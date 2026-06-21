const { query } = require('../config/database');

/**
 * Modelo Membresia — tabla `membresias`
 */
const Membresia = {
  /**
   * Busca la membresía activa de un socio.
   */
  findActivaBySocioId: async (socioId) => {
    const result = await query(
      `SELECT m.*, p.nombre AS plan_nombre, p.duracion_dias, p.precio
       FROM membresias m
       JOIN planes p ON p.id = m.plan_id
       WHERE m.socio_id = $1 AND m.estado = 'activa'
       LIMIT 1`,
      [socioId]
    );
    return result.rows[0] || null;
  },

  /**
   * Obtiene todas las membresías con filtros.
   */
  findAll: async ({ socioId, estado, venceEn }) => {
    let condiciones = [];
    let params = [];
    let idx = 1;

    if (socioId) { condiciones.push(`m.socio_id = $${idx}`); params.push(socioId); idx++; }
    if (estado)  { condiciones.push(`m.estado = $${idx}`);   params.push(estado);  idx++; }
    if (venceEn) {
      condiciones.push(`m.fecha_fin <= NOW() + ($${idx} || ' days')::INTERVAL`);
      params.push(venceEn); idx++;
    }

    const where = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';
    const result = await query(
      `SELECT m.*, p.nombre AS plan_nombre, s.nombre AS socio_nombre, s.apellido AS socio_apellido
       FROM membresias m
       JOIN planes p ON p.id = m.plan_id
       JOIN socios s ON s.id = m.socio_id
       ${where}
       ORDER BY m.fecha_fin ASC`,
      params
    );
    return result.rows;
  },

  /**
   * Crea una nueva membresía. Primero vence cualquier membresía activa anterior.
   * @param {Object} datos - { socioId, planId, duracionDias, precio }
   */
  create: async ({ socioId, planId, duracionDias, precio }, client) => {
    const db = client || { query: (text, params) => query(text, params) };

    // Vencer membresías activas anteriores del mismo socio
    await db.query(
      `UPDATE membresias SET estado = 'vencida' WHERE socio_id = $1 AND estado = 'activa'`,
      [socioId]
    );

    // Crear la nueva membresía
    const result = await db.query(
      `INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, precio)
       VALUES ($1, $2, NOW(), NOW() + ($3 || ' days')::INTERVAL, $4)
       RETURNING *`,
      [socioId, planId, duracionDias, precio]
    );
    return result.rows[0];
  },

  /**
   * Vence automáticamente membresías cuya fecha_fin ya pasó.
   * Útil para correr como tarea de mantenimiento.
   */
  vencerExpiradas: async () => {
    const result = await query(
      `UPDATE membresias SET estado = 'vencida'
       WHERE estado = 'activa' AND fecha_fin < NOW()
       RETURNING id, socio_id`
    );
    return result.rows;
  },
};

module.exports = Membresia;
