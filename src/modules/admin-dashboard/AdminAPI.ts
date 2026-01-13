import { IncomingMessage } from "http";
import { IFaucetApiUrl } from "../../webserv/FaucetWebApi.js";
import { FaucetError } from "../../common/FaucetError.js";
import { IAdminDashboardConfig } from "./AdminDashboardConfig.js";
import { AdminAuth, IAdminSession } from "./AdminAuth.js";
import { AdminStats } from "./AdminStats.js";
import { AdminAlerts } from "./AdminAlerts.js";
import { ServiceManager } from "../../common/ServiceManager.js";
import { FaucetProcess, FaucetLogLevel } from "../../common/FaucetProcess.js";

export class AdminAPI {
  private config: IAdminDashboardConfig;
  private adminAuth: AdminAuth;
  private adminStats: AdminStats;
  private adminAlerts: AdminAlerts;

  constructor(
    config: IAdminDashboardConfig,
    adminAuth: AdminAuth,
    adminStats: AdminStats,
    adminAlerts: AdminAlerts
  ) {
    this.config = config;
    this.adminAuth = adminAuth;
    this.adminStats = adminStats;
    this.adminAlerts = adminAlerts;
  }

  /**
   * Maneja requests de la API de administración
   */
  public async handleApiRequest(req: IncomingMessage, url: IFaucetApiUrl, body: Buffer): Promise<any> {
    try {
      const path = url.path.slice(1); // Remover 'admin' del path
      const method = req.method || 'GET';

      // Rutas públicas (sin autenticación)
      if (path[0] === 'login' && method === 'POST') {
        return this.handleLogin(req, body);
      }

      // Todas las demás rutas requieren autenticación
      const session = this.requireAuthentication(req);

      // Rutas autenticadas
      switch (path[0]) {
        case 'logout':
          return this.handleLogout(req, session);
        
        case 'stats':
          return this.handleStats(req, session, path.slice(1));
        
        case 'alerts':
          return this.handleAlerts(req, session, path.slice(1), method, body);
        
        case 'sessions':
          return this.handleSessions(req, session, path.slice(1), method);
        
        case 'config':
          return this.handleConfig(req, session, path.slice(1), method, body);
        
        case 'logs':
          return this.handleLogs(req, session, path.slice(1));
        
        case 'users':
          return this.handleUsers(req, session, path.slice(1), method, body);
        
        case 'modules':
          return this.handleModules(req, session, path.slice(1), method, body);
        
        default:
          throw new FaucetError("ADMIN_ENDPOINT_NOT_FOUND", `Endpoint not found: ${path.join('/')}`);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Maneja login de administrador
   */
  private async handleLogin(req: IncomingMessage, body: Buffer): Promise<any> {
    const data = JSON.parse(body.toString());
    const { username, password } = data;

    if (!username || !password) {
      throw new FaucetError("ADMIN_MISSING_CREDENTIALS", "Username and password required");
    }

    const ipAddress = this.getClientIP(req);
    const token = await this.adminAuth.authenticateUser(username, password, ipAddress);

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Admin login successful: ${username} from ${ipAddress}`
    );

    return {
      success: true,
      token,
      user: {
        username,
        loginTime: Date.now()
      }
    };
  }

  /**
   * Maneja logout de administrador
   */
  private handleLogout(req: IncomingMessage, session: IAdminSession): any {
    const token = this.adminAuth.extractTokenFromRequest(req);
    if (token) {
      this.adminAuth.logout(token);
    }

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Admin logout: ${session.username}`
    );

    return { success: true };
  }

  /**
   * Maneja endpoints de estadísticas
   */
  private async handleStats(req: IncomingMessage, session: IAdminSession, path: string[]): Promise<any> {
    this.requirePermission(session, 'stats');

    if (path.length === 0) {
      // GET /api/admin/stats - Estadísticas completas
      const stats = await this.adminStats.getStats();
      return { success: true, data: stats };
    }

    switch (path[0]) {
      case 'realtime':
        // GET /api/admin/stats/realtime - Estadísticas en tiempo real
        const realtimeStats = await this.adminStats.getRealTimeStats();
        return { success: true, data: realtimeStats };
      
      case 'refresh':
        // POST /api/admin/stats/refresh - Forzar actualización
        const refreshedStats = await this.adminStats.getStats(true);
        return { success: true, data: refreshedStats };
      
      default:
        throw new FaucetError("ADMIN_STATS_ENDPOINT_NOT_FOUND", `Stats endpoint not found: ${path[0]}`);
    }
  }

  /**
   * Maneja endpoints de alertas
   */
  private async handleAlerts(req: IncomingMessage, session: IAdminSession, path: string[], method: string, body: Buffer): Promise<any> {
    this.requirePermission(session, 'alerts');

    if (path.length === 0) {
      if (method === 'GET') {
        // GET /api/admin/alerts - Obtener alertas
        const alerts = this.adminAlerts.getActiveAlerts();
        const stats = this.adminAlerts.getAlertStats();
        return { success: true, data: { alerts, stats } };
      }
    }

    switch (path[0]) {
      case 'all':
        // GET /api/admin/alerts/all - Todas las alertas
        const allAlerts = this.adminAlerts.getAllAlerts();
        return { success: true, data: allAlerts };
      
      case 'acknowledge':
        if (method === 'POST') {
          const data = JSON.parse(body.toString());
          if (data.alertId) {
            // POST /api/admin/alerts/acknowledge - Reconocer alerta específica
            const success = this.adminAlerts.acknowledgeAlert(data.alertId);
            return { success, message: success ? 'Alert acknowledged' : 'Alert not found' };
          } else {
            // POST /api/admin/alerts/acknowledge - Reconocer todas las alertas
            const count = this.adminAlerts.acknowledgeAllAlerts();
            return { success: true, message: `${count} alerts acknowledged` };
          }
        }
        break;
      
      case 'cleanup':
        if (method === 'POST') {
          // POST /api/admin/alerts/cleanup - Limpiar alertas antiguas
          const count = this.adminAlerts.cleanupOldAlerts();
          return { success: true, message: `${count} old alerts cleaned up` };
        }
        break;
      
      default:
        throw new FaucetError("ADMIN_ALERTS_ENDPOINT_NOT_FOUND", `Alerts endpoint not found: ${path[0]}`);
    }
  }

  /**
   * Maneja endpoints de sesiones
   */
  private async handleSessions(req: IncomingMessage, session: IAdminSession, path: string[], method: string): Promise<any> {
    this.requirePermission(session, 'sessions');

    if (path.length === 0) {
      // GET /api/admin/sessions - Sesiones activas
      const activeSessions = this.adminAuth.getActiveSessions();
      return { success: true, data: activeSessions };
    }

    switch (path[0]) {
      case 'admin':
        // GET /api/admin/sessions/admin - Sesiones de administrador
        const adminSessions = this.adminAuth.getActiveSessions();
        return { success: true, data: adminSessions };
      
      default:
        throw new FaucetError("ADMIN_SESSIONS_ENDPOINT_NOT_FOUND", `Sessions endpoint not found: ${path[0]}`);
    }
  }

  /**
   * Maneja endpoints de configuración
   */
  private async handleConfig(req: IncomingMessage, session: IAdminSession, path: string[], method: string, body: Buffer): Promise<any> {
    this.requirePermission(session, 'config');

    if (path.length === 0) {
      if (method === 'GET') {
        // GET /api/admin/config - Obtener configuración actual
        return { 
          success: true, 
          data: this.getSafeConfig() 
        };
      } else if (method === 'POST') {
        // POST /api/admin/config - Actualizar configuración
        const newConfig = JSON.parse(body.toString());
        return this.updateConfig(session, newConfig);
      }
    }

    throw new FaucetError("ADMIN_CONFIG_ENDPOINT_NOT_FOUND", `Config endpoint not found: ${path.join('/')}`);
  }

  /**
   * Maneja endpoints de logs
   */
  private async handleLogs(req: IncomingMessage, session: IAdminSession, path: string[]): Promise<any> {
    this.requirePermission(session, 'logs');

    // TODO: Implementar lectura de logs
    return { 
      success: true, 
      data: { 
        logs: [], 
        message: "Log reading not implemented yet" 
      } 
    };
  }

  /**
   * Maneja endpoints de usuarios
   */
  private async handleUsers(req: IncomingMessage, session: IAdminSession, path: string[], method: string, body: Buffer): Promise<any> {
    this.requirePermission(session, 'users');

    // TODO: Implementar gestión de usuarios (blacklist, whitelist)
    return { 
      success: true, 
      data: { 
        users: [], 
        message: "User management not implemented yet" 
      } 
    };
  }

  /**
   * Maneja endpoints de módulos
   */
  private async handleModules(req: IncomingMessage, session: IAdminSession, path: string[], method: string, body: Buffer): Promise<any> {
    this.requirePermission(session, 'modules');

    // TODO: Implementar gestión de módulos
    return { 
      success: true, 
      data: { 
        modules: [], 
        message: "Module management not implemented yet" 
      } 
    };
  }

  /**
   * Requiere autenticación
   */
  private requireAuthentication(req: IncomingMessage): IAdminSession {
    const token = this.adminAuth.extractTokenFromRequest(req);
    if (!token) {
      throw new FaucetError("ADMIN_AUTH_REQUIRED", "Authentication required");
    }

    const session = this.adminAuth.validateSession(token);
    if (!session) {
      throw new FaucetError("ADMIN_INVALID_SESSION", "Invalid or expired session");
    }

    return session;
  }

  /**
   * Requiere un permiso específico
   */
  private requirePermission(session: IAdminSession, permission: string): void {
    if (!this.adminAuth.hasPermission(session, permission)) {
      throw new FaucetError("ADMIN_INSUFFICIENT_PERMISSIONS", `Permission required: ${permission}`);
    }
  }

  /**
   * Obtiene la IP del cliente
   */
  private getClientIP(req: IncomingMessage): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }

  /**
   * Obtiene configuración segura (sin datos sensibles)
   */
  private getSafeConfig(): any {
    const safeConfig = { ...this.config };
    
    // Remover datos sensibles
    if (safeConfig.adminUsers) {
      safeConfig.adminUsers = safeConfig.adminUsers.map(user => ({
        username: user.username,
        permissions: user.permissions,
        email: user.email,
        lastLogin: user.lastLogin,
        passwordHash: "[HIDDEN]" // No exponer el hash
      }));
    }
    
    delete (safeConfig as any).sessionSecret;
    
    return safeConfig;
  }

  /**
   * Actualiza configuración
   */
  private updateConfig(session: IAdminSession, newConfig: any): any {
    // TODO: Implementar actualización de configuración
    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Admin ${session.username} attempted to update configuration`
    );

    return { 
      success: false, 
      message: "Configuration update not implemented yet" 
    };
  }

  /**
   * Maneja errores de la API
   */
  private handleError(error: any): any {
    if (error instanceof FaucetError) {
      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.WARNING,
        `Admin API error: ${error.getCode()} - ${error.message}`
      );

      return {
        success: false,
        error: {
          code: error.getCode(),
          message: error.message
        }
      };
    }

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.ERROR,
      `Admin API unexpected error: ${error.message}`
    );

    return {
      success: false,
      error: {
        code: "ADMIN_INTERNAL_ERROR",
        message: "Internal server error"
      }
    };
  }
}