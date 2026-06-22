import api from './api';

export const dashboardService = {
  getResumen: () => api.get('/dashboard/resumen'),
};
