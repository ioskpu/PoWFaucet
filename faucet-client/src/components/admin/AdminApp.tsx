import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminConfig } from './AdminConfig';
import './AdminApp.css';

interface AdminUser {
  username: string;
  loginTime: number;
}

export const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Verificar si hay una sesión guardada al cargar
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
        // Si hay error al parsear, limpiar storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (newToken: string, userData: any) => {
    const userInfo: AdminUser = {
      username: userData.username,
      loginTime: userData.loginTime || Date.now(),
    };

    setToken(newToken);
    setUser(userInfo);
    setIsAuthenticated(true);

    // Guardar en localStorage
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminUser', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Limpiar localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const handleError = (error: string) => {
    console.error('Admin error:', error);
    // Aquí podrías mostrar notificaciones de error
  };

  const renderContent = () => {
    if (!token) return null;

    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard token={token} />;
      case 'config':
        return <AdminConfig token={token} />;
      case 'stats':
      case 'alerts':
      case 'users':
      case 'modules':
      case 'logs':
      case 'export':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h2>Funcionalidad en Desarrollo</h2>
            <p>La sección "{activeSection}" estará disponible próximamente.</p>
          </div>
        );
      default:
        return <AdminDashboard token={token} />;
    }
  };

  if (isLoading) {
    return (
      <div className="admin-app">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token || !user) {
    return (
      <div className="admin-app">
        <AdminLogin onLogin={handleLogin} onError={handleError} />
      </div>
    );
  }

  return (
    <div className="admin-app">
      <AdminLayout 
        user={user} 
        token={token} 
        onLogout={handleLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {renderContent()}
      </AdminLayout>
    </div>
  );
};