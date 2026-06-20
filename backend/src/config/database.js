const { Pool } = require('pg');
const config = require('./config');

// Si existe DATABASE_URL (servicios cloud como Railway, Render, Supabase)
// la usa directamente. Si no, usa las variables separadas (local).
const poolConfig = config.db.url
  ? {
      connectionString: config.db.url,
      ssl: config.server.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
    };

const pool = new Pool(poolConfig);

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
  } else {
    console.log('✅ Conexión con la base de datos establecida');
    release();
  }
});

/**
 * Ejecuta una query directamente.
 * @param {string} text - La consulta SQL.
 * @param {Array} params - Parámetros de la consulta.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Obtiene un cliente del pool para transacciones manuales.
 * Recuerda llamar client.release() al terminar.
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
