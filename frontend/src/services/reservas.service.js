import api from './api';
export const reservasService = {
  getAll:           (params)         => api.get('/reservas', params),
  create:           (data)           => api.post('/reservas', data),
  cancel:           (id)             => api.delete(`/reservas/${id}/cancelar`),
  registrarAsistencia: (id, asistio) => api.patch(`/reservas/${id}/asistencia`, { asistio }),
};
