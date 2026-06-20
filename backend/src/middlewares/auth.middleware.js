const { verifyToken } = require('../utils/jwt.utils');
const { sendUnauthorized } = require('../utils/response.utils');

/**
 * Middleware de autenticación.
 * Verifica que el request tenga un JWT válido en el header Authorization.
 * Si el token es válido, agrega req.usuario con el payload decodificado.
 *
 * Uso: router.get('/ruta', authenticate, controller)
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendUnauthorized(res, 'Token de autenticación no proporcionado.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.usuario = payload; // { id, rol, nombre }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'El token ha expirado. Inicia sesión nuevamente.');
    }
    return sendUnauthorized(res, 'Token inválido.');
  }
};

module.exports = { authenticate };
