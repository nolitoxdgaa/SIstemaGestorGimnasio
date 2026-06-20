import axios from 'axios';

/**
 * api.js — Instancia base de Axios para todo el frontend.
 * TODOS los services del proyecto importan este objeto.
 * 
 * Maneja automáticamente:
 * - Base URL desde variables de entorno
 * - Inyección del token JWT en cada request
 * - Redirección al login si el token expira (401)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos máximo por request
});

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
// Agrega el token JWT a cada solicitud si existe en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('olympus_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
// Si el servidor devuelve 401, limpia la sesión y redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('olympus_token');
      localStorage.removeItem('olympus_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
