import api from './api';
export const sociosService = {
  getAll:   (params)    => api.get('/socios', params),
  getById:  (id)        => api.get(`/socios/${id}`),
  create:   (data)      => api.post('/socios', data),
  update:   (id, data)  => api.put(`/socios/${id}`, data),
  remove:   (id)        => api.delete(`/socios/${id}`),
  getQR:    (id)        => api.get(`/socios/${id}/qr`),
  getMembresia: (id)    => api.get(`/socios/${id}/membresia`),
  getPagos: (id)        => api.get(`/socios/${id}/pagos`),
  getReservas: (id)     => api.get(`/socios/${id}/reservas`),
  getStrikes: (id)      => api.get(`/socios/${id}/strikes`),
  justificarStrike: (socioId, strikeId, justificacion) =>
    api.delete(`/socios/${socioId}/strikes/${strikeId}`, { justificacion }),
};
