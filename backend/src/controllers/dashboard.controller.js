const { obtenerResumen } = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response.utils');

/**
 * GET /api/v1/dashboard/resumen
 * Solo accesible por administradores (RNF-05).
 */
const getResumen = async (req, res, next) => {
  try {
    const resumen = await obtenerResumen();
    return sendSuccess(res, 'Resumen del dashboard obtenido.', resumen);
  } catch (err) {
    next(err);
  }
};

module.exports = { getResumen };
