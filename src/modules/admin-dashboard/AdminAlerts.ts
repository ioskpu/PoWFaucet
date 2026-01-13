import { ServiceManager } from "../../common/ServiceManager.js";
import { FaucetProcess, FaucetLogLevel } from "../../common/FaucetProcess.js";
import { IAdminDashboardConfig, IAdminAlert } from "./AdminDashboardConfig.js";
import { AdminStats, IFaucetStats } from "./AdminStats.js";

export interface IAlert {
  id: string;
  type: string;
  level: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  data?: any;
}

export interface IAlertRule {
  type: string;
  config: IAdminAlert;
  lastCheck: number;
  lastTriggered: number;
  isActive: boolean;
}

export class AdminAlerts {
  private config: IAdminDashboardConfig;
  private adminStats: AdminStats;
  private alerts: Map<string, IAlert> = new Map();
  private alertRules: Map<string, IAlertRule> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private alertIdCounter = 0;

  constructor(config: IAdminDashboardConfig, adminStats: AdminStats) {
    this.config = config;
    this.adminStats = adminStats;
    
    this.initializeAlertRules();
    this.startMonitoring();
  }

  /**
   * Inicializa las reglas de alerta
   */
  private initializeAlertRules(): void {
    for (const [alertType, alertConfig] of Object.entries(this.config.alerts)) {
      if (alertConfig && alertConfig.enabled) {
        this.alertRules.set(alertType, {
          type: alertType,
          config: alertConfig,
          lastCheck: 0,
          lastTriggered: 0,
          isActive: false
        });
      }
    }
  }

  /**
   * Inicia el monitoreo de alertas
   */
  private startMonitoring(): void {
    // Verificar alertas cada 30 segundos
    this.checkInterval = setInterval(() => {
      this.checkAllAlerts();
    }, 30000);

    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO, 
      `Admin Alerts initialized with ${this.alertRules.size} alert rules`
    );
  }

  /**
   * Detiene el monitoreo
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Verifica todas las alertas
   */
  private async checkAllAlerts(): Promise<void> {
    try {
      const stats = await this.adminStats.getRealTimeStats();
      
      for (const [alertType, rule] of this.alertRules) {
        await this.checkAlert(alertType, rule, stats);
      }
    } catch (error) {
      ServiceManager.GetService(FaucetProcess).emitLog(
        FaucetLogLevel.ERROR, 
        `Error checking alerts: ${error}`
      );
    }
  }

  /**
   * Verifica una alerta específica
   */
  private async checkAlert(alertType: string, rule: IAlertRule, stats: Partial<IFaucetStats>): Promise<void> {
    const now = Date.now();
    rule.lastCheck = now;

    let shouldTrigger = false;
    let alertData: any = {};

    switch (alertType) {
      case 'lowBalance':
        if (stats.balance && rule.config.threshold) {
          const currentBalance = BigInt(stats.balance.current);
          const threshold = BigInt(rule.config.threshold);
          shouldTrigger = currentBalance < threshold;
          alertData = {
            currentBalance: stats.balance.formatted,
            threshold: this.formatEther(rule.config.threshold.toString())
          };
        }
        break;

      case 'highActivity':
        if (stats.activity && rule.config.threshold) {
          // Verificar actividad en la última hora
          const hourlyRequests = stats.activity.activeSessions + stats.activity.queuedSessions;
          shouldTrigger = hourlyRequests > rule.config.threshold;
          alertData = {
            currentActivity: hourlyRequests,
            threshold: rule.config.threshold
          };
        }
        break;

      case 'systemErrors':
        // Verificar errores del sistema (implementar según necesidades)
        shouldTrigger = false; // TODO: implementar lógica de errores
        break;

      case 'failedTransactions':
        if (stats.activity && rule.config.threshold) {
          shouldTrigger = stats.activity.failedToday > rule.config.threshold;
          alertData = {
            failedTransactions: stats.activity.failedToday,
            threshold: rule.config.threshold
          };
        }
        break;
    }

    if (shouldTrigger && !rule.isActive) {
      // Activar alerta
      this.triggerAlert(alertType, rule, alertData);
      rule.isActive = true;
      rule.lastTriggered = now;
    } else if (!shouldTrigger && rule.isActive) {
      // Desactivar alerta
      this.resolveAlert(alertType, rule);
      rule.isActive = false;
    }
  }

  /**
   * Dispara una alerta
   */
  private triggerAlert(alertType: string, rule: IAlertRule, data: any): void {
    const alert: IAlert = {
      id: this.generateAlertId(),
      type: alertType,
      level: this.getAlertLevel(alertType),
      title: this.getAlertTitle(alertType),
      message: rule.config.message || this.getDefaultMessage(alertType, data),
      timestamp: Date.now(),
      acknowledged: false,
      data
    };

    this.alerts.set(alert.id, alert);

    // Log de la alerta
    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.WARNING,
      `ALERT [${alertType}]: ${alert.message}`
    );

    // Enviar notificaciones
    this.sendNotifications(alert, rule.config.notification);
  }

  /**
   * Resuelve una alerta
   */
  private resolveAlert(alertType: string, rule: IAlertRule): void {
    // Marcar alertas relacionadas como resueltas
    for (const [alertId, alert] of this.alerts) {
      if (alert.type === alertType && !alert.acknowledged) {
        alert.acknowledged = true;
        
        ServiceManager.GetService(FaucetProcess).emitLog(
          FaucetLogLevel.INFO,
          `ALERT RESOLVED [${alertType}]: ${alert.message}`
        );
      }
    }
  }

  /**
   * Obtiene el nivel de una alerta
   */
  private getAlertLevel(alertType: string): IAlert['level'] {
    switch (alertType) {
      case 'lowBalance':
        return 'critical';
      case 'highActivity':
        return 'warning';
      case 'systemErrors':
        return 'error';
      case 'failedTransactions':
        return 'warning';
      default:
        return 'info';
    }
  }

  /**
   * Obtiene el título de una alerta
   */
  private getAlertTitle(alertType: string): string {
    switch (alertType) {
      case 'lowBalance':
        return 'Balance Bajo';
      case 'highActivity':
        return 'Alta Actividad';
      case 'systemErrors':
        return 'Errores del Sistema';
      case 'failedTransactions':
        return 'Transacciones Fallidas';
      default:
        return 'Alerta del Sistema';
    }
  }

  /**
   * Obtiene mensaje por defecto para una alerta
   */
  private getDefaultMessage(alertType: string, data: any): string {
    switch (alertType) {
      case 'lowBalance':
        return `Balance del faucet (${data.currentBalance} ETH) está por debajo del umbral (${data.threshold} ETH)`;
      case 'highActivity':
        return `Actividad inusualmente alta detectada: ${data.currentActivity} solicitudes (umbral: ${data.threshold})`;
      case 'systemErrors':
        return 'Se han detectado errores del sistema';
      case 'failedTransactions':
        return `Alto número de transacciones fallidas: ${data.failedTransactions} (umbral: ${data.threshold})`;
      default:
        return 'Alerta del sistema activada';
    }
  }

  /**
   * Envía notificaciones
   */
  private sendNotifications(alert: IAlert, channels: string[]): void {
    for (const channel of channels) {
      switch (channel) {
        case 'dashboard':
          // Ya está guardada en this.alerts
          break;
        case 'email':
          this.sendEmailNotification(alert);
          break;
        case 'webhook':
          this.sendWebhookNotification(alert);
          break;
      }
    }
  }

  /**
   * Envía notificación por email
   */
  private sendEmailNotification(alert: IAlert): void {
    // TODO: Implementar envío de email
    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Email notification would be sent for alert: ${alert.title}`
    );
  }

  /**
   * Envía notificación por webhook
   */
  private sendWebhookNotification(alert: IAlert): void {
    // TODO: Implementar webhook
    ServiceManager.GetService(FaucetProcess).emitLog(
      FaucetLogLevel.INFO,
      `Webhook notification would be sent for alert: ${alert.title}`
    );
  }

  /**
   * Genera ID único para alerta
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${++this.alertIdCounter}`;
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
   * Obtiene todas las alertas activas
   */
  public getActiveAlerts(): IAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Obtiene todas las alertas (incluyendo reconocidas)
   */
  public getAllAlerts(limit: number = 100): IAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Reconoce una alerta
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Reconoce todas las alertas
   */
  public acknowledgeAllAlerts(): number {
    let count = 0;
    for (const alert of this.alerts.values()) {
      if (!alert.acknowledged) {
        alert.acknowledged = true;
        count++;
      }
    }
    return count;
  }

  /**
   * Limpia alertas antiguas
   */
  public cleanupOldAlerts(maxAge: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;

    for (const [alertId, alert] of this.alerts) {
      if (alert.timestamp < cutoff && alert.acknowledged) {
        this.alerts.delete(alertId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Obtiene estadísticas de alertas
   */
  public getAlertStats(): {
    total: number;
    active: number;
    acknowledged: number;
    byLevel: { [level: string]: number };
    byType: { [type: string]: number };
  } {
    const alerts = Array.from(this.alerts.values());
    const active = alerts.filter(a => !a.acknowledged);
    const acknowledged = alerts.filter(a => a.acknowledged);

    const byLevel: { [level: string]: number } = {};
    const byType: { [type: string]: number } = {};

    for (const alert of alerts) {
      byLevel[alert.level] = (byLevel[alert.level] || 0) + 1;
      byType[alert.type] = (byType[alert.type] || 0) + 1;
    }

    return {
      total: alerts.length,
      active: active.length,
      acknowledged: acknowledged.length,
      byLevel,
      byType
    };
  }
}