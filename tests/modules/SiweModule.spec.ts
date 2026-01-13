import 'mocha';
import { expect } from 'chai';
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { Socket } from 'net';
import { bindTestStubs, unbindTestStubs, loadDefaultTestConfig } from '../common.js';
import { ServiceManager } from '../../src/common/ServiceManager.js';
import { FaucetDatabase } from '../../src/db/FaucetDatabase.js';
import { ModuleManager } from '../../src/modules/ModuleManager.js';
import { SessionManager } from '../../src/session/SessionManager.js';
import { faucetConfig } from '../../src/config/FaucetConfig.js';
import { FaucetError } from '../../src/common/FaucetError.js';
import { ISiweConfig } from '../../src/modules/siwe/SiweConfig.js';
import { FaucetWebApi } from '../../src/webserv/FaucetWebApi.js';
import { SiweModule } from '../../src/modules/siwe/SiweModule.js';

describe("Faucet module: siwe", () => {
  let globalStubs: any;

  function encodeApiRequest(options: {
    url: string;
    remoteAddr: string;
    method?: string;
    headers?: IncomingHttpHeaders;
  }): IncomingMessage {
    let socketData = {
      remoteAddress: options.remoteAddr,
    };
    let socket: Socket = socketData as any;
    Object.setPrototypeOf(socket, Socket.prototype);
    let messageData = {
      method: options.method || "GET",
      socket: socket,
      url: options.url,
      headers: options.headers || {},
    };
    let message: IncomingMessage = messageData as any;
    Object.setPrototypeOf(message, IncomingMessage.prototype);
    return message;
  }

  beforeEach(async () => {
    globalStubs = bindTestStubs({});
    loadDefaultTestConfig();
    await ServiceManager.GetService(FaucetDatabase).initialize();
  });
  
  afterEach(async () => {
    let dbService = ServiceManager.GetService(FaucetDatabase);
    await ServiceManager.DisposeAllServices();
    await dbService.closeDatabase();
    await unbindTestStubs(globalStubs);
  });

  it("Check client config exports", async () => {
    faucetConfig.modules["siwe"] = {
      enabled: true,
      domain: "test.example.com",
      uri: "https://test.example.com",
      nonceExpiration: 300,
      sessionExpiration: 86400,
      required: false,
      rewardFactor: 1.5,
      restrictions: []
    } as ISiweConfig;
    
    await ServiceManager.GetService(ModuleManager).initialize();
    let clientConfig = ServiceManager.GetService(FaucetWebApi).onGetFaucetConfig();
    
    expect(!!clientConfig.modules['siwe']).to.equal(true, "no siwe config exported");
    expect(clientConfig.modules['siwe'].domain).to.equal("test.example.com", "client config mismatch: domain");
    expect(clientConfig.modules['siwe'].uri).to.equal("https://test.example.com", "client config mismatch: uri");
    expect(clientConfig.modules['siwe'].required).to.equal(false, "client config mismatch: required");
    expect(clientConfig.modules['siwe'].rewardFactor).to.equal(1.5, "client config mismatch: rewardFactor");
  });

  it("Generate nonce via API", async () => {
    faucetConfig.modules["siwe"] = {
      enabled: true,
      domain: "test.example.com",
      uri: "https://test.example.com",
      nonceExpiration: 300,
      sessionExpiration: 86400,
      required: false,
      rewardFactor: 1.5,
      restrictions: []
    } as ISiweConfig;
    
    await ServiceManager.GetService(ModuleManager).initialize();
    let webApi = ServiceManager.GetService(FaucetWebApi);
    
    let response = await webApi.onApiRequest(encodeApiRequest({
      url: "/api/siweNonce",
      remoteAddr: "8.8.8.8"
    }));
    
    expect(response.nonce).to.be.a('string', "nonce should be a string");
    expect(response.nonce.length).to.equal(32, "nonce should be 32 characters (16 bytes hex)");
    expect(response.expiresIn).to.equal(300, "expiresIn should match config");
  });

  it("Apply reward factor for authenticated session", async () => {
    faucetConfig.modules["siwe"] = {
      enabled: true,
      domain: "test.example.com",
      uri: "https://test.example.com",
      nonceExpiration: 300,
      sessionExpiration: 86400,
      required: false,
      rewardFactor: 2.0,
      restrictions: []
    } as ISiweConfig;
    
    await ServiceManager.GetService(ModuleManager).initialize();
    let sessionManager = ServiceManager.GetService(SessionManager);
    
    // Create session with SIWE authentication
    let testSession = await sessionManager.createSession("::ffff:8.8.8.8", {
      addr: "0x0000000000000000000000000000000000001337",
      siweAddress: "0x0000000000000000000000000000000000001337",
      siweToken: "test-token"
    });
    
    expect(testSession.getSessionStatus()).to.equal("claimable", "unexpected session status");
    
    // Check reward factor is applied by calling the hook directly
    let moduleManager = ServiceManager.GetService(ModuleManager);
    let siweModule = moduleManager.getModule("siwe") as SiweModule;
    let rewardFactors: any[] = [];
    
    // Simulate the reward factor hook
    await (siweModule as any).processSessionRewardFactor(testSession, rewardFactors);
    
    expect(rewardFactors.length).to.equal(1, "reward factor should be added");
    expect(rewardFactors[0].factor).to.equal(2.0, "reward factor not applied correctly");
    expect(rewardFactors[0].module).to.equal("siwe", "reward factor module should be siwe");
  });

  it("Require SIWE when configured as required", async () => {
    faucetConfig.modules["siwe"] = {
      enabled: true,
      domain: "test.example.com",
      uri: "https://test.example.com",
      nonceExpiration: 300,
      sessionExpiration: 86400,
      required: true,
      rewardFactor: 1.5,
      restrictions: []
    } as ISiweConfig;
    
    await ServiceManager.GetService(ModuleManager).initialize();
    let sessionManager = ServiceManager.GetService(SessionManager);
    
    let error: FaucetError | null = null;
    try {
      await sessionManager.createSession("::ffff:8.8.8.8", {
        addr: "0x0000000000000000000000000000000000001337"
      });
    } catch(ex) {
      error = ex;
    }
    
    expect(error).to.not.equal(null, "no exception thrown");
    expect(error instanceof FaucetError).to.equal(true, "unexpected error type");
    expect(error?.getCode()).to.equal("SIWE_REQUIRED", "unexpected error code");
  });

  it("Reject session when SIWE address doesn't match target", async () => {
    faucetConfig.modules["siwe"] = {
      enabled: true,
      domain: "test.example.com",
      uri: "https://test.example.com",
      nonceExpiration: 300,
      sessionExpiration: 86400,
      required: false,
      rewardFactor: 1.5,
      restrictions: []
    } as ISiweConfig;
    
    await ServiceManager.GetService(ModuleManager).initialize();
    let sessionManager = ServiceManager.GetService(SessionManager);
    
    let error: FaucetError | null = null;
    try {
      await sessionManager.createSession("::ffff:8.8.8.8", {
        addr: "0x0000000000000000000000000000000000001337",
        siweAddress: "0x0000000000000000000000000000000000001338", // Different address
        siweToken: "test-token"
      });
    } catch(ex) {
      error = ex;
    }
    
    expect(error).to.not.equal(null, "no exception thrown");
    expect(error instanceof FaucetError).to.equal(true, "unexpected error type");
    expect(error?.getCode()).to.equal("SIWE_ADDRESS_MISMATCH", "unexpected error code");
  });

  it("Apply restrictions for SIWE authenticated sessions", async () => {
    faucetConfig.modules["siwe"] = {
      enabled: true,
      domain: "test.example.com",
      uri: "https://test.example.com",
      nonceExpiration: 300,
      sessionExpiration: 86400,
      required: false,
      rewardFactor: 1.5,
      restrictions: [{
        limitCount: 1,
        duration: 86400
      }]
    } as ISiweConfig;
    
    await ServiceManager.GetService(ModuleManager).initialize();
    let sessionManager = ServiceManager.GetService(SessionManager);
    
    // Create first session
    let testSession1 = await sessionManager.createSession("::ffff:8.8.8.8", {
      addr: "0x0000000000000000000000000000000000001337",
      siweAddress: "0x0000000000000000000000000000000000001337",
      siweToken: "test-token"
    });
    expect(testSession1.getSessionStatus()).to.equal("claimable", "first session should be allowed");
    
    // Mark first session as finished
    testSession1.setSessionData("finished", true);
    await testSession1.saveSession();
    
    // Try to create second session with same SIWE address
    let error: FaucetError | null = null;
    try {
      await sessionManager.createSession("::ffff:8.8.8.8", {
        addr: "0x0000000000000000000000000000000000001337",
        siweAddress: "0x0000000000000000000000000000000000001337",
        siweToken: "test-token"
      });
    } catch(ex) {
      error = ex;
    }
    
    expect(error).to.not.equal(null, "no exception thrown for second session");
    expect(error instanceof FaucetError).to.equal(true, "unexpected error type");
    expect(error?.getCode()).to.equal("SIWE_LIMIT", "unexpected error code");
  });

  it("Database cleanup removes expired nonces", async () => {
    faucetConfig.modules["siwe"] = {
      enabled: true,
      domain: "test.example.com",
      uri: "https://test.example.com",
      nonceExpiration: 300,
      sessionExpiration: 86400,
      required: false,
      rewardFactor: 1.5,
      restrictions: []
    } as ISiweConfig;
    
    await ServiceManager.GetService(ModuleManager).initialize();
    let moduleManager = ServiceManager.GetService(ModuleManager);
    let siweModule = moduleManager.getModule("siwe") as SiweModule;
    let siweDb = siweModule.getSiweDb();
    
    // Create a nonce that expires immediately
    await siweDb.createNonce("test-nonce", -1); // Already expired
    
    // Cleanup should remove it
    await siweDb.cleanupExpiredNonces();
    
    // Verify nonce is gone
    let nonceValid = await siweDb.verifyAndConsumeNonce("test-nonce");
    expect(nonceValid).to.equal(false, "expired nonce should be cleaned up");
  });

});