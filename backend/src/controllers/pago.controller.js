const { getClient } = require('../config/database');
const Plan = require('../models/Plan');
const Pago = require('../models/Pago');
const Membresia = require('../models/Membresia');
const Socio = require('../models/Socio');
const { sendSuccess, sendCreated, sendNotFound, sendBadRequest } = require('../utils/response.utils');
const { validarCamposRequeridos } = require('../utils/validators.utils');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/v1/pagos
 */
const getPagos = async (req, res, next) => {
  try {
    const { socioId, fechaDesde, fechaHasta, metodoPago } = req.query;
    const pagos = await Pago.findAll({ socioId, fechaDesde, fechaHasta, metodoPago });
    const totalMonto = pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
    return sendSuccess(res, 'Pagos obtenidos.', { pagos, totalMonto: parseFloat(totalMonto.toFixed(2)) });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/socios/:id/pagos
 */
const getPagosBySocio = async (req, res, next) => {
  try {
    const pagos = await Pago.findBySocioId(req.params.id);
    return sendSuccess(res, 'Historial de pagos del socio.', { pagos });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/pagos
 * Registra el pago Y activa la membresía en una sola transacción ACID.
 * Implementa la regla: pago → membresía activa (RNF-14: integridad de datos).
 */
const createPago = async (req, res, next) => {
  const client = await getClient();
  try {
    const { socioId, planId, metodoPago } = req.body;

    const errores = validarCamposRequeridos(req.body, ['socioId', 'planId', 'metodoPago']);
    if (errores.length > 0) return sendBadRequest(res, 'Datos inválidos.', errores);

    const metodosValidos = ['efectivo', 'yape', 'plin', 'tarjeta'];
    if (!metodosValidos.includes(metodoPago))
      return sendBadRequest(res, `Método de pago inválido. Válidos: ${metodosValidos.join(', ')}.`);

    // Verificar socio y plan
    const [socio, plan] = await Promise.all([
      Socio.findById(socioId),
      Plan.findById(planId),
    ]);
    if (!socio) return sendNotFound(res, 'Socio no encontrado.');
    if (!plan)  return sendNotFound(res, 'Plan no encontrado.');

    // Transacción ACID: pago + activación de membresía
    await client.query('BEGIN');

    const comprobante = `REC-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    const pago = await Pago.create(
      { socioId, planId, monto: plan.precio, metodoPago, registradoPorId: req.usuario.id, comprobante },
      client
    );
    const membresia = await Membresia.create(
      { socioId, planId, duracionDias: plan.duracion_dias, precio: plan.precio },
      client
    );

    await client.query('COMMIT');

    return sendCreated(res, 'Pago registrado y membresía activada.', { pago, membresia });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { getPagos, getPagosBySocio, createPago };
