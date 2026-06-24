/* ── ReservaCard.jsx ────────────────────────────────────────
   Tarjeta que muestra una reserva individual del socio.
──────────────────────────────────────────────────────────── */
const ESTADO_CONFIG = {
  confirmada:   { badge: 'badge-accent',   label: 'Confirmada',   emoji: '✅' },
  cancelada:    { badge: 'badge-neutral',  label: 'Cancelada',    emoji: '❌' },
  asistio:      { badge: 'badge-success',  label: 'Asistió',      emoji: '🏆' },
  inasistencia: { badge: 'badge-danger',   label: 'Inasistencia', emoji: '⚠️' },
};

export default function ReservaCard({ reserva, onCancelar }) {
  const config   = ESTADO_CONFIG[reserva.estado] ?? ESTADO_CONFIG.confirmada;
  const pasada   = new Date(reserva.claseHora) < new Date();
  const cancelable = reserva.estado === 'confirmada' && !pasada;

  const fechaHora = new Date(reserva.claseHora);
  const fecha = fechaHora.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' });
  const hora  = fechaHora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', gap: '1rem' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
          {config.emoji} {reserva.claseNombre ?? 'Clase'}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          📅 {fecha} • ⏰ {hora}
        </div>
        {reserva.socioNombre && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            👤 {reserva.socioNombre}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
        <span className={`badge ${config.badge}`}>{config.label}</span>
        {cancelable && (
          <button className="btn btn-danger btn-sm" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} onClick={() => onCancelar?.(reserva)}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
