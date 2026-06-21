const Membresia = require('../models/Membresia');
const { sendSuccess, sendNotFound } = require('../utils/response.utils');

/**
 * GET /api/v1/membresias
 */
const getMembresias = async (req, res, next) => {
  try {
    const { socioId, estado, venceEn } = req.query;
    const membresias = await Membresia.findAll({ socioId, estado, venceEn });
    return sendSuccess(res, 'Membresías obtenidas.', { membresias });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/membresias/socio/:socioId  (membresía activa de un socio)
 */
const getMembresiaBySocio = async (req, res, next) => {
  try {
    const membresia = await Membresia.findActivaBySocioId(req.params.socioId);
    if (!membresia) return sendNotFound(res, 'El socio no tiene membresía activa.');
    return sendSuccess(res, 'Membresía activa encontrada.', membresia);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMembresias, getMembresiaBySocio };
