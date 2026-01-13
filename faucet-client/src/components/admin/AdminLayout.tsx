import React, { useState, useEffect } from 'react';
import './AdminLayout.css';

interface AdminUser {
  username: string;
  loginTime: number;
}

interface AdminLayoutProps {
  user: AdminUser;
  token: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ user, token, onLogout, children }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
    }
  };

  const formatLoginTime = (timestamp: number) => {
    const loginDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ${diffMins % 60}m`;
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', active: true },
    { id: 'stats', icon: '📈', label: 'Estadísticas', active: true },
    { id: 'alerts', icon: '🚨', label: 'Alertas', active: true },
    { id: 'users', icon: '👥', label: 'Usuarios', active: true },
    { id: 'modules', icon: '🔧', label: 'Módulos', active: true },
    { id: 'config', icon: '⚙️', label: 'Configuración', active: true },
    { id: 'logs', icon: '📝', label: 'Logs', active: true },
    { id: 'export', icon: '📤', label: 'Exportar', active: true },
  ];

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🔐</span>
            {!sidebarCollapsed && <span className="logo-text">Admin Panel</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''} ${!item.active ? 'disabled' : ''}`}
              onClick={() => item.active && setActiveSection(item.id)}
              disabled={!item.active}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>{user.username.charAt(0).toUpperCase()}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user.username}</div>
                <div className="user-session">Sesión: {formatLoginTime(user.loginTime)}</div>
              </div>
            )}
          </div>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="logout-icon">🚪</span>
            {!sidebarCollapsed && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.id === activeSection)?.icon}{' '}
              {menuItems.find(item => item.id === activeSection)?.label}
            </h1>
          </div>
          <div className="header-right">
            <div className="header-info">
              <div className="current-time">
                <span className="time-icon">🕐</span>
                {currentTime.toLocaleTimeString('es-ES')}
              </div>
              <div className="server-status">
                <span className="status-indicator online"></span>
                Servidor Online
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};