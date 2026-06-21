const ClaseGrupal = require('../models/ClaseGrupal');
const {
  sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendError,
} = require('../utils/response.utils');

const TIPOS_VALIDOS = ['spinning', 'crossfit'];

/**
 * GET /api/v1/clases
 */
const getClases = async (req, res, next) => {
  try {
    const { tipo, fecha, disponibles } = req.query;
    if (tipo && !TIPOS_VALIDOS.includes(tipo))
      return sendBadRequest(res, `Tipo inválido. Válidos: ${TIPOS_VALIDOS.join(', ')}.`);
    const clases = await ClaseGrupal.findAll({ tipo, fecha, disponibles });
    return sendSuccess(res, 'Clases obtenidas.', { clases });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/clases/:id
 */
const getClaseById = async (req, res, next) => {
  try {
    const clase = await ClaseGrupal.findById(req.params.id);
    if (!clase) return sendNotFound(res, 'Clase no encontrada.');
    return sendSuccess(res, 'Clase encontrada.', clase);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/clases
 * Solo administradores/entrenadores.
 */
const createClase = async (req, res, next) => {
  try {
    const { tipo, nombre, descripcion, instructor, fechaHora, duracionMinutos, aforoMaximo } = req.body;

    if (!TIPOS_VALIDOS.includes(tipo))
      return sendBadRequest(res, `Tipo inválido. Válidos: ${TIPOS_VALIDOS.join(', ')}.`);

    // Validar que la fecha es futura
    if (new Date(fechaHora) <= new Date())
      return sendBadRequest(res, 'La fecha y hora de la clase debe ser futura.');

    if (!Number.isInteger(Number(aforoMaximo)) || Number(aforoMaximo) <= 0)
      return sendBadRequest(res, 'El aforo máximo debe ser un número entero positivo.');

    const clase = await ClaseGrupal.create({
      tipo, nombre, descripcion, instructor, fechaHora,
      duracionMinutos: duracionMinutos || 60,
      aforoMaximo: parseInt(aforoMaximo),
    });
    return sendCreated(res, 'Clase creada exitosamente.', clase);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/clases/:id
 */
const updateClase = async (req, res, next) => {
  try {
    const clase = await ClaseGrupal.findById(req.params.id);
    if (!clase) return sendNotFound(res, 'Clase no encontrada.');
    if (clase.estado === 'cancelada')
      return sendError(res, 'No se puede modificar una clase cancelada.', 'CLASE_CANCELADA', 409);

    const { nombre, descripcion, instructor, fecha_hora, duracion_minutos, aforo_maximo } = req.body;
    const campos = {};
    if (nombre)           campos.nombre = nombre;
    if (descripcion)      campos.descripcion = descripcion;
    if (instructor)       campos.instructor = instructor;
    if (fecha_hora)       campos.fecha_hora = fecha_hora;
    if (duracion_minutos) campos.duracion_minutos = duracion_minutos;
    if (aforo_maximo)     campos.aforo_maximo = aforo_maximo;

    if (Object.keys(campos).length === 0)
      return sendBadRequest(res, 'No se proporcionaron campos para actualizar.');

    const updated = await ClaseGrupal.update(req.params.id, campos);
    return sendSuccess(res, 'Clase actualizada.', updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/clases/:id  (cancela la clase y sus reservas)
 */
const cancelClase = async (req, res, next) => {
  try {
    const clase = await ClaseGrupal.findById(req.params.id);
    if (!clase) return sendNotFound(res, 'Clase no encontrada.');
    if (clase.estado === 'cancelada')
      return sendError(res, 'La clase ya está cancelada.', 'CLASE_YA_CANCELADA', 409);
    await ClaseGrupal.cancel(req.params.id);
    return sendSuccess(res, 'Clase cancelada y reservas anuladas.', null);
  } catch (err) {
    next(err);
  }
};

module.exports = { getClases, getClaseById, createClase, updateClase, cancelClase };
