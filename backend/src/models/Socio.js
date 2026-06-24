const { query } = require('../config/database');

/**
 * Modelo Socio — tabla `socios`
 * Persona registrada en el gimnasio. Puede tener una membresía activa.
 */
const Socio = {
  /**
   * Obtiene todos los socios con su membresía activa, con soporte de filtros y paginación.
   */
  findAll: async ({ busqueda, estado, membresiaEstado, pagina = 1, limite = 20 }) => {
    let condiciones = [];
    let params = [];
    let idx = 1;

    if (busqueda) {
      condiciones.push(`(s.nombre ILIKE $${idx} OR s.apellido ILIKE $${idx} OR s.dni = $${idx + 1})`);
      params.push(`%${busqueda}%`, busqueda);
      idx += 2;
    }
    if (estado) {
      condiciones.push(`s.estado = $${idx}`);
      params.push(estado); idx++;
    }
    if (membresiaEstado) {
      condiciones.push(`m.estado = $${idx}`);
      params.push(membresiaEstado); idx++;
    }

    const where = condiciones.length > 0 ? 'WHERE ' + condiciones.join(' AND ') : '';
    const offset = (pagina - 1) * limite;

    const dataQuery = `
      SELECT
        s.id, s.nombre, s.apellido, s.dni, s.email, s.telefono,
        s.fecha_nacimiento, s.fecha_registro, s.estado,
        m.id AS membresia_id, p.nombre AS plan_nombre,
        m.estado AS membresia_estado, m.fecha_inicio, m.fecha_fin,
        COALESCE(strikes.total, 0) AS strikes
      FROM socios s
      LEFT JOIN (
        SELECT DISTINCT ON (socio_id) id, socio_id, plan_id, estado, fecha_inicio, fecha_fin, precio
        FROM membresias
        ORDER BY socio_id, fecha_fin DESC, id DESC
      ) m ON m.socio_id = s.id
      LEFT JOIN planes p ON p.id = m.plan_id
      LEFT JOIN (
        SELECT socio_id, COUNT(*) AS total
        FROM penalizaciones
        WHERE creado_en >= NOW() - INTERVAL '30 days' AND justificada = false
        GROUP BY socio_id
      ) strikes ON strikes.socio_id = s.id
      ${where}
      ORDER BY s.fecha_registro DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limite, offset);

    const countQuery = `
      SELECT COUNT(*) FROM socios s
      LEFT JOIN membresias m ON m.socio_id = s.id AND m.estado = 'activa'
      ${where}
    `;

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, -2)),
    ]);

    return {
      socios: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  },

  /**
   * Busca un socio por ID con todos sus datos.
   */
  findById: async (id) => {
    const result = await query(
      `SELECT
        s.*,
        m.id AS membresia_id, p.nombre AS plan_nombre,
        m.estado AS membresia_estado, m.fecha_inicio, m.fecha_fin,
        COALESCE(strikes.total, 0) AS strikes,
        false AS ficha_medica_completa
      FROM socios s
      LEFT JOIN (
        SELECT DISTINCT ON (socio_id) id, socio_id, plan_id, estado, fecha_inicio, fecha_fin, precio
        FROM membresias
        ORDER BY socio_id, fecha_fin DESC, id DESC
      ) m ON m.socio_id = s.id
      LEFT JOIN planes p ON p.id = m.plan_id
      LEFT JOIN (
        SELECT socio_id, COUNT(*) AS total
        FROM penalizaciones
        WHERE creado_en >= NOW() - INTERVAL '30 days' AND justificada = false
        GROUP BY socio_id
      ) strikes ON strikes.socio_id = s.id
      WHERE s.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Verifica si ya existe un socio con ese DNI.
   */
  findByDni: async (dni) => {
    const result = await query('SELECT id FROM socios WHERE dni = $1', [dni]);
    return result.rows[0] || null;
  },

  /**
   * Crea un nuevo socio. Devuelve el socio creado.
   */
  create: async ({ nombre, apellido, dni, email, telefono, fechaNacimiento }) => {
    const result = await query(
      `INSERT INTO socios (nombre, apellido, dni, email, telefono, fecha_nacimiento)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, apellido, dni, email, telefono, fechaNacimiento]
    );
    return result.rows[0];
  },

  /**
   * Actualiza los datos de un socio.
   */
  update: async (id, campos) => {
    const keys = Object.keys(campos);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = Object.values(campos);
    const result = await query(
      `UPDATE socios SET ${sets}, actualizado_en = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Desactiva un socio (borrado lógico).
   */
  deactivate: async (id) => {
    await query(
      "UPDATE socios SET estado = 'inactivo', actualizado_en = NOW() WHERE id = $1",
      [id]
    );
  },
};

module.exports = Socio;
