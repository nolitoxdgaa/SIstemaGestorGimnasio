/**
 * models/index.js
 * Punto central de exportación de todos los modelos.
 * Importar desde aquí para mayor consistencia.
 *
 * Uso: const { Socio, Membresia } = require('../models');
 */
const Usuario  = require('./Usuario');
const Socio    = require('./Socio');
const Plan     = require('./Plan');
const Membresia = require('./Membresia');
const Pago     = require('./Pago');
const LogAcceso = require('./LogAcceso');

module.exports = { Usuario, Socio, Plan, Membresia, Pago, LogAcceso };
