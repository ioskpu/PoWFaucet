import { BaseModule } from "../BaseModule.js";
import { ServiceManager } from "../../common/ServiceManager.js";
import { FaucetProcess, FaucetLogLevel } from "../../common/FaucetProcess.js";
import { defaultAdminDashboardConfig, IAdminDashboardConfig } from "./AdminDashboardConfig.js";
import { AdminAuth } from "./AdminAuth.js";
import { AdminAPI } from "./AdminAPI.js";
import { AdminStats } from "./AdminStats.js";
import { AdminAlerts } from "./AdminAlerts.js";
import { FaucetWebApi } from "../../webserv/FaucetWebApi.js";

export class AdminDashboardModule extends BaseModule<IAdminDashboardConfig> {
  protected readonly moduleDefaultConfig = defaultAdminDashboardConfig;
  
  private adminAuth: AdminAuth;
  private adminAPI: AdminAPI;
  private adminStats: AdminStats;
  private adminAlerts: AdminAlerts;

  protected override startModule(): Promise<void> {
    // Validar configuración
    this.validateConfig();
    
    // Inicializar componentes
    this.adminAuth = new AdminAuth(this.moduleConfig);
    this.adminStats = new AdminStats(this.moduleConfig);
    this.adminAlerts = new AdminAlerts(this.moduleConfig, this.adminStats);
    this.adminAPI = new AdminAPI(this.moduleConfig, this.adminAuth, this.adminStats, this.adminAlerts);

    // Registrar endpoints API
    this.registerApiEndpoints();

    ServiceManager.GetService(FaucetProcess).emitLog(FaucetLogLevel.INFO, `Admin Dashboard initialized with ${this.moduleConfig.adminUsers.length} admin users`);
    
    return Promise.resolve();
  }

  protected override stopModule(): Promise<void> {
    if (this.adminAlerts) {
      this.adminAlerts.stop();
    }
    
    // Desregistrar endpoints API
    this.unregisterApiEndpoints();
    
    return Promise.resolve();
  }

  private registerApiEndpoints(): void {
    const webApi = ServiceManager.GetService(FaucetWebApi);
    
    // Registrar un solo endpoint "admin" que maneje todas las sub-rutas
    webApi.registerApiEndpoint("admin", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Reportes
    webApi.registerApiEndpoint("admin/reports/summary", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/reports/charts", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/reports/modules", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/reports/health", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
  }

  private unregisterApiEndpoints(): void {
    const webApi = ServiceManager.GetService(FaucetWebApi);
    
    // Desregistrar el endpoint "admin"
    webApi.removeApiEndpoint("admin");
  }

  private validateConfig(): void {
    if (!this.moduleConfig.adminUsers || this.moduleConfig.adminUsers.length === 0) {
      throw new Error("Admin Dashboard: No admin users configured");
    }

    if (!this.moduleConfig.sessionSecret || this.moduleConfig.sessionSecret === "change-this-secret-key") {
      throw new Error("Admin Dashboard: sessionSecret must be changed from default value");
    }

    // Validar que todos los usuarios tengan hash de contraseña
    for (const user of this.moduleConfig.adminUsers) {
      if (!user.passwordHash) {
        throw new Error(`Admin Dashboard: User ${user.username} missing passwordHash`);
      }
      if (!user.permissions || user.permissions.length === 0) {
        throw new Error(`Admin Dashboard: User ${user.username} missing permissions`);
      }
    }
  }

  /**
   * Obtiene la instancia de AdminAuth para uso externo
   */
  public getAdminAuth(): AdminAuth {
    return this.adminAuth;
  }

  /**
   * Obtiene la instancia de AdminStats para uso externo
   */
  public getAdminStats(): AdminStats {
    return this.adminStats;
  }

  /**
   * Obtiene la instancia de AdminAlerts para uso externo
   */
  public getAdminAlerts(): AdminAlerts {
    return this.adminAlerts;
  }

  /**
   * Obtiene configuración del cliente (sin datos sensibles)
   */
  public getClientConfig(): any {
    return {
      enabled: this.moduleConfig.enabled,
      adminPath: this.moduleConfig.security.adminPath,
      ui: this.moduleConfig.ui,
      features: {
        alerts: Object.keys(this.moduleConfig.alerts).filter(
          key => this.moduleConfig.alerts[key as keyof typeof this.moduleConfig.alerts]?.enabled
        ),
        reports: this.moduleConfig.reports.exportFormat
      }
    };
  }
}