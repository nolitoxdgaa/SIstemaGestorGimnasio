const express = require('express');
const router = express.Router();
const { getPagos, createPago } = require('../controllers/pago.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roles.middleware');

router.get('/',  authenticate, authorize('administrador'), getPagos);
router.post('/', authenticate, authorize('administrador','recepcionista'), createPago);

module.exports = router;
