/**
 * setup_db.js — Script de inicialización de BD para OLYMPUS CORE
 * Ejecuta schema.sql + todos los seeds en orden contra Neon.tech
 * 
 * Uso: node setup_db.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está definida en .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const DB_DIR = path.join(__dirname, '..', 'database');

const ARCHIVOS_EN_ORDEN = [
  { label: 'Schema principal',        file: path.join(DB_DIR, 'schema.sql') },
  { label: 'Seed: Planes',            file: path.join(DB_DIR, 'seeds', 'planes.seed.sql') },
  { label: 'Seed: Usuarios demo',     file: path.join(DB_DIR, 'seeds', 'usuarios_demo.seed.sql') },
  { label: 'Seed: Clases grupales',   file: path.join(DB_DIR, 'seeds', 'clases.seed.sql') },
];

async function ejecutarSQL(client, label, filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Archivo no encontrado, omitiendo: ${filePath}`);
    return;
  }

  const sql = fs.readFileSync(filePath, 'utf8').trim();
  if (!sql) {
    console.warn(`  ⚠️  Archivo vacío, omitiendo: ${path.basename(filePath)}`);
    return;
  }

  console.log(`  ⏳ Ejecutando: ${label}...`);
  await client.query(sql);
  console.log(`  ✅ Completado: ${label}`);
}

async function main() {
  console.log('');
  console.log('🏋️  OLYMPUS CORE — Inicialización de Base de Datos');
  console.log('────────────────────────────────────────────────────');
  console.log(`📡 Conectando a: ${DATABASE_URL.split('@')[1]?.split('/')[0] ?? 'neon.tech'}...`);
  console.log('');

  const client = await pool.connect();

  try {
    for (const { label, file } of ARCHIVOS_EN_ORDEN) {
      await ejecutarSQL(client, label, file);
    }

    console.log('');
    console.log('────────────────────────────────────────────────────');
    console.log('✅ Base de datos inicializada correctamente.');
    console.log('');
    console.log('👥 Usuarios de prueba creados (contraseña: Demo1234):');
    console.log('   admin@olympuscore.com       → administrador');
    console.log('   recepcion@olympuscore.com   → recepcionista');
    console.log('   entrenador@olympuscore.com  → entrenador');
    console.log('');
    console.log('📅 12 clases grupales de demo creadas (6 spinning + 6 crossfit)');
    console.log('💳 4 planes de membresía cargados');
    console.log('');
    console.log('🚀 Ahora puedes ejecutar: npm run dev');
    console.log('');
  } catch (err) {
    console.error('');
    console.error('❌ Error al ejecutar SQL:');
    console.error(err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
