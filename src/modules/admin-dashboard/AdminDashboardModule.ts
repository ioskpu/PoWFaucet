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
    
    // Registrar todos los endpoints de admin
    webApi.registerApiEndpoint("admin/login", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/logout", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/stats", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/stats/realtime", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/stats/refresh", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/alerts", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/alerts/all", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/alerts/acknowledge", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/alerts/cleanup", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/sessions", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/sessions/admin", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/config", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/logs", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/users", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/modules", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
  }

  private unregisterApiEndpoints(): void {
    const webApi = ServiceManager.GetService(FaucetWebApi);
    
    webApi.removeApiEndpoint("admin/login");
    webApi.removeApiEndpoint("admin/logout");
    webApi.removeApiEndpoint("admin/stats");
    webApi.removeApiEndpoint("admin/stats/realtime");
    webApi.removeApiEndpoint("admin/stats/refresh");
    webApi.removeApiEndpoint("admin/alerts");
    webApi.removeApiEndpoint("admin/alerts/all");
    webApi.removeApiEndpoint("admin/alerts/acknowledge");
    webApi.removeApiEndpoint("admin/alerts/cleanup");
    webApi.removeApiEndpoint("admin/sessions");
    webApi.removeApiEndpoint("admin/sessions/admin");
    webApi.removeApiEndpoint("admin/config");
    webApi.removeApiEndpoint("admin/logs");
    webApi.removeApiEndpoint("admin/users");
    webApi.removeApiEndpoint("admin/modules");
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