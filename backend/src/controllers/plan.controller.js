const Plan = require('../models/Plan');
const { sendSuccess, sendNotFound } = require('../utils/response.utils');

/**
 * GET /api/v1/planes
 * Devuelve todos los planes activos del catálogo.
 */
const getPlanes = async (req, res, next) => {
  try {
    const planes = await Plan.findAll();
    return sendSuccess(res, 'Planes obtenidos.', { planes });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/planes/:id
 */
const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return sendNotFound(res, 'Plan no encontrado.');
    return sendSuccess(res, 'Plan encontrado.', plan);
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlanes, getPlanById };
