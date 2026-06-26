const Usuario = require('../models/Usuario');
const { query } = require('../config/database');
const { comparePassword } = require('../utils/bcrypt.utils');
const { generateToken, buildTokenPayload } = require('../utils/jwt.utils');
const { sendSuccess, sendBadRequest, sendUnauthorized, sendError } = require('../utils/response.utils');
const { validarCamposRequeridos, esEmailValido } = require('../utils/validators.utils');
const config = require('../config/config');

/**
 * POST /api/v1/auth/login
 * Autentica al usuario y devuelve un JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    const errores = validarCamposRequeridos(req.body, ['email', 'password']);
    if (errores.length > 0) return sendBadRequest(res, 'Datos incompletos.', errores);
    if (!esEmailValido(email)) return sendBadRequest(res, 'El formato del email no es válido.');

    // Buscar usuario
    const usuario = await Usuario.findByEmail(email);
    if (!usuario) return sendUnauthorized(res, 'Credenciales incorrectas.');

    // Verificar si está bloqueado
    if (Usuario.isLocked(usuario)) {
      const hasta = new Date(usuario.bloqueado_hasta).toLocaleTimeString('es-PE');
      return sendError(
        res,
        `Cuenta bloqueada por múltiples intentos fallidos. Intenta nuevamente después de las ${hasta}.`,
        'ACCOUNT_LOCKED',
        429
      );
    }

    // Verificar contraseña
    const passwordCorrecta = await comparePassword(password, usuario.password_hash);
    if (!passwordCorrecta) {
      await Usuario.incrementFailedAttempts(usuario.id);

      // Bloquear si supera el máximo de intentos
      const intentosActualizados = usuario.intentos_fallidos + 1;
      if (intentosActualizados >= config.security.maxLoginAttempts) {
        await Usuario.lockAccount(usuario.id, config.security.loginBlockMinutes);
        return sendError(
          res,
          `Cuenta bloqueada por ${config.security.loginBlockMinutes} minutos por múltiples intentos fallidos.`,
          'ACCOUNT_LOCKED',
          429
        );
      }

      return sendUnauthorized(res, 'Credenciales incorrectas.');
    }

    // Login exitoso: resetear intentos y generar token
    await Usuario.resetFailedAttempts(usuario.id);

    // Buscar socio y membresía si el rol es socio
    let socioData = null;
    let membresiaData = null;
    if (usuario.rol === 'socio') {
      const socioQuery = await query('SELECT * FROM socios WHERE email = $1', [usuario.email]);
      if (socioQuery.rows.length > 0) {
        socioData = socioQuery.rows[0];
        // Buscar membresía activa
        const memQuery = await query(
          `SELECT m.*, p.nombre AS plan_nombre
           FROM membresias m
           JOIN planes p ON p.id = m.plan_id
           WHERE m.socio_id = $1 AND m.estado = 'activa'
           LIMIT 1`,
          [socioData.id]
        );
        if (memQuery.rows.length > 0) {
          membresiaData = {
            id: memQuery.rows[0].id,
            planNombre: memQuery.rows[0].plan_nombre,
            estado: memQuery.rows[0].estado,
            fechaFin: memQuery.rows[0].fecha_fin,
          };
        }
      }
    }

    const payload = buildTokenPayload(usuario, socioData?.id);
    const token = generateToken(payload);

    return sendSuccess(res, 'Inicio de sesión exitoso.', {
      token,
      usuario: {
        id: socioData ? socioData.id : usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        ...(membresiaData ? { membresia: membresiaData } : {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/logout
 * El cliente elimina el token localmente. Este endpoint es simbólico
 * (el JWT es stateless) pero mantiene consistencia con el contrato de API.
 */
const logout = async (req, res) => {
  return sendSuccess(res, 'Sesión cerrada correctamente.', null);
};

/**
 * GET /api/v1/auth/me
 * Devuelve los datos del usuario autenticado actualmente.
 */
const me = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.usuarioId || req.usuario.id;
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return sendUnauthorized(res, 'Usuario no encontrado.');

    // Buscar socio y membresía si el rol es socio
    let socioData = null;
    let membresiaData = null;
    if (usuario.rol === 'socio') {
      const socioQuery = await query('SELECT * FROM socios WHERE email = $1', [usuario.email]);
      if (socioQuery.rows.length > 0) {
        socioData = socioQuery.rows[0];
        // Buscar membresía activa
        const memQuery = await query(
          `SELECT m.*, p.nombre AS plan_nombre
           FROM membresias m
           JOIN planes p ON p.id = m.plan_id
           WHERE m.socio_id = $1 AND m.estado = 'activa'
           LIMIT 1`,
          [socioData.id]
        );
        if (memQuery.rows.length > 0) {
          membresiaData = {
            id: memQuery.rows[0].id,
            planNombre: memQuery.rows[0].plan_nombre,
            estado: memQuery.rows[0].estado,
            fechaFin: memQuery.rows[0].fecha_fin,
          };
        }
      }
    }

    return sendSuccess(res, 'Datos del usuario autenticado.', {
      usuario: {
        id: socioData ? socioData.id : usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        ...(membresiaData ? { membresia: membresiaData } : {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, logout, me };
