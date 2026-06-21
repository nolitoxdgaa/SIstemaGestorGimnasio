import api from './api';
export const planesService = {
  getAll: () => api.get('/planes'),
};
