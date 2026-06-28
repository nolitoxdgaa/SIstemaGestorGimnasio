/* ── ClaseCard.jsx ──────────────────────────────────────────
   Muestra información de una clase grupal con indicador de aforo
   y botón de reserva.
──────────────────────────────────────────────────────────── */
import AforoIndicator from './AforoIndicator';

const TIPO_EMOJIS = {
  spinning: '🚴',
  crossfit: '🏋️',
  yoga:     '🧘',
  zumba:    '💃',
};

export default function ClaseCard({ clase, onReservar, onCancelar, onEditar, onCancelarClase, reservaId, cargando }) {
  const aforoDisponible = clase.aforo_disponible !== undefined ? clase.aforo_disponible : clase.aforoDisponible;
  const aforoMaximo = clase.aforo_maximo !== undefined ? clase.aforo_maximo : clase.aforoMaximo;
  const duracionMinutos = clase.duracion_minutos !== undefined ? clase.duracion_minutos : clase.duracionMinutos;
  const fechaHoraStr = clase.fecha_hora || clase.fechaHora;

  const fechaHora = new Date(fechaHoraStr);
  const esPasada = fechaHora <= new Date();
  const llena    = aforoDisponible === 0;
  const cancelada = clase.estado === 'cancelada';
  const tengoReserva = !!reservaId;

  const fecha = fechaHora.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' });
  const hora  = fechaHora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{TIPO_EMOJIS[clase.tipo] ?? '🏃'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {clase.nombre}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {clase.tipo}
            </div>
          </div>
        </div>
        {cancelada ? (
          <span className="badge badge-danger">Cancelada</span>
        ) : esPasada ? (
          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>Finalizada</span>
        ) : llena ? (
          <span className="badge badge-warning">Sin cupos</span>
        ) : (
          <span className="badge badge-success">Disponible</span>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          📅 {fecha} • ⏰ {hora}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          🎓 {clase.instructor}
        </div>
        {duracionMinutos && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ⏱ {duracionMinutos} min
          </div>
        )}
      </div>

      {/* Aforo */}
      <AforoIndicator disponible={aforoDisponible} maximo={aforoMaximo} />

      {/* Acciones */}
      {!cancelada && !esPasada && (onReservar || onCancelar || onEditar || onCancelarClase) && (
        <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.5rem' }}>
          {tengoReserva && onCancelar && (
            <button
              className="btn btn-danger btn-sm w-full"
              onClick={() => onCancelar?.(reservaId)}
              disabled={cargando}
            >
              ✕ Cancelar mi reserva
            </button>
          )}
          {!tengoReserva && onReservar && (
            <button
              className="btn btn-primary btn-sm w-full"
              onClick={() => onReservar?.(clase)}
              disabled={llena || cargando}
            >
              {llena ? 'Sin cupos' : '✔ Reservar'}
            </button>
          )}
          {onEditar && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => onEditar(clase)}
              disabled={cargando}
            >
              ✏️ Editar
            </button>
          )}
          {onCancelarClase && (
            <button
              className="btn btn-danger btn-sm"
              style={{ flex: 1 }}
              onClick={() => onCancelarClase(clase.id)}
              disabled={cargando}
            >
              ✕ Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
