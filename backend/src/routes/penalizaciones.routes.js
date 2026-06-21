const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getStrikesBySocio,
  justificarStrike,
} = require('../controllers/penalizacion.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize, authorizeSelfOrRoles } = require('../middlewares/roles.middleware');

// Las rutas de penalizaciones viven bajo /socios/:id/strikes
// Este router se monta en socios.routes.js con mergeParams: true

// GET /api/v1/socios/:id/strikes — el socio ve los suyos, admin/recepcionista/entrenador ven cualquiera
router.get(
  '/',
  authenticate,
  authorizeSelfOrRoles('id', 'administrador', 'recepcionista', 'entrenador'),
  getStrikesBySocio
);

// DELETE /api/v1/socios/:id/strikes/:strikeId — solo admin puede justificar un strike
router.delete(
  '/:strikeId',
  authenticate,
  authorize('administrador'),
  justificarStrike
);

module.exports = router;
