const express = require('express');
const router = express.Router();
const { getSocios, getSocioById, createSocio, updateSocio, deleteSocio, getSocioQR } = require('../controllers/socio.controller');
const { getPagosBySocio } = require('../controllers/pago.controller');
const { getMembresiaBySocio } = require('../controllers/membresia.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize, authorizeSelfOrRoles } = require('../middlewares/roles.middleware');

router.get('/',     authenticate, authorize('administrador','recepcionista'), getSocios);
router.post('/',    authenticate, authorize('administrador','recepcionista'), createSocio);
router.get('/:id',  authenticate, authorize('administrador','recepcionista','entrenador'), getSocioById);
router.put('/:id',  authenticate, authorize('administrador','recepcionista'), updateSocio);
router.delete('/:id', authenticate, authorize('administrador'), deleteSocio);
router.get('/:id/qr', authenticate, authorizeSelfOrRoles('id','administrador','recepcionista'), getSocioQR);
router.get('/:id/pagos', authenticate, authorizeSelfOrRoles('id','administrador','recepcionista'), getPagosBySocio);
router.get('/:id/membresia', authenticate, authorizeSelfOrRoles('id','administrador','recepcionista'), getMembresiaBySocio);

module.exports = router;
