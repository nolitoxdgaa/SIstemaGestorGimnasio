const Membresia = require('../models/Membresia');
const { diasParaVencer } = require('../utils/fecha.utils');

/**
 * Verifica si un socio tiene membresía activa.
 * @param {number} socioId
 * @returns {{ activa: boolean, membresia: Object | null, diasRestantes: number }}
 */
const verificarMembresia = async (socioId) => {
  const membresia = await Membresia.findActivaBySocioId(socioId);

  if (!membresia) {
    return { activa: false, membresia: null, diasRestantes: 0 };
  }

  const diasRestantes = diasParaVencer(membresia.fecha_fin);

  if (diasRestantes <= 0) {
    return { activa: false, membresia, diasRestantes: 0 };
  }

  return { activa: true, membresia, diasRestantes };
};

module.exports = { verificarMembresia };
