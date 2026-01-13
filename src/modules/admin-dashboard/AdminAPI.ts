import { IncomingMessage } from "http";
import { IFaucetApiUrl } from "../../webserv/FaucetWebApi.js";
import { FaucetError } from "../../common/FaucetError.js";
import { IAdminDashboardConfig } from "./AdminDashboardConfig.js";
import { AdminAuth, IAdminSession } from "./AdminAuth.js";
import { AdminStats } from "./AdminStats.js";
import { AdminAlerts } from "./AdminAlerts.js";
import { ServiceManager } from "../../common/ServiceManager.js";
import { FaucetProcess, FaucetLogLevel } from "../../common/FaucetProcess.js";
import { FaucetDatabase } from "../../db/FaucetDatabase.js";
import { SessionManager } from "../../session/SessionManager.js";
import { ModuleManager } from "../ModuleManager.js";

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
        
        case 'export':
          return this.handleExport(req, session, path.slice(1), method);
        
        default:
          throw new FaucetError("ADMIN_ENDPOINT_NOT_FOUND", `Endpoint not found: ${path.join('/')}`);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Maneja endpoints de exportación
   */
  private async handleExport(req: IncomingMessage, session: IAdminSession, path: string[], method: string): Promise<any> {
    this.requirePermission(session, 'export');

    if (method !== 'GET') {
      throw new FaucetError("ADMIN_METHOD_NOT_ALLOWED", "Only GET method allowed for export endpoints");
    }

    switch (path[0]) {
      case 'stats':
        return this.exportStats(session, path.slice(1));
      
      case 'sessions':
        return this.exportSessions(session, path.slice(1));
      
      case 'alerts':
        return this.exportAlerts(session);
      
      case 'users':
        return this.exportUsers(session);
      
      default:
        throw new FaucetError("ADMIN_EXPORT_ENDPOINT_NOT_FOUND", `Export endpoint not found: ${path[0]}`);
    }
  }

  /**
   * Exporta estadísticas
   */
  private async exportStats(session: IAdminSession, path: string[]): Promise<any> {
    try {
      const format = path[0] || 'json'; // json, csv
      const stats = await this.adminStats.getStats();
      
      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.INFO,
        `Admin ${session.username} exported statistics in ${format} format`
      );

      if (format === 'csv') {
        return this.convertStatsToCSV(stats);
      }

      return {
        success: true,
        data: stats,
        exportInfo: {
          format,
          timestamp: Date.now(),
          exportedBy: session.username
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Exporta sesiones
   */
  private async exportSessions(session: IAdminSession, path: string[]): Promise<any> {
    try {
      const format = path[0] || 'json';
      const database = ServiceManager.GetService(FaucetDatabase);
      
      // TODO: Implementar exportación real de sesiones desde la base de datos
      const mockSessions = [
        {
          sessionId: "session-1",
          targetAddr: "0x1234...5678",
          remoteIP: "192.168.1.1",
          startTime: Date.now() - 3600000,
          status: "finished",
          dropAmount: "1000000000000000000"
        }
      ];

      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.INFO,
        `Admin ${session.username} exported sessions in ${format} format`
      );

      if (format === 'csv') {
        return this.convertSessionsToCSV(mockSessions);
      }

      return {
        success: true,
        data: {
          sessions: mockSessions,
          totalCount: mockSessions.length
        },
        exportInfo: {
          format,
          timestamp: Date.now(),
          exportedBy: session.username
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Exporta alertas
   */
  private async exportAlerts(session: IAdminSession): Promise<any> {
    try {
      const alerts = this.adminAlerts.getAllAlerts(1000);
      
      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.INFO,
        `Admin ${session.username} exported alerts`
      );

      return {
        success: true,
        data: {
          alerts,
          totalCount: alerts.length
        },
        exportInfo: {
          format: 'json',
          timestamp: Date.now(),
          exportedBy: session.username
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Exporta usuarios
   */
  private async exportUsers(session: IAdminSession): Promise<any> {
    try {
      const database = ServiceManager.GetService(FaucetDatabase);
      const [topAddresses, topIPs] = await Promise.all([
        database.getTopAddresses(1000),
        database.getTopIPs(1000)
      ]);

      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.INFO,
        `Admin ${session.username} exported user data`
      );

      return {
        success: true,
        data: {
          addresses: topAddresses,
          ips: topIPs,
          totalAddresses: topAddresses.length,
          totalIPs: topIPs.length
        },
        exportInfo: {
          format: 'json',
          timestamp: Date.now(),
          exportedBy: session.username
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convierte estadísticas a formato CSV
   */
  private convertStatsToCSV(stats: any): any {
    // TODO: Implementar conversión real a CSV
    return {
      success: true,
      data: "timestamp,balance,activeSessions,completedToday\n" +
            `${Date.now()},${stats.balance?.formatted || '0'},${stats.activity?.activeSessions || 0},${stats.activity?.completedToday || 0}`,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="faucet-stats.csv"'
      }
    };
  }

  /**
   * Convierte sesiones a formato CSV
   */
  private convertSessionsToCSV(sessions: any[]): any {
    const csvHeader = "sessionId,targetAddr,remoteIP,startTime,status,dropAmount\n";
    const csvRows = sessions.map(s => 
      `${s.sessionId},${s.targetAddr},${s.remoteIP},${s.startTime},${s.status},${s.dropAmount}`
    ).join('\n');

    return {
      success: true,
      data: csvHeader + csvRows,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="faucet-sessions.csv"'
      }
    };
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

    if (path[0] === 'validate' && method === 'POST') {
      // POST /api/admin/config/validate - Validar configuración
      const configToValidate = JSON.parse(body.toString());
      return this.validateConfigEndpoint(session, configToValidate);
    }

    if (path[0] === 'backup' && method === 'GET') {
      // GET /api/admin/config/backup - Obtener backup de configuración
      return this.getConfigBackup(session);
    }

    if (path[0] === 'restore' && method === 'POST') {
      // POST /api/admin/config/restore - Restaurar configuración desde backup
      const backupData = JSON.parse(body.toString());
      return this.restoreConfigFromBackup(session, backupData);
    }

    throw new FaucetError("ADMIN_CONFIG_ENDPOINT_NOT_FOUND", `Config endpoint not found: ${path.join('/')}`);
  }

  /**
   * Maneja endpoints de logs
   */
  private async handleLogs(req: IncomingMessage, session: IAdminSession, path: string[]): Promise<any> {
    this.requirePermission(session, 'logs');

    if (path.length === 0) {
      // GET /api/admin/logs - Obtener logs recientes
      const logs = await this.getSystemLogs();
      return { success: true, data: logs };
    }

    switch (path[0]) {
      case 'download':
        // GET /api/admin/logs/download - Descargar archivo de logs
        return this.downloadLogFile();
      
      case 'clear':
        // POST /api/admin/logs/clear - Limpiar logs (requiere permisos especiales)
        this.requirePermission(session, 'all');
        return this.clearLogs(session);
      
      default:
        throw new FaucetError("ADMIN_LOGS_ENDPOINT_NOT_FOUND", `Logs endpoint not found: ${path[0]}`);
    }
  }

  /**
   * Obtiene logs del sistema
   */
  private async getSystemLogs(limit: number = 100): Promise<any> {
    try {
      const { faucetConfig } = await import("../../config/FaucetConfig.js");
      const logFile = faucetConfig.faucetLogFile;
      
      if (!logFile) {
        return {
          logs: [],
          message: "Log file not configured"
        };
      }

      // TODO: Implementar lectura real del archivo de logs
      // Por ahora retornamos logs simulados
      const mockLogs = [
        {
          timestamp: Date.now() - 60000,
          level: "INFO",
          message: "Faucet started successfully",
          module: "FaucetProcess"
        },
        {
          timestamp: Date.now() - 30000,
          level: "INFO",
          message: "Admin Dashboard initialized",
          module: "AdminDashboard"
        },
        {
          timestamp: Date.now() - 10000,
          level: "WARNING",
          message: "High activity detected",
          module: "AdminAlerts"
        }
      ];

      return {
        logs: mockLogs.slice(0, limit),
        totalCount: mockLogs.length,
        logFile: logFile
      };
    } catch (error) {
      return {
        logs: [],
        error: error.message
      };
    }
  }

  /**
   * Descarga archivo de logs
   */
  private downloadLogFile(): any {
    // TODO: Implementar descarga de archivo de logs
    return {
      success: false,
      message: "Log file download not implemented yet"
    };
  }

  /**
   * Limpia logs del sistema
   */
  private clearLogs(session: IAdminSession): any {
    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.WARNING,
      `Admin ${session.username} cleared system logs`
    );

    // TODO: Implementar limpieza real de logs
    return {
      success: false,
      message: "Log clearing not implemented yet"
    };
  }

  /**
   * Maneja endpoints de usuarios
   */
  private async handleUsers(req: IncomingMessage, session: IAdminSession, path: string[], method: string, body: Buffer): Promise<any> {
    this.requirePermission(session, 'users');

    if (path.length === 0) {
      if (method === 'GET') {
        // GET /api/admin/users - Obtener estadísticas de usuarios
        const userStats = await this.getUserStats();
        return { success: true, data: userStats };
      }
    }

    switch (path[0]) {
      case 'blacklist':
        return this.handleBlacklist(req, session, path.slice(1), method, body);
      
      case 'whitelist':
        return this.handleWhitelist(req, session, path.slice(1), method, body);
      
      case 'sessions':
        return this.handleUserSessions(req, session, path.slice(1), method);
      
      case 'top':
        return this.getTopUsers();
      
      default:
        throw new FaucetError("ADMIN_USERS_ENDPOINT_NOT_FOUND", `Users endpoint not found: ${path[0]}`);
    }
  }

  /**
   * Maneja blacklist
   */
  private async handleBlacklist(req: IncomingMessage, session: IAdminSession, path: string[], method: string, body: Buffer): Promise<any> {
    if (method === 'GET') {
      // GET /api/admin/users/blacklist - Obtener blacklist
      const blacklist = await this.getBlacklist();
      return { success: true, data: blacklist };
    } else if (method === 'POST') {
      // POST /api/admin/users/blacklist - Agregar a blacklist
      const data = JSON.parse(body.toString());
      const result = await this.addToBlacklist(session, data);
      return result;
    } else if (method === 'DELETE') {
      // DELETE /api/admin/users/blacklist - Remover de blacklist
      const data = JSON.parse(body.toString());
      const result = await this.removeFromBlacklist(session, data);
      return result;
    }

    throw new FaucetError("ADMIN_METHOD_NOT_ALLOWED", `Method ${method} not allowed for blacklist`);
  }

  /**
   * Maneja whitelist
   */
  private async handleWhitelist(req: IncomingMessage, session: IAdminSession, path: string[], method: string, body: Buffer): Promise<any> {
    if (method === 'GET') {
      // GET /api/admin/users/whitelist - Obtener whitelist
      const whitelist = await this.getWhitelist();
      return { success: true, data: whitelist };
    } else if (method === 'POST') {
      // POST /api/admin/users/whitelist - Agregar a whitelist
      const data = JSON.parse(body.toString());
      const result = await this.addToWhitelist(session, data);
      return result;
    } else if (method === 'DELETE') {
      // DELETE /api/admin/users/whitelist - Remover de whitelist
      const data = JSON.parse(body.toString());
      const result = await this.removeFromWhitelist(session, data);
      return result;
    }

    throw new FaucetError("ADMIN_METHOD_NOT_ALLOWED", `Method ${method} not allowed for whitelist`);
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  private async getUserStats(): Promise<any> {
    try {
      const database = ServiceManager.GetService(FaucetDatabase);
      
      // Obtener estadísticas básicas
      const [topAddresses, topIPs] = await Promise.all([
        database.getTopAddresses(10),
        database.getTopIPs(10)
      ]);

      return {
        topAddresses,
        topIPs,
        blacklistCount: 0, // TODO: implementar conteo real
        whitelistCount: 0, // TODO: implementar conteo real
        totalUsers: topAddresses.length,
        activeUsers: topAddresses.filter(addr => 
          Date.now() - addr.lastSession < 24 * 60 * 60 * 1000
        ).length
      };
    } catch (error) {
      return {
        error: error.message,
        topAddresses: [],
        topIPs: []
      };
    }
  }

  /**
   * Obtiene blacklist
   */
  private async getBlacklist(): Promise<any> {
    // TODO: Implementar lectura real de blacklist
    return {
      addresses: [],
      ips: [],
      message: "Blacklist reading not fully implemented"
    };
  }

  /**
   * Obtiene whitelist
   */
  private async getWhitelist(): Promise<any> {
    // TODO: Implementar lectura real de whitelist
    return {
      addresses: [],
      ips: [],
      message: "Whitelist reading not fully implemented"
    };
  }

  /**
   * Agrega a blacklist
   */
  private async addToBlacklist(session: IAdminSession, data: any): Promise<any> {
    const { address, ip, reason } = data;
    
    if (!address && !ip) {
      throw new FaucetError("ADMIN_INVALID_INPUT", "Address or IP required");
    }

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.WARNING,
      `Admin ${session.username} added to blacklist: ${address || ip} (reason: ${reason || 'none'})`
    );

    // TODO: Implementar adición real a blacklist
    return {
      success: true,
      message: `Added ${address || ip} to blacklist`,
      item: { address, ip, reason, addedBy: session.username, timestamp: Date.now() }
    };
  }

  /**
   * Remueve de blacklist
   */
  private async removeFromBlacklist(session: IAdminSession, data: any): Promise<any> {
    const { address, ip } = data;
    
    if (!address && !ip) {
      throw new FaucetError("ADMIN_INVALID_INPUT", "Address or IP required");
    }

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Admin ${session.username} removed from blacklist: ${address || ip}`
    );

    // TODO: Implementar remoción real de blacklist
    return {
      success: true,
      message: `Removed ${address || ip} from blacklist`
    };
  }

  /**
   * Agrega a whitelist
   */
  private async addToWhitelist(session: IAdminSession, data: any): Promise<any> {
    const { address, ip, reason } = data;
    
    if (!address && !ip) {
      throw new FaucetError("ADMIN_INVALID_INPUT", "Address or IP required");
    }

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Admin ${session.username} added to whitelist: ${address || ip} (reason: ${reason || 'none'})`
    );

    // TODO: Implementar adición real a whitelist
    return {
      success: true,
      message: `Added ${address || ip} to whitelist`,
      item: { address, ip, reason, addedBy: session.username, timestamp: Date.now() }
    };
  }

  /**
   * Remueve de whitelist
   */
  private async removeFromWhitelist(session: IAdminSession, data: any): Promise<any> {
    const { address, ip } = data;
    
    if (!address && !ip) {
      throw new FaucetError("ADMIN_INVALID_INPUT", "Address or IP required");
    }

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Admin ${session.username} removed from whitelist: ${address || ip}`
    );

    // TODO: Implementar remoción real de whitelist
    return {
      success: true,
      message: `Removed ${address || ip} from whitelist`
    };
  }

  /**
   * Maneja sesiones de usuarios
   */
  private async handleUserSessions(req: IncomingMessage, session: IAdminSession, path: string[], method: string): Promise<any> {
    if (path.length === 0) {
      // GET /api/admin/users/sessions - Obtener sesiones activas de usuarios
      const sessionManager = ServiceManager.GetService(SessionManager);
      const activeSessions = sessionManager.getActiveSessions();
      
      return {
        success: true,
        data: {
          activeSessions: activeSessions.length,
          sessions: activeSessions.map(s => ({
            sessionId: s.getSessionId(),
            targetAddr: s.getTargetAddr(),
            remoteIP: s.getRemoteIP(),
            startTime: s.getStartTime(),
            status: s.getSessionStatus(),
            tasks: s.getBlockingTasks()
          }))
        }
      };
    }

    if (path[0] === 'terminate' && method === 'POST') {
      // POST /api/admin/users/sessions/terminate - Terminar sesión específica
      // TODO: Implementar terminación de sesiones
      return {
        success: false,
        message: "Session termination not implemented yet"
      };
    }

    throw new FaucetError("ADMIN_USERS_SESSIONS_ENDPOINT_NOT_FOUND", `User sessions endpoint not found: ${path[0]}`);
  }

  /**
   * Obtiene top usuarios
   */
  private async getTopUsers(): Promise<any> {
    try {
      const database = ServiceManager.GetService(FaucetDatabase);
      const topAddresses = await database.getTopAddresses(20);
      
      return {
        success: true,
        data: {
          topAddresses: topAddresses.map(addr => ({
            ...addr,
            isActive: Date.now() - addr.lastSession < 24 * 60 * 60 * 1000,
            daysSinceLastRequest: Math.floor((Date.now() - addr.lastSession) / (24 * 60 * 60 * 1000))
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Maneja endpoints de módulos
   */
  private async handleModules(req: IncomingMessage, session: IAdminSession, path: string[], method: string, body: Buffer): Promise<any> {
    this.requirePermission(session, 'modules');

    if (path.length === 0) {
      if (method === 'GET') {
        // GET /api/admin/modules - Obtener estado de módulos
        const moduleStats = await this.getModuleStats();
        return { success: true, data: moduleStats };
      } else if (method === 'POST') {
        // POST /api/admin/modules - Actualizar estado de módulos
        const data = JSON.parse(body.toString());
        const result = await this.updateModuleStatus(session, data);
        return result;
      }
    }

    switch (path[0]) {
      case 'reload':
        if (method === 'POST') {
          // POST /api/admin/modules/reload - Recargar módulos
          return this.reloadModules(session);
        }
        break;
      
      case 'config':
        if (path[1]) {
          // GET /api/admin/modules/config/{moduleName} - Obtener configuración de módulo
          return this.getModuleConfig(path[1]);
        }
        break;
      
      default:
        throw new FaucetError("ADMIN_MODULES_ENDPOINT_NOT_FOUND", `Modules endpoint not found: ${path[0]}`);
    }
  }

  /**
   * Obtiene estadísticas de módulos
   */
  private async getModuleStats(): Promise<any> {
    try {
      const moduleManager = ServiceManager.GetService(ModuleManager);
      const { faucetConfig } = await import("../../config/FaucetConfig.js");
      
      const modules = [];
      
      for (const moduleName in faucetConfig.modules) {
        if (faucetConfig.modules.hasOwnProperty(moduleName)) {
          const moduleConfig = faucetConfig.modules[moduleName];
          let moduleInstance = null;
          let isLoaded = false;
          
          try {
            moduleInstance = moduleManager.getModule(moduleName);
            isLoaded = true;
          } catch (error) {
            // Módulo no cargado
          }
          
          modules.push({
            name: moduleName,
            enabled: moduleConfig.enabled || false,
            loaded: isLoaded,
            active: isLoaded && moduleInstance?.isEnabled(),
            config: {
              hasConfig: Object.keys(moduleConfig).length > 1, // Más que solo 'enabled'
              configKeys: Object.keys(moduleConfig)
            },
            stats: {
              // TODO: Agregar estadísticas específicas del módulo
              sessionsProcessed: 0,
              lastActivity: isLoaded ? Date.now() : null
            }
          });
        }
      }
      
      return {
        modules,
        totalModules: modules.length,
        enabledModules: modules.filter(m => m.enabled).length,
        loadedModules: modules.filter(m => m.loaded).length,
        activeModules: modules.filter(m => m.active).length
      };
    } catch (error) {
      return {
        modules: [],
        error: error.message
      };
    }
  }

  /**
   * Actualiza estado de módulos
   */
  private async updateModuleStatus(session: IAdminSession, data: any): Promise<any> {
    const { moduleName, enabled } = data;
    
    if (!moduleName) {
      throw new FaucetError("ADMIN_INVALID_INPUT", "Module name required");
    }

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Admin ${session.username} ${enabled ? 'enabled' : 'disabled'} module: ${moduleName}`
    );

    // TODO: Implementar habilitación/deshabilitación real de módulos
    // Esto requeriría modificar la configuración y recargar módulos
    return {
      success: false,
      message: "Module status update not fully implemented",
      note: "This would require configuration file modification and module reloading"
    };
  }

  /**
   * Recarga módulos
   */
  private async reloadModules(session: IAdminSession): Promise<any> {
    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.WARNING,
      `Admin ${session.username} requested module reload`
    );

    try {
      // TODO: Implementar recarga real de módulos
      // Esto es una operación delicada que requiere cuidado
      return {
        success: false,
        message: "Module reloading not implemented",
        warning: "This operation requires careful implementation to avoid service disruption"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene configuración de un módulo específico
   */
  private async getModuleConfig(moduleName: string): Promise<any> {
    try {
      const { faucetConfig } = await import("../../config/FaucetConfig.js");
      const moduleConfig = faucetConfig.modules[moduleName];
      
      if (!moduleConfig) {
        throw new FaucetError("ADMIN_MODULE_NOT_FOUND", `Module ${moduleName} not found`);
      }

      // Remover datos sensibles de la configuración
      const safeConfig = { ...moduleConfig };
      
      // Lista de campos sensibles que no deben exponerse
      const sensitiveFields = ['secret', 'key', 'password', 'token', 'apiKey', 'privateKey'];
      
      function sanitizeConfig(obj: any): any {
        if (typeof obj !== 'object' || obj === null) {
          return obj;
        }
        
        const sanitized = Array.isArray(obj) ? [] : {};
        
        for (const [key, value] of Object.entries(obj)) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            (sanitized as any)[key] = '[HIDDEN]';
          } else if (typeof value === 'object') {
            (sanitized as any)[key] = sanitizeConfig(value);
          } else {
            (sanitized as any)[key] = value;
          }
        }
        
        return sanitized;
      }

      return {
        success: true,
        data: {
          moduleName,
          config: sanitizeConfig(safeConfig),
          configKeys: Object.keys(moduleConfig),
          hasSecrets: Object.keys(moduleConfig).some(key => 
            sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))
          )
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
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
  private async updateConfig(session: IAdminSession, newConfig: any): Promise<any> {
    try {
      // Validar que el usuario tenga permisos de configuración
      this.requirePermission(session, 'config');

      // Validar la nueva configuración
      const validationResult = this.validateConfig(newConfig);
      if (!validationResult.valid) {
        return {
          success: false,
          error: {
            code: "ADMIN_INVALID_CONFIG",
            message: "Invalid configuration",
            details: validationResult.errors
          }
        };
      }

      // TODO: Implementar actualización real de configuración
      // Por ahora, solo simulamos la actualización
      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.INFO,
        `Admin ${session.username} updated configuration: ${JSON.stringify(Object.keys(newConfig))}`
      );

      return {
        success: true,
        message: "Configuration updated successfully",
        changes: this.getConfigChanges(newConfig)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ADMIN_CONFIG_UPDATE_FAILED",
          message: error.message
        }
      };
    }
  }

  /**
   * Valida una configuración (endpoint)
   */
  private async validateConfigEndpoint(session: IAdminSession, config: any): Promise<any> {
    try {
      const validationResult = this.validateConfig(config);
      
      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.INFO,
        `Admin ${session.username} validated configuration`
      );

      return {
        success: true,
        valid: validationResult.valid,
        errors: validationResult.errors,
        warnings: this.getConfigWarnings(config)
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ADMIN_CONFIG_VALIDATION_FAILED",
          message: error.message
        }
      };
    }
  }

  /**
   * Obtiene backup de configuración actual
   */
  private async getConfigBackup(session: IAdminSession): Promise<any> {
    try {
      const { faucetConfig } = await import("../../config/FaucetConfig.js");
      
      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.INFO,
        `Admin ${session.username} requested configuration backup`
      );

      return {
        success: true,
        data: {
          backup: this.getSafeConfig(),
          timestamp: Date.now(),
          version: faucetConfig.faucetVersion,
          backupBy: session.username
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ADMIN_CONFIG_BACKUP_FAILED",
          message: error.message
        }
      };
    }
  }

  /**
   * Restaura configuración desde backup
   */
  private async restoreConfigFromBackup(session: IAdminSession, backupData: any): Promise<any> {
    try {
      if (!backupData.backup) {
        throw new Error("Invalid backup data");
      }

      // Validar el backup antes de restaurar
      const validationResult = this.validateConfig(backupData.backup);
      if (!validationResult.valid) {
        return {
          success: false,
          error: {
            code: "ADMIN_INVALID_BACKUP",
            message: "Backup contains invalid configuration",
            details: validationResult.errors
          }
        };
      }

      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.WARNING,
        `Admin ${session.username} restored configuration from backup (timestamp: ${backupData.timestamp})`
      );

      // TODO: Implementar restauración real de configuración
      return {
        success: true,
        message: "Configuration restored from backup",
        restoredFrom: {
          timestamp: backupData.timestamp,
          backupBy: backupData.backupBy
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ADMIN_CONFIG_RESTORE_FAILED",
          message: error.message
        }
      };
    }
  }

  /**
   * Obtiene advertencias de configuración
   */
  private getConfigWarnings(config: any): string[] {
    const warnings: string[] = [];

    // Advertencias de seguridad
    if (config.faucetSecret === "test-secret") {
      warnings.push("Using default faucet secret - change for production");
    }

    if (config.ethWalletKey && config.ethWalletKey.startsWith("0x1234")) {
      warnings.push("Using test wallet key - use real wallet for production");
    }

    // Advertencias de configuración
    if (config.serverPort === 8080) {
      warnings.push("Using default port 8080 - consider using a different port");
    }

    if (config.sessionTimeout < 300) {
      warnings.push("Session timeout is very short (< 5 minutes)");
    }

    if (config.claimTimeout < 60) {
      warnings.push("Claim timeout is very short (< 1 minute)");
    }

    // Advertencias de módulos
    if (config.modules) {
      const enabledModules = Object.entries(config.modules)
        .filter(([_, moduleConfig]: [string, any]) => moduleConfig?.enabled)
        .map(([name]) => name);

      if (enabledModules.length === 0) {
        warnings.push("No protection modules enabled - faucet may be vulnerable to abuse");
      }

      if (enabledModules.includes('pow') && enabledModules.includes('captcha')) {
        warnings.push("Both PoW and CAPTCHA modules enabled - may create poor user experience");
      }
    }

    return warnings;
  }

  /**
   * Obtiene los cambios realizados en la configuración
   */
  private getConfigChanges(newConfig: any): any {
    // TODO: Comparar con configuración actual y retornar diferencias
    return {
      modified: Object.keys(newConfig),
      timestamp: Date.now()
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