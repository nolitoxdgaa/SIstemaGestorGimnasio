const { query } = require('../config/database');

/**
 * Modelo Reserva — tabla `reservas`
 * Reglas críticas:
 *   RN-02: No exceder aforo máximo
 *   RN-03: Cancelación solo hasta 2h antes
 *   RN-07: No dos clases en el mismo horario
 */
const Reserva = {
  /**
   * Obtiene reservas con filtros.
   */
  findAll: async ({ socioId, claseId, estado, fecha }) => {
    let condiciones = [];
    let params = [];
    let idx = 1;

    if (socioId) { condiciones.push(`r.socio_id = $${idx}`);               params.push(socioId); idx++; }
    if (claseId) { condiciones.push(`r.clase_id = $${idx}`);               params.push(claseId); idx++; }
    if (estado)  { condiciones.push(`r.estado = $${idx}`);                  params.push(estado);  idx++; }
    if (fecha)   { condiciones.push(`DATE(cg.fecha_hora) = $${idx}`);       params.push(fecha);   idx++; }

    const where = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';

    const result = await query(
      `SELECT r.*,
              s.nombre AS socio_nombre, s.apellido AS socio_apellido,
              cg.nombre AS clase_nombre, cg.fecha_hora AS clase_hora,
              cg.tipo AS clase_tipo
       FROM reservas r
       JOIN socios s ON s.id = r.socio_id
       JOIN clases_grupales cg ON cg.id = r.clase_id
       ${where}
       ORDER BY cg.fecha_hora DESC`,
      params
    );
    return result.rows;
  },

  /**
   * Reservas de un socio específico.
   */
  findBySocioId: async (socioId) => {
    const result = await query(
      `SELECT r.*,
              cg.nombre AS clase_nombre, cg.fecha_hora AS clase_hora,
              cg.tipo AS clase_tipo, cg.instructor
       FROM reservas r
       JOIN clases_grupales cg ON cg.id = r.clase_id
       WHERE r.socio_id = $1
       ORDER BY cg.fecha_hora DESC`,
      [socioId]
    );
    return result.rows;
  },

  /**
   * Busca una reserva por ID.
   */
  findById: async (id) => {
    const result = await query(
      `SELECT r.*, cg.fecha_hora, cg.nombre AS clase_nombre, cg.tipo
       FROM reservas r
       JOIN clases_grupales cg ON cg.id = r.clase_id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Verifica si el socio ya tiene una reserva activa en el mismo horario (RN-07).
   * Se usa dentro de una transacción.
   */
  tieneHorarioDuplicado: async (socioId, claseId, client) => {
    const result = await client.query(
      `SELECT r.id FROM reservas r
       JOIN clases_grupales c1 ON c1.id = r.clase_id
       JOIN clases_grupales c2 ON c2.id = $2
       WHERE r.socio_id = $1
         AND r.estado = 'confirmada'
         AND c1.fecha_hora < (c2.fecha_hora + (c2.duracion_minutos || ' minutes')::INTERVAL)
         AND (c1.fecha_hora + (c1.duracion_minutos || ' minutes')::INTERVAL) > c2.fecha_hora`,
      [socioId, claseId]
    );
    return result.rows.length > 0;
  },

  /**
   * Crea una reserva. Debe llamarse dentro de una transacción.
   */
  create: async (socioId, claseId, client) => {
    // Si ya existe una fila (incluso cancelada), la reutilizamos actualizando su estado a confirmada
    const existRes = await client.query(
      `SELECT id, estado FROM reservas WHERE socio_id = $1 AND clase_id = $2`,
      [socioId, claseId]
    );
    if (existRes.rows.length > 0) {
      const row = existRes.rows[0];
      if (row.estado === 'cancelada') {
        const updateRes = await client.query(
          `UPDATE reservas SET estado = 'confirmada', creada_en = NOW() WHERE id = $1 RETURNING *`,
          [row.id]
        );
        return updateRes.rows[0];
      }
    }
    const result = await client.query(
      `INSERT INTO reservas (socio_id, clase_id) VALUES ($1, $2) RETURNING *`,
      [socioId, claseId]
    );
    return result.rows[0];
  },

  /**
   * Cancela una reserva (cambia estado a 'cancelada').
   */
  cancel: async (id) => {
    const result = await query(
      `UPDATE reservas SET estado = 'cancelada' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Marca una reserva como inasistencia (para disparar el sistema de strikes).
   */
  marcarInasistencia: async (id) => {
    const result = await query(
      `UPDATE reservas SET estado = 'inasistencia' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Marca una reserva como asistida.
   */
  marcarAsistencia: async (id) => {
    const result = await query(
      `UPDATE reservas SET estado = 'asistio' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = Reserva;
