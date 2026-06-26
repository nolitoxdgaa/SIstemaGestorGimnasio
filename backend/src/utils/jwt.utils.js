const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Genera un JWT firmado con el payload dado.
 * @param {Object} payload - Datos a incluir en el token.
 * @returns {string} Token JWT.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verifica y decodifica un JWT.
 * @param {string} token - El token a verificar.
 * @returns {Object} El payload decodificado.
 * @throws {JsonWebTokenError | TokenExpiredError} Si el token es inválido o expiró.
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Genera el payload estándar para el token de un usuario.
 * @param {Object} usuario - Objeto usuario de la BD.
 * @returns {Object} Payload listo para firmar.
 */
const buildTokenPayload = (usuario, socioId = null) => ({
  id: socioId || usuario.id,
  usuarioId: usuario.id,
  rol: usuario.rol,
  nombre: usuario.nombre,
});

module.exports = { generateToken, verifyToken, buildTokenPayload };
