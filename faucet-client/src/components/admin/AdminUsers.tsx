import React, { useState, useEffect } from 'react';
import './AdminUsers.css';

interface UserEntry {
  address?: string;
  ip?: string;
  reason: string;
  addedBy: string;
  timestamp: number;
  lastActivity?: number;
}

interface ActiveSession {
  sessionId: string;
  targetAddr: string;
  remoteIP: string;
  startTime: number;
  status: string;
  tasks: string[];
}

interface TopUser {
  address: string;
  requests: number;
  totalReceived: string;
  lastRequest: number;
  isActive: boolean;
  daysSinceLastRequest: number;
}

interface AdminUsersProps {
  token: string;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para diferentes secciones
  const [userStats, setUserStats] = useState<any>(null);
  const [blacklist, setBlacklist] = useState<UserEntry[]>([]);
  const [whitelist, setWhitelist] = useState<UserEntry[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  
  // Estados para formularios
  const [newEntry, setNewEntry] = useState({ address: '', ip: '', reason: '' });
  const [showAddForm, setShowAddForm] = useState<'blacklist' | 'whitelist' | null>(null);
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
        'Authorization': `Bearer ${token}`,
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      setBlacklist([
        ...data.data.addresses.map((addr: any) => ({ ...addr, type: 'address' })),
        ...data.data.ips.map((ip: any) => ({ ...ip, type: 'ip' }))
      ]);
    } else {
      throw new Error(data.error?.message || 'Error al cargar blacklist');
    }
  };

  const fetchWhitelist = async () => {
    const response = await fetch('/api/admin/users/whitelist', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      setWhitelist([
        ...data.data.addresses.map((addr: any) => ({ ...addr, type: 'address' })),
        ...data.data.ips.map((ip: any) => ({ ...ip, type: 'ip' }))
      ]);
    } else {
      throw new Error(data.error?.message || 'Error al cargar whitelist');
    }
  };

  const fetchActiveSessions = async () => {
    const response = await fetch('/api/admin/users/sessions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      setActiveSessions(data.data.sessions || []);
    } else {
      throw new Error(data.error?.message || 'Error al cargar sesiones');
    }
  };

  const fetchTopUsers = async () => {
    const response = await fetch('/api/admin/users/top', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      setTopUsers(data.data.topAddresses || []);
    } else {
      throw new Error(data.error?.message || 'Error al cargar top usuarios');
    }
  };

  const addToList = async (listType: 'blacklist' | 'whitelist') => {
    if (!newEntry.address && !newEntry.ip) {
      setError('Debe especificar una dirección o IP');
      return;
    }

    if (!newEntry.reason.trim()) {
      setError('Debe especificar una razón');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${listType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      const data = await response.json();
      if (data.success) {
        setNewEntry({ address: '', ip: '', reason: '' });
        setShowAddForm(null);
        await fetchData(); // Recargar datos
      } else {
        setError(data.error?.message || `Error al agregar a ${listType}`);
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const removeFromList = async (listType: 'blacklist' | 'whitelist', entry: UserEntry) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${listType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: entry.address,
          ip: entry.ip
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchData(); // Recargar datos
      } else {
        setError(data.error?.message || `Error al remover de ${listType}`);
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users/sessions/terminate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchActiveSessions(); // Recargar sesiones
      } else {
        setError(data.error?.message || 'Error al terminar sesión');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setActionLoading(false);
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

  const renderOverview = () => {
    if (!userStats) return null;

    return (
      <div className="users-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Usuarios Totales</h3>
              <div className="stat-value">{userStats.totalUsers || 0}</div>
              <div className="stat-subtitle">Direcciones únicas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <h3>Usuarios Activos</h3>
              <div className="stat-value">{userStats.activeUsers || 0}</div>
              <div className="stat-subtitle">Últimas 24h</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚫</div>
            <div className="stat-content">
              <h3>Blacklist</h3>
              <div className="stat-value">{userStats.blacklistCount || 0}</div>
              <div className="stat-subtitle">Direcciones/IPs bloqueadas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Whitelist</h3>
              <div className="stat-value">{userStats.whitelistCount || 0}</div>
              <div className="stat-subtitle">Direcciones/IPs permitidas</div>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Top Direcciones Recientes</h3>
          <div className="activity-list">
            {userStats.topAddresses?.slice(0, 5).map((addr: any, index: number) => (
              <div key={addr.address} className="activity-item">
                <div className="activity-rank">#{index + 1}</div>
                <div className="activity-address">{formatAddress(addr.address)}</div>
                <div className="activity-requests">{addr.requests} solicitudes</div>
                <div className="activity-time">{formatTimeAgo(addr.lastSession)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderList = (list: UserEntry[], listType: 'blacklist' | 'whitelist') => {
    const title = listType === 'blacklist' ? 'Blacklist' : 'Whitelist';
    const icon = listType === 'blacklist' ? '🚫' : '✅';
    const addButtonText = listType === 'blacklist' ? 'Agregar a Blacklist' : 'Agregar a Whitelist';

    return (
      <div className="user-list">
        <div className="list-header">
          <h3>{icon} {title}</h3>
          <button 
            className="add-button"
            onClick={() => setShowAddForm(listType)}
          >
            + {addButtonText}
          </button>
        </div>

        {showAddForm === listType && (
          <div className="add-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Dirección Ethereum (0x...)"
                value={newEntry.address}
                onChange={(e) => setNewEntry({ ...newEntry, address: e.target.value })}
              />
              <span className="form-separator">O</span>
              <input
                type="text"
                placeholder="Dirección IP"
                value={newEntry.ip}
                onChange={(e) => setNewEntry({ ...newEntry, ip: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Razón (requerida)"
              value={newEntry.reason}
              onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
              className="reason-input"
            />
            <div className="form-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowAddForm(null);
                  setNewEntry({ address: '', ip: '', reason: '' });
                }}
              >
                Cancelar
              </button>
              <button 
                className="submit-button"
                onClick={() => addToList(listType)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        )}

        <div className="list-content">
          {list.length === 0 ? (
            <div className="empty-list">
              <div className="empty-icon">{icon}</div>
              <p>No hay entradas en {title.toLowerCase()}</p>
            </div>
          ) : (
            <div className="entries-list">
              {list.map((entry, index) => (
                <div key={index} className="entry-item">
                  <div className="entry-info">
                    <div className="entry-target">
                      {entry.address ? (
                        <span className="address">{formatAddress(entry.address)}</span>
                      ) : (
                        <span className="ip">{entry.ip}</span>
                      )}
                    </div>
                    <div className="entry-reason">{entry.reason}</div>
                    <div className="entry-meta">
                      Por {entry.addedBy} • {formatTimeAgo(entry.timestamp)}
                    </div>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => removeFromList(listType, entry)}
                    disabled={actionLoading}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSessions = () => {
    return (
      <div className="active-sessions">
        <div className="sessions-header">
          <h3>🔗 Sesiones Activas</h3>
          <div className="sessions-count">
            {activeSessions.length} sesiones activas
          </div>
        </div>

        <div className="sessions-content">
          {activeSessions.length === 0 ? (
            <div className="empty-sessions">
              <div className="empty-icon">🔗</div>
              <p>No hay sesiones activas</p>
            </div>
          ) : (
            <div className="sessions-list">
              {activeSessions.map((session) => (
                <div key={session.sessionId} className="session-item">
                  <div className="session-info">
                    <div className="session-address">
                      {formatAddress(session.targetAddr)}
                    </div>
                    <div className="session-ip">
                      IP: {session.remoteIP}
                    </div>
                    <div className="session-status">
                      Estado: <span className={`status ${session.status.toLowerCase()}`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="session-time">
                      Iniciada: {formatTimeAgo(session.startTime)}
                    </div>
                    {session.tasks.length > 0 && (
                      <div className="session-tasks">
                        Tareas: {session.tasks.join(', ')}
                      </div>
                    )}
                  </div>
                  <button 
                    className="terminate-button"
                    onClick={() => terminateSession(session.sessionId)}
                    disabled={actionLoading}
                  >
                    Terminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTopUsers = () => {
    return (
      <div className="top-users">
        <div className="top-users-header">
          <h3>🏆 Top Usuarios</h3>
          <div className="users-count">
            {topUsers.length} usuarios registrados
          </div>
        </div>

        <div className="top-users-content">
          {topUsers.length === 0 ? (
            <div className="empty-users">
              <div className="empty-icon">🏆</div>
              <p>No hay datos de usuarios</p>
            </div>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <div className="col-rank">#</div>
                <div className="col-address">Dirección</div>
                <div className="col-requests">Solicitudes</div>
                <div className="col-received">Recibido</div>
                <div className="col-last">Última Actividad</div>
                <div className="col-status">Estado</div>
              </div>
              {topUsers.map((user, index) => (
                <div key={user.address} className="table-row">
                  <div className="col-rank">#{index + 1}</div>
                  <div className="col-address">
                    <span className="address-text">{formatAddress(user.address)}</span>
                  </div>
                  <div className="col-requests">{user.requests}</div>
                  <div className="col-received">{user.totalReceived} ETH</div>
                  <div className="col-last">{formatTimeAgo(user.lastRequest)}</div>
                  <div className="col-status">
                    <span className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Cargando gestión de usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <div className="header-left">
          <h2>Gestión de Usuarios</h2>
          <p>Administra usuarios, sesiones y listas de control de acceso</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="users-tabs">
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

      <div className="users-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'blacklist' && renderList(blacklist, 'blacklist')}
        {activeTab === 'whitelist' && renderList(whitelist, 'whitelist')}
        {activeTab === 'sessions' && renderSessions()}
        {activeTab === 'top-users' && renderTopUsers()}
      </div>
    </div>
  );
};