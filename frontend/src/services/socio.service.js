import api from './api';

export const socioService = {
  getAll: (params) => api.get('/socios', { params }),
  getById: (id)    => api.get(`/socios/${id}`),
  create:  (data)  => api.post('/socios', data),
  update:  (id, data) => api.put(`/socios/${id}`, data),
  delete:  (id)    => api.delete(`/socios/${id}`),
  getQR:   (id)    => api.get(`/socios/${id}/qr`),
  getMembresia: (id) => api.get(`/socios/${id}/membresia`),
  getPagos:     (id) => api.get(`/socios/${id}/pagos`),
};
