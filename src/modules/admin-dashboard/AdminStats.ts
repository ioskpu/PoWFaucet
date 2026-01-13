import { ServiceManager } from "../../common/ServiceManager.js";
import { FaucetDatabase } from "../../db/FaucetDatabase.js";
import { EthWalletManager } from "../../eth/EthWalletManager.js";
import { SessionManager } from "../../session/SessionManager.js";
import { EthClaimManager } from "../../eth/EthClaimManager.js";
import { ModuleManager } from "../ModuleManager.js";
import { IAdminDashboardConfig } from "./AdminDashboardConfig.js";

export interface IFaucetStats {
  // Balance y wallet
  balance: {
    current: string; // en wei
    formatted: string; // en ETH
    lastUpdate: number;
  };
  
  // Actividad general
  activity: {
    activeSessions: number;
    queuedSessions: number;
    completedToday: number;
    failedToday: number;
    totalDistributed: string; // en wei
    totalDistributedFormatted: string; // en ETH
  };
  
  // Estadísticas por tiempo
  hourlyStats: {
    hour: number;
    requests: number;
    completed: number;
    failed: number;
    distributed: string; // en wei
  }[];
  
  dailyStats: {
    date: string;
    requests: number;
    completed: number;
    failed: number;
    distributed: string; // en wei
  }[];
  
  // Estadísticas de módulos
  moduleStats: {
    [moduleName: string]: {
      enabled: boolean;
      sessionsProcessed: number;
      sessionsBlocked: number;
      lastActivity: number;
    };
  };
  
  // Top usuarios/IPs
  topAddresses: {
    address: string;
    requests: number;
    totalReceived: string; // en wei
    lastRequest: number;
  }[];
  
  topIPs: {
    ip: string;
    requests: number;
    lastRequest: number;
    country?: string;
  }[];
  
  // Sistema
  system: {
    uptime: number;
    version: string;
    nodeVersion: string;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    lastUpdate: number;
  };
}

export class AdminStats {
  private config: IAdminDashboardConfig;
  private cachedStats: IFaucetStats | null = null;
  private lastStatsUpdate: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 segundos

  constructor(config: IAdminDashboardConfig) {
    this.config = config;
  }

  /**
   * Obtiene estadísticas completas del faucet
   */
  public async getStats(forceRefresh: boolean = false): Promise<IFaucetStats> {
    const now = Date.now();
    
    // Usar cache si está disponible y no ha expirado
    if (!forceRefresh && this.cachedStats && (now - this.lastStatsUpdate) < this.CACHE_DURATION) {
      return this.cachedStats;
    }

    // Generar nuevas estadísticas
    const stats = await this.generateStats();
    
    // Actualizar cache
    this.cachedStats = stats;
    this.lastStatsUpdate = now;
    
    return stats;
  }

  /**
   * Genera estadísticas frescas
   */
  private async generateStats(): Promise<IFaucetStats> {
    const [
      balanceStats,
      activityStats,
      hourlyStats,
      dailyStats,
      moduleStats,
      topAddresses,
      topIPs,
      systemStats
    ] = await Promise.all([
      this.getBalanceStats(),
      this.getActivityStats(),
      this.getHourlyStats(),
      this.getDailyStats(),
      this.getModuleStats(),
      this.getTopAddresses(),
      this.getTopIPs(),
      this.getSystemStats()
    ]);

    return {
      balance: balanceStats,
      activity: activityStats,
      hourlyStats,
      dailyStats,
      moduleStats,
      topAddresses,
      topIPs,
      system: systemStats
    };
  }

  /**
   * Obtiene estadísticas de balance
   */
  private async getBalanceStats(): Promise<IFaucetStats['balance']> {
    try {
      const walletManager = ServiceManager.GetService(EthWalletManager);
      const balanceWei = await walletManager.getFaucetBalance();
      const balanceEth = parseFloat(balanceWei.toString()) / Math.pow(10, 18);

      return {
        current: balanceWei.toString(),
        formatted: balanceEth.toFixed(4),
        lastUpdate: Date.now()
      };
    } catch (error) {
      return {
        current: "0",
        formatted: "0.0000",
        lastUpdate: Date.now()
      };
    }
  }

  /**
   * Obtiene estadísticas de actividad
   */
  private async getActivityStats(): Promise<IFaucetStats['activity']> {
    try {
      const sessionManager = ServiceManager.GetService(SessionManager);
      const database = ServiceManager.GetService(FaucetDatabase);
      
      const activeSessions = sessionManager.getActiveSessions().length;
      const queuedSessions = 0; // TODO: implementar cola si existe
      
      // Estadísticas del día actual
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Math.floor(today.getTime() / 1000);
      
      const todayStats = await database.getSessionStats(todayTimestamp);
      
      return {
        activeSessions,
        queuedSessions,
        completedToday: todayStats.completed || 0,
        failedToday: todayStats.failed || 0,
        totalDistributed: todayStats.totalDistributed || "0",
        totalDistributedFormatted: this.formatEther(todayStats.totalDistributed || "0")
      };
    } catch (error) {
      return {
        activeSessions: 0,
        queuedSessions: 0,
        completedToday: 0,
        failedToday: 0,
        totalDistributed: "0",
        totalDistributedFormatted: "0.0000"
      };
    }
  }

  /**
   * Obtiene estadísticas por hora (últimas 24 horas)
   */
  private async getHourlyStats(): Promise<IFaucetStats['hourlyStats']> {
    try {
      const database = ServiceManager.GetService(FaucetDatabase);
      const stats: IFaucetStats['hourlyStats'] = [];
      
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(hour.getHours() - i, 0, 0, 0);
        const hourTimestamp = Math.floor(hour.getTime() / 1000);
        
        const hourStats = await database.getSessionStats(hourTimestamp, hourTimestamp + 3600);
        
        stats.push({
          hour: hour.getHours(),
          requests: hourStats.total || 0,
          completed: hourStats.completed || 0,
          failed: hourStats.failed || 0,
          distributed: hourStats.totalDistributed || "0"
        });
      }
      
      return stats;
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtiene estadísticas diarias (últimos 30 días)
   */
  private async getDailyStats(): Promise<IFaucetStats['dailyStats']> {
    try {
      const database = ServiceManager.GetService(FaucetDatabase);
      const stats: IFaucetStats['dailyStats'] = [];
      
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const dayTimestamp = Math.floor(day.getTime() / 1000);
        
        const dayStats = await database.getSessionStats(dayTimestamp, dayTimestamp + 86400);
        
        stats.push({
          date: day.toISOString().split('T')[0],
          requests: dayStats.total || 0,
          completed: dayStats.completed || 0,
          failed: dayStats.failed || 0,
          distributed: dayStats.totalDistributed || "0"
        });
      }
      
      return stats;
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtiene estadísticas de módulos
   */
  private async getModuleStats(): Promise<IFaucetStats['moduleStats']> {
    try {
      const moduleManager = ServiceManager.GetService(ModuleManager);
      const stats: IFaucetStats['moduleStats'] = {};
      
      // Obtener módulos desde la configuración
      const { faucetConfig } = await import("../../config/FaucetConfig.js");
      
      for (const moduleName in faucetConfig.modules) {
        if (faucetConfig.modules.hasOwnProperty(moduleName)) {
          try {
            const module = moduleManager.getModule(moduleName);
            stats[moduleName] = {
              enabled: module ? module.isEnabled() : false,
              sessionsProcessed: 0, // TODO: implementar contadores en módulos
              sessionsBlocked: 0,   // TODO: implementar contadores en módulos
              lastActivity: Date.now()
            };
          } catch (error) {
            // Módulo no cargado
            stats[moduleName] = {
              enabled: false,
              sessionsProcessed: 0,
              sessionsBlocked: 0,
              lastActivity: 0
            };
          }
        }
      }
      
      return stats;
    } catch (error) {
      return {};
    }
  }

  /**
   * Obtiene top direcciones por actividad
   */
  private async getTopAddresses(): Promise<IFaucetStats['topAddresses']> {
    try {
      const database = ServiceManager.GetService(FaucetDatabase);
      const topAddresses = await database.getTopAddresses(10);
      
      return topAddresses.map(addr => ({
        address: addr.targetAddr,
        requests: addr.sessionCount,
        totalReceived: addr.totalReceived || "0",
        lastRequest: addr.lastSession
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtiene top IPs por actividad
   */
  private async getTopIPs(): Promise<IFaucetStats['topIPs']> {
    try {
      const database = ServiceManager.GetService(FaucetDatabase);
      const topIPs = await database.getTopIPs(10);
      
      return topIPs.map(ip => ({
        ip: ip.remoteIP,
        requests: ip.sessionCount,
        lastRequest: ip.lastSession,
        country: ip.country // Si está disponible
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  private async getSystemStats(): Promise<IFaucetStats['system']> {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    
    return {
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
      nodeVersion: process.version,
      memoryUsage: {
        used: usedMem,
        total: totalMem,
        percentage: Math.round((usedMem / totalMem) * 100)
      },
      lastUpdate: Date.now()
    };
  }

  /**
   * Formatea wei a ether
   */
  private formatEther(weiString: string): string {
    try {
      const wei = BigInt(weiString);
      const ether = Number(wei) / Math.pow(10, 18);
      return ether.toFixed(4);
    } catch (error) {
      return "0.0000";
    }
  }

  /**
   * Obtiene estadísticas en tiempo real (sin cache)
   */
  public async getRealTimeStats(): Promise<Partial<IFaucetStats>> {
    const [balanceStats, activityStats, systemStats] = await Promise.all([
      this.getBalanceStats(),
      this.getActivityStats(),
      this.getSystemStats()
    ]);

    return {
      balance: balanceStats,
      activity: activityStats,
      system: systemStats
    };
  }

  /**
   * Limpia el cache de estadísticas
   */
  public clearCache(): void {
    this.cachedStats = null;
    this.lastStatsUpdate = 0;
  }
}