const express = require('express');
const router = express.Router();
const {
  getClases,
  getClaseById,
  createClase,
  updateClase,
  cancelClase,
} = require('../controllers/clase.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roles.middleware');
const { validate } = require('../middlewares/validate.middleware');

// GET /api/v1/clases — todos los autenticados (socios ven el calendario)
router.get(
  '/',
  authenticate,
  getClases
);

// GET /api/v1/clases/:id — todos los autenticados
router.get(
  '/:id',
  authenticate,
  getClaseById
);

// POST /api/v1/clases — solo administrador
router.post(
  '/',
  authenticate,
  authorize('administrador'),
  validate(['tipo', 'nombre', 'fechaHora', 'aforoMaximo']),
  createClase
);

// PUT /api/v1/clases/:id — solo administrador
router.put(
  '/:id',
  authenticate,
  authorize('administrador'),
  updateClase
);

// DELETE /api/v1/clases/:id — cancela la clase y sus reservas
router.delete(
  '/:id',
  authenticate,
  authorize('administrador'),
  cancelClase
);

module.exports = router;
