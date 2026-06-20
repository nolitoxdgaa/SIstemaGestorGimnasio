const { sendServerError } = require('../utils/response.utils');

/**
 * Middleware global de manejo de errores.
 * Express lo reconoce como handler de error porque tiene 4 parámetros (err, req, res, next).
 * Debe registrarse en app.js DESPUÉS de todas las rutas.
 *
 * Captura cualquier error no manejado lanzado con next(err) en los controllers.
 */
const errorHandler = (err, req, res, next) => {
  // Log del error en consola (con stack trace en desarrollo)
  console.error('🔴 Error no manejado:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Errores específicos de PostgreSQL
  if (err.code === '23505') {
    // Unique violation
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con esos datos.',
      error: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Referencia a un recurso que no existe.',
      error: 'FOREIGN_KEY_ERROR',
    });
  }

  // Error genérico
  return sendServerError(
    res,
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Error interno del servidor.'
  );
};

module.exports = { errorHandler };
