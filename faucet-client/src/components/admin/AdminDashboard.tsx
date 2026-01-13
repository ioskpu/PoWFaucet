import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface FaucetStats {
  balance: {
    current: string;
    formatted: string;
    lastUpdate: number;
  };
  activity: {
    activeSessions: number;
    queuedSessions: number;
    completedToday: number;
    failedToday: number;
    totalDistributed: string;
    totalDistributedFormatted: string;
  };
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
  topAddresses: Array<{
    address: string;
    requests: number;
    totalReceived: string;
    lastRequest: number;
  }>;
  topIPs: Array<{
    ip: string;
    requests: number;
    lastRequest: number;
    country?: string;
  }>;
}

interface AdminDashboardProps {
  token: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [stats, setStats] = useState<FaucetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
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
      fetchStats(false); // No mostrar loading en auto-refresh
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, token]);

  const formatUptime = (seconds: number) => {
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  if (loading && !stats) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Cargando estadísticas del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar el dashboard</h3>
          <p>{error}</p>
          <button onClick={() => fetchStats()} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header Controls */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Dashboard Principal</h2>
          {lastUpdate && (
            <p className="last-update">
              Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            </p>
          )}
        </div>
        <div className="header-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-actualizar</span>
          </label>
          <button onClick={refreshStats} className="refresh-button">
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {/* Balance Card */}
        <div className="stat-card balance-card">
          <div className="card-header">
            <h3>💰 Balance del Faucet</h3>
            <div className="card-status online">●</div>
          </div>
          <div className="card-content">
            <div className="main-value">{stats?.balance?.formatted || '0.0000'} ETH</div>
            <div className="sub-value">
              {stats?.balance?.current ? `${stats.balance.current} wei` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="stat-card activity-card">
          <div className="card-header">
            <h3>📊 Actividad</h3>
          </div>
          <div className="card-content">
            <div className="activity-stats">
              <div className="activity-item">
                <span className="activity-label">Sesiones Activas</span>
                <span className="activity-value">{stats?.activity?.activeSessions || 0}</span>
              </div>
              <div className="activity-item">
                <span className="activity-label">Completadas Hoy</span>
                <span className="activity-value success">{stats?.activity?.completedToday || 0}</span>
              </div>
              <div className="activity-item">
                <span className="activity-label">Fallidas Hoy</span>
                <span className="activity-value error">{stats?.activity?.failedToday || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Card */}
        <div className="stat-card system-card">
          <div className="card-header">
            <h3>🖥️ Sistema</h3>
          </div>
          <div className="card-content">
            <div className="system-stats">
              <div className="system-item">
                <span className="system-label">Uptime</span>
                <span className="system-value">{formatUptime(stats?.system?.uptime || 0)}</span>
              </div>
              <div className="system-item">
                <span className="system-label">Memoria</span>
                <span className="system-value">{stats?.system?.memoryUsage?.percentage || 0}%</span>
              </div>
              <div className="system-item">
                <span className="system-label">Node.js</span>
                <span className="system-value">{stats?.system?.nodeVersion || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Card */}
        <div className="stat-card distribution-card">
          <div className="card-header">
            <h3>💸 Distribuido Hoy</h3>
          </div>
          <div className="card-content">
            <div className="main-value">{stats?.activity?.totalDistributedFormatted || '0.0000'} ETH</div>
            <div className="sub-value">
              Total distribuido en el día actual
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="secondary-stats">
        {/* Top Addresses */}
        <div className="stat-card top-addresses-card">
          <div className="card-header">
            <h3>🏆 Top Direcciones</h3>
          </div>
          <div className="card-content">
            {stats?.topAddresses && stats.topAddresses.length > 0 ? (
              <div className="top-list">
                {stats.topAddresses.slice(0, 5).map((addr, index) => (
                  <div key={addr.address} className="top-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="address">{formatAddress(addr.address)}</div>
                    <div className="requests">{addr.requests} req</div>
                    <div className="last-seen">{formatTimeAgo(addr.lastRequest)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No hay datos disponibles</div>
            )}
          </div>
        </div>

        {/* Top IPs */}
        <div className="stat-card top-ips-card">
          <div className="card-header">
            <h3>🌐 Top IPs</h3>
          </div>
          <div className="card-content">
            {stats?.topIPs && stats.topIPs.length > 0 ? (
              <div className="top-list">
                {stats.topIPs.slice(0, 5).map((ip, index) => (
                  <div key={ip.ip} className="top-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="ip">{ip.ip}</div>
                    <div className="requests">{ip.requests} req</div>
                    <div className="last-seen">{formatTimeAgo(ip.lastRequest)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No hay datos disponibles</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};