/**
 * Logger middleware.
 * Registra cada request HTTP en consola durante el desarrollo.
 * Muestra: método, ruta, código de respuesta y tiempo de respuesta.
 */
const logger = (req, res, next) => {
  const inicio = Date.now();

  // Se ejecuta cuando la respuesta termina
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // rojo o verde
    const reset = '\x1b[0m';
    console.log(
      `${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duracion}ms)${reset}`
    );
  });

  next();
};

module.exports = { logger };
