/**
 * fecha.utils.js
 * Helpers para manejo de fechas en el proyecto.
 * Evita duplicar lógica de fechas en múltiples controllers.
 */

/**
 * Retorna la fecha actual en formato ISO (YYYY-MM-DD).
 * @returns {string}
 */
const hoy = () => new Date().toISOString().split('T')[0];

/**
 * Suma N días a una fecha.
 * @param {Date|string} fecha - Fecha base.
 * @param {number} dias - Días a sumar.
 * @returns {Date}
 */
const sumarDias = (fecha, dias) => {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
};

/**
 * Verifica si una fecha ya pasó (es anterior a hoy).
 * @param {Date|string} fecha
 * @returns {boolean}
 */
const esFechaVencida = (fecha) => new Date(fecha) < new Date();

/**
 * Calcula los días que faltan para que venza una fecha.
 * Retorna negativo si ya venció.
 * @param {Date|string} fechaFin
 * @returns {number}
 */
const diasParaVencer = (fechaFin) => {
  const ahora = new Date();
  const fin = new Date(fechaFin);
  const diffMs = fin - ahora;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Verifica si han pasado más de N horas desde una fecha.
 * Útil para validar la regla de cancelación de clases (RN-03).
 * @param {Date|string} fechaEvento - Fecha/hora del evento.
 * @param {number} horas - Horas de anticipación requeridas.
 * @returns {boolean} true si ya no se puede cancelar (fuera de plazo).
 */
const fueraDePlazo = (fechaEvento, horas = 2) => {
  const ahora = new Date();
  const evento = new Date(fechaEvento);
  const diffHoras = (evento - ahora) / (1000 * 60 * 60);
  return diffHoras < horas;
};

/**
 * Formatea una fecha a string legible en español.
 * @param {Date|string} fecha
 * @returns {string} Ej: "20/06/2026"
 */
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

module.exports = { hoy, sumarDias, esFechaVencida, diasParaVencer, fueraDePlazo, formatearFecha };
