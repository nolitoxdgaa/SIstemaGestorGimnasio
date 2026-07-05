require('dotenv').config();
const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function runSeed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Limpiando base de datos...');
    await client.query(`
      TRUNCATE TABLE 
        logs_acceso, penalizaciones_bloqueo, penalizaciones, 
        reservas, clases_grupales, pagos, membresias, socios, planes, usuarios
      RESTART IDENTITY CASCADE;
    `);

    console.log('Insertando usuarios y personal...');
    const hash = await bcrypt.hash('123456', 10);
    const hashSocio = await bcrypt.hash('Demo1234', 10);
    await client.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES 
      ('Admin Principal', 'admin@olympus.com', $1, 'administrador'),
      ('Recepción Central', 'recepcion@olympus.com', $1, 'recepcionista'),
      ('Entrenador Luis', 'luis@olympus.com', $1, 'entrenador'),
      -- Credenciales para los 30 socios:
      ('Juan Perez', 'juan@test.com', $2, 'socio'),
      ('Maria Gomez', 'maria@test.com', $2, 'socio'),
      ('Carlos Ruiz', 'carlos@test.com', $2, 'socio'),
      ('Ana Torres', 'ana@test.com', $2, 'socio'),
      ('Pedro Salas', 'pedro@test.com', $2, 'socio'),
      ('Lucia Vega', 'lucia@test.com', $2, 'socio'),
      ('Miguel Rios', 'miguel@test.com', $2, 'socio'),
      ('Valeria Castro', 'valeria@test.com', $2, 'socio'),
      ('Andres Silva', 'andres@test.com', $2, 'socio'),
      ('Carla Ramos', 'carla@test.com', $2, 'socio'),
      ('Jorge Mendoza', 'jorge@test.com', $2, 'socio'),
      ('Camila Diaz', 'camila@test.com', $2, 'socio'),
      ('Luis Herrera', 'lherrera@test.com', $2, 'socio'),
      ('Sofia Vargas', 'sofia@test.com', $2, 'socio'),
      ('Diego Fernandez', 'diego@test.com', $2, 'socio'),
      ('Marta Sanchez', 'marta@test.com', $2, 'socio'),
      ('Esteban Quito', 'esteban@test.com', $2, 'socio'),
      ('Rodrigo Paz', 'rodrigo@test.com', $2, 'socio'),
      ('Gabriela Rojas', 'gabriela@test.com', $2, 'socio'),
      ('Fernando Sosa', 'fernando@test.com', $2, 'socio'),
      ('Paula Gimenez', 'paula@test.com', $2, 'socio'),
      ('Santiago Lynch', 'santiago@test.com', $2, 'socio'),
      ('Tomas Aquino', 'tomas@test.com', $2, 'socio'),
      ('Victoria Vidal', 'victoria@test.com', $2, 'socio'),
      ('Isabella Suarez', 'isabella@test.com', $2, 'socio'),
      ('Joaquin Sabina', 'joaquin@test.com', $2, 'socio'),
      ('Elena Troyano', 'elena@test.com', $2, 'socio'),
      ('Mateo Kovacic', 'mateo@test.com', $2, 'socio'),
      ('Diana Prince', 'diana@test.com', $2, 'socio'),
      ('Bruce Wayne', 'bruce@test.com', $2, 'socio')
    `, [hash, hashSocio]);

    console.log('Insertando planes...');
    await client.query(`
      INSERT INTO planes (nombre, descripcion, duracion_dias, precio) VALUES 
      ('Mensual Básico', 'Acceso a máquinas y pesas', 30, 100.00),
      ('Mensual Premium', 'Acceso a máquinas, pesas y clases grupales', 30, 150.00),
      ('Anual VIP', 'Acceso total y beneficios exclusivos', 365, 1200.00)
    `);

    console.log('Insertando socios...');
    await client.query(`
      INSERT INTO socios (nombre, apellido, dni, email, telefono, estado) VALUES 
      ('Juan', 'Perez', '70000001', 'juan@test.com', '999000111', 'activo'),      
      ('Maria', 'Gomez', '70000002', 'maria@test.com', '999000222', 'activo'),      
      ('Carlos', 'Ruiz', '70000003', 'carlos@test.com', '999000333', 'activo'),     
      ('Ana', 'Torres', '70000004', 'ana@test.com', '999000444', 'inactivo'),     
      ('Pedro', 'Salas', '70000005', 'pedro@test.com', '999000555', 'activo'),      
      ('Lucia', 'Vega', '70000006', 'lucia@test.com', '999000666', 'inactivo'),     
      ('Miguel', 'Rios', '70000007', 'miguel@test.com', '999000777', 'activo'),     
      ('Valeria', 'Castro', '70000008', 'valeria@test.com', '999000888', 'activo'), 
      ('Andres', 'Silva', '70000009', 'andres@test.com', '999000999', 'activo'),    
      ('Carla', 'Ramos', '70000010', 'carla@test.com', '999001111', 'activo'),      
      ('Jorge', 'Mendoza', '70000011', 'jorge@test.com', '999002222', 'activo'),    
      ('Camila', 'Diaz', '70000012', 'camila@test.com', '999003333', 'activo'),     
      ('Luis', 'Herrera', '70000013', 'lherrera@test.com', '999004444', 'inactivo'),
      ('Sofia', 'Vargas', '70000014', 'sofia@test.com', '999005555', 'activo'),     
      ('Diego', 'Fernandez', '70000015', 'diego@test.com', '999006666', 'activo'),
      ('Marta', 'Sanchez', '70000016', 'marta@test.com', '999007777', 'activo'),
      ('Esteban', 'Quito', '70000017', 'esteban@test.com', '999008888', 'activo'),
      ('Rodrigo', 'Paz', '70000018', 'rodrigo@test.com', '999009999', 'activo'),
      ('Gabriela', 'Rojas', '70000019', 'gabriela@test.com', '999010000', 'activo'),
      ('Fernando', 'Sosa', '70000020', 'fernando@test.com', '999011111', 'activo'),
      ('Paula', 'Gimenez', '70000021', 'paula@test.com', '999012222', 'activo'),
      ('Santiago', 'Lynch', '70000022', 'santiago@test.com', '999013333', 'activo'),
      ('Tomas', 'Aquino', '70000023', 'tomas@test.com', '999014444', 'activo'),
      ('Victoria', 'Vidal', '70000024', 'victoria@test.com', '999015555', 'activo'),
      ('Isabella', 'Suarez', '70000025', 'isabella@test.com', '999016666', 'activo'),
      ('Joaquin', 'Sabina', '70000026', 'joaquin@test.com', '999017777', 'activo'),
      ('Elena', 'Troyano', '70000027', 'elena@test.com', '999018888', 'activo'),
      ('Mateo', 'Kovacic', '70000028', 'mateo@test.com', '999019999', 'activo'),
      ('Diana', 'Prince', '70000029', 'diana@test.com', '999020000', 'activo'),
      ('Bruce', 'Wayne', '70000030', 'bruce@test.com', '999021111', 'activo')
    `);

    console.log('Insertando membresías y pagos para 30 socios...');
    
    // Función auxiliar para generar membresías activas rápidamente
    const queryMem = `INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES ($1, $2, NOW() - $3::INTERVAL, NOW() + $4::INTERVAL, 'activa', $5)`;
    const queryPag = `INSERT INTO pagos (socio_id, plan_id, monto, metodo_pago) VALUES ($1, $2, $3, $4)`;

    const activasIds = [1,8,9,10,11,12,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    for (const id of activasIds) {
      const planId = id % 3 === 0 ? 3 : (id % 2 === 0 ? 2 : 1);
      const precio = planId === 3 ? 1200 : (planId === 2 ? 150 : 100);
      const diasVigencia = planId === 3 ? '300 days' : '15 days';
      const metodo = id % 2 === 0 ? 'yape' : 'tarjeta';
      await client.query(queryMem, [id, planId, '15 days', diasVigencia, precio]);
      await client.query(queryPag, [id, planId, precio, metodo]);
    }

    // CON STRIKES
    await client.query(`INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES (2, 2, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', 'activa', 150.00)`);
    await client.query(`INSERT INTO pagos (socio_id, plan_id, monto, metodo_pago) VALUES (2, 2, 150.00, 'plin')`);

    await client.query(`INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES (3, 2, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', 'activa', 150.00)`);
    await client.query(`INSERT INTO pagos (socio_id, plan_id, monto, metodo_pago) VALUES (3, 2, 150.00, 'efectivo')`);

    await client.query(`INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES (4, 2, NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', 'bloqueada', 150.00)`);
    await client.query(`INSERT INTO pagos (socio_id, plan_id, monto, metodo_pago) VALUES (4, 2, 150.00, 'yape')`);

    // POR VENCER (Jueves y Viernes)
    await client.query(`INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES (5, 1, NOW() - INTERVAL '26 days', CURRENT_DATE + INTERVAL '4 days', 'activa', 100.00)`);
    await client.query(`INSERT INTO pagos (socio_id, plan_id, monto, metodo_pago) VALUES (5, 1, 100.00, 'tarjeta')`);

    await client.query(`INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES (15, 2, NOW() - INTERVAL '25 days', CURRENT_DATE + INTERVAL '5 days', 'activa', 150.00)`);
    await client.query(`INSERT INTO pagos (socio_id, plan_id, monto, metodo_pago) VALUES (15, 2, 150.00, 'yape')`);

    // MOROSOS
    await client.query(`INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES (6, 1, NOW() - INTERVAL '33 days', CURRENT_DATE - INTERVAL '3 days', 'vencida', 100.00)`);
    await client.query(`INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES (13, 2, NOW() - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days', 'vencida', 150.00)`);

    // NUEVO
    await client.query(`INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_fin, estado, precio) VALUES (7, 2, NOW(), NOW() + INTERVAL '30 days', 'activa', 150.00)`);
    await client.query(`INSERT INTO pagos (socio_id, plan_id, monto, metodo_pago) VALUES (7, 2, 150.00, 'yape')`);

    console.log('Insertando clases con horarios realistas orientados a la semana de presentación...');
    await client.query(`
      INSERT INTO clases_grupales (tipo, nombre, instructor, fecha_hora, aforo_maximo, estado) VALUES 
      ('spinning', 'Spinning Básico', 'Luis', CURRENT_DATE + INTERVAL '1 day' + TIME '07:00:00' + INTERVAL '5 hours', 10, 'disponible'), -- 1. Lunes 7 AM
      ('crossfit', 'Crossfit WOD', 'Carlos', CURRENT_DATE + INTERVAL '1 day' + TIME '19:00:00' + INTERVAL '5 hours', 15, 'disponible'), -- 2. Lunes 7 PM
      ('yoga', 'Yoga Relax', 'Maria', CURRENT_DATE + INTERVAL '2 days' + TIME '18:00:00' + INTERVAL '5 hours', 12, 'disponible'), -- 3. Martes 6 PM
      
      ('spinning', 'Spinning Intenso', 'Luis', CURRENT_DATE + INTERVAL '3 days' + TIME '07:00:00' + INTERVAL '5 hours', 15, 'disponible'), -- 4. MIERCOLES 7 AM
      ('crossfit', 'Crossfit WOD Avanzado', 'Carlos', CURRENT_DATE + INTERVAL '3 days' + TIME '18:00:00' + INTERVAL '5 hours', 12, 'disponible'), -- 5. MIERCOLES 6 PM
      ('zumba', 'Zumba Party', 'Ana', CURRENT_DATE + INTERVAL '3 days' + TIME '20:00:00' + INTERVAL '5 hours', 20, 'disponible'), -- 6. MIERCOLES 8 PM
      
      ('yoga', 'Yoga Inicial', 'Maria', CURRENT_DATE + INTERVAL '4 days' + TIME '08:00:00' + INTERVAL '5 hours', 15, 'disponible'), -- 7. Jueves 8 AM
      ('spinning', 'Spinning Endurance', 'Luis', CURRENT_DATE + INTERVAL '4 days' + TIME '19:00:00' + INTERVAL '5 hours', 15, 'disponible') -- 8. Jueves 7 PM
    `);

    console.log('Insertando reservas y penalizaciones...');
    // Maria (1 strike)
    await client.query(`INSERT INTO reservas (socio_id, clase_id, estado) VALUES (2, 3, 'inasistencia')`);
    await client.query(`INSERT INTO penalizaciones (socio_id, reserva_id, justificada) VALUES (2, 1, false)`);

    // Carlos (2 strikes)
    await client.query(`INSERT INTO reservas (socio_id, clase_id, estado) VALUES (3, 2, 'inasistencia'), (3, 3, 'inasistencia')`);
    await client.query(`INSERT INTO penalizaciones (socio_id, reserva_id, justificada) VALUES (3, 2, false), (3, 3, false)`);

    // Ana (3 strikes)
    await client.query(`INSERT INTO reservas (socio_id, clase_id, estado) VALUES (4, 1, 'inasistencia'), (4, 2, 'inasistencia'), (4, 3, 'inasistencia')`);
    await client.query(`INSERT INTO penalizaciones (socio_id, reserva_id, justificada) VALUES (4, 4, false), (4, 5, false), (4, 6, false)`);
    await client.query(`INSERT INTO penalizaciones_bloqueo (socio_id, bloqueado_hasta) VALUES (4, NOW() + INTERVAL '15 days')`);

    // Reservas para el día de la presentación (Miércoles)
    await client.query(`INSERT INTO reservas (socio_id, clase_id, estado) VALUES (1, 5, 'confirmada'), (8, 5, 'confirmada'), (10, 5, 'confirmada'), (16, 5, 'confirmada'), (17, 5, 'confirmada')`); 
    await client.query(`INSERT INTO reservas (socio_id, clase_id, estado) VALUES (9, 6, 'confirmada'), (11, 6, 'confirmada'), (14, 6, 'confirmada'), (18, 6, 'confirmada'), (19, 6, 'confirmada'), (20, 6, 'confirmada')`); 
    await client.query(`INSERT INTO reservas (socio_id, clase_id, estado) VALUES (7, 4, 'confirmada'), (21, 4, 'confirmada'), (22, 4, 'confirmada')`); 

    await client.query('COMMIT');
    console.log('✅ Nueva semilla ejecutada con éxito (30 Socios). Base de datos lista.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error ejecutando semilla:', error);
  } finally {
    client.release();
    pool.end();
  }
}

runSeed();
