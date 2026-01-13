import { IBaseModuleConfig } from "../BaseModule.js";

export interface IAdminUser {
  username: string;
  passwordHash: string;
  permissions: string[];
  email?: string;
  lastLogin?: number;
}

export interface IAdminAlert {
  enabled: boolean;
  threshold?: number;
  notification: string[];
  message?: string;
}

export interface IAdminDashboardConfig extends IBaseModuleConfig {
  // Configuración de usuarios administradores
  adminUsers: IAdminUser[];
  
  // Configuración de sesión
  sessionSecret: string;
  sessionExpiration: number; // segundos
  
  // Configuración de alertas
  alerts: {
    lowBalance?: IAdminAlert;
    highActivity?: IAdminAlert;
    systemErrors?: IAdminAlert;
    failedTransactions?: IAdminAlert;
  };
  
  // Configuración de UI
  ui: {
    refreshInterval: number; // milisegundos
    theme: "dark" | "light" | "auto";
    language: "es" | "en";
    itemsPerPage: number;
  };
  
  // Configuración de reportes
  reports: {
    retention: number; // días
    autoExport: boolean;
    exportFormat: string[];
    emailReports?: string[];
  };
  
  // Configuración de seguridad
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number; // segundos
    requireHTTPS: boolean;
    csrfProtection: boolean;
    sessionSecure: boolean;
    adminPath: string;
  };
}

export const defaultAdminDashboardConfig: IAdminDashboardConfig = {
  enabled: false,
  adminUsers: [],
  sessionSecret: "change-this-secret-key",
  sessionExpiration: 3600, // 1 hora
  alerts: {
    lowBalance: {
      enabled: true,
      threshold: 1000000000000000000, // 1 ETH
      notification: ["dashboard"],
      message: "Balance del faucet está bajo"
    },
    highActivity: {
      enabled: true,
      threshold: 100, // solicitudes por hora
      notification: ["dashboard"],
      message: "Actividad inusualmente alta detectada"
    },
    systemErrors: {
      enabled: true,
      notification: ["dashboard", "email"],
      message: "Errores del sistema detectados"
    },
    failedTransactions: {
      enabled: true,
      threshold: 10, // fallos por hora
      notification: ["dashboard"],
      message: "Alto número de transacciones fallidas"
    }
  },
  ui: {
    refreshInterval: 5000, // 5 segundos
    theme: "dark",
    language: "es",
    itemsPerPage: 20
  },
  reports: {
    retention: 90, // 90 días
    autoExport: false,
    exportFormat: ["csv", "json"]
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 900, // 15 minutos
    requireHTTPS: true,
    csrfProtection: true,
    sessionSecure: true,
    adminPath: "/admin"
  }
};