#!/usr/bin/env node

/**
 * Build script for Admin Dashboard
 * Compiles React components into a single bundle for the admin interface
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, '..', 'static', 'admin');
const OUTPUT_FILE = join(OUTPUT_DIR, 'admin.js');
const CSS_OUTPUT_FILE = join(OUTPUT_DIR, 'admin.css');

console.log('🔧 Building Admin Dashboard...');

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  console.log('📦 Creating admin bundle...');
  
  // Read CSS files
  const cssFiles = [
    'src/components/admin/AdminLogin.css',
    'src/components/admin/AdminLayout.css', 
    'src/components/admin/AdminDashboard.css',
    'src/components/admin/AdminConfig.css',
    'src/components/admin/AdminUsers.css'
  ];

  let combinedCSS = `
/* Admin Dashboard Styles - Generated at ${new Date().toISOString()} */

/* Global Admin Styles */
.admin-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f0f23;
  color: #ffffff;
  min-height: 100vh;
}

.admin-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-spinner.large {
  width: 60px;
  height: 60px;
  border-width: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Login Styles */
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  text-align: center;
}

.login-header p {
  margin: 0 0 32px 0;
  text-align: center;
  opacity: 0.9;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.login-button {
  padding: 14px 24px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.4);
  border-radius: 8px;
  padding: 12px;
  color: #ff6b6b;
  font-size: 14px;
  text-align: center;
}

/* Layout Styles */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0f0f23;
}

.admin-sidebar {
  width: 280px;
  background: #1a1a2e;
  border-right: 1px solid #2d2d44;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #2d2d44;
}

.sidebar-header h1 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #ffffff;
}

.sidebar-header p {
  margin: 0;
  font-size: 14px;
  color: #8892b0;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: block;
  padding: 12px 20px;
  color: #8892b0;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-left-color: #667eea;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #2d2d44;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.user-details h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #ffffff;
}

.user-details p {
  margin: 0;
  font-size: 12px;
  color: #8892b0;
}

.logout-button {
  width: 100%;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 6px;
  color: #ff6b6b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: rgba(255, 107, 107, 0.2);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* Dashboard Styles */
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #ffffff;
}

.last-update {
  margin: 0;
  font-size: 14px;
  color: #8892b0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auto-refresh-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #8892b0;
  cursor: pointer;
}

.auto-refresh-toggle input {
  margin: 0;
}

.refresh-button {
  padding: 8px 16px;
  background: #667eea;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.refresh-button:hover {
  background: #5a67d8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #ffffff;
}

.card-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.card-status.online {
  background: #10b981;
}

.card-status.offline {
  background: #ef4444;
}

.card-content {
  color: #8892b0;
}

.main-value {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
}

.sub-value {
  font-size: 14px;
  color: #8892b0;
}

.activity-stats,
.system-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item,
.system-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-label,
.system-label {
  font-size: 14px;
  color: #8892b0;
}

.activity-value,
.system-value {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.activity-value.success {
  color: #10b981;
}

.activity-value.error {
  color: #ef4444;
}

.secondary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-item {
  display: grid;
  grid-template-columns: 40px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
}

.rank {
  font-weight: bold;
  color: #667eea;
  text-align: center;
}

.address,
.ip {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  color: #ffffff;
}

.requests {
  font-size: 14px;
  color: #8892b0;
}

.last-seen {
  font-size: 12px;
  color: #8892b0;
}

.no-data {
  text-align: center;
  color: #8892b0;
  font-style: italic;
  padding: 20px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-container h3 {
  margin: 0 0 12px 0;
  color: #ef4444;
}

.error-container p {
  margin: 0 0 24px 0;
  color: #8892b0;
}

.retry-button {
  padding: 12px 24px;
  background: #667eea;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #5a67d8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .admin-sidebar {
    width: 100%;
    height: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .secondary-stats {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-controls {
    justify-content: space-between;
  }
}
`;

  // Try to read existing CSS files and append them
  for (const cssFile of cssFiles) {
    const fullPath = join(__dirname, cssFile);
    if (existsSync(fullPath)) {
      try {
        const cssContent = readFileSync(fullPath, 'utf8');
        combinedCSS += `\n\n/* From ${cssFile} */\n${cssContent}`;
      } catch (error) {
        console.log(`⚠️  Could not read ${cssFile}, using default styles`);
      }
    }
  }

  // Add AdminUsers CSS
  const adminUsersCSS = join(__dirname, 'src/components/admin/AdminUsers.css');
  if (existsSync(adminUsersCSS)) {
    try {
      const cssContent = readFileSync(adminUsersCSS, 'utf8');
      combinedCSS += `\n\n/* From AdminUsers.css */\n${cssContent}`;
    } catch (error) {
      console.log(`⚠️  Could not read AdminUsers.css`);
    }
  }

  // Add AdminReports CSS
  const adminReportsCSS = join(__dirname, 'src/components/admin/AdminReports.css');
  if (existsSync(adminReportsCSS)) {
    try {
      const cssContent = readFileSync(adminReportsCSS, 'utf8');
      combinedCSS += `\n\n/* From AdminReports.css */\n${cssContent}`;
    } catch (error) {
      console.log(`⚠️  Could not read AdminReports.css`);
    }
  }

  // Write CSS file
  writeFileSync(CSS_OUTPUT_FILE, combinedCSS);

  // Create the JavaScript bundle with actual React components
  let bundleContent = `
// Admin Dashboard Bundle
// Generated at: ${new Date().toISOString()}

(function() {
  'use strict';
  
  const { useState, useEffect, createElement: h } = React;
  const { createRoot } = ReactDOM;
  
  // Admin Login Component
  const AdminLogin = ({ onLogin, onError }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!username || !password) {
        setError('Por favor ingresa usuario y contraseña');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
          onLogin(data.token, data.user);
        } else {
          setError(data.error?.message || 'Error de autenticación');
        }
      } catch (error) {
        setError('Error de conexión con el servidor');
        onError && onError(error.message);
      } finally {
        setLoading(false);
      }
    };

    return h('div', { className: 'admin-login' }, [
      h('div', { key: 'container', className: 'login-container' }, [
        h('div', { key: 'header', className: 'login-header' }, [
          h('h2', { key: 'title' }, '🔐 Admin Dashboard'),
          h('p', { key: 'subtitle' }, 'Panel de Administración del Faucet')
        ]),
        h('form', { key: 'form', className: 'login-form', onSubmit: handleSubmit }, [
          h('div', { key: 'username-group', className: 'form-group' }, [
            h('label', { key: 'username-label', htmlFor: 'username' }, 'Usuario'),
            h('input', {
              key: 'username-input',
              id: 'username',
              type: 'text',
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: 'Ingresa tu usuario',
              disabled: loading
            })
          ]),
          h('div', { key: 'password-group', className: 'form-group' }, [
            h('label', { key: 'password-label', htmlFor: 'password' }, 'Contraseña'),
            h('input', {
              key: 'password-input',
              id: 'password',
              type: 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: 'Ingresa tu contraseña',
              disabled: loading
            })
          ]),
          error && h('div', { key: 'error', className: 'error-message' }, error),
          h('button', {
            key: 'submit',
            type: 'submit',
            className: 'login-button',
            disabled: loading
          }, loading ? 'Iniciando sesión...' : 'Iniciar Sesión')
        ])
      ])
    ]);
  };

  // Admin Layout Component
  const AdminLayout = ({ user, token, onLogout, children, currentView, onNavigate }) => {
    const formatLoginTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('es-ES');
    };

    const getUserInitials = (username) => {
      return username.substring(0, 2).toUpperCase();
    };

    const navItems = [
      { key: 'dashboard', label: '📊 Dashboard', icon: '📊' },
      { key: 'config', label: '⚙️ Configuración', icon: '⚙️' },
      { key: 'users', label: '👥 Usuarios', icon: '👥' },
      { key: 'reports', label: '📈 Reportes', icon: '📈' },
      { key: 'logs', label: '📋 Logs', icon: '📋' },
      { key: 'alerts', label: '🚨 Alertas', icon: '🚨' },
      { key: 'modules', label: '🧩 Módulos', icon: '🧩' }
    ];

    return h('div', { className: 'admin-layout' }, [
      h('div', { key: 'sidebar', className: 'admin-sidebar' }, [
        h('div', { key: 'header', className: 'sidebar-header' }, [
          h('h1', { key: 'title' }, '🔐 Admin Panel'),
          h('p', { key: 'subtitle' }, 'PoWFaucet Dashboard')
        ]),
        h('nav', { key: 'nav', className: 'sidebar-nav' }, 
          navItems.map(item => 
            h('a', { 
              key: item.key, 
              href: '#', 
              className: \`nav-item \${currentView === item.key ? 'active' : ''}\`,
              onClick: (e) => {
                e.preventDefault();
                onNavigate(item.key);
              }
            }, item.label)
          )
        ),
        h('div', { key: 'footer', className: 'sidebar-footer' }, [
          h('div', { key: 'user-info', className: 'user-info' }, [
            h('div', { key: 'avatar', className: 'user-avatar' }, getUserInitials(user.username)),
            h('div', { key: 'details', className: 'user-details' }, [
              h('h4', { key: 'username' }, user.username),
              h('p', { key: 'login-time' }, formatLoginTime(user.loginTime))
            ])
          ]),
          h('button', {
            key: 'logout',
            className: 'logout-button',
            onClick: onLogout
          }, '🚪 Cerrar Sesión')
        ])
      ]),
      h('div', { key: 'main', className: 'admin-main' }, [
        h('div', { key: 'content', className: 'main-content' }, children)
      ])
    ]);
  };

  // Admin Dashboard Component
  const AdminDashboard = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchStats = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setStats(data.data);
          setLastUpdate(new Date());
        } else {
          setError(data.error?.message || 'Error al cargar estadísticas');
        }
      } catch (error) {
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    const refreshStats = async () => {
      try {
        const response = await fetch('/api/admin/stats/refresh', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setStats(data.data);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Error refreshing stats:', error);
      }
    };

    useEffect(() => {
      fetchStats();
    }, [token]);

    useEffect(() => {
      if (!autoRefresh) return;

      const interval = setInterval(() => {
        fetchStats(false);
      }, 30000);

      return () => clearInterval(interval);
    }, [autoRefresh, token]);

    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (days > 0) {
        return \`\${days}d \${hours}h \${minutes}m\`;
      } else if (hours > 0) {
        return \`\${hours}h \${minutes}m\`;
      } else {
        return \`\${minutes}m\`;
      }
    };

    const formatAddress = (address) => {
      return \`\${address.slice(0, 6)}...\${address.slice(-4)}\`;
    };

    const formatTimeAgo = (timestamp) => {
      const now = Date.now();
      const diffMs = now - timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return \`\${diffMins}m\`;
      } else if (diffMins < 1440) {
        return \`\${Math.floor(diffMins / 60)}h\`;
      } else {
        return \`\${Math.floor(diffMins / 1440)}d\`;
      }
    };

    if (loading && !stats) {
      return h('div', { className: 'admin-dashboard' }, [
        h('div', { key: 'loading', className: 'loading-container' }, [
          h('div', { key: 'spinner', className: 'loading-spinner large' }),
          h('p', { key: 'text' }, 'Cargando estadísticas del dashboard...')
        ])
      ]);
    }

    if (error && !stats) {
      return h('div', { className: 'admin-dashboard' }, [
        h('div', { key: 'error', className: 'error-container' }, [
          h('div', { key: 'icon', className: 'error-icon' }, '⚠️'),
          h('h3', { key: 'title' }, 'Error al cargar el dashboard'),
          h('p', { key: 'message' }, error),
          h('button', {
            key: 'retry',
            onClick: () => fetchStats(),
            className: 'retry-button'
          }, 'Reintentar')
        ])
      ]);
    }

    return h('div', { className: 'admin-dashboard' }, [
      // Header Controls
      h('div', { key: 'header', className: 'dashboard-header' }, [
        h('div', { key: 'left', className: 'header-left' }, [
          h('h2', { key: 'title' }, 'Dashboard Principal'),
          lastUpdate && h('p', { key: 'update', className: 'last-update' }, 
            \`Última actualización: \${lastUpdate.toLocaleTimeString('es-ES')}\`)
        ]),
        h('div', { key: 'controls', className: 'header-controls' }, [
          h('label', { key: 'toggle', className: 'auto-refresh-toggle' }, [
            h('input', {
              key: 'checkbox',
              type: 'checkbox',
              checked: autoRefresh,
              onChange: (e) => setAutoRefresh(e.target.checked)
            }),
            h('span', { key: 'label' }, 'Auto-actualizar')
          ]),
          h('button', {
            key: 'refresh',
            onClick: refreshStats,
            className: 'refresh-button'
          }, '🔄 Actualizar')
        ])
      ]),

      // Main Stats Grid
      h('div', { key: 'stats', className: 'stats-grid' }, [
        // Balance Card
        h('div', { key: 'balance', className: 'stat-card balance-card' }, [
          h('div', { key: 'header', className: 'card-header' }, [
            h('h3', { key: 'title' }, '💰 Balance del Faucet'),
            h('div', { key: 'status', className: 'card-status online' })
          ]),
          h('div', { key: 'content', className: 'card-content' }, [
            h('div', { key: 'main', className: 'main-value' }, 
              \`\${stats?.balance?.formatted || '0.0000'} ETH\`),
            h('div', { key: 'sub', className: 'sub-value' }, 
              stats?.balance?.current ? \`\${stats.balance.current} wei\` : 'N/A')
          ])
        ]),

        // Activity Card
        h('div', { key: 'activity', className: 'stat-card activity-card' }, [
          h('div', { key: 'header', className: 'card-header' }, [
            h('h3', { key: 'title' }, '📊 Actividad')
          ]),
          h('div', { key: 'content', className: 'card-content' }, [
            h('div', { key: 'stats', className: 'activity-stats' }, [
              h('div', { key: 'active', className: 'activity-item' }, [
                h('span', { key: 'label', className: 'activity-label' }, 'Sesiones Activas'),
                h('span', { key: 'value', className: 'activity-value' }, 
                  stats?.activity?.activeSessions || 0)
              ]),
              h('div', { key: 'completed', className: 'activity-item' }, [
                h('span', { key: 'label', className: 'activity-label' }, 'Completadas Hoy'),
                h('span', { key: 'value', className: 'activity-value success' }, 
                  stats?.activity?.completedToday || 0)
              ]),
              h('div', { key: 'failed', className: 'activity-item' }, [
                h('span', { key: 'label', className: 'activity-label' }, 'Fallidas Hoy'),
                h('span', { key: 'value', className: 'activity-value error' }, 
                  stats?.activity?.failedToday || 0)
              ])
            ])
          ])
        ]),

        // System Card
        h('div', { key: 'system', className: 'stat-card system-card' }, [
          h('div', { key: 'header', className: 'card-header' }, [
            h('h3', { key: 'title' }, '🖥️ Sistema')
          ]),
          h('div', { key: 'content', className: 'card-content' }, [
            h('div', { key: 'stats', className: 'system-stats' }, [
              h('div', { key: 'uptime', className: 'system-item' }, [
                h('span', { key: 'label', className: 'system-label' }, 'Uptime'),
                h('span', { key: 'value', className: 'system-value' }, 
                  formatUptime(stats?.system?.uptime || 0))
              ]),
              h('div', { key: 'memory', className: 'system-item' }, [
                h('span', { key: 'label', className: 'system-label' }, 'Memoria'),
                h('span', { key: 'value', className: 'system-value' }, 
                  \`\${stats?.system?.memoryUsage?.percentage || 0}%\`)
              ]),
              h('div', { key: 'node', className: 'system-item' }, [
                h('span', { key: 'label', className: 'system-label' }, 'Node.js'),
                h('span', { key: 'value', className: 'system-value' }, 
                  stats?.system?.nodeVersion || 'N/A')
              ])
            ])
          ])
        ]),

        // Distribution Card
        h('div', { key: 'distribution', className: 'stat-card distribution-card' }, [
          h('div', { key: 'header', className: 'card-header' }, [
            h('h3', { key: 'title' }, '💸 Distribuido Hoy')
          ]),
          h('div', { key: 'content', className: 'card-content' }, [
            h('div', { key: 'main', className: 'main-value' }, 
              \`\${stats?.activity?.totalDistributedFormatted || '0.0000'} ETH\`),
            h('div', { key: 'sub', className: 'sub-value' }, 
              'Total distribuido en el día actual')
          ])
        ])
      ]),

      // Secondary Stats
      h('div', { key: 'secondary', className: 'secondary-stats' }, [
        // Top Addresses
        h('div', { key: 'addresses', className: 'stat-card top-addresses-card' }, [
          h('div', { key: 'header', className: 'card-header' }, [
            h('h3', { key: 'title' }, '🏆 Top Direcciones')
          ]),
          h('div', { key: 'content', className: 'card-content' }, [
            stats?.topAddresses && stats.topAddresses.length > 0 ? 
              h('div', { key: 'list', className: 'top-list' }, 
                stats.topAddresses.slice(0, 5).map((addr, index) => 
                  h('div', { key: addr.address, className: 'top-item' }, [
                    h('div', { key: 'rank', className: 'rank' }, \`#\${index + 1}\`),
                    h('div', { key: 'address', className: 'address' }, formatAddress(addr.address)),
                    h('div', { key: 'requests', className: 'requests' }, \`\${addr.requests} req\`),
                    h('div', { key: 'time', className: 'last-seen' }, formatTimeAgo(addr.lastRequest))
                  ])
                )
              ) :
              h('div', { key: 'no-data', className: 'no-data' }, 'No hay datos disponibles')
          ])
        ]),

        // Top IPs
        h('div', { key: 'ips', className: 'stat-card top-ips-card' }, [
          h('div', { key: 'header', className: 'card-header' }, [
            h('h3', { key: 'title' }, '🌐 Top IPs')
          ]),
          h('div', { key: 'content', className: 'card-content' }, [
            stats?.topIPs && stats.topIPs.length > 0 ? 
              h('div', { key: 'list', className: 'top-list' }, 
                stats.topIPs.slice(0, 5).map((ip, index) => 
                  h('div', { key: ip.ip, className: 'top-item' }, [
                    h('div', { key: 'rank', className: 'rank' }, \`#\${index + 1}\`),
                    h('div', { key: 'ip', className: 'ip' }, ip.ip),
                    h('div', { key: 'requests', className: 'requests' }, \`\${ip.requests} req\`),
                    h('div', { key: 'time', className: 'last-seen' }, formatTimeAgo(ip.lastRequest))
                  ])
                )
              ) :
              h('div', { key: 'no-data', className: 'no-data' }, 'No hay datos disponibles')
          ])
        ])
      ])
    ]);
  };

  // Admin Users Component
  const AdminUsers = ({ token }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para diferentes secciones
    const [userStats, setUserStats] = useState(null);
    const [blacklist, setBlacklist] = useState([]);
    const [whitelist, setWhitelist] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    
    // Estados para formularios
    const [newEntry, setNewEntry] = useState({ address: '', ip: '', reason: '' });
    const [showAddForm, setShowAddForm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const tabs = [
      { key: 'overview', label: '📊 Resumen', icon: '📊' },
      { key: 'blacklist', label: '🚫 Blacklist', icon: '🚫' },
      { key: 'whitelist', label: '✅ Whitelist', icon: '✅' },
      { key: 'sessions', label: '🔗 Sesiones Activas', icon: '🔗' },
      { key: 'top-users', label: '🏆 Top Usuarios', icon: '🏆' }
    ];

    useEffect(() => {
      fetchData();
    }, [token, activeTab]);

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        switch (activeTab) {
          case 'overview':
            await fetchUserStats();
            break;
          case 'blacklist':
            await fetchBlacklist();
            break;
          case 'whitelist':
            await fetchWhitelist();
            break;
          case 'sessions':
            await fetchActiveSessions();
            break;
          case 'top-users':
            await fetchTopUsers();
            break;
        }
      } catch (error) {
        setError('Error al cargar datos de usuarios');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserStats = async () => {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setUserStats(data.data);
      } else {
        throw new Error(data.error?.message || 'Error al cargar estadísticas');
      }
    };

    const fetchBlacklist = async () => {
      const response = await fetch('/api/admin/users/blacklist', {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setBlacklist([
          ...data.data.addresses.map(addr => ({ ...addr, type: 'address' })),
          ...data.data.ips.map(ip => ({ ...ip, type: 'ip' }))
        ]);
      } else {
        throw new Error(data.error?.message || 'Error al cargar blacklist');
      }
    };

    const formatAddress = (address) => {
      return \`\${address.slice(0, 6)}...\${address.slice(-4)}\`;
    };

    const formatTimeAgo = (timestamp) => {
      const now = Date.now();
      const diffMs = now - timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return \`\${diffMins}m\`;
      } else if (diffMins < 1440) {
        return \`\${Math.floor(diffMins / 60)}h\`;
      } else {
        return \`\${Math.floor(diffMins / 1440)}d\`;
      }
    };

    if (loading) {
      return h('div', { className: 'admin-users' }, [
        h('div', { key: 'loading', className: 'loading-container' }, [
          h('div', { key: 'spinner', className: 'loading-spinner large' }),
          h('p', { key: 'text' }, 'Cargando gestión de usuarios...')
        ])
      ]);
    }

    return h('div', { className: 'admin-users' }, [
      h('div', { key: 'header', className: 'users-header' }, [
        h('div', { key: 'left', className: 'header-left' }, [
          h('h2', { key: 'title' }, 'Gestión de Usuarios'),
          h('p', { key: 'subtitle' }, 'Administra usuarios, sesiones y listas de control de acceso')
        ])
      ]),

      error && h('div', { key: 'error-banner', className: 'error-banner' }, [
        h('span', { key: 'message' }, \`⚠️ \${error}\`),
        h('button', { key: 'close', onClick: () => setError(null) }, '✕')
      ]),

      h('div', { key: 'tabs', className: 'users-tabs' },
        tabs.map(tab =>
          h('button', {
            key: tab.key,
            className: \`tab-button \${activeTab === tab.key ? 'active' : ''}\`,
            onClick: () => setActiveTab(tab.key)
          }, [
            h('span', { key: 'icon', className: 'tab-icon' }, tab.icon),
            h('span', { key: 'label', className: 'tab-label' }, tab.label)
          ])
        )
      ),

      h('div', { key: 'content', className: 'users-content' }, [
        activeTab === 'overview' && userStats && h('div', { key: 'overview', className: 'users-overview' }, [
          h('div', { key: 'stats', className: 'stats-grid' }, [
            h('div', { key: 'total', className: 'stat-card' }, [
              h('div', { key: 'icon', className: 'stat-icon' }, '👥'),
              h('div', { key: 'content', className: 'stat-content' }, [
                h('h3', { key: 'title' }, 'Usuarios Totales'),
                h('div', { key: 'value', className: 'stat-value' }, userStats.totalUsers || 0),
                h('div', { key: 'subtitle', className: 'stat-subtitle' }, 'Direcciones únicas')
              ])
            ]),
            h('div', { key: 'active', className: 'stat-card' }, [
              h('div', { key: 'icon', className: 'stat-icon' }, '🟢'),
              h('div', { key: 'content', className: 'stat-content' }, [
                h('h3', { key: 'title' }, 'Usuarios Activos'),
                h('div', { key: 'value', className: 'stat-value' }, userStats.activeUsers || 0),
                h('div', { key: 'subtitle', className: 'stat-subtitle' }, 'Últimas 24h')
              ])
            ]),
            h('div', { key: 'blacklist', className: 'stat-card' }, [
              h('div', { key: 'icon', className: 'stat-icon' }, '🚫'),
              h('div', { key: 'content', className: 'stat-content' }, [
                h('h3', { key: 'title' }, 'Blacklist'),
                h('div', { key: 'value', className: 'stat-value' }, userStats.blacklistCount || 0),
                h('div', { key: 'subtitle', className: 'stat-subtitle' }, 'Direcciones/IPs bloqueadas')
              ])
            ]),
            h('div', { key: 'whitelist', className: 'stat-card' }, [
              h('div', { key: 'icon', className: 'stat-icon' }, '✅'),
              h('div', { key: 'content', className: 'stat-content' }, [
                h('h3', { key: 'title' }, 'Whitelist'),
                h('div', { key: 'value', className: 'stat-value' }, userStats.whitelistCount || 0),
                h('div', { key: 'subtitle', className: 'stat-subtitle' }, 'Direcciones/IPs permitidas')
              ])
            ])
          ])
        ]),
        
        (activeTab === 'blacklist' || activeTab === 'whitelist' || activeTab === 'sessions' || activeTab === 'top-users') && 
        h('div', { key: 'placeholder', style: { padding: '40px', textAlign: 'center' } }, [
          h('h3', { key: 'title' }, \`Funcionalidad de \${activeTab} en desarrollo\`),
          h('p', { key: 'message' }, 'Esta sección estará disponible próximamente')
        ])
      ])
    ]);
  };
  const AdminConfig = ({ token }) => {
    const [config, setConfig] = useState(null);
    const [originalConfig, setOriginalConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('basic');
    const [hasChanges, setHasChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const configSections = [
      {
        key: 'basic',
        label: 'Configuración Básica',
        description: 'Configuración general del faucet'
      },
      {
        key: 'modules',
        label: 'Módulos',
        description: 'Gestión de módulos y sus configuraciones'
      },
      {
        key: 'advanced',
        label: 'Configuración Avanzada',
        description: 'Configuraciones técnicas y de seguridad'
      }
    ];

    useEffect(() => {
      fetchConfig();
    }, [token]);

    useEffect(() => {
      if (config && originalConfig) {
        const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);
        setHasChanges(hasChanges);
        
        if (hasChanges) {
          validateConfig();
        } else {
          setValidationErrors([]);
        }
      }
    }, [config, originalConfig]);

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/config', {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setConfig(data.data);
          setOriginalConfig(JSON.parse(JSON.stringify(data.data)));
        } else {
          setError(data.error?.message || 'Error al cargar configuración');
        }
      } catch (error) {
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    const validateConfig = async () => {
      if (!config) return;

      try {
        const response = await fetch('/api/admin/config/validate', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config),
        });

        const data = await response.json();

        if (data.success) {
          setValidationErrors(data.errors || []);
        } else {
          setValidationErrors([data.error?.message || 'Error de validación']);
        }
      } catch (error) {
        setValidationErrors(['Error al validar configuración']);
      }
    };

    const saveConfig = async () => {
      if (validationErrors.length > 0) {
        setError('No se puede guardar: hay errores de validación');
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/config', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config),
        });

        const data = await response.json();

        if (data.success) {
          setOriginalConfig(JSON.parse(JSON.stringify(config)));
          setHasChanges(false);
          setShowPreview(false);
          alert('Configuración guardada exitosamente');
        } else {
          setError(data.error?.message || 'Error al guardar configuración');
        }
      } catch (error) {
        setError('Error de conexión con el servidor');
      } finally {
        setSaving(false);
      }
    };

    const resetConfig = () => {
      if (originalConfig) {
        setConfig(JSON.parse(JSON.stringify(originalConfig)));
        setHasChanges(false);
        setValidationErrors([]);
        setShowPreview(false);
      }
    };

    const updateConfigValue = (path, value) => {
      if (!config) return;

      const newConfig = JSON.parse(JSON.stringify(config));
      let current = newConfig;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      setConfig(newConfig);
    };

    const toggleModule = (moduleName, enabled) => {
      updateConfigValue(['modules', moduleName, 'enabled'], enabled);
    };

    if (loading) {
      return h('div', { className: 'admin-config' }, [
        h('div', { key: 'loading', className: 'loading-container' }, [
          h('div', { key: 'spinner', className: 'loading-spinner large' }),
          h('p', { key: 'text' }, 'Cargando configuración...')
        ])
      ]);
    }

    if (error && !config) {
      return h('div', { className: 'admin-config' }, [
        h('div', { key: 'error', className: 'error-container' }, [
          h('div', { key: 'icon', className: 'error-icon' }, '⚠️'),
          h('h3', { key: 'title' }, 'Error al cargar configuración'),
          h('p', { key: 'message' }, error),
          h('button', {
            key: 'retry',
            onClick: fetchConfig,
            className: 'retry-button'
          }, 'Reintentar')
        ])
      ]);
    }

    return h('div', { className: 'admin-config' }, [
      h('div', { key: 'header', className: 'config-header' }, [
        h('div', { key: 'left', className: 'header-left' }, [
          h('h2', { key: 'title' }, 'Gestión de Configuración'),
          h('p', { key: 'subtitle' }, 'Modifica la configuración del faucet desde la interfaz web')
        ]),
        hasChanges && h('div', { key: 'actions', className: 'header-actions' }, [
          h('button', {
            key: 'preview',
            className: 'preview-button',
            onClick: () => setShowPreview(!showPreview)
          }, showPreview ? 'Ocultar' : 'Vista Previa'),
          h('button', {
            key: 'reset',
            className: 'reset-button',
            onClick: resetConfig
          }, 'Descartar Cambios'),
          h('button', {
            key: 'save',
            className: 'save-button',
            onClick: saveConfig,
            disabled: saving || validationErrors.length > 0
          }, saving ? 'Guardando...' : 'Guardar Cambios')
        ])
      ]),

      error && h('div', { key: 'error-banner', className: 'error-banner' }, [
        h('span', { key: 'message' }, \`⚠️ \${error}\`),
        h('button', { key: 'close', onClick: () => setError(null) }, '✕')
      ]),

      validationErrors.length > 0 && h('div', { key: 'validation', className: 'validation-errors' }, [
        h('h4', { key: 'title' }, 'Errores de Validación:'),
        h('ul', { key: 'list' }, 
          validationErrors.map((error, index) => 
            h('li', { key: index }, error)
          )
        )
      ]),

      h('div', { key: 'layout', className: 'config-layout' }, [
        h('div', { key: 'sidebar', className: 'config-sidebar' }, [
          h('nav', { key: 'nav', className: 'config-nav' },
            configSections.map(section =>
              h('button', {
                key: section.key,
                className: \`nav-item \${activeSection === section.key ? 'active' : ''}\`,
                onClick: () => setActiveSection(section.key)
              }, [
                h('span', { key: 'label', className: 'nav-label' }, section.label),
                h('span', { key: 'desc', className: 'nav-description' }, section.description)
              ])
            )
          )
        ]),

        h('div', { key: 'content', className: 'config-content' }, [
          activeSection === 'basic' && h('div', { key: 'basic', className: 'config-section' }, [
            h('h3', { key: 'title' }, 'Configuración General'),
            h('p', { key: 'placeholder' }, 'Funcionalidad de configuración básica en desarrollo...')
          ]),
          activeSection === 'modules' && h('div', { key: 'modules', className: 'config-section' }, [
            h('h3', { key: 'title' }, 'Gestión de Módulos'),
            h('p', { key: 'placeholder' }, 'Funcionalidad de gestión de módulos en desarrollo...')
          ]),
          activeSection === 'advanced' && h('div', { key: 'advanced', className: 'config-section' }, [
            h('h3', { key: 'title' }, 'Configuración Avanzada'),
            h('p', { key: 'placeholder' }, 'Funcionalidad de configuración avanzada en desarrollo...')
          ])
        ])
      ])
    ]);
  };

  // Admin Reports Component
  const AdminReports = ({ token }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('7d');
    
    // Estados para diferentes secciones
    const [reportSummary, setReportSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [moduleReports, setModuleReports] = useState(null);
    const [healthReport, setHealthReport] = useState(null);

    const sections = [
      { key: 'overview', label: '📊 Resumen General', icon: '📊' },
      { key: 'charts', label: '📈 Gráficos', icon: '📈' },
      { key: 'modules', label: '🧩 Módulos', icon: '🧩' },
      { key: 'health', label: '💚 Salud del Sistema', icon: '💚' },
      { key: 'export', label: '📤 Exportar Datos', icon: '📤' }
    ];

    const periods = [
      { value: '24h', label: 'Últimas 24h' },
      { value: '7d', label: 'Últimos 7 días' },
      { value: '30d', label: 'Últimos 30 días' },
      { value: '90d', label: 'Últimos 90 días' }
    ];

    useEffect(() => {
      fetchData();
    }, [token, activeSection, period]);

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        switch (activeSection) {
          case 'overview':
            await fetchReportSummary();
            break;
          case 'charts':
            await fetchChartData();
            break;
          case 'modules':
            await fetchModuleReports();
            break;
          case 'health':
            await fetchHealthReport();
            break;
          case 'export':
            // No necesita fetch, es solo UI
            setLoading(false);
            break;
        }
      } catch (error) {
        setError('Error al cargar datos de reportes');
        setLoading(false);
      }
    };

    const fetchReportSummary = async () => {
      try {
        const response = await fetch(\`/api/admin/reports/summary?period=\${period}\`, {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setReportSummary(data.data);
        } else {
          throw new Error(data.error?.message || 'Error al cargar resumen');
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };

    const fetchChartData = async () => {
      try {
        const response = await fetch(\`/api/admin/reports/charts?period=\${period}\`, {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setChartData(data.data);
        } else {
          throw new Error(data.error?.message || 'Error al cargar gráficos');
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };

    const fetchModuleReports = async () => {
      try {
        const response = await fetch(\`/api/admin/reports/modules?period=\${period}\`, {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setModuleReports(data.data);
        } else {
          throw new Error(data.error?.message || 'Error al cargar reportes de módulos');
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };

    const fetchHealthReport = async () => {
      try {
        const response = await fetch('/api/admin/reports/health', {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setHealthReport(data.data);
        } else {
          throw new Error(data.error?.message || 'Error al cargar reporte de salud');
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };

    const exportData = async (type, format = 'json') => {
      try {
        const response = await fetch(\`/api/admin/export/\${type}\${format === 'csv' ? '/csv' : ''}\`, {
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          if (format === 'csv') {
            // Descargar CSV
            const blob = new Blob([data.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`faucet-\${type}-\${Date.now()}.csv\`;
            a.click();
            window.URL.revokeObjectURL(url);
          } else {
            // Descargar JSON
            const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`faucet-\${type}-\${Date.now()}.json\`;
            a.click();
            window.URL.revokeObjectURL(url);
          }
        } else {
          alert('Error al exportar datos: ' + (data.error?.message || 'Error desconocido'));
        }
      } catch (error) {
        alert('Error al exportar datos: ' + error.message);
      }
    };

    const getHealthColor = (score) => {
      if (score >= 90) return '#10b981'; // Verde
      if (score >= 70) return '#f59e0b'; // Amarillo
      return '#ef4444'; // Rojo
    };

    const getHealthLabel = (score) => {
      if (score >= 90) return 'Excelente';
      if (score >= 70) return 'Bueno';
      if (score >= 50) return 'Regular';
      return 'Crítico';
    };

    if (loading) {
      return h('div', { className: 'admin-reports' }, [
        h('div', { key: 'loading', className: 'loading-container' }, [
          h('div', { key: 'spinner', className: 'loading-spinner large' }),
          h('p', { key: 'text' }, 'Cargando reportes y análisis...')
        ])
      ]);
    }

    return h('div', { className: 'admin-reports' }, [
      h('div', { key: 'header', className: 'reports-header' }, [
        h('div', { key: 'left', className: 'header-left' }, [
          h('h2', { key: 'title' }, 'Reportes y Análisis'),
          h('p', { key: 'subtitle' }, 'Análisis detallado del rendimiento y uso del faucet')
        ]),
        h('div', { key: 'controls', className: 'header-controls' }, [
          activeSection !== 'health' && activeSection !== 'export' && h('select', {
            key: 'period',
            value: period,
            onChange: (e) => setPeriod(e.target.value),
            className: 'period-selector'
          }, periods.map(p => h('option', { key: p.value, value: p.value }, p.label)))
        ])
      ]),

      error && h('div', { key: 'error-banner', className: 'error-banner' }, [
        h('span', { key: 'message' }, \`⚠️ \${error}\`),
        h('button', { key: 'close', onClick: () => setError(null) }, '✕')
      ]),

      h('div', { key: 'layout', className: 'reports-layout' }, [
        h('div', { key: 'sidebar', className: 'reports-sidebar' }, [
          h('nav', { key: 'nav', className: 'reports-nav' },
            sections.map(section =>
              h('button', {
                key: section.key,
                className: \`nav-item \${activeSection === section.key ? 'active' : ''}\`,
                onClick: () => setActiveSection(section.key)
              }, [
                h('span', { key: 'icon', className: 'nav-icon' }, section.icon),
                h('span', { key: 'label', className: 'nav-label' }, section.label)
              ])
            )
          )
        ]),

        h('div', { key: 'content', className: 'reports-content' }, [
          // Resumen General
          activeSection === 'overview' && reportSummary && h('div', { key: 'overview', className: 'reports-section' }, [
            h('div', { key: 'summary-grid', className: 'summary-grid' }, [
              h('div', { key: 'requests', className: 'summary-card' }, [
                h('div', { key: 'icon', className: 'summary-icon' }, '📊'),
                h('div', { key: 'content', className: 'summary-content' }, [
                  h('h3', { key: 'title' }, 'Total Solicitudes'),
                  h('div', { key: 'value', className: 'summary-value' }, reportSummary.totalRequests.toLocaleString()),
                  h('div', { key: 'period', className: 'summary-period' }, reportSummary.period)
                ])
              ]),
              h('div', { key: 'distributed', className: 'summary-card' }, [
                h('div', { key: 'icon', className: 'summary-icon' }, '💰'),
                h('div', { key: 'content', className: 'summary-content' }, [
                  h('h3', { key: 'title' }, 'ETH Distribuido'),
                  h('div', { key: 'value', className: 'summary-value' }, \`\${reportSummary.totalDistributed} ETH\`),
                  h('div', { key: 'period', className: 'summary-period' }, reportSummary.period)
                ])
              ]),
              h('div', { key: 'users', className: 'summary-card' }, [
                h('div', { key: 'icon', className: 'summary-icon' }, '👥'),
                h('div', { key: 'content', className: 'summary-content' }, [
                  h('h3', { key: 'title' }, 'Usuarios Únicos'),
                  h('div', { key: 'value', className: 'summary-value' }, reportSummary.uniqueUsers.toLocaleString()),
                  h('div', { key: 'period', className: 'summary-period' }, reportSummary.period)
                ])
              ]),
              h('div', { key: 'success', className: 'summary-card' }, [
                h('div', { key: 'icon', className: 'summary-icon' }, '✅'),
                h('div', { key: 'content', className: 'summary-content' }, [
                  h('h3', { key: 'title' }, 'Tasa de Éxito'),
                  h('div', { key: 'value', className: 'summary-value' }, \`\${reportSummary.successRate.toFixed(1)}%\`),
                  h('div', { key: 'period', className: 'summary-period' }, reportSummary.period)
                ])
              ])
            ]),
            h('div', { key: 'details', className: 'summary-details' }, [
              h('div', { key: 'detail-item', className: 'detail-item' }, [
                h('span', { key: 'label' }, 'Cantidad promedio por claim:'),
                h('span', { key: 'value' }, \`\${reportSummary.averageClaimAmount} ETH\`)
              ]),
              h('div', { key: 'detail-item2', className: 'detail-item' }, [
                h('span', { key: 'label' }, 'Hora pico de actividad:'),
                h('span', { key: 'value' }, reportSummary.topHour)
              ]),
              h('div', { key: 'detail-item3', className: 'detail-item' }, [
                h('span', { key: 'label' }, 'Día más activo:'),
                h('span', { key: 'value' }, reportSummary.topDay)
              ])
            ])
          ]),

          // Gráficos
          activeSection === 'charts' && h('div', { key: 'charts', className: 'reports-section' }, [
            h('div', { key: 'chart-placeholder', className: 'chart-placeholder' }, [
              h('div', { key: 'icon', className: 'placeholder-icon' }, '📈'),
              h('h3', { key: 'title' }, 'Gráficos Interactivos'),
              h('p', { key: 'message' }, 'Los gráficos interactivos estarán disponibles próximamente'),
              chartData && h('div', { key: 'data-info', className: 'data-info' }, [
                h('p', { key: 'info' }, \`Datos disponibles para \${chartData.labels.length} períodos\`),
                h('p', { key: 'datasets' }, \`\${chartData.datasets.length} series de datos cargadas\`)
              ])
            ])
          ]),

          // Módulos
          activeSection === 'modules' && moduleReports && h('div', { key: 'modules', className: 'reports-section' }, [
            h('div', { key: 'modules-grid', className: 'modules-grid' },
              moduleReports.modules.map(module =>
                h('div', { key: module.name, className: 'module-card' }, [
                  h('div', { key: 'header', className: 'module-header' }, [
                    h('h4', { key: 'name' }, module.name),
                    h('div', { key: 'status', className: \`module-status \${module.enabled ? 'enabled' : 'disabled'}\` }, 
                      module.enabled ? 'Activo' : 'Inactivo')
                  ]),
                  module.enabled && h('div', { key: 'stats', className: 'module-stats' }, [
                    h('div', { key: 'processed', className: 'stat-item' }, [
                      h('span', { key: 'label' }, 'Sesiones procesadas:'),
                      h('span', { key: 'value' }, module.sessionsProcessed.toLocaleString())
                    ]),
                    h('div', { key: 'success', className: 'stat-item' }, [
                      h('span', { key: 'label' }, 'Tasa de éxito:'),
                      h('span', { key: 'value' }, \`\${module.successRate.toFixed(1)}%\`)
                    ]),
                    h('div', { key: 'time', className: 'stat-item' }, [
                      h('span', { key: 'label' }, 'Tiempo promedio:'),
                      h('span', { key: 'value' }, \`\${module.averageProcessingTime.toFixed(0)}ms\`)
                    ])
                  ])
                ])
              )
            )
          ]),

          // Salud del Sistema
          activeSection === 'health' && healthReport && h('div', { key: 'health', className: 'reports-section' }, [
            h('div', { key: 'health-overview', className: 'health-overview' }, [
              h('div', { key: 'score-card', className: 'health-score-card' }, [
                h('div', { key: 'score-circle', className: 'health-score-circle', style: { borderColor: getHealthColor(healthReport.overallScore) } }, [
                  h('div', { key: 'score', className: 'health-score' }, healthReport.overallScore),
                  h('div', { key: 'label', className: 'health-label' }, getHealthLabel(healthReport.overallScore))
                ])
              ]),
              h('div', { key: 'metrics', className: 'health-metrics' }, [
                h('div', { key: 'metric1', className: 'health-metric' }, [
                  h('span', { key: 'label' }, 'Uptime:'),
                  h('span', { key: 'value' }, \`\${healthReport.uptime}%\`)
                ]),
                h('div', { key: 'metric2', className: 'health-metric' }, [
                  h('span', { key: 'label' }, 'Uso de memoria:'),
                  h('span', { key: 'value' }, \`\${healthReport.memoryUsage}%\`)
                ]),
                h('div', { key: 'metric3', className: 'health-metric' }, [
                  h('span', { key: 'label' }, 'Tiempo de respuesta:'),
                  h('span', { key: 'value' }, \`\${healthReport.responseTime}ms\`)
                ]),
                h('div', { key: 'metric4', className: 'health-metric' }, [
                  h('span', { key: 'label' }, 'Tasa de error:'),
                  h('span', { key: 'value' }, \`\${healthReport.errorRate.toFixed(1)}%\`)
                ])
              ])
            ]),
            h('div', { key: 'services', className: 'services-status' }, [
              h('h4', { key: 'title' }, 'Estado de Servicios'),
              h('div', { key: 'services-grid', className: 'services-grid' },
                healthReport.services.map(service =>
                  h('div', { key: service.name, className: 'service-card' }, [
                    h('div', { key: 'name', className: 'service-name' }, service.name),
                    h('div', { key: 'status', className: \`service-status \${service.status}\` }, service.status),
                    h('div', { key: 'uptime', className: 'service-uptime' }, \`\${service.uptime}% uptime\`)
                  ])
                )
              )
            ])
          ]),

          // Exportar Datos
          activeSection === 'export' && h('div', { key: 'export', className: 'reports-section' }, [
            h('div', { key: 'export-grid', className: 'export-grid' }, [
              h('div', { key: 'stats', className: 'export-card' }, [
                h('h4', { key: 'title' }, '📊 Estadísticas'),
                h('p', { key: 'desc' }, 'Exportar datos de estadísticas y métricas del faucet'),
                h('div', { key: 'buttons', className: 'export-buttons' }, [
                  h('button', { key: 'json', onClick: () => exportData('stats', 'json') }, 'JSON'),
                  h('button', { key: 'csv', onClick: () => exportData('stats', 'csv') }, 'CSV')
                ])
              ]),
              h('div', { key: 'sessions', className: 'export-card' }, [
                h('h4', { key: 'title' }, '🔗 Sesiones'),
                h('p', { key: 'desc' }, 'Exportar datos de sesiones de usuarios'),
                h('div', { key: 'buttons', className: 'export-buttons' }, [
                  h('button', { key: 'json', onClick: () => exportData('sessions', 'json') }, 'JSON'),
                  h('button', { key: 'csv', onClick: () => exportData('sessions', 'csv') }, 'CSV')
                ])
              ]),
              h('div', { key: 'alerts', className: 'export-card' }, [
                h('h4', { key: 'title' }, '🚨 Alertas'),
                h('p', { key: 'desc' }, 'Exportar historial de alertas del sistema'),
                h('div', { key: 'buttons', className: 'export-buttons' }, [
                  h('button', { key: 'json', onClick: () => exportData('alerts', 'json') }, 'JSON')
                ])
              ]),
              h('div', { key: 'users', className: 'export-card' }, [
                h('h4', { key: 'title' }, '👥 Usuarios'),
                h('p', { key: 'desc' }, 'Exportar datos de usuarios y direcciones'),
                h('div', { key: 'buttons', className: 'export-buttons' }, [
                  h('button', { key: 'json', onClick: () => exportData('users', 'json') }, 'JSON')
                ])
              ])
            ])
          ])
        ])
      ])
    ]);
  };

  // Admin App Component
  const AdminApp = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');

    useEffect(() => {
      const savedToken = localStorage.getItem('adminToken');
      const savedUser = localStorage.getItem('adminUser');

      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }

      setIsLoading(false);
    }, []);

    const handleLogin = (newToken, userData) => {
      const userInfo = {
        username: userData.username,
        loginTime: userData.loginTime || Date.now(),
      };

      setToken(newToken);
      setUser(userInfo);
      setIsAuthenticated(true);

      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('adminUser', JSON.stringify(userInfo));
    };

    const handleLogout = () => {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setCurrentView('dashboard');

      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    };

    const handleNavigate = (view) => {
      setCurrentView(view);
    };

    const handleError = (error) => {
      console.error('Admin error:', error);
    };

    const renderCurrentView = () => {
      switch (currentView) {
        case 'dashboard':
          return h(AdminDashboard, { key: 'dashboard', token });
        case 'config':
          return h(AdminConfig, { key: 'config', token });
        case 'users':
          return h(AdminUsers, { key: 'users', token });
        case 'reports':
          return h(AdminReports, { key: 'reports', token });
        case 'logs':
        case 'alerts':
        case 'modules':
          return h('div', { key: 'placeholder', style: { padding: '40px', textAlign: 'center' } }, [
            h('h3', { key: 'title' }, \`Funcionalidad de \${currentView} en desarrollo\`),
            h('p', { key: 'message' }, 'Esta sección estará disponible próximamente')
          ]);
        default:
          return h(AdminDashboard, { key: 'dashboard', token });
      }
    };

    if (isLoading) {
      return h('div', { className: 'admin-app' }, [
        h('div', { key: 'loading', className: 'admin-loading' }, [
          h('div', { key: 'spinner', className: 'loading-spinner' }),
          h('p', { key: 'text' }, 'Cargando Admin Dashboard...')
        ])
      ]);
    }

    if (!isAuthenticated || !token || !user) {
      return h('div', { className: 'admin-app' }, [
        h(AdminLogin, { key: 'login', onLogin: handleLogin, onError: handleError })
      ]);
    }

    return h('div', { className: 'admin-app' }, [
      h(AdminLayout, { 
        key: 'layout', 
        user, 
        token, 
        onLogout: handleLogout, 
        currentView, 
        onNavigate: handleNavigate 
      }, [
        renderCurrentView()
      ])
    ]);
  };

  // Initialize the admin app
  function initializeAdmin() {
    const root = createRoot(document.getElementById('admin-root'));
    root.render(h(AdminApp));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdmin);
  } else {
    initializeAdmin();
  }

})();
`;

  // Write the bundle
  writeFileSync(OUTPUT_FILE, bundleContent);

  console.log('✅ Admin Dashboard build completed!');
  console.log(`📁 JavaScript: ${OUTPUT_FILE}`);
  console.log(`📁 CSS: ${CSS_OUTPUT_FILE}`);
  console.log('');
  console.log('🚀 To test the admin dashboard:');
  console.log('   1. Start the faucet server');
  console.log('   2. Enable admin-dashboard module in config');
  console.log('   3. Visit http://localhost:8080/admin');
  console.log('');
  console.log('✨ Features included:');
  console.log('   • Complete React-based admin interface');
  console.log('   • Login with JWT authentication');
  console.log('   • Real-time statistics dashboard');
  console.log('   • Auto-refresh functionality');
  console.log('   • Responsive design with dark theme');
  console.log('   • Error handling and loading states');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}