import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — Proveedor de contexto de autenticación.
 * Envuelve toda la app en App.jsx.
 * Expone: usuario, token, login(), logout(), cargando, estaAutenticado
 */
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('olympus_usuario');
    return saved ? JSON.parse(saved) : null;
  });

  const [cargando, setCargando] = useState(false);

  /**
   * Inicia sesión con email y password.
   * @returns {{ success: boolean, message: string }}
   */
  const login = useCallback(async (email, password) => {
    setCargando(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, usuario: usuarioData } = data.data;

      localStorage.setItem('olympus_token', token);
      localStorage.setItem('olympus_usuario', JSON.stringify(usuarioData));
      setUsuario(usuarioData);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      return { success: false, message };
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Cierra la sesión del usuario actual.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Si falla la llamada, igual cerramos sesión localmente
    } finally {
      localStorage.removeItem('olympus_token');
      localStorage.removeItem('olympus_usuario');
      setUsuario(null);
    }
  }, []);

  const estaAutenticado = !!usuario;

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, estaAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para consumir el contexto de auth en cualquier componente.
 * Uso: const { usuario, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
};
