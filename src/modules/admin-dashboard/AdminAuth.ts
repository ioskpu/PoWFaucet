import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import { IAdminUser, IAdminDashboardConfig } from './AdminDashboardConfig.js';
import { FaucetError } from '../../common/FaucetError.js';

export interface IAdminSession {
  username: string;
  permissions: string[];
  loginTime: number;
  lastActivity: number;
  ipAddress: string;
}

export interface ILoginAttempt {
  username: string;
  ipAddress: string;
  timestamp: number;
  success: boolean;
}

export class AdminAuth {
  private config: IAdminDashboardConfig;
  private activeSessions: Map<string, IAdminSession> = new Map();
  private loginAttempts: ILoginAttempt[] = [];
  private lockedAccounts: Map<string, number> = new Map(); // username -> unlock timestamp

  constructor(config: IAdminDashboardConfig) {
    this.config = config;
    
    // Limpiar intentos de login antiguos cada 5 minutos
    setInterval(() => {
      this.cleanupOldAttempts();
    }, 5 * 60 * 1000);
  }

  /**
   * Autentica un usuario administrador
   */
  public async authenticateUser(username: string, password: string, ipAddress: string): Promise<string> {
    // Verificar si la cuenta está bloqueada
    if (this.isAccountLocked(username)) {
      this.recordLoginAttempt(username, ipAddress, false);
      throw new FaucetError("ADMIN_ACCOUNT_LOCKED", "Cuenta bloqueada por múltiples intentos fallidos");
    }

    // Buscar usuario
    const user = this.config.adminUsers.find(u => u.username === username);
    if (!user) {
      this.recordLoginAttempt(username, ipAddress, false);
      throw new FaucetError("ADMIN_INVALID_CREDENTIALS", "Credenciales inválidas");
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      this.recordLoginAttempt(username, ipAddress, false);
      
      // Verificar si debe bloquearse la cuenta
      if (this.shouldLockAccount(username)) {
        this.lockAccount(username);
      }
      
      throw new FaucetError("ADMIN_INVALID_CREDENTIALS", "Credenciales inválidas");
    }

    // Login exitoso
    this.recordLoginAttempt(username, ipAddress, true);
    
    // Actualizar último login del usuario
    user.lastLogin = Date.now();

    // Crear token JWT
    const token = jwt.sign(
      {
        username: user.username,
        permissions: user.permissions,
        loginTime: Date.now()
      },
      this.config.sessionSecret,
      {
        expiresIn: this.config.sessionExpiration
      }
    );

    // Crear sesión
    const session: IAdminSession = {
      username: user.username,
      permissions: user.permissions,
      loginTime: Date.now(),
      lastActivity: Date.now(),
      ipAddress
    };

    this.activeSessions.set(token, session);

    return token;
  }

  /**
   * Valida un token de sesión
   */
  public validateSession(token: string): IAdminSession | null {
    try {
      // Verificar JWT
      const decoded = jwt.verify(token, this.config.sessionSecret) as any;
      
      // Verificar sesión activa
      const session = this.activeSessions.get(token);
      if (!session) {
        return null;
      }

      // Verificar expiración de sesión
      const now = Date.now();
      if (now - session.lastActivity > this.config.sessionExpiration * 1000) {
        this.activeSessions.delete(token);
        return null;
      }

      // Actualizar última actividad
      session.lastActivity = now;
      
      return session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cierra una sesión
   */
  public logout(token: string): void {
    this.activeSessions.delete(token);
  }

  /**
   * Obtiene todas las sesiones activas
   */
  public getActiveSessions(): IAdminSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  public hasPermission(session: IAdminSession, permission: string): boolean {
    return session.permissions.includes("all") || session.permissions.includes(permission);
  }

  /**
   * Extrae el token de una request HTTP
   */
  public extractTokenFromRequest(req: IncomingMessage): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // También buscar en cookies si está disponible
    const cookies = this.parseCookies(req.headers.cookie || '');
    return cookies.adminToken || null;
  }

  /**
   * Middleware para verificar autenticación
   */
  public requireAuth(requiredPermission?: string) {
    return (req: IncomingMessage & { adminSession?: IAdminSession }) => {
      const token = this.extractTokenFromRequest(req);
      if (!token) {
        throw new FaucetError("ADMIN_AUTH_REQUIRED", "Autenticación requerida");
      }

      const session = this.validateSession(token);
      if (!session) {
        throw new FaucetError("ADMIN_INVALID_SESSION", "Sesión inválida o expirada");
      }

      if (requiredPermission && !this.hasPermission(session, requiredPermission)) {
        throw new FaucetError("ADMIN_INSUFFICIENT_PERMISSIONS", "Permisos insuficientes");
      }

      req.adminSession = session;
      return session;
    };
  }

  /**
   * Genera hash de contraseña para nuevos usuarios
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Registra un intento de login
   */
  private recordLoginAttempt(username: string, ipAddress: string, success: boolean): void {
    this.loginAttempts.push({
      username,
      ipAddress,
      timestamp: Date.now(),
      success
    });
  }

  /**
   * Verifica si una cuenta debe ser bloqueada
   */
  private shouldLockAccount(username: string): boolean {
    const now = Date.now();
    const recentAttempts = this.loginAttempts.filter(
      attempt => 
        attempt.username === username && 
        !attempt.success && 
        now - attempt.timestamp < 15 * 60 * 1000 // últimos 15 minutos
    );

    return recentAttempts.length >= this.config.security.maxLoginAttempts;
  }

  /**
   * Bloquea una cuenta
   */
  private lockAccount(username: string): void {
    const unlockTime = Date.now() + (this.config.security.lockoutDuration * 1000);
    this.lockedAccounts.set(username, unlockTime);
  }

  /**
   * Verifica si una cuenta está bloqueada
   */
  private isAccountLocked(username: string): boolean {
    const unlockTime = this.lockedAccounts.get(username);
    if (!unlockTime) {
      return false;
    }

    if (Date.now() > unlockTime) {
      this.lockedAccounts.delete(username);
      return false;
    }

    return true;
  }

  /**
   * Limpia intentos de login antiguos
   */
  private cleanupOldAttempts(): void {
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 horas
    
    this.loginAttempts = this.loginAttempts.filter(
      attempt => attempt.timestamp > cutoff
    );
  }

  /**
   * Parsea cookies de una request
   */
  private parseCookies(cookieHeader: string): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    return cookies;
  }

  /**
   * Obtiene estadísticas de autenticación
   */
  public getAuthStats(): {
    activeSessions: number;
    totalLoginAttempts: number;
    failedLoginAttempts: number;
    lockedAccounts: number;
  } {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    
    const recentAttempts = this.loginAttempts.filter(a => a.timestamp > last24h);
    
    return {
      activeSessions: this.activeSessions.size,
      totalLoginAttempts: recentAttempts.length,
      failedLoginAttempts: recentAttempts.filter(a => !a.success).length,
      lockedAccounts: this.lockedAccounts.size
    };
  }
}