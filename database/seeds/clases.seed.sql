-- Seed: Clases Grupales de demostración para el MVP1
-- Integrante 2: Josue Rodrigo Cordova Guerra (24200155)
-- Ejecutar DESPUÉS de schema.sql y seeds de usuarios/planes.
--
-- Genera clases para las próximas 2 semanas desde el momento de ejecución,
-- usando NOW() + INTERVAL para que siempre sean fechas futuras.

-- ─── Clases de SPINNING ─────────────────────────────────────────────────────

INSERT INTO clases_grupales (tipo, nombre, descripcion, instructor, fecha_hora, duracion_minutos, aforo_maximo) VALUES
  ('spinning', 'Spinning Matutino',
   'Sesión de ciclismo indoor de baja-media intensidad. Ideal para comenzar el día.',
   'Prof. María Torres',
   NOW() + INTERVAL '1 day'  + TIME '07:00:00',
   60, 15),

  ('spinning', 'Spinning Intensivo',
   'Clase de ciclismo indoor de alta intensidad con intervalos HIIT.',
   'Prof. María Torres',
   NOW() + INTERVAL '1 day'  + TIME '18:00:00',
   60, 20),

  ('spinning', 'Spinning Nocturno',
   'Sesión relajada de spinning para aliviar el estrés del día.',
   'Prof. Luis Quispe',
   NOW() + INTERVAL '2 days' + TIME '20:00:00',
   45, 12),

  ('spinning', 'Spinning Power',
   'Entrenamiento de fuerza en bicicleta estática con resistencia alta.',
   'Prof. María Torres',
   NOW() + INTERVAL '4 days' + TIME '07:30:00',
   60, 15),

  ('spinning', 'Spinning Cardio',
   'Clase enfocada en ritmo cardíaco y quema calórica. Apto para principiantes.',
   'Prof. Luis Quispe',
   NOW() + INTERVAL '6 days' + TIME '08:00:00',
   60, 20),

  ('spinning', 'Spinning Weekend',
   'Clase especial de fin de semana con música en vivo.',
   'Prof. María Torres',
   NOW() + INTERVAL '8 days' + TIME '09:00:00',
   75, 20);

-- ─── Clases de CROSSFIT ─────────────────────────────────────────────────────

INSERT INTO clases_grupales (tipo, nombre, descripcion, instructor, fecha_hora, duracion_minutos, aforo_maximo) VALUES
  ('crossfit', 'CrossFit Funcional',
   'Entrenamiento funcional de alta intensidad con movimientos compuestos.',
   'Coach Diego Salas',
   NOW() + INTERVAL '1 day'  + TIME '09:00:00',
   60, 12),

  ('crossfit', 'CrossFit Fuerza',
   'Sesión enfocada en levantamiento de pesas olímpico y powerlifting.',
   'Coach Diego Salas',
   NOW() + INTERVAL '2 days' + TIME '07:00:00',
   60, 10),

  ('crossfit', 'CrossFit Endurance',
   'Combinación de cardio y fuerza para mejorar la resistencia aeróbica.',
   'Coach Ana Flores',
   NOW() + INTERVAL '3 days' + TIME '18:30:00',
   60, 12),

  ('crossfit', 'CrossFit Metcon',
   'Workout of the Day (WOD) metabolic conditioning. Alta variedad de movimientos.',
   'Coach Diego Salas',
   NOW() + INTERVAL '5 days' + TIME '17:00:00',
   60, 15),

  ('crossfit', 'CrossFit Beginners',
   'Clase introductoria al CrossFit. Aprende los movimientos básicos con seguridad.',
   'Coach Ana Flores',
   NOW() + INTERVAL '7 days' + TIME '10:00:00',
   90, 8),

  ('crossfit', 'CrossFit Weekend Warrior',
   'Clase de fin de semana para los que quieren superarse. WOD especial.',
   'Coach Diego Salas',
   NOW() + INTERVAL '9 days' + TIME '08:00:00',
   60, 15);
