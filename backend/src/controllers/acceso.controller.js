const { validarAcceso } = require('../services/acceso.service');
const LogAcceso = require('../models/LogAcceso');
const { sendSuccess, sendBadRequest } = require('../utils/response.utils');

/**
 * POST /api/v1/acceso/validar
 * Valida el QR de un socio y registra el intento.
 */
const validarQR = async (req, res, next) => {
  try {
    const { tokenQR } = req.body;
    if (!tokenQR) return sendBadRequest(res, 'El tokenQR es requerido.');

    const validacion = await validarAcceso(tokenQR);

    // Registrar en log si tenemos un socio identificado
    if (validacion.socio?.id) {
      await LogAcceso.create({
        socioId: validacion.socio.id,
        resultado: validacion.resultado,
        motivo: validacion.motivo,
      });
    }

    return sendSuccess(res, validacion.resultado === 'PERMITIDO' ? 'Acceso permitido.' : 'Acceso denegado.', {
      resultado: validacion.resultado,
      socio: validacion.socio,
      membresia: validacion.membresia || null,
      penalizacion: validacion.penalizacion || null,
      motivo: validacion.motivo,
      registradoEn: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/acceso/logs
 */
const getLogs = async (req, res, next) => {
  try {
    const { socioId, fecha, resultado, pagina = 1, limite = 50 } = req.query;
    const { logs, total } = await LogAcceso.findAll({
      socioId, fecha, resultado,
      pagina: parseInt(pagina), limite: parseInt(limite),
    });
    return sendSuccess(res, 'Logs de acceso obtenidos.', { logs, total, pagina: parseInt(pagina) });
  } catch (err) {
    next(err);
  }
};

module.exports = { validarQR, getLogs };
