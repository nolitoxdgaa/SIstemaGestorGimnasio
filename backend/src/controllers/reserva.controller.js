const { getClient } = require('../config/database');
const ClaseGrupal  = require('../models/ClaseGrupal');
const Reserva      = require('../models/Reserva');
const Socio        = require('../models/Socio');
const { verificarMembresia }   = require('../services/membresia.service');
const { puedeReservar, procesarInasistencia } = require('../services/penalizacion.service');
const { fueraDePlazo } = require('../utils/fecha.utils');
const {
  sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendError,
} = require('../utils/response.utils');

/**
 * GET /api/v1/reservas
 */
const getReservas = async (req, res, next) => {
  try {
    const { socioId, claseId, estado, fecha } = req.query;
    const reservas = await Reserva.findAll({ socioId, claseId, estado, fecha });
    return sendSuccess(res, 'Reservas obtenidas.', { reservas });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/socios/:id/reservas
 */
const getReservasBySocio = async (req, res, next) => {
  try {
    const reservas = await Reserva.findBySocioId(req.params.id);
    return sendSuccess(res, 'Reservas del socio.', { reservas });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/reservas
 * Flujo completo con transacción ACID:
 *   1. Verifica membresía activa (RN-01)
 *   2. Verifica que no tenga penalización activa (RN-04)
 *   3. Verifica horario duplicado (RN-07)  ─┐ dentro de
 *   4. Verifica aforo con FOR UPDATE (RN-02) ─┘ transacción
 *   5. Crea la reserva
 */
const createReserva = async (req, res, next) => {
  const client = await getClient();
  try {
    const { socioId, claseId } = req.body;

    // Socio existe?
    const socio = await Socio.findById(socioId);
    if (!socio) return sendNotFound(res, 'Socio no encontrado.');

    // RN-01: Membresía activa
    const { activa, membresia } = await verificarMembresia(socioId);
    if (!activa) {
      return sendError(
        res,
        'El socio no tiene membresía activa. Debe renovarla para reservar clases.',
        'MEMBRESIA_VENCIDA', 403
      );
    }

    // RN-04: Sin penalización activa
    const { puede, bloqueo } = await puedeReservar(socioId);
    if (!puede) {
      const hasta = new Date(bloqueo.hasta).toLocaleDateString('es-PE');
      return sendError(
        res,
        `El socio está bloqueado hasta el ${hasta} por acumular 3 inasistencias.`,
        'SOCIO_BLOQUEADO', 403
      );
    }

    // Clase existe?
    const clase = await ClaseGrupal.findById(claseId);
    if (!clase) return sendNotFound(res, 'Clase no encontrada.');
    if (clase.estado === 'cancelada')
      return sendError(res, 'No se puede reservar una clase cancelada.', 'CLASE_CANCELADA', 409);
    if (new Date(clase.fecha_hora) <= new Date())
      return sendError(res, 'No se puede reservar una clase que ya pasó.', 'CLASE_PASADA', 409);

    // Transacción ACID para las validaciones concurrentes
    await client.query('BEGIN');

    // RN-07: No dos clases en el mismo horario
    const horarioDuplicado = await Reserva.tieneHorarioDuplicado(socioId, claseId, client);
    if (horarioDuplicado) {
      await client.query('ROLLBACK');
      return sendError(
        res,
        'El socio ya tiene una reserva en ese horario.',
        'HORARIO_DUPLICADO', 409
      );
    }

    // RN-02: Aforo con bloqueo FOR UPDATE (previene race conditions)
    const { disponible, aforoMaximo, ocupados } = await ClaseGrupal.verificarAforo(claseId, client);
    if (!disponible) {
      await client.query('ROLLBACK');
      return sendError(
        res,
        `Clase sin cupos disponibles (${ocupados}/${aforoMaximo}).`,
        'AFORO_COMPLETO', 409
      );
    }

    const reserva = await Reserva.create(socioId, claseId, client);
    await client.query('COMMIT');

    return sendCreated(res, 'Reserva creada exitosamente.', {
      reserva,
      clase: { nombre: clase.nombre, fechaHora: clase.fecha_hora },
      cuposRestantes: aforoMaximo - ocupados - 1,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return sendError(res, 'El socio ya tiene una reserva para esta clase.', 'RESERVA_DUPLICADA', 409);
    }
    next(err);
  } finally {
    client.release();
  }
};

/**
 * DELETE /api/v1/reservas/:id
 * Cancela una reserva (RN-03: solo hasta 2h antes).
 */
const cancelReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) return sendNotFound(res, 'Reserva no encontrada.');
    if (reserva.estado !== 'confirmada')
      return sendError(res, 'Solo se pueden cancelar reservas confirmadas.', 'RESERVA_NO_ACTIVA', 409);

    // RN-03: Solo cancelable hasta 2h antes
    if (fueraDePlazo(reserva.fecha_hora, 2)) {
      return sendError(
        res,
        'No se puede cancelar la reserva con menos de 2 horas de anticipación.',
        'FUERA_DE_PLAZO', 403
      );
    }

    const cancelada = await Reserva.cancel(req.params.id);
    return sendSuccess(res, 'Reserva cancelada exitosamente.', cancelada);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/reservas/:id/asistencia
 * El entrenador/admin registra la asistencia o inasistencia de una reserva.
 * Si es inasistencia, dispara el sistema de strikes (RN-04).
 */
const registrarAsistencia = async (req, res, next) => {
  try {
    const { asistio } = req.body;
    if (typeof asistio !== 'boolean')
      return sendBadRequest(res, "El campo 'asistio' debe ser true o false.");

    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) return sendNotFound(res, 'Reserva no encontrada.');
    if (reserva.estado !== 'confirmada')
      return sendError(res, 'Solo se puede registrar asistencia en reservas confirmadas.', 'RESERVA_NO_ACTIVA', 409);

    if (asistio) {
      const updated = await Reserva.marcarAsistencia(req.params.id);
      return sendSuccess(res, 'Asistencia registrada.', updated);
    } else {
      // Inasistencia: marcar + procesar strike
      await Reserva.marcarInasistencia(req.params.id);
      const resultado = await procesarInasistencia(reserva.socio_id, reserva.id);
      return sendSuccess(res, 'Inasistencia registrada.', {
        mensaje: resultado.bloqueado
          ? `El socio acumuló 3 strikes y ha sido bloqueado por 7 días.`
          : `Strike registrado (${resultado.strikesActivos}/3).`,
        ...resultado,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getReservas, getReservasBySocio, createReserva, cancelReserva, registrarAsistencia };
