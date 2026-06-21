const { sendBadRequest } = require('../utils/response.utils');

/**
 * Middleware de validación de campos del body.
 * Verifica que los campos requeridos existan y no estén vacíos.
 *
 * Uso en routes:
 *   router.post('/', validate(['campo1', 'campo2']), controller)
 *
 * @param {string[]} camposRequeridos - Lista de campos obligatorios.
 */
const validate = (camposRequeridos) => {
  return (req, res, next) => {
    const errores = [];
    camposRequeridos.forEach((campo) => {
      const valor = req.body[campo];
      if (valor === undefined || valor === null || String(valor).trim() === '') {
        errores.push(`El campo '${campo}' es obligatorio.`);
      }
    });
    if (errores.length > 0) {
      return sendBadRequest(res, 'Datos incompletos o inválidos.', errores);
    }
    next();
  };
};

/**
 * Valida que el parámetro :id de la ruta sea un entero positivo.
 */
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return sendBadRequest(res, 'El ID proporcionado no es válido.');
  }
  next();
};

module.exports = { validate, validateId };
