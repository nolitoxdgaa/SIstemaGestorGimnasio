require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  db: {
    url: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'olympus_core',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  qr: {
    secret: process.env.QR_SECRET || 'dev_qr_secret',
  },
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    loginBlockMinutes: parseInt(process.env.LOGIN_BLOCK_MINUTES) || 30,
    bcryptRounds: 10,
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

module.exports = config;
