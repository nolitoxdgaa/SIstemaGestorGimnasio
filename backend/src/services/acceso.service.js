const { verifyQRToken } = require('./qr.service');
const { verificarMembresia } = require('./membresia.service');
const { query } = require('../config/database');

/**
 * Valida el token QR de un socio y determina si puede acceder.
 * Implementa RN-01: membresía vencida = acceso bloqueado.
 *
 * @param {string} tokenQR
 * @returns {{ resultado: 'PERMITIDO'|'DENEGADO', motivo: string|null, socio: Object, ... }}
 */
const validarAcceso = async (tokenQR) => {
  // 1. Verificar que el token QR sea válido
  const payload = verifyQRToken(tokenQR);
  if (!payload) {
    return { resultado: 'DENEGADO', motivo: 'QR_INVALIDO', socio: null };
  }

  const { socioId } = payload;

  // 2. Obtener datos del socio
  const socioResult = await query(
    `SELECT s.id, s.nombre, s.apellido, s.estado
     FROM socios s WHERE s.id = $1`,
    [socioId]
  );
  const socio = socioResult.rows[0];

  if (!socio || socio.estado !== 'activo') {
    return { resultado: 'DENEGADO', motivo: 'SOCIO_INACTIVO', socio };
  }

  // 3. Verificar penalización activa (bloqueo por strikes - RN-04)
  const penalizacionResult = await query(
    `SELECT bloqueado_hasta FROM penalizaciones_bloqueo
     WHERE socio_id = $1 AND bloqueado_hasta > NOW()
     LIMIT 1`,
    [socioId]
  );
  if (penalizacionResult.rows.length > 0) {
    return {
      resultado: 'DENEGADO',
      motivo: 'PENALIZACION_ACTIVA',
      socio,
      penalizacion: { bloqueadoHasta: penalizacionResult.rows[0].bloqueado_hasta },
    };
  }

  // 4. Verificar membresía activa (RN-01)
  const { activa, membresia } = await verificarMembresia(socioId);
  if (!activa) {
    return {
      resultado: 'DENEGADO',
      motivo: 'MEMBRESIA_VENCIDA',
      socio,
      membresia: membresia
        ? { estado: membresia.estado, fechaFin: membresia.fecha_fin }
        : null,
    };
  }

  // 5. Acceso permitido
  return {
    resultado: 'PERMITIDO',
    motivo: null,
    socio,
    membresia: { estado: membresia.estado, fechaFin: membresia.fecha_fin },
  };
};

module.exports = { validarAcceso };
