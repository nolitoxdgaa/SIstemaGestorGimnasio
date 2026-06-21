const { query } = require('../config/database');
const Pago = require('../models/Pago');
const Membresia = require('../models/Membresia');

/**
 * Genera el resumen del dashboard para el administrador.
 * Implementa RN-08: ingresos diarios, membresías por vencer (3 días), ocupación de clases.
 */
const obtenerResumen = async () => {
  const [ingresosDiarios, porVencer, ocupacionClases, totalSociosActivos] = await Promise.all([
    // Ingresos del día
    Pago.totalIngresosHoy(),

    // Membresías que vencen en los próximos 3 días
    Membresia.findAll({ venceEn: 3, estado: 'activa' }),

    // Ocupación de clases de hoy
    query(
      `SELECT cg.id AS clase_id, cg.nombre, cg.aforo_maximo,
              COUNT(r.id) FILTER (WHERE r.estado = 'confirmada') AS aforo_ocupado
       FROM clases_grupales cg
       LEFT JOIN reservas r ON r.clase_id = cg.id
       WHERE DATE(cg.fecha_hora) = CURRENT_DATE AND cg.estado != 'cancelada'
       GROUP BY cg.id, cg.nombre, cg.aforo_maximo
       ORDER BY cg.fecha_hora ASC`
    ),

    // Total de socios activos
    query("SELECT COUNT(*) FROM socios WHERE estado = 'activo'"),
  ]);

  const clasesConPorcentaje = ocupacionClases.rows.map((c) => ({
    claseId: c.clase_id,
    nombre: c.nombre,
    aforoMaximo: c.aforo_maximo,
    aforoOcupado: parseInt(c.aforo_ocupado || 0),
    porcentaje: c.aforo_maximo > 0
      ? Math.round((parseInt(c.aforo_ocupado || 0) / c.aforo_maximo) * 100)
      : 0,
  }));

  return {
    ingresosDiarios: {
      monto: parseFloat(ingresosDiarios.total || 0),
      cantidadPagos: parseInt(ingresosDiarios.cantidad || 0),
      fecha: new Date().toISOString().split('T')[0],
    },
    membresiasPorVencer: {
      cantidad: porVencer.length,
      socios: porVencer.map((m) => ({
        id: m.socio_id,
        fechaFin: m.fecha_fin,
      })),
    },
    ocupacionClases: { hoy: clasesConPorcentaje },
    totalSociosActivos: parseInt(totalSociosActivos.rows[0].count),
    actualizadoEn: new Date().toISOString(),
  };
};

module.exports = { obtenerResumen };
