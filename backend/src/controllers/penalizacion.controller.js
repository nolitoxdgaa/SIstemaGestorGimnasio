const Penalizacion = require('../models/Penalizacion');
const Socio        = require('../models/Socio');
const {
  sendSuccess,
  sendNotFound,
  sendBadRequest,
} = require('../utils/response.utils');

const STRIKES_MAXIMOS = 3;

/**
 * GET /api/v1/socios/:id/strikes
 * Devuelve los strikes activos y el historial completo de un socio.
 */
const getStrikesBySocio = async (req, res, next) => {
  try {
    const socioId = req.params.id;

    // Verificar que el socio existe
    const socio = await Socio.findById(socioId);
    if (!socio) return sendNotFound(res, 'Socio no encontrado.');

    // Strikes activos (últimos 30 días, no justificados)
    const strikesActivos = await Penalizacion.contarStrikesActivos(socioId);

    // Bloqueo vigente, si existe
    const bloqueoVigente = await Penalizacion.tieneBloqueActivo(socioId);

    // Historial completo de penalizaciones
    const historialRaw = await Penalizacion.findBySocioId(socioId);

    const historial = historialRaw.map((p) => ({
      id: p.id,
      claseId: p.clase_id ?? null,
      claseNombre: p.clase_nombre ?? null,
      fecha: p.fecha_hora ?? null,
      justificada: p.justificada,
      justificacion: p.justificacion ?? null,
      tipo: 'inasistencia',
      creadoEn: p.creado_en,
    }));

    return sendSuccess(res, 'Strikes del socio obtenidos.', {
      socioId: parseInt(socioId),
      strikesActivos,
      strikesMaximos: STRIKES_MAXIMOS,
      bloqueado: !!bloqueoVigente,
      bloqueadoHasta: bloqueoVigente ? bloqueoVigente.bloqueado_hasta : null,
      historial,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/socios/:id/strikes/:strikeId
 * Justifica (remueve) un strike con una razón documentada.
 * Solo administradores.
 */
const justificarStrike = async (req, res, next) => {
  try {
    const { strikeId } = req.params;
    const { justificacion } = req.body;

    if (!justificacion || String(justificacion).trim() === '') {
      return sendBadRequest(res, "El campo 'justificacion' es obligatorio para remover un strike.");
    }

    const penalizacion = await Penalizacion.justificar(
      parseInt(strikeId),
      String(justificacion).trim()
    );

    if (!penalizacion) {
      return sendNotFound(res, 'Strike no encontrado.');
    }

    return sendSuccess(res, 'Strike removido con justificación registrada.', null);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStrikesBySocio, justificarStrike };
