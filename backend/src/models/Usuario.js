const { query } = require('../config/database');
const { hashPassword } = require('../utils/bcrypt.utils');

/**
 * Modelo Usuario — tabla `usuarios`
 * Representa a cualquier persona con acceso al sistema (admin, recepcionista, entrenador, socio).
 */
const Usuario = {
  /**
   * Busca un usuario por su email.
   */
  findByEmail: async (email) => {
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  },

  /**
   * Busca un usuario por su ID.
   */
  findById: async (id) => {
    const result = await query(
      'SELECT id, nombre, email, rol, activo, creado_en FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Crea un nuevo usuario en la BD.
   */
  create: async ({ nombre, email, password, rol }) => {
    const hashedPassword = await hashPassword(password);
    const result = await query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol, creado_en`,
      [nombre, email.toLowerCase().trim(), hashedPassword, rol]
    );
    return result.rows[0];
  },

  /**
   * Incrementa el contador de intentos fallidos de login.
   */
  incrementFailedAttempts: async (id) => {
    await query(
      'UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = $1',
      [id]
    );
  },

  /**
   * Bloquea temporalmente la cuenta del usuario.
   * @param {number} id
   * @param {number} minutos - Minutos de bloqueo.
   */
  lockAccount: async (id, minutos = 30) => {
    await query(
      `UPDATE usuarios
       SET bloqueado_hasta = NOW() + ($1 || ' minutes')::INTERVAL,
           intentos_fallidos = 0
       WHERE id = $2`,
      [minutos, id]
    );
  },

  /**
   * Resetea los intentos fallidos y desbloquea la cuenta tras login exitoso.
   */
  resetFailedAttempts: async (id) => {
    await query(
      'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1',
      [id]
    );
  },

  /**
   * Verifica si una cuenta está bloqueada en este momento.
   * @returns {boolean}
   */
  isLocked: (usuario) => {
    if (!usuario.bloqueado_hasta) return false;
    return new Date(usuario.bloqueado_hasta) > new Date();
  },
};

module.exports = Usuario;
