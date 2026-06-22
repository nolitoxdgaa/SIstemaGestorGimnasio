import api from './api';

export const pagoService = {
  getAll:  (params) => api.get('/pagos', { params }),
  create:  (data)   => api.post('/pagos', data),
  getPlanes: ()     => api.get('/planes'),
};
