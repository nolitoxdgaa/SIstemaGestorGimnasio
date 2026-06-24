/* ── ClaseList.jsx ──────────────────────────────────────────
   Lista filtrable de clases. Reutilizable en ClasesPage.
──────────────────────────────────────────────────────────── */
import ClaseCard from './ClaseCard';

export default function ClaseList({ clases, misReservas = [], onReservar, onCancelar, cargando }) {
  if (!clases.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <div className="empty-title">No hay clases disponibles</div>
        <div className="empty-desc">Intenta cambiar los filtros o revisa más tarde</div>
      </div>
    );
  }

  // misReservas: array de { claseId, reservaId }
  const reservaMap = misReservas.reduce((acc, r) => {
    acc[r.claseId] = r.id;
    return acc;
  }, {});

  return (
    <div className="grid-3" style={{ alignItems: 'start' }}>
      {clases.map(clase => (
        <ClaseCard
          key={clase.id}
          clase={clase}
          reservaId={reservaMap[clase.id] ?? null}
          onReservar={onReservar}
          onCancelar={onCancelar}
          cargando={cargando}
        />
      ))}
    </div>
  );
}
