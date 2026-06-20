/**
 * validators.utils.js
 * Funciones de validación reutilizables para controllers y middlewares.
 */

/**
 * Verifica que un DNI peruano sea válido (8 dígitos numéricos).
 * @param {string} dni
 * @returns {boolean}
 */
const esDNIValido = (dni) => /^\d{8}$/.test(String(dni).trim());

/**
 * Verifica que un email tenga formato válido.
 * @param {string} email
 * @returns {boolean}
 */
const esEmailValido = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());

/**
 * Verifica que un número de teléfono peruano sea válido (9 dígitos, empieza con 9).
 * @param {string} telefono
 * @returns {boolean}
 */
const esTelefonoValido = (telefono) => /^9\d{8}$/.test(String(telefono).trim());

/**
 * Verifica que una contraseña cumpla los requisitos mínimos.
 * Mínimo 8 caracteres, al menos una letra y un número.
 * @param {string} password
 * @returns {boolean}
 */
const esPasswordValido = (password) =>
  /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(String(password));

/**
 * Verifica que un campo requerido no esté vacío.
 * @param {*} valor
 * @returns {boolean}
 */
const noEsVacio = (valor) => valor !== null && valor !== undefined && String(valor).trim() !== '';

/**
 * Valida un conjunto de campos requeridos en un objeto.
 * @param {Object} body - El cuerpo del request.
 * @param {string[]} campos - Lista de nombres de campos obligatorios.
 * @returns {string[]} Array de mensajes de error. Vacío si todo está bien.
 */
const validarCamposRequeridos = (body, campos) => {
  const errores = [];
  campos.forEach((campo) => {
    if (!noEsVacio(body[campo])) {
      errores.push(`El campo '${campo}' es obligatorio`);
    }
  });
  return errores;
};

/**
 * Verifica que un ID sea un entero positivo válido.
 * @param {*} id
 * @returns {boolean}
 */
const esIdValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

module.exports = {
  esDNIValido,
  esEmailValido,
  esTelefonoValido,
  esPasswordValido,
  noEsVacio,
  validarCamposRequeridos,
  esIdValido,
};
