-- ============================================================
-- Migration 003: Clases Grupales, Reservas y Penalizaciones
-- Integrante 2: Josue Rodrigo Cordova Guerra (24200155)
-- Ejecutar DESPUÉS de migration 001 y 002.
-- Compatible con PostgreSQL 14+
-- ============================================================

-- ─── TABLA: clases_grupales ───────────────────────────────────
CREATE TABLE IF NOT EXISTS clases_grupales (
  id               SERIAL PRIMARY KEY,
  tipo             VARCHAR(30) NOT NULL CHECK (tipo IN ('spinning','crossfit')),
  nombre           VARCHAR(100) NOT NULL,
  descripcion      TEXT,
  instructor       VARCHAR(100),
  fecha_hora       TIMESTAMPTZ NOT NULL,
  duracion_minutos INTEGER DEFAULT 60,
  aforo_maximo     INTEGER NOT NULL,
  estado           VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible','llena','cancelada')),
  creado_en        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clases_fecha  ON clases_grupales(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_clases_estado ON clases_grupales(estado);
CREATE INDEX IF NOT EXISTS idx_clases_tipo   ON clases_grupales(tipo);

-- ─── TABLA: reservas ──────────────────────────────────────────
-- Reglas cubiertas:
--   RN-02: aforo máximo verificado en el controller con FOR UPDATE
--   RN-03: cancelación solo hasta 2h antes (validado en controller)
--   RN-07: UNIQUE(socio_id, clase_id) impide duplicar la misma clase
CREATE TABLE IF NOT EXISTS reservas (
  id          SERIAL PRIMARY KEY,
  socio_id    INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  clase_id    INTEGER NOT NULL REFERENCES clases_grupales(id) ON DELETE CASCADE,
  estado      VARCHAR(20) DEFAULT 'confirmada'
              CHECK (estado IN ('confirmada','cancelada','asistio','inasistencia')),
  creada_en   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (socio_id, clase_id)
);

CREATE INDEX IF NOT EXISTS idx_reservas_socio  ON reservas(socio_id);
CREATE INDEX IF NOT EXISTS idx_reservas_clase  ON reservas(clase_id);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);

-- ─── TABLA: penalizaciones ────────────────────────────────────
-- Cada fila es un "strike" (inasistencia injustificada).
-- RN-04: 3 strikes activos en 30 días → bloqueo de 7 días.
CREATE TABLE IF NOT EXISTS penalizaciones (
  id            SERIAL PRIMARY KEY,
  socio_id      INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  reserva_id    INTEGER REFERENCES reservas(id) ON DELETE SET NULL,
  justificada   BOOLEAN DEFAULT FALSE,
  justificacion TEXT,
  creado_en     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pen_socio    ON penalizaciones(socio_id);
CREATE INDEX IF NOT EXISTS idx_pen_fecha    ON penalizaciones(creado_en);

-- ─── TABLA: penalizaciones_bloqueo ────────────────────────────
-- Se crea una fila cuando el socio acumula 3 strikes en 30 días (RN-04).
CREATE TABLE IF NOT EXISTS penalizaciones_bloqueo (
  id               SERIAL PRIMARY KEY,
  socio_id         INTEGER NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  bloqueado_desde  TIMESTAMPTZ DEFAULT NOW(),
  bloqueado_hasta  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bloqueo_socio ON penalizaciones_bloqueo(socio_id);
CREATE INDEX IF NOT EXISTS idx_bloqueo_hasta ON penalizaciones_bloqueo(bloqueado_hasta);
