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
    
    // Estadísticas
    webApi.registerApiEndpoint("admin/stats", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/stats/realtime", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/stats/refresh", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Alertas
    webApi.registerApiEndpoint("admin/alerts", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/alerts/all", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/alerts/acknowledge", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/alerts/cleanup", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Sesiones
    webApi.registerApiEndpoint("admin/sessions", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/sessions/admin", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Configuración
    webApi.registerApiEndpoint("admin/config", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/config/validate", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/config/backup", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/config/restore", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Logs
    webApi.registerApiEndpoint("admin/logs", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/logs/download", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/logs/clear", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Usuarios
    webApi.registerApiEndpoint("admin/users", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/users/blacklist", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/users/whitelist", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/users/sessions", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/users/sessions/terminate", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/users/top", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Módulos
    webApi.registerApiEndpoint("admin/modules", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/modules/reload", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/modules/config", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Exportación
    webApi.registerApiEndpoint("admin/export/stats", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/export/stats/csv", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/export/sessions", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/export/sessions/csv", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/export/alerts", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/export/users", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    
    // Reportes
    webApi.registerApiEndpoint("admin/reports/summary", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/reports/charts", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/reports/modules", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
    webApi.registerApiEndpoint("admin/reports/health", (req, url, body) => this.adminAPI.handleApiRequest(req, url, body));
  }

  private unregisterApiEndpoints(): void {
    const webApi = ServiceManager.GetService(FaucetWebApi);
    
    // Desregistrar endpoints básicos
    webApi.removeApiEndpoint("admin/login");
    webApi.removeApiEndpoint("admin/logout");
    
    // Estadísticas
    webApi.removeApiEndpoint("admin/stats");
    webApi.removeApiEndpoint("admin/stats/realtime");
    webApi.removeApiEndpoint("admin/stats/refresh");
    
    // Alertas
    webApi.removeApiEndpoint("admin/alerts");
    webApi.removeApiEndpoint("admin/alerts/all");
    webApi.removeApiEndpoint("admin/alerts/acknowledge");
    webApi.removeApiEndpoint("admin/alerts/cleanup");
    
    // Sesiones
    webApi.removeApiEndpoint("admin/sessions");
    webApi.removeApiEndpoint("admin/sessions/admin");
    
    // Configuración
    webApi.removeApiEndpoint("admin/config");
    webApi.removeApiEndpoint("admin/config/validate");
    webApi.removeApiEndpoint("admin/config/backup");
    webApi.removeApiEndpoint("admin/config/restore");
    
    // Logs
    webApi.removeApiEndpoint("admin/logs");
    webApi.removeApiEndpoint("admin/logs/download");
    webApi.removeApiEndpoint("admin/logs/clear");
    
    // Usuarios
    webApi.removeApiEndpoint("admin/users");
    webApi.removeApiEndpoint("admin/users/blacklist");
    webApi.removeApiEndpoint("admin/users/whitelist");
    webApi.removeApiEndpoint("admin/users/sessions");
    webApi.removeApiEndpoint("admin/users/sessions/terminate");
    webApi.removeApiEndpoint("admin/users/top");
    
    // Módulos
    webApi.removeApiEndpoint("admin/modules");
    webApi.removeApiEndpoint("admin/modules/reload");
    webApi.removeApiEndpoint("admin/modules/config");
    
    // Exportación
    webApi.removeApiEndpoint("admin/export/stats");
    webApi.removeApiEndpoint("admin/export/stats/csv");
    webApi.removeApiEndpoint("admin/export/sessions");
    webApi.removeApiEndpoint("admin/export/sessions/csv");
    webApi.removeApiEndpoint("admin/export/alerts");
    webApi.removeApiEndpoint("admin/export/users");
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