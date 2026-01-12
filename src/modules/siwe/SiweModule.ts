import { ServiceManager } from "../../common/ServiceManager.js";
import { EthWalletManager } from "../../eth/EthWalletManager.js";
import { FaucetSession } from "../../session/FaucetSession.js";
import { BaseModule } from "../BaseModule.js";
import { ModuleHookAction } from "../ModuleManager.js";
import { defaultConfig, ISiweConfig, ISiweRestrictionConfig } from './SiweConfig.js';
import { FaucetError } from '../../common/FaucetError.js';
import { FaucetDatabase } from "../../db/FaucetDatabase.js";
import { renderTimespan } from "../../utils/DateUtils.js";
import { FaucetWebApi, IFaucetApiUrl } from "../../webserv/FaucetWebApi.js";
import { IncomingMessage } from "http";
import { SiweDB } from './SiweDB.js';
import { FaucetLogLevel, FaucetProcess } from "../../common/FaucetProcess.js";
import { ISessionRewardFactor } from "../../session/SessionRewardFactor.js";
import { randomBytes } from "crypto";

export class SiweModule extends BaseModule<ISiweConfig> {
  protected readonly moduleDefaultConfig = defaultConfig;
  private siweDb: SiweDB;
  private cleanupInterval: NodeJS.Timeout;

  protected override async startModule(): Promise<void> {
    this.siweDb = await ServiceManager.GetService(FaucetDatabase).createModuleDb(SiweDB, this);
    
    // Hook: Enviar configuración SIWE al cliente
    this.moduleManager.addActionHook(
      this, ModuleHookAction.ClientConfig, 1, "siwe config",
      async (clientConfig: any) => {
        clientConfig[this.moduleName] = {
          domain: this.moduleConfig.domain,
          uri: this.moduleConfig.uri,
          required: this.moduleConfig.required,
          rewardFactor: this.moduleConfig.rewardFactor,
        };
      }
    );

    // Hook: Verificar autenticación SIWE al iniciar sesión
    this.moduleManager.addActionHook(
      this, ModuleHookAction.SessionStart, 6, "SIWE auth check",
      (session: FaucetSession, userInput: any) => this.processSessionStart(session, userInput)
    );

    // Hook: Guardar sesión SIWE al completar
    this.moduleManager.addActionHook(
      this, ModuleHookAction.SessionComplete, 5, "SIWE save session",
      (session: FaucetSession) => this.processSessionComplete(session)
    );

    // Hook: Factor de recompensa por autenticación SIWE
    this.moduleManager.addActionHook(
      this, ModuleHookAction.SessionRewardFactor, 5, "SIWE reward factor",
      (session: FaucetSession, rewardFactors: ISessionRewardFactor[]) => this.processSessionRewardFactor(session, rewardFactors)
    );

    // Registrar endpoints API
    ServiceManager.GetService(FaucetWebApi).registerApiEndpoint(
      "siweNonce",
      (req: IncomingMessage, url: IFaucetApiUrl, body: Buffer) => this.handleGetNonce(req, url, body)
    );

    ServiceManager.GetService(FaucetWebApi).registerApiEndpoint(
      "siweVerify",
      (req: IncomingMessage, url: IFaucetApiUrl, body: Buffer) => this.handleVerifySignature(req, url, body)
    );

    // Limpieza periódica de nonces expirados
    this.cleanupInterval = setInterval(() => {
      this.siweDb.cleanupExpiredNonces().catch((err) => {
        ServiceManager.GetService(FaucetProcess).emitLog(FaucetLogLevel.WARNING, "SIWE nonce cleanup error: " + err.toString());
      });
    }, 60000); // Cada minuto

    return Promise.resolve();
  }

  protected override stopModule(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    return Promise.resolve();
  }

  public getSiweDb(): SiweDB {
    return this.siweDb;
  }

  private generateNonce(): string {
    return randomBytes(16).toString("hex");
  }

  private async handleGetNonce(req: IncomingMessage, url: IFaucetApiUrl, body: Buffer): Promise<any> {
    const nonce = this.generateNonce();
    await this.siweDb.createNonce(nonce, this.moduleConfig.nonceExpiration);
    
    return {
      nonce: nonce,
      expiresIn: this.moduleConfig.nonceExpiration,
    };
  }

  private async handleVerifySignature(req: IncomingMessage, url: IFaucetApiUrl, body: Buffer): Promise<any> {
    try {
      const data = JSON.parse(body.toString());
      const { message, signature } = data;

      if (!message || !signature) {
        return { success: false, error: "Missing message or signature" };
      }

      // Importar siwe dinámicamente
      const { SiweMessage } = await import("siwe");
      
      const siweMessage = new SiweMessage(message);
      
      // Verificar nonce
      const nonceValid = await this.siweDb.verifyAndConsumeNonce(siweMessage.nonce);
      if (!nonceValid) {
        return { success: false, error: "Invalid or expired nonce" };
      }

      // Verificar dominio
      if (this.moduleConfig.domain && siweMessage.domain !== this.moduleConfig.domain) {
        return { success: false, error: "Invalid domain" };
      }

      // Verificar firma
      const verifyResult = await siweMessage.verify({ signature });
      
      if (!verifyResult.success) {
        return { success: false, error: "Invalid signature" };
      }

      // Generar token de sesión SIWE
      const siweToken = randomBytes(32).toString("hex");
      
      return {
        success: true,
        address: siweMessage.address,
        token: siweToken,
      };

    } catch (ex) {
      ServiceManager.GetService(FaucetProcess).emitLog(FaucetLogLevel.WARNING, "SIWE verify error: " + ex.toString());
      return { success: false, error: "Verification failed" };
    }
  }

  private async processSessionStart(session: FaucetSession, userInput: any): Promise<void> {
    if (session.getSessionData<Array<string>>("skip.modules", []).indexOf(this.moduleName) !== -1) {
      return;
    }

    const siweAddress = userInput.siweAddress;
    const siweToken = userInput.siweToken;

    // Si SIWE es requerido y no hay autenticación
    if (this.moduleConfig.required && !siweAddress) {
      throw new FaucetError(
        "SIWE_REQUIRED",
        "Sign-In with Ethereum authentication is required"
      );
    }

    // Si hay autenticación SIWE, verificar que la dirección coincida
    if (siweAddress) {
      const targetAddr = session.getTargetAddr().toLowerCase();
      if (siweAddress.toLowerCase() !== targetAddr) {
        throw new FaucetError(
          "SIWE_ADDRESS_MISMATCH",
          "SIWE authenticated address does not match the target address"
        );
      }

      session.setSessionData("siwe.address", siweAddress.toLowerCase());
      session.setSessionData("siwe.authenticated", true);

      // Verificar restricciones
      for (const restriction of this.moduleConfig.restrictions) {
        await this.checkRestriction(siweAddress, restriction);
      }

      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.INFO,
        "Session " + session.getSessionId() + " authenticated via SIWE: " + siweAddress
      );
    }
  }

  private async processSessionComplete(session: FaucetSession): Promise<void> {
    const siweAddress = session.getSessionData("siwe.address");
    if (!siweAddress) {
      return;
    }

    await this.siweDb.setSiweSession(session.getSessionId(), siweAddress);
  }

  private async processSessionRewardFactor(session: FaucetSession, rewardFactors: ISessionRewardFactor[]): Promise<void> {
    const isAuthenticated = session.getSessionData("siwe.authenticated");
    if (!isAuthenticated) {
      return;
    }

    if (this.moduleConfig.rewardFactor && this.moduleConfig.rewardFactor !== 1) {
      rewardFactors.push({
        factor: this.moduleConfig.rewardFactor,
        module: this.moduleName,
      });
    }
  }

  private async checkRestriction(address: string, restriction: ISiweRestrictionConfig): Promise<void> {
    const sessions = await this.siweDb.getSiweSessions(address, restriction.duration, false);

    if (restriction.limitCount && restriction.limitCount > 0 && sessions.length >= restriction.limitCount) {
      const errMsg = restriction.message || [
        "You have already created ",
        sessions.length,
        (sessions.length > 1 ? " sessions" : " session"),
        " in the last ",
        renderTimespan(restriction.duration)
      ].join("");
      throw new FaucetError("SIWE_LIMIT", errMsg);
    }

    if (restriction.limitAmount && restriction.limitAmount > 0) {
      let totalAmount = 0n;
      sessions.forEach((s) => {
        if (s.dropAmount) {
          totalAmount += BigInt(s.dropAmount);
        }
      });
      
      if (totalAmount >= BigInt(restriction.limitAmount)) {
        const errMsg = restriction.message || [
          "You have already requested ",
          ServiceManager.GetService(EthWalletManager).readableAmount(totalAmount),
          " in the last ",
          renderTimespan(restriction.duration)
        ].join("");
        throw new FaucetError("SIWE_LIMIT", errMsg);
      }
    }
  }
}
