const express = require('express');
const router = express.Router();
const { login, logout, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// POST /api/v1/auth/login — público
router.post('/login', login);

// POST /api/v1/auth/logout — autenticado
router.post('/logout', authenticate, logout);

// GET /api/v1/auth/me — autenticado (útil para refrescar datos del usuario)
router.get('/me', authenticate, me);

module.exports = router;
