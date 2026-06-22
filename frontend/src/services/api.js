/**
 * api.js — Cliente HTTP base usando fetch con interceptores manuales.
 * Adjunta automáticamente el JWT y maneja errores globales.
 */

const BASE_URL = '/api/v1';

// ⚠️ Clave sincronizada con AuthContext.jsx
const getToken = () => localStorage.getItem('olympus_token');

const buildHeaders = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.response = { data, status: res.status }; // compatibilidad con .response?.data?.message
    throw err;
  }
  return { data };  // envolvemos en { data } para ser compatibles con los servicios
};

const api = {
  get: (path, options = {}) => {
    const url = new URL(`${BASE_URL}${path}`, window.location.origin);
    const params = options?.params ?? {};
    Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
    return fetch(url.toString(), { headers: buildHeaders() }).then(handleResponse);
  },
  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
  put: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
  patch: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
  delete: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    }).then(handleResponse),
};

export default api;
