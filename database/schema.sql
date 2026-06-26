-- ============================================================
-- OLYMPUS CORE — Schema principal de la base de datos (MVP1)
-- Ejecutar en orden. Compatible con PostgreSQL 14+
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLA: usuarios ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id                SERIAL PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL,
  email             VARCHAR(150) NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  rol               VARCHAR(30) NOT NULL CHECK (rol IN ('administrador','recepcionista','entrenador','socio')),
  activo            BOOLEAN DEFAULT TRUE,
  intentos_fallidos INTEGER DEFAULT 0,
  bloqueado_hasta   TIMESTAMPTZ,
  creado_en         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: planes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planes (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL UNIQUE,
  descripcion     TEXT,
  duracion_dias   INTEGER NOT NULL,
  precio          NUMERIC(10,2) NOT NULL,
  activo          BOOLEAN DEFAULT TRUE
);

-- ─── TABLA: socios ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS socios (
  id               SERIAL PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  dni              CHAR(8) NOT NULL UNIQUE,
  email            VARCHAR(150),
  telefono         VARCHAR(15),
  fecha_nacimiento DATE,
  fecha_registro   TIMESTAMPTZ DEFAULT NOW(),
  estado           VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo','inactivo')),
  actualizado_en   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA: membresias ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membresias (
  id           SERIAL PRIMARY KEY,
  socio_id     INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  plan_id      INTEGER NOT NULL REFERENCES planes(id),
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin    TIMESTAMPTZ NOT NULL,
  estado       VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa','vencida','bloqueada')),
  precio       NUMERIC(10,2) NOT NULL,
  creada_en    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_membresias_socio ON membresias(socio_id);
CREATE INDEX IF NOT EXISTS idx_membresias_estado ON membresias(estado);

-- ─── TABLA: pagos ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagos (
  id             SERIAL PRIMARY KEY,
  socio_id       INTEGER NOT NULL REFERENCES socios(id),
  plan_id        INTEGER NOT NULL REFERENCES planes(id),
  monto          NUMERIC(10,2) NOT NULL,
  metodo_pago    VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo','yape','plin','tarjeta')),
  estado         VARCHAR(20) DEFAULT 'completado' CHECK (estado IN ('completado','anulado')),
  comprobante    VARCHAR(50),
  registrado_por INTEGER REFERENCES usuarios(id),
  creado_en      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pagos_socio ON pagos(socio_id);

-- ─── TABLA: clases_grupales ───────────────────────────────────
CREATE TABLE IF NOT EXISTS clases_grupales (
  id               SERIAL PRIMARY KEY,
  tipo             VARCHAR(30) NOT NULL CHECK (tipo IN ('spinning','crossfit','yoga','zumba')),
  nombre           VARCHAR(100) NOT NULL,
  descripcion      TEXT,
  instructor       VARCHAR(100),
  fecha_hora       TIMESTAMPTZ NOT NULL,
  duracion_minutos INTEGER DEFAULT 60,
  aforo_maximo     INTEGER NOT NULL,
  estado           VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible','llena','cancelada')),
  creado_en        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clases_fecha ON clases_grupales(fecha_hora);

-- ─── TABLA: reservas ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservas (
  id          SERIAL PRIMARY KEY,
  socio_id    INTEGER NOT NULL REFERENCES socios(id),
  clase_id    INTEGER NOT NULL REFERENCES clases_grupales(id),
  estado      VARCHAR(20) DEFAULT 'confirmada' CHECK (estado IN ('confirmada','cancelada','asistio','inasistencia')),
  creada_en   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (socio_id, clase_id)
);
CREATE INDEX IF NOT EXISTS idx_reservas_socio ON reservas(socio_id);
CREATE INDEX IF NOT EXISTS idx_reservas_clase ON reservas(clase_id);

-- ─── TABLA: penalizaciones ────────────────────────────────────
-- Cada registro es un "strike" (inasistencia injustificada)
CREATE TABLE IF NOT EXISTS penalizaciones (
  id          SERIAL PRIMARY KEY,
  socio_id    INTEGER NOT NULL REFERENCES socios(id),
  reserva_id  INTEGER REFERENCES reservas(id),
  justificada BOOLEAN DEFAULT FALSE,
  justificacion TEXT,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pen_socio ON penalizaciones(socio_id);

-- ─── TABLA: penalizaciones_bloqueo ────────────────────────────
-- Se crea un registro aquí cuando el socio acumula 3 strikes (RN-04)
CREATE TABLE IF NOT EXISTS penalizaciones_bloqueo (
  id             SERIAL PRIMARY KEY,
  socio_id       INTEGER NOT NULL REFERENCES socios(id),
  bloqueado_desde TIMESTAMPTZ DEFAULT NOW(),
  bloqueado_hasta TIMESTAMPTZ NOT NULL
);

-- ─── TABLA: logs_acceso ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS logs_acceso (
  id            SERIAL PRIMARY KEY,
  socio_id      INTEGER NOT NULL REFERENCES socios(id),
  resultado     VARCHAR(10) NOT NULL CHECK (resultado IN ('PERMITIDO','DENEGADO')),
  motivo        VARCHAR(50),
  registrado_en TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_logs_socio ON logs_acceso(socio_id);
CREATE INDEX IF NOT EXISTS idx_logs_fecha ON logs_acceso(registrado_en);
