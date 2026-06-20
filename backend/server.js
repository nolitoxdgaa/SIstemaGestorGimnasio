require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config/config');

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log('');
  console.log('  🏋️  OLYMPUS CORE API');
  console.log(`  ✅  Servidor corriendo en http://localhost:${PORT}`);
  console.log(`  🌍  Entorno: ${config.server.nodeEnv}`);
  console.log(`  📋  Health check: http://localhost:${PORT}/api/v1/health`);
  console.log('');
});
