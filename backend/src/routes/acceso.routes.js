const express = require('express');
const router = express.Router();
const { validarQR, getLogs } = require('../controllers/acceso.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roles.middleware');

router.post('/validar', authenticate, authorize('administrador','recepcionista'), validarQR);
router.get('/logs',     authenticate, authorize('administrador','recepcionista'), getLogs);

module.exports = router;
