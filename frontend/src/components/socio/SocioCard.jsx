export default function SocioCard({ socio, onVerQR, onEditar, onPago }) {
  const iniciales = `${socio.nombre?.[0] ?? ''}${socio.apellido?.[0] ?? ''}`.toUpperCase();

  const estadoMembresia = socio.membresia_estado;
  const badgeClass = {
    activa:  'badge-success',
    vencida: 'badge-danger',
    bloqueada: 'badge-warning',
  }[estadoMembresia] ?? 'badge-neutral';

  const strikes = socio.strikes ?? 0;

  return (
    <div className="socio-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="socio-avatar">{iniciales}</div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div className="socio-name truncate">{socio.nombre} {socio.apellido}</div>
          <div className="socio-meta">DNI: {socio.dni}</div>
        </div>
        {estadoMembresia && (
          <span className={`badge ${badgeClass}`}>{estadoMembresia}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {socio.plan_nombre && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Plan</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{socio.plan_nombre}</span>
          </div>
        )}
        {socio.fecha_fin && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Vence</span>
            <span style={{ fontSize: '0.8rem' }}>
              {new Date(socio.fecha_fin).toLocaleDateString('es-PE')}
            </span>
          </div>
        )}
        {strikes > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Strikes</span>
            <span className={`badge ${strikes >= 3 ? 'badge-danger' : 'badge-warning'}`}>
              {strikes}/3
            </span>
          </div>
        )}
        {socio.email && (
          <div className="socio-meta truncate">{socio.email}</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        {onPago && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onPago(socio)}>
            💳 Pago
          </button>
        )}
        {onVerQR && (
          <button className="btn btn-secondary btn-sm" onClick={() => onVerQR(socio)}>
            QR
          </button>
        )}
        {onEditar && (
          <button className="btn btn-ghost btn-sm" onClick={() => onEditar(socio)}>
            ✏️
          </button>
        )}
      </div>
    </div>
  );
}
