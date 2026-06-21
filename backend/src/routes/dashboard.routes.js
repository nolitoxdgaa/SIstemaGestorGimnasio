const express = require('express');
const router = express.Router();
const { getResumen } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/roles.middleware');

router.get('/resumen', authenticate, authorize('administrador'), getResumen);

module.exports = router;
