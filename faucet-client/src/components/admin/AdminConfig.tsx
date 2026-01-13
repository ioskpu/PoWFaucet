import React, { useState, useEffect } from 'react';
import './AdminConfig.css';

interface ConfigSection {
  key: string;
  label: string;
  description: string;
  type: 'basic' | 'modules' | 'advanced';
}

interface AdminConfigProps {
  token: string;
}

export const AdminConfig: React.FC<AdminConfigProps> = ({ token }) => {
  const [config, setConfig] = useState<any>(null);
  const [originalConfig, setOriginalConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const configSections: ConfigSection[] = [
    {
      key: 'basic',
      label: 'Configuración Básica',
      description: 'Configuración general del faucet',
      type: 'basic'
    },
    {
      key: 'modules',
      label: 'Módulos',
      description: 'Gestión de módulos y sus configuraciones',
      type: 'modules'
    },
    {
      key: 'advanced',
      label: 'Configuración Avanzada',
      description: 'Configuraciones técnicas y de seguridad',
      type: 'advanced'
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
        // Mostrar mensaje de éxito
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

  const updateConfigValue = (path: string[], value: any) => {
    if (!config) return;

    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;

    // Navegar hasta el penúltimo nivel
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // Establecer el valor final
    current[path[path.length - 1]] = value;
    setConfig(newConfig);
  };

  const toggleModule = (moduleName: string, enabled: boolean) => {
    updateConfigValue(['modules', moduleName, 'enabled'], enabled);
  };

  const renderBasicConfig = () => {
    if (!config) return null;

    return (
      <div className="config-section">
        <h3>Configuración General</h3>
        
        <div className="config-group">
          <label>Título del Faucet</label>
          <input
            type="text"
            value={config.faucetTitle || ''}
            onChange={(e) => updateConfigValue(['faucetTitle'], e.target.value)}
            placeholder="Nombre del faucet"
          />
        </div>

        <div className="config-group">
          <label>Puerto del Servidor</label>
          <input
            type="number"
            value={config.serverPort || 8080}
            onChange={(e) => updateConfigValue(['serverPort'], parseInt(e.target.value))}
            min="1"
            max="65535"
          />
        </div>

        <div className="config-group">
          <label>Símbolo de la Moneda</label>
          <input
            type="text"
            value={config.faucetCoinSymbol || ''}
            onChange={(e) => updateConfigValue(['faucetCoinSymbol'], e.target.value)}
            placeholder="ETH"
          />
        </div>

        <div className="config-group">
          <label>Cantidad Mínima (wei)</label>
          <input
            type="text"
            value={config.minClaim || ''}
            onChange={(e) => updateConfigValue(['minClaim'], e.target.value)}
            placeholder="100000000000000000"
          />
        </div>

        <div className="config-group">
          <label>Cantidad Máxima (wei)</label>
          <input
            type="text"
            value={config.maxClaim || ''}
            onChange={(e) => updateConfigValue(['maxClaim'], e.target.value)}
            placeholder="1000000000000000000"
          />
        </div>

        <div className="config-group">
          <label>Timeout de Sesión (segundos)</label>
          <input
            type="number"
            value={config.sessionTimeout || 3600}
            onChange={(e) => updateConfigValue(['sessionTimeout'], parseInt(e.target.value))}
            min="60"
          />
        </div>
      </div>
    );
  };

  const renderModulesConfig = () => {
    if (!config || !config.modules) return null;

    return (
      <div className="config-section">
        <h3>Gestión de Módulos</h3>
        
        <div className="modules-grid">
          {Object.entries(config.modules).map(([moduleName, moduleConfig]: [string, any]) => (
            <div key={moduleName} className="module-card">
              <div className="module-header">
                <h4>{moduleName}</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={moduleConfig?.enabled || false}
                    onChange={(e) => toggleModule(moduleName, e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="module-status">
                <span className={`status-indicator ${moduleConfig?.enabled ? 'enabled' : 'disabled'}`}>
                  {moduleConfig?.enabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>

              {moduleConfig?.enabled && (
                <div className="module-config">
                  <p className="config-count">
                    {Object.keys(moduleConfig).length - 1} configuraciones
                  </p>
                  <button 
                    className="config-button"
                    onClick={() => {/* TODO: Abrir editor específico del módulo */}}
                  >
                    Configurar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAdvancedConfig = () => {
    if (!config) return null;

    return (
      <div className="config-section">
        <h3>Configuración Avanzada</h3>
        
        <div className="config-group">
          <label>RPC Host</label>
          <input
            type="text"
            value={config.ethRpcHost || ''}
            onChange={(e) => updateConfigValue(['ethRpcHost'], e.target.value)}
            placeholder="https://rpc.example.com"
          />
        </div>

        <div className="config-group">
          <label>Chain ID</label>
          <input
            type="number"
            value={config.ethChainId || 1}
            onChange={(e) => updateConfigValue(['ethChainId'], parseInt(e.target.value))}
          />
        </div>

        <div className="config-group">
          <label>Timeout de Claim (segundos)</label>
          <input
            type="number"
            value={config.claimTimeout || 600}
            onChange={(e) => updateConfigValue(['claimTimeout'], parseInt(e.target.value))}
            min="60"
          />
        </div>

        <div className="config-group">
          <label>Construir Índice SEO</label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.buildSeoIndex || false}
              onChange={(e) => updateConfigValue(['buildSeoIndex'], e.target.checked)}
            />
            <span>Generar archivos SEO automáticamente</span>
          </label>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (!showPreview || !config) return null;

    return (
      <div className="config-preview">
        <div className="preview-header">
          <h3>Vista Previa de Cambios</h3>
          <button 
            className="close-preview"
            onClick={() => setShowPreview(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="preview-content">
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-config">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="admin-config">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar configuración</h3>
          <p>{error}</p>
          <button onClick={fetchConfig} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-config">
      <div className="config-header">
        <div className="header-left">
          <h2>Gestión de Configuración</h2>
          <p>Modifica la configuración del faucet desde la interfaz web</p>
        </div>
        
        <div className="header-actions">
          {hasChanges && (
            <>
              <button 
                className="preview-button"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Ocultar' : 'Vista Previa'}
              </button>
              <button 
                className="reset-button"
                onClick={resetConfig}
              >
                Descartar Cambios
              </button>
              <button 
                className="save-button"
                onClick={saveConfig}
                disabled={saving || validationErrors.length > 0}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>Errores de Validación:</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="config-layout">
        <div className="config-sidebar">
          <nav className="config-nav">
            {configSections.map((section) => (
              <button
                key={section.key}
                className={`nav-item ${activeSection === section.key ? 'active' : ''}`}
                onClick={() => setActiveSection(section.key)}
              >
                <span className="nav-label">{section.label}</span>
                <span className="nav-description">{section.description}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="config-content">
          {activeSection === 'basic' && renderBasicConfig()}
          {activeSection === 'modules' && renderModulesConfig()}
          {activeSection === 'advanced' && renderAdvancedConfig()}
        </div>

        {showPreview && renderPreview()}
      </div>
    </div>
  );
};