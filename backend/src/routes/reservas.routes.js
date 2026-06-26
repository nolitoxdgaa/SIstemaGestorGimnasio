const express = require('express');
const router = express.Router();
const {
  getReservas,
  getReservasBySocio,
  createReserva,
  cancelReserva,
  registrarAsistencia,
} = require('../controllers/reserva.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize, authorizeSelfOrRoles } = require('../middlewares/roles.middleware');
const { validate } = require('../middlewares/validate.middleware');

// GET /api/v1/reservas — admin y recepcionista ven todas las reservas
router.get(
  '/',
  authenticate,
  authorize('administrador', 'recepcionista', 'socio'),
  getReservas
);

// POST /api/v1/reservas — socio reserva, o recepcionista a nombre de un socio
router.post(
  '/',
  authenticate,
  authorize('socio', 'recepcionista', 'administrador'),
  validate(['socioId', 'claseId']),
  createReserva
);

// DELETE /api/v1/reservas/:id/cancelar — cancela una reserva (RN-03: solo hasta 2h antes)
router.delete(
  '/:id/cancelar',
  authenticate,
  authorize('socio', 'recepcionista', 'administrador'),
  cancelReserva
);

// PATCH /api/v1/reservas/:id/asistencia — registra asistencia/inasistencia (dispara strikes si faltó)
router.patch(
  '/:id/asistencia',
  authenticate,
  authorize('administrador', 'recepcionista', 'entrenador'),
  registrarAsistencia
);

module.exports = router;
