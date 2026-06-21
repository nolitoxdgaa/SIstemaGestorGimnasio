const { query } = require('../config/database');

/**
 * Modelo Plan — tabla `planes`
 * Catálogo cerrado de planes de membresía (RN-05: precios fijos, el cajero no puede modificarlos).
 */
const Plan = {
  /**
   * Obtiene todos los planes activos.
   */
  findAll: async () => {
    const result = await query(
      'SELECT * FROM planes WHERE activo = true ORDER BY precio ASC'
    );
    return result.rows;
  },

  /**
   * Busca un plan por ID.
   */
  findById: async (id) => {
    const result = await query(
      'SELECT * FROM planes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = Plan;
