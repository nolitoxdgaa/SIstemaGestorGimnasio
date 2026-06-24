/* ── AforoIndicator.jsx ─────────────────────────────────────
   Barra de progreso visual del aforo de una clase.
──────────────────────────────────────────────────────────── */
export default function AforoIndicator({ disponible, maximo }) {
  if (!maximo) return null;
  const ocupados  = maximo - disponible;
  const pct       = Math.round((ocupados / maximo) * 100);
  const color     = pct >= 100 ? 'var(--danger)' : pct >= 75 ? 'var(--warning)' : 'var(--success)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Aforo</span>
        <span style={{ color }}>{disponible}/{maximo} disponibles</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-input)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}
