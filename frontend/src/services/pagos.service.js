import api from './api';
export const pagosService = {
  getAll:  (params) => api.get('/pagos', params),
  create:  (data)   => api.post('/pagos', data),
};
