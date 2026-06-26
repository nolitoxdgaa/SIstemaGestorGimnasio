-- Seed: Usuarios de demostración para el MVP
-- IMPORTANTE: Las contraseñas están hasheadas con bcrypt (10 rounds).
-- Contraseña para todos: Demo1234
-- Hash generado con: bcrypt.hashSync('Demo1234', 10)

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Admin OLYMPUS',       'admin@olympuscore.com',        '$2a$10$ErpoAe3Os/b7IZYI1q/qVeB.wV86hu6rLPJzvxnuY97RWpBsvYmPK', 'administrador'),
  ('Maria Recepcion',     'recepcion@olympuscore.com',    '$2a$10$ErpoAe3Os/b7IZYI1q/qVeB.wV86hu6rLPJzvxnuY97RWpBsvYmPK', 'recepcionista'),
  ('Carlos Entrenador',   'entrenador@olympuscore.com',   '$2a$10$ErpoAe3Os/b7IZYI1q/qVeB.wV86hu6rLPJzvxnuY97RWpBsvYmPK', 'entrenador'),
  ('Juan Pérez Demo',     'socio@demo.com',               '$2a$10$ErpoAe3Os/b7IZYI1q/qVeB.wV86hu6rLPJzvxnuY97RWpBsvYmPK', 'socio')
ON CONFLICT (email) DO NOTHING;

-- Socio de demostración
INSERT INTO socios (nombre, apellido, dni, email, telefono) VALUES
  ('Juan', 'Pérez Demo', '12345678', 'socio@demo.com', '987654321')
ON CONFLICT (dni) DO NOTHING;

-- Membresía activa para el socio demo (plan mensual)
INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, precio)
SELECT s.id, p.id, NOW(), NOW() + INTERVAL '30 days', p.precio
FROM socios s, planes p
WHERE s.dni = '12345678' AND p.nombre = 'Plan Mensual'
ON CONFLICT DO NOTHING;
