/* ── StrikesBadge.jsx ───────────────────────────────────────
   Badge visual que muestra strikes activos del socio.
   Verde=0, Amarillo=1-2, Rojo=3+/bloqueado
──────────────────────────────────────────────────────────── */
export default function StrikesBadge({ strikes = 0, bloqueado = false, bloqueadoHasta = null }) {
  const max = 3;

  let color, label;
  if (bloqueado) {
    color = 'danger';
    label = `Bloqueado`;
  } else if (strikes === 0) {
    color = 'success';
    label = 'Sin strikes';
  } else if (strikes < max) {
    color = 'warning';
    label = `${strikes}/${max} strikes`;
  } else {
    color = 'danger';
    label = `${strikes}/${max} strikes`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className={`badge badge-${color}`}>
          {bloqueado ? '🔒' : strikes === 0 ? '✅' : '⚠️'} {label}
        </span>
      </div>
      {/* Bolitas de strikes */}
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < strikes ? (bloqueado || strikes >= max ? 'var(--danger)' : 'var(--warning)') : 'var(--border)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      {bloqueado && bloqueadoHasta && (
        <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
          Desbloqueado el {new Date(bloqueadoHasta).toLocaleDateString('es-PE')}
        </div>
      )}
    </div>
  );
}
