const { query } = require('../config/database');

/**
 * Modelo LogAcceso — tabla `logs_acceso`
 * Registra cada intento de acceso al gimnasio (permitido o denegado).
 */
const LogAcceso = {
  /**
   * Registra un intento de acceso.
   */
  create: async ({ socioId, resultado, motivo = null }) => {
    const result = await query(
      `INSERT INTO logs_acceso (socio_id, resultado, motivo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [socioId, resultado, motivo]
    );
    return result.rows[0];
  },

  /**
   * Obtiene logs de acceso con filtros.
   */
  findAll: async ({ socioId, fecha, resultado, pagina = 1, limite = 50 }) => {
    let condiciones = [];
    let params = [];
    let idx = 1;

    if (socioId)   { condiciones.push(`la.socio_id = $${idx}`);        params.push(socioId);  idx++; }
    if (fecha)     { condiciones.push(`DATE(la.registrado_en) = $${idx}`); params.push(fecha); idx++; }
    if (resultado) { condiciones.push(`la.resultado = $${idx}`);       params.push(resultado); idx++; }

    const where = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';
    const offset = (pagina - 1) * limite;

    const result = await query(
      `SELECT la.*, s.nombre AS socio_nombre, s.apellido AS socio_apellido
       FROM logs_acceso la
       JOIN socios s ON s.id = la.socio_id
       ${where}
       ORDER BY la.registrado_en DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limite, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM logs_acceso la ${where}`,
      params
    );

    return {
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },
};

module.exports = LogAcceso;
