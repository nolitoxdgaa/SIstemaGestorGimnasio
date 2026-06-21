const express = require('express');
const router = express.Router();
const { getMembresias } = require('../controllers/membresia.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roles.middleware');

router.get('/', authenticate, authorize('administrador','recepcionista'), getMembresias);

module.exports = router;
