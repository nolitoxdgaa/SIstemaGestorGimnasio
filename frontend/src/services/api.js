/**
 * api.js — Cliente HTTP base usando fetch con interceptores manuales.
 * Adjunta automáticamente el JWT y maneja errores globales.
 */

const BASE_URL = '/api/v1';

const getToken = () => localStorage.getItem('oc_token');

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
    err.data   = data;
    throw err;
  }
  return data;
};

const api = {
  get: (path, params) => {
    const url = new URL(`${BASE_URL}${path}`, window.location.origin);
    if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
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
