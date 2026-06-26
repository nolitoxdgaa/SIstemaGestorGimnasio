const Socio = require('../models/Socio');
const Usuario = require('../models/Usuario');
const { generateQRCode } = require('../services/qr.service');
const {
  sendSuccess, sendCreated, sendNotFound, sendBadRequest, sendConflict,
} = require('../utils/response.utils');
const { validarCamposRequeridos, esDNIValido, esEmailValido, esTelefonoValido } = require('../utils/validators.utils');

/**
 * GET /api/v1/socios
 */
const getSocios = async (req, res, next) => {
  try {
    const { busqueda, estado, membresiaEstado, pagina = 1, limite = 20 } = req.query;
    const { socios, total } = await Socio.findAll({
      busqueda, estado, membresiaEstado,
      pagina: parseInt(pagina), limite: parseInt(limite),
    });
    return sendSuccess(res, 'Socios obtenidos correctamente.', {
      socios,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      totalPaginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/socios/:id
 */
const getSocioById = async (req, res, next) => {
  try {
    const socio = await Socio.findById(req.params.id);
    if (!socio) return sendNotFound(res, 'Socio no encontrado.');
    return sendSuccess(res, 'Socio encontrado.', socio);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/socios
 */
const createSocio = async (req, res, next) => {
  try {
    const { nombre, apellido, dni, email, telefono, fechaNacimiento } = req.body;

    // Validaciones
    const errores = validarCamposRequeridos(req.body, ['nombre', 'apellido', 'dni', 'email']);
    if (!esDNIValido(dni))         errores.push("El campo 'dni' debe tener 8 dígitos numéricos.");
    if (!esEmailValido(email))     errores.push("El formato del email no es válido.");
    if (telefono && !esTelefonoValido(telefono)) errores.push("El teléfono debe tener 9 dígitos y empezar con 9.");
    if (errores.length > 0) return sendBadRequest(res, 'Datos inválidos.', errores);

    // DNI duplicado
    const existente = await Socio.findByDni(dni);
    if (existente) return sendConflict(res, 'Ya existe un socio con ese DNI.', 'DNI_ALREADY_EXISTS');

    // Email duplicado
    const usuarioExistente = await Usuario.findByEmail(email);
    if (usuarioExistente) return sendConflict(res, 'Ya existe un usuario registrado con ese email.', 'EMAIL_ALREADY_EXISTS');

    const socio = await Socio.create({ nombre, apellido, dni, email, telefono, fechaNacimiento });

    // Crear cuenta de usuario para el socio con contraseña por defecto Demo1234
    await Usuario.create({
      nombre: `${nombre} ${apellido}`,
      email,
      password: 'Demo1234',
      rol: 'socio',
    });

    const codigoQR = await generateQRCode(socio.id);

    return sendCreated(res, 'Socio registrado exitosamente.', { socio, codigoQR });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/socios/:id
 */
const updateSocio = async (req, res, next) => {
  try {
    const { nombre, apellido, email, telefono, fecha_nacimiento } = req.body;
    const camposPermitidos = {};
    if (nombre)          camposPermitidos.nombre = nombre;
    if (apellido)        camposPermitidos.apellido = apellido;
    if (email)           camposPermitidos.email = email;
    if (telefono)        camposPermitidos.telefono = telefono;
    if (fecha_nacimiento) camposPermitidos.fecha_nacimiento = fecha_nacimiento;

    if (Object.keys(camposPermitidos).length === 0)
      return sendBadRequest(res, 'No se proporcionaron campos para actualizar.');

    const socio = await Socio.update(req.params.id, camposPermitidos);
    if (!socio) return sendNotFound(res, 'Socio no encontrado.');
    return sendSuccess(res, 'Información del socio actualizada.', socio);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/socios/:id  (borrado lógico)
 */
const deleteSocio = async (req, res, next) => {
  try {
    const socio = await Socio.findById(req.params.id);
    if (!socio) return sendNotFound(res, 'Socio no encontrado.');
    await Socio.deactivate(req.params.id);
    return sendSuccess(res, 'Socio desactivado del sistema.', null);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/socios/:id/qr
 */
const getSocioQR = async (req, res, next) => {
  try {
    const socio = await Socio.findById(req.params.id);
    if (!socio) return sendNotFound(res, 'Socio no encontrado.');
    const { codigoQR, token, expiracion } = await generateQRCode(socio.id);
    return sendSuccess(res, 'Código QR generado.', { codigoQR, token, expiracion });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSocios, getSocioById, createSocio, updateSocio, deleteSocio, getSocioQR };
