import React, { useState } from 'react';
import './AdminLogin.css';

interface AdminLoginProps {
  onLogin: (token: string, user: any) => void;
  onError: (error: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Usuario y contraseña son requeridos');
      return;
    }

    setIsLoading(true);
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
        const errorMessage = data.error?.message || 'Error de autenticación';
        setError(errorMessage);
        onError(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Error de conexión con el servidor';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>🔐 Admin Dashboard</h1>
          <p>Acceso para administradores del faucet</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="admin-form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Autenticando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>
            <span className="security-icon">🛡️</span>
            Conexión segura con autenticación JWT
          </p>
        </div>
      </div>
    </div>
  );
};