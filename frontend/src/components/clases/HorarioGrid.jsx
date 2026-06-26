/* ── HorarioGrid.jsx ────────────────────────────────────────
   Vista semanal compacta de clases (opcional, decorativa).
   Muestra días de la semana con sus clases en tarjetas pequeñas.
──────────────────────────────────────────────────────────── */

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getDayIndex(fechaHora) {
  const d = new Date(fechaHora).getDay(); // 0 = Domingo
  return d === 0 ? 6 : d - 1;            // Convertir a lun=0 … dom=6
}

export default function HorarioGrid({ clases }) {
  // Agrupar por día de semana
  const grid = DAYS.map(() => []);
  clases.forEach(c => {
    const fStr = c.fecha_hora || c.fechaHora;
    const idx = getDayIndex(fStr);
    grid[idx].push(c);
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
      {DAYS.map((day, i) => (
        <div key={day}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
            textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '0.4rem',
          }}>
            {day}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {grid[i].length === 0 ? (
              <div style={{
                height: 40, borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)', border: '1px dashed var(--border)',
              }} />
            ) : grid[i].map(c => {
              const aforoDisponible = c.aforo_disponible !== undefined ? c.aforo_disponible : c.aforoDisponible;
              const fStr = c.fecha_hora || c.fechaHora;
              const isLlena = aforoDisponible === 0;

              return (
                <div key={c.id} style={{
                  padding: '0.3rem 0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  background: c.estado === 'cancelada'
                    ? 'var(--danger-light)'
                    : isLlena
                      ? 'var(--warning-light)'
                      : 'var(--accent-light)',
                  fontSize: '0.67rem',
                  fontWeight: 600,
                  color: c.estado === 'cancelada' ? 'var(--danger)' : isLlena ? 'var(--warning)' : 'var(--accent)',
                  lineHeight: 1.3,
                }}>
                  <div>{new Date(fStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div style={{ fontWeight: 400, opacity: 0.85 }}>{c.nombre}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
