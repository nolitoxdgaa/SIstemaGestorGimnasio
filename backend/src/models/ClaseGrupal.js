const { query } = require('../config/database');

/**
 * Modelo ClaseGrupal — tabla `clases_grupales`
 * Tipos disponibles: spinning | crossfit (RN-02: aforo máximo)
 */
const ClaseGrupal = {
  /**
   * Obtiene clases con filtros opcionales, incluyendo el aforo disponible calculado en tiempo real.
   */
  findAll: async ({ tipo, fecha, disponibles }) => {
    let condiciones = ["cg.estado != 'cancelada'"];
    let params = [];
    let idx = 1;

    if (tipo)  { condiciones.push(`cg.tipo = $${idx}`);                     params.push(tipo);  idx++; }
    if (fecha) { condiciones.push(`DATE(cg.fecha_hora) = $${idx}`);          params.push(fecha); idx++; }

    const where = 'WHERE ' + condiciones.join(' AND ');

    const havingClause = disponibles === 'true'
      ? 'HAVING (cg.aforo_maximo - COUNT(r.id) FILTER (WHERE r.estado = \'confirmada\')) > 0'
      : '';

    const result = await query(
      `SELECT
        cg.*,
        (cg.aforo_maximo - COUNT(r.id) FILTER (WHERE r.estado = 'confirmada')) AS aforo_disponible,
        CASE
          WHEN (cg.aforo_maximo - COUNT(r.id) FILTER (WHERE r.estado = 'confirmada')) <= 0 THEN 'llena'
          ELSE cg.estado
        END AS estado_calculado
       FROM clases_grupales cg
       LEFT JOIN reservas r ON r.clase_id = cg.id
       ${where}
       GROUP BY cg.id
       ${havingClause}
       ORDER BY cg.fecha_hora ASC`,
      params
    );
    return result.rows;
  },

  /**
   * Busca una clase por ID con aforo calculado.
   */
  findById: async (id) => {
    const result = await query(
      `SELECT
        cg.*,
        (cg.aforo_maximo - COUNT(r.id) FILTER (WHERE r.estado = 'confirmada')) AS aforo_disponible
       FROM clases_grupales cg
       LEFT JOIN reservas r ON r.clase_id = cg.id
       WHERE cg.id = $1
       GROUP BY cg.id`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Crea una nueva clase grupal.
   */
  create: async ({ tipo, nombre, descripcion, instructor, fechaHora, duracionMinutos, aforoMaximo }) => {
    const result = await query(
      `INSERT INTO clases_grupales (tipo, nombre, descripcion, instructor, fecha_hora, duracion_minutos, aforo_maximo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tipo, nombre, descripcion, instructor, fechaHora, duracionMinutos || 60, aforoMaximo]
    );
    return result.rows[0];
  },

  /**
   * Actualiza una clase.
   */
  update: async (id, campos) => {
    const keys = Object.keys(campos);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const result = await query(
      `UPDATE clases_grupales SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`,
      [...Object.values(campos), id]
    );
    return result.rows[0] || null;
  },

  /**
   * Cancela una clase y cancela todas sus reservas asociadas.
   */
  cancel: async (id) => {
    await query(
      `UPDATE reservas SET estado = 'cancelada' WHERE clase_id = $1 AND estado = 'confirmada'`,
      [id]
    );
    await query(
      `UPDATE clases_grupales SET estado = 'cancelada' WHERE id = $1`,
      [id]
    );
  },

  /**
   * Verifica si hay cupos disponibles para una clase (para reserva concurrente).
   * Se usa dentro de una transacción con FOR UPDATE.
   * @param {Object} client - Cliente de transacción PostgreSQL.
   */
  verificarAforo: async (claseId, client) => {
    // Primero bloqueamos la fila de la clase (FOR UPDATE sin GROUP BY)
    await client.query(
      `SELECT id FROM clases_grupales WHERE id = $1 FOR UPDATE`,
      [claseId]
    );
    // Luego contamos las reservas confirmadas por separado
    const result = await client.query(
      `SELECT
        cg.aforo_maximo,
        COUNT(r.id) FILTER (WHERE r.estado = 'confirmada') AS ocupados
       FROM clases_grupales cg
       LEFT JOIN reservas r ON r.clase_id = cg.id
       WHERE cg.id = $1
       GROUP BY cg.id, cg.aforo_maximo`,
      [claseId]
    );
    if (!result.rows[0]) return { disponible: false, aforoMaximo: 0, ocupados: 0 };
    const { aforo_maximo, ocupados } = result.rows[0];
    return {
      disponible: parseInt(ocupados) < parseInt(aforo_maximo),
      aforoMaximo: parseInt(aforo_maximo),
      ocupados: parseInt(ocupados),
    };
  },
};

module.exports = ClaseGrupal;
