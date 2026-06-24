const { query } = require('../config/database');

/**
 * Modelo Pago — tabla `pagos`
 */
const Pago = {
  /**
   * Crea un registro de pago.
   */
  create: async ({ socioId, planId, monto, metodoPago, registradoPorId, comprobante }, client) => {
    const db = client || { query: (text, params) => query(text, params) };
    const result = await db.query(
      `INSERT INTO pagos (socio_id, plan_id, monto, metodo_pago, registrado_por, comprobante)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [socioId, planId, monto, metodoPago, registradoPorId, comprobante]
    );
    return result.rows[0];
  },

  /**
   * Historial de pagos de un socio.
   */
  findBySocioId: async (socioId) => {
    const result = await query(
      `SELECT p.*, pl.nombre AS plan_nombre, u.nombre AS registrado_por_nombre
       FROM pagos p
       JOIN planes pl ON pl.id = p.plan_id
       LEFT JOIN usuarios u ON u.id = p.registrado_por
       WHERE p.socio_id = $1
       ORDER BY p.creado_en DESC`,
      [socioId]
    );
    return result.rows;
  },

  /**
   * Todos los pagos con filtros opcionales.
   */
  findAll: async ({ socioId, fechaDesde, fechaHasta, metodoPago }) => {
    let condiciones = [];
    let params = [];
    let idx = 1;

    if (socioId)    { condiciones.push(`p.socio_id = $${idx}`);        params.push(socioId);    idx++; }
    if (fechaDesde) { condiciones.push(`DATE(p.creado_en) >= $${idx}`);      params.push(fechaDesde); idx++; }
    if (fechaHasta) { condiciones.push(`DATE(p.creado_en) <= $${idx}`);      params.push(fechaHasta); idx++; }
    if (metodoPago) { condiciones.push(`p.metodo_pago = $${idx}`);     params.push(metodoPago); idx++; }

    const where = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';
    const result = await query(
      `SELECT p.*, s.nombre AS socio_nombre, s.apellido AS socio_apellido,
              pl.nombre AS plan_nombre, u.nombre AS registrado_por_nombre
       FROM pagos p
       JOIN socios s ON s.id = p.socio_id
       JOIN planes pl ON pl.id = p.plan_id
       LEFT JOIN usuarios u ON u.id = p.registrado_por
       ${where}
       ORDER BY p.creado_en DESC`,
      params
    );
    return result.rows;
  },

  /**
   * Total de ingresos en un rango de fechas.
   */
  totalIngresosHoy: async () => {
    const result = await query(
      `SELECT COALESCE(SUM(monto), 0) AS total, COUNT(*) AS cantidad
       FROM pagos
       WHERE DATE(creado_en) = CURRENT_DATE AND estado = 'completado'`
    );
    return result.rows[0];
  },
};

module.exports = Pago;
