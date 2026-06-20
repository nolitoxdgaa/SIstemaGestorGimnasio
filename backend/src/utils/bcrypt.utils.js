const bcrypt = require('bcryptjs');
const config = require('../config/config');

/**
 * Hashea una contraseña en texto plano.
 * @param {string} plainPassword - Contraseña sin hashear.
 * @returns {Promise<string>} Hash de la contraseña.
 */
const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, config.security.bcryptRounds);
};

/**
 * Compara una contraseña en texto plano con un hash.
 * @param {string} plainPassword - Contraseña a verificar.
 * @param {string} hashedPassword - Hash almacenado en BD.
 * @returns {Promise<boolean>} true si coinciden, false si no.
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
