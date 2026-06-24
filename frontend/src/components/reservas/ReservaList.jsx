/* ── ReservaList.jsx ────────────────────────────────────────
   Lista de reservas con estado vacío.
──────────────────────────────────────────────────────────── */
import ReservaCard from './ReservaCard';

export default function ReservaList({ reservas = [], onCancelar }) {
  if (!reservas.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <div className="empty-title">No hay reservas</div>
        <div className="empty-desc">Aún no tienes reservas registradas</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {reservas.map(r => (
        <ReservaCard key={r.id} reserva={r} onCancelar={onCancelar} />
      ))}
    </div>
  );
}
