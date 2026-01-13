import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
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
      <AdminLayout user={user} token={token} onLogout={handleLogout}>
        <AdminDashboard token={token} />
      </AdminLayout>
    </div>
  );
};