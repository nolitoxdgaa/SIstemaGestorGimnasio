import api from './api';
export const clasesService = {
  getAll:   (params)   => api.get('/clases', params),
  getById:  (id)       => api.get(`/clases/${id}`),
  create:   (data)     => api.post('/clases', data),
  update:   (id, data) => api.put(`/clases/${id}`, data),
  cancel:   (id)       => api.delete(`/clases/${id}`),
};
