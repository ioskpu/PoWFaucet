import React, { useState, useEffect } from 'react';
import './AdminReports.css';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }>;
}

interface ReportData {
  period: string;
  totalRequests: number;
  totalDistributed: string;
  uniqueUsers: number;
  successRate: number;
  averageClaimAmount: string;
  topHour: string;
  topDay: string;
}

interface ModuleStats {
  name: string;
  enabled: boolean;
  sessionsProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  lastActivity: number;
}

interface AdminReportsProps {
  token: string;
}

export const AdminReports: React.FC<AdminReportsProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');
  
  // Estados para diferentes tipos de datos
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const tabs = [
    { key: 'overview', label: '📊 Resumen', icon: '📊' },
    { key: 'charts', label: '📈 Gráficos', icon: '📈' },
    { key: 'modules', label: '🧩 Rendimiento Módulos', icon: '🧩' },
    { key: 'health', label: '💚 Salud del Sistema', icon: '💚' },
    { key: 'export', label: '📤 Exportar Datos', icon: '📤' }
  ];

  const timeRanges = [
    { key: '24h', label: 'Últimas 24h' },
    { key: '7d', label: 'Últimos 7 días' },
    { key: '30d', label: 'Últimos 30 días' },
    { key: '90d', label: 'Últimos 90 días' }
  ];

  useEffect(() => {
    fetchData();
  }, [token, activeTab, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'overview':
          await fetchReportData();
          break;
        case 'charts':
          await fetchChartData();
          break;
        case 'modules':
          await fetchModuleStats();
          break;
        case 'health':
          await fetchSystemHealth();
          break;
        case 'export':
          // No necesita cargar datos específicos
          setLoading(false);
          return;
      }
    } catch (error) {
      setError('Error al cargar datos de reportes');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    const response = await fetch(`/api/admin/reports/summary?period=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      setReportData(data.data);
    } else {
      throw new Error(data.error?.message || 'Error al cargar resumen');
    }
  };

  const fetchChartData = async () => {
    const response = await fetch(`/api/admin/reports/charts?period=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      setChartData(data.data);
    } else {
      throw new Error(data.error?.message || 'Error al cargar gráficos');
    }
  };

  const fetchModuleStats = async () => {
    const response = await fetch(`/api/admin/reports/modules?period=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      setModuleStats(data.data.modules || []);
    } else {
      throw new Error(data.error?.message || 'Error al cargar estadísticas de módulos');
    }
  };

  const fetchSystemHealth = async () => {
    const response = await fetch('/api/admin/reports/health', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      setSystemHealth(data.data);
    } else {
      throw new Error(data.error?.message || 'Error al cargar salud del sistema');
    }
  };

  const exportData = async (format: 'csv' | 'json', type: 'stats' | 'sessions' | 'users') => {
    setExportLoading(true);
    setError(null);

    try {
      const endpoint = format === 'csv' 
        ? `/api/admin/export/${type}/csv`
        : `/api/admin/export/${type}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Crear y descargar archivo
        const blob = new Blob([format === 'csv' ? data.data : JSON.stringify(data.data, null, 2)], {
          type: format === 'csv' ? 'text/csv' : 'application/json'
        });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `faucet-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError(data.error?.message || 'Error al exportar datos');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setExportLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatTimeAgo = (timestamp: number) => {
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

  const renderOverview = () => {
    if (!reportData) return null;

    return (
      <div className="reports-overview">
        <div className="overview-stats">
          <div className="stat-card large">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Solicitudes Totales</h3>
              <div className="stat-value">{formatNumber(reportData.totalRequests)}</div>
              <div className="stat-subtitle">En {reportData.period}</div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>ETH Distribuido</h3>
              <div className="stat-value">{reportData.totalDistributed}</div>
              <div className="stat-subtitle">Total del período</div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Usuarios Únicos</h3>
              <div className="stat-value">{formatNumber(reportData.uniqueUsers)}</div>
              <div className="stat-subtitle">Direcciones diferentes</div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Tasa de Éxito</h3>
              <div className="stat-value">{formatPercentage(reportData.successRate)}</div>
              <div className="stat-subtitle">Transacciones exitosas</div>
            </div>
          </div>
        </div>

        <div className="overview-details">
          <div className="detail-card">
            <h4>📈 Análisis de Patrones</h4>
            <div className="detail-content">
              <div className="detail-item">
                <span className="detail-label">Promedio por Claim:</span>
                <span className="detail-value">{reportData.averageClaimAmount} ETH</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hora Pico:</span>
                <span className="detail-value">{reportData.topHour}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Día Más Activo:</span>
                <span className="detail-value">{reportData.topDay}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h4>🎯 Métricas Clave</h4>
            <div className="detail-content">
              <div className="detail-item">
                <span className="detail-label">Usuarios por Día:</span>
                <span className="detail-value">{Math.round(reportData.uniqueUsers / 7)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Solicitudes por Usuario:</span>
                <span className="detail-value">{(reportData.totalRequests / reportData.uniqueUsers).toFixed(1)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ETH por Usuario:</span>
                <span className="detail-value">{(parseFloat(reportData.totalDistributed) / reportData.uniqueUsers).toFixed(4)} ETH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    if (!chartData) return null;

    return (
      <div className="reports-charts">
        <div className="chart-container">
          <h4>📈 Solicitudes por Día</h4>
          <div className="simple-chart">
            <div className="chart-bars">
              {chartData.datasets[0]?.data.map((value, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(value / Math.max(...chartData.datasets[0].data)) * 100}%`,
                      backgroundColor: '#667eea'
                    }}
                  ></div>
                  <div className="bar-label">{chartData.labels[index]}</div>
                  <div className="bar-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h4>💰 ETH Distribuido por Día</h4>
          <div className="simple-chart">
            <div className="chart-bars">
              {chartData.datasets[1]?.data.map((value, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(value / Math.max(...chartData.datasets[1].data)) * 100}%`,
                      backgroundColor: '#10b981'
                    }}
                  ></div>
                  <div className="bar-label">{chartData.labels[index]}</div>
                  <div className="bar-value">{value.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-info">
          <p>📊 Los gráficos muestran tendencias de uso durante el período seleccionado</p>
          <p>💡 Usa los filtros de tiempo para analizar diferentes períodos</p>
        </div>
      </div>
    );
  };

  const renderModuleStats = () => {
    return (
      <div className="module-stats">
        <div className="modules-grid">
          {moduleStats.map((module) => (
            <div key={module.name} className="module-stat-card">
              <div className="module-header">
                <h4>{module.name}</h4>
                <span className={`module-status ${module.enabled ? 'enabled' : 'disabled'}`}>
                  {module.enabled ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="module-metrics">
                <div className="metric-item">
                  <span className="metric-label">Sesiones Procesadas</span>
                  <span className="metric-value">{formatNumber(module.sessionsProcessed)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Tasa de Éxito</span>
                  <span className="metric-value">{formatPercentage(module.successRate)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Tiempo Promedio</span>
                  <span className="metric-value">{module.averageProcessingTime}ms</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Última Actividad</span>
                  <span className="metric-value">{formatTimeAgo(module.lastActivity)}</span>
                </div>
              </div>

              <div className="module-performance">
                <div className="performance-bar">
                  <div 
                    className="performance-fill"
                    style={{ 
                      width: `${module.successRate}%`,
                      backgroundColor: module.successRate > 90 ? '#10b981' : 
                                     module.successRate > 70 ? '#ffc107' : '#ef4444'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {moduleStats.length === 0 && (
          <div className="empty-modules">
            <div className="empty-icon">🧩</div>
            <p>No hay datos de módulos disponibles</p>
          </div>
        )}
      </div>
    );
  };

  const renderSystemHealth = () => {
    if (!systemHealth) return null;

    return (
      <div className="system-health">
        <div className="health-overview">
          <div className="health-score">
            <div className="score-circle">
              <div className="score-value">{systemHealth.overallScore}</div>
              <div className="score-label">Salud General</div>
            </div>
          </div>

          <div className="health-indicators">
            <div className={`health-indicator ${systemHealth.uptime > 99 ? 'good' : 'warning'}`}>
              <div className="indicator-icon">⏱️</div>
              <div className="indicator-content">
                <div className="indicator-label">Uptime</div>
                <div className="indicator-value">{systemHealth.uptime}%</div>
              </div>
            </div>

            <div className={`health-indicator ${systemHealth.memoryUsage < 80 ? 'good' : 'warning'}`}>
              <div className="indicator-icon">💾</div>
              <div className="indicator-content">
                <div className="indicator-label">Memoria</div>
                <div className="indicator-value">{systemHealth.memoryUsage}%</div>
              </div>
            </div>

            <div className={`health-indicator ${systemHealth.responseTime < 500 ? 'good' : 'warning'}`}>
              <div className="indicator-icon">⚡</div>
              <div className="indicator-content">
                <div className="indicator-label">Respuesta</div>
                <div className="indicator-value">{systemHealth.responseTime}ms</div>
              </div>
            </div>

            <div className={`health-indicator ${systemHealth.errorRate < 5 ? 'good' : 'warning'}`}>
              <div className="indicator-icon">🚨</div>
              <div className="indicator-content">
                <div className="indicator-label">Errores</div>
                <div className="indicator-value">{systemHealth.errorRate}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="health-details">
          <div className="health-section">
            <h4>🔧 Estado de Servicios</h4>
            <div className="service-list">
              {systemHealth.services?.map((service: any) => (
                <div key={service.name} className="service-item">
                  <div className={`service-status ${service.status}`}></div>
                  <span className="service-name">{service.name}</span>
                  <span className="service-uptime">{service.uptime}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="health-section">
            <h4>📊 Métricas de Rendimiento</h4>
            <div className="performance-metrics">
              <div className="metric-row">
                <span>Transacciones por Segundo:</span>
                <span>{systemHealth.tps || 0}</span>
              </div>
              <div className="metric-row">
                <span>Conexiones Activas:</span>
                <span>{systemHealth.activeConnections || 0}</span>
              </div>
              <div className="metric-row">
                <span>Cache Hit Rate:</span>
                <span>{systemHealth.cacheHitRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExport = () => {
    return (
      <div className="export-section">
        <div className="export-options">
          <div className="export-card">
            <div className="export-header">
              <h4>📊 Exportar Estadísticas</h4>
              <p>Datos de uso, solicitudes y distribución</p>
            </div>
            <div className="export-actions">
              <button 
                className="export-button csv"
                onClick={() => exportData('csv', 'stats')}
                disabled={exportLoading}
              >
                📄 Descargar CSV
              </button>
              <button 
                className="export-button json"
                onClick={() => exportData('json', 'stats')}
                disabled={exportLoading}
              >
                📋 Descargar JSON
              </button>
            </div>
          </div>

          <div className="export-card">
            <div className="export-header">
              <h4>🔗 Exportar Sesiones</h4>
              <p>Historial de sesiones y actividad de usuarios</p>
            </div>
            <div className="export-actions">
              <button 
                className="export-button csv"
                onClick={() => exportData('csv', 'sessions')}
                disabled={exportLoading}
              >
                📄 Descargar CSV
              </button>
              <button 
                className="export-button json"
                onClick={() => exportData('json', 'sessions')}
                disabled={exportLoading}
              >
                📋 Descargar JSON
              </button>
            </div>
          </div>

          <div className="export-card">
            <div className="export-header">
              <h4>👥 Exportar Usuarios</h4>
              <p>Datos de usuarios, direcciones y estadísticas</p>
            </div>
            <div className="export-actions">
              <button 
                className="export-button csv"
                onClick={() => exportData('csv', 'users')}
                disabled={exportLoading}
              >
                📄 Descargar CSV
              </button>
              <button 
                className="export-button json"
                onClick={() => exportData('json', 'users')}
                disabled={exportLoading}
              >
                📋 Descargar JSON
              </button>
            </div>
          </div>
        </div>

        <div className="export-info">
          <h4>ℹ️ Información sobre Exportación</h4>
          <ul>
            <li><strong>CSV:</strong> Formato compatible con Excel y hojas de cálculo</li>
            <li><strong>JSON:</strong> Formato estructurado para análisis programático</li>
            <li><strong>Datos incluidos:</strong> Período seleccionado en filtros de tiempo</li>
            <li><strong>Privacidad:</strong> Datos sensibles son anonimizados automáticamente</li>
          </ul>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-reports">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Cargando análisis y reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <div className="header-left">
          <h2>Análisis y Reportes</h2>
          <p>Análisis histórico, métricas de rendimiento y exportación de datos</p>
        </div>
        
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            {timeRanges.map((range) => (
              <option key={range.key} value={range.key}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="reports-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="reports-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'charts' && renderCharts()}
        {activeTab === 'modules' && renderModuleStats()}
        {activeTab === 'health' && renderSystemHealth()}
        {activeTab === 'export' && renderExport()}
      </div>
    </div>
  );
};