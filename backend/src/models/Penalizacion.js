const { query } = require('../config/database');

/**
 * Modelo Penalizacion — tablas `penalizaciones` y `penalizaciones_bloqueo`
 * Implementa RN-04: 3 inasistencias injustificadas en 30 días → bloqueo por 7 días.
 */
const Penalizacion = {
  /**
   * Registra un nuevo strike por inasistencia.
   */
  create: async ({ socioId, reservaId }) => {
    const result = await query(
      `INSERT INTO penalizaciones (socio_id, reserva_id)
       VALUES ($1, $2)
       RETURNING *`,
      [socioId, reservaId]
    );
    return result.rows[0];
  },

  /**
   * Cuenta los strikes activos (últimos 30 días, no justificados) de un socio.
   */
  contarStrikesActivos: async (socioId) => {
    const result = await query(
      `SELECT COUNT(*) AS total
       FROM penalizaciones
       WHERE socio_id = $1
         AND justificada = false
         AND creado_en >= NOW() - INTERVAL '30 days'`,
      [socioId]
    );
    return parseInt(result.rows[0].total);
  },

  /**
   * Obtiene el historial completo de strikes de un socio.
   */
  findBySocioId: async (socioId) => {
    const result = await query(
      `SELECT p.*, cg.nombre AS clase_nombre, cg.fecha_hora
       FROM penalizaciones p
       LEFT JOIN reservas r ON r.id = p.reserva_id
       LEFT JOIN clases_grupales cg ON cg.id = r.clase_id
       WHERE p.socio_id = $1
       ORDER BY p.creado_en DESC`,
      [socioId]
    );
    return result.rows;
  },

  /**
   * Verifica si el socio tiene un bloqueo activo en este momento (RN-04).
   */
  tieneBloqueActivo: async (socioId) => {
    const result = await query(
      `SELECT id, bloqueado_hasta
       FROM penalizaciones_bloqueo
       WHERE socio_id = $1 AND bloqueado_hasta > NOW()
       LIMIT 1`,
      [socioId]
    );
    return result.rows[0] || null;
  },

  /**
   * Crea un bloqueo de 7 días para un socio (tras acumular 3 strikes).
   */
  crearBloqueo: async (socioId) => {
    const result = await query(
      `INSERT INTO penalizaciones_bloqueo (socio_id, bloqueado_hasta)
       VALUES ($1, NOW() + INTERVAL '7 days')
       RETURNING *`,
      [socioId]
    );
    return result.rows[0];
  },

  /**
   * Justifica un strike (lo marca como justificado con una razón).
   */
  justificar: async (penalizacionId, justificacion) => {
    const result = await query(
      `UPDATE penalizaciones
       SET justificada = true, justificacion = $2
       WHERE id = $1
       RETURNING *`,
      [penalizacionId, justificacion]
    );
    return result.rows[0] || null;
  },
};

module.exports = Penalizacion;
