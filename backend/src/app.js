const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { logger } = require('./middlewares/logger.middleware');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const { registerRoutes } = require('./routes/index');
const config = require('./config/config');

const app = express();

// ─── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet()); // Headers de seguridad HTTP

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.cors.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logger ───────────────────────────────────────────────────────────────────
if (config.server.nodeEnv === 'development') {
  app.use(logger);
}

// ─── Rutas ────────────────────────────────────────────────────────────────────
registerRoutes(app);

// ─── 404 para rutas no encontradas ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    error: 'ROUTE_NOT_FOUND',
  });
});

// ─── Manejador global de errores (SIEMPRE AL FINAL) ──────────────────────────
app.use(errorHandler);

module.exports = app;
