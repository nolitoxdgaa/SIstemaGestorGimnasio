// Importación de rutas de cada módulo
// Los integrantes agregan su require aquí cuando su módulo esté listo
const authRoutes            = require('./auth.routes');
const sociosRoutes          = require('./socios.routes');
const planesRoutes          = require('./planes.routes');
const membresiasRoutes      = require('./membresias.routes');
const pagosRoutes           = require('./pagos.routes');
const accesoRoutes          = require('./acceso.routes');
const clasesRoutes          = require('./clases.routes');
const reservasRoutes        = require('./reservas.routes');
const dashboardRoutes       = require('./dashboard.routes');

/**
 * Registra todas las rutas de la aplicación en el router principal.
 * @param {Express} app - La instancia de la aplicación Express.
 */
const registerRoutes = (app) => {
  app.use('/api/v1/auth',        authRoutes);
  app.use('/api/v1/socios',      sociosRoutes);      // incluye /:id/strikes y /:id/reservas
  app.use('/api/v1/planes',      planesRoutes);
  app.use('/api/v1/membresias',  membresiasRoutes);
  app.use('/api/v1/pagos',       pagosRoutes);
  app.use('/api/v1/acceso',      accesoRoutes);
  app.use('/api/v1/clases',      clasesRoutes);
  app.use('/api/v1/reservas',    reservasRoutes);
  app.use('/api/v1/dashboard',   dashboardRoutes);

  // Ruta de health check (útil para verificar que el servidor corre)
  app.get('/api/v1/health', (req, res) => {
    res.json({ success: true, message: 'OLYMPUS CORE API corriendo ✅', timestamp: new Date() });
  });
};

module.exports = { registerRoutes };

