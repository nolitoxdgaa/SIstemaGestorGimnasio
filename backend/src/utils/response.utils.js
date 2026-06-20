/**
 * response.utils.js
 * Funciones helper para estandarizar TODAS las respuestas de la API.
 * TODOS los controllers del proyecto deben usar estas funciones.
 * Formato acordado en API_CONTRACT.md
 */

/**
 * Respuesta de éxito.
 * @param {Object} res - Objeto response de Express.
 * @param {string} message - Mensaje legible del resultado.
 * @param {*} data - Datos a devolver (objeto, array o null).
 * @param {number} statusCode - Código HTTP (default: 200).
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Respuesta de creación exitosa (201 Created).
 * @param {Object} res - Objeto response de Express.
 * @param {string} message - Mensaje legible del resultado.
 * @param {*} data - Datos del recurso creado.
 */
const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Respuesta de error.
 * @param {Object} res - Objeto response de Express.
 * @param {string} message - Mensaje legible del error.
 * @param {string} errorCode - Código interno del error (ej. 'MEMBRESIA_VENCIDA').
 * @param {number} statusCode - Código HTTP (default: 400).
 * @param {string[]} details - Array de detalles adicionales (validaciones).
 */
const sendError = (res, message, errorCode = 'ERROR', statusCode = 400, details = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    details,
  });
};

/**
 * Error 400 - Bad Request / Validación fallida.
 */
const sendBadRequest = (res, message, details = []) => {
  return sendError(res, message, 'VALIDATION_ERROR', 400, details);
};

/**
 * Error 401 - No autenticado.
 */
const sendUnauthorized = (res, message = 'No autenticado. Token requerido.') => {
  return sendError(res, message, 'UNAUTHORIZED', 401);
};

/**
 * Error 403 - Sin permiso (autenticado pero sin el rol necesario).
 */
const sendForbidden = (res, message = 'No tienes permisos para realizar esta acción.') => {
  return sendError(res, message, 'FORBIDDEN', 403);
};

/**
 * Error 404 - Recurso no encontrado.
 */
const sendNotFound = (res, message = 'Recurso no encontrado.') => {
  return sendError(res, message, 'NOT_FOUND', 404);
};

/**
 * Error 409 - Conflicto de datos.
 */
const sendConflict = (res, message, errorCode = 'CONFLICT') => {
  return sendError(res, message, errorCode, 409);
};

/**
 * Error 500 - Error interno del servidor.
 */
const sendServerError = (res, message = 'Error interno del servidor.') => {
  return sendError(res, message, 'INTERNAL_ERROR', 500);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendServerError,
};
