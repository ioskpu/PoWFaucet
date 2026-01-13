
// Admin Dashboard Bundle
// Generated at: 2026-01-13T21:31:33.379Z

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
              className: `nav-item ${currentView === item.key ? 'active' : ''}`,
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
            'Authorization': `Bearer ${token}`,
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
            'Authorization': `Bearer ${token}`,
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
        return `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    };

    const formatAddress = (address) => {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatTimeAgo = (timestamp) => {
      const now = Date.now();
      const diffMs = now - timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins}m`;
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)}h`;
      } else {
        return `${Math.floor(diffMins / 1440)}d`;
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
            `Última actualización: ${lastUpdate.toLocaleTimeString('es-ES')}`)
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
              `${stats?.balance?.formatted || '0.0000'} ETH`),
            h('div', { key: 'sub', className: 'sub-value' }, 
              stats?.balance?.current ? `${stats.balance.current} wei` : 'N/A')
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
                  `${stats?.system?.memoryUsage?.percentage || 0}%`)
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
              `${stats?.activity?.totalDistributedFormatted || '0.0000'} ETH`),
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
                    h('div', { key: 'rank', className: 'rank' }, `#${index + 1}`),
                    h('div', { key: 'address', className: 'address' }, formatAddress(addr.address)),
                    h('div', { key: 'requests', className: 'requests' }, `${addr.requests} req`),
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
                    h('div', { key: 'rank', className: 'rank' }, `#${index + 1}`),
                    h('div', { key: 'ip', className: 'ip' }, ip.ip),
                    h('div', { key: 'requests', className: 'requests' }, `${ip.requests} req`),
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

  // Admin Config Component
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
            'Authorization': `Bearer ${token}`,
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
            'Authorization': `Bearer ${token}`,
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
            'Authorization': `Bearer ${token}`,
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
        h('span', { key: 'message' }, `⚠️ ${error}`),
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
                className: `nav-item ${activeSection === section.key ? 'active' : ''}`,
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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

      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    };

    const handleError = (error) => {
      console.error('Admin error:', error);
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
      h(AdminLayout, { key: 'layout', user, token, onLogout: handleLogout }, [
        h(AdminDashboard, { key: 'dashboard', token })
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
