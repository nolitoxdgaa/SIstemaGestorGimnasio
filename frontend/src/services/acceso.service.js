import api from './api';

export const accesoService = {
  validarQR: (tokenQR)  => api.post('/acceso/validar', { tokenQR }),
  getLogs:   (params)   => api.get('/acceso/logs', { params }),
};
