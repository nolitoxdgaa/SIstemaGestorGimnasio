-- Seed: Planes de membresía
-- Ejecutar DESPUÉS del schema.sql
-- Catálogo cerrado de precios (RN-05)

INSERT INTO planes (nombre, descripcion, duracion_dias, precio, activo) VALUES
  ('Plan Mensual',    'Acceso ilimitado al gimnasio por 30 días',  30,  100.00, true),
  ('Plan Trimestral', 'Acceso ilimitado al gimnasio por 90 días',  90,  260.00, true),
  ('Plan Semestral',  'Acceso ilimitado al gimnasio por 180 días', 180, 480.00, true),
  ('Plan Anual',      'Acceso ilimitado al gimnasio por 365 días', 365, 850.00, true)
ON CONFLICT (nombre) DO NOTHING;
