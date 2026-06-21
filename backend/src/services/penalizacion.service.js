const Penalizacion = require('../models/Penalizacion');

const STRIKES_PARA_BLOQUEO = 3;

/**
 * Procesa la inasistencia de un socio a una clase reservada.
 * Registra el strike y, si acumula 3 en 30 días, aplica el bloqueo de 7 días (RN-04).
 *
 * @param {number} socioId
 * @param {number} reservaId
 * @returns {{ strike: Object, bloqueado: boolean, bloqueo: Object | null }}
 */
const procesarInasistencia = async (socioId, reservaId) => {
  // 1. Registrar el strike
  const strike = await Penalizacion.create({ socioId, reservaId });

  // 2. Contar strikes activos en los últimos 30 días
  const totalStrikes = await Penalizacion.contarStrikesActivos(socioId);

  let bloqueo = null;

  // 3. Si alcanzó el límite, crear bloqueo de 7 días
  if (totalStrikes >= STRIKES_PARA_BLOQUEO) {
    bloqueo = await Penalizacion.crearBloqueo(socioId);
  }

  return {
    strike,
    strikesActivos: totalStrikes,
    bloqueado: bloqueo !== null,
    bloqueo: bloqueo
      ? { hasta: bloqueo.bloqueado_hasta, dias: 7 }
      : null,
  };
};

/**
 * Verifica si un socio puede hacer reservas (sin bloqueo activo).
 * @param {number} socioId
 * @returns {{ puede: boolean, bloqueo: Object | null }}
 */
const puedeReservar = async (socioId) => {
  const bloqueo = await Penalizacion.tieneBloqueActivo(socioId);
  if (bloqueo) {
    return {
      puede: false,
      bloqueo: { hasta: bloqueo.bloqueado_hasta },
    };
  }
  return { puede: true, bloqueo: null };
};

module.exports = { procesarInasistencia, puedeReservar };
