/* ── ReservaModal.jsx ───────────────────────────────────────
   Modal de confirmación antes de reservar una clase.
──────────────────────────────────────────────────────────── */
import { useState } from 'react';
import { reservasService } from '../../services/reservas.service';
import { useAuth } from '../../context/AuthContext';

export default function ReservaModal({ clase, onClose, onSuccess }) {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const fechaHora = new Date(clase.fechaHora);
  const fecha = fechaHora.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hora  = fechaHora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const handleConfirmar = async () => {
    setLoading(true);
    setError('');
    try {
      await reservasService.create({ socioId: usuario.id, claseId: clase.id });
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Error al registrar la reserva.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3 className="modal-title">🏋️ Confirmar reserva</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{clase.nombre}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>📅 {fecha}</div>
              <div>⏰ {hora} • ⏱ {clase.duracionMinutos} min</div>
              <div>🎓 {clase.instructor}</div>
              <div>👥 {clase.aforoDisponible} cupos disponibles</div>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Recuerda que puedes cancelar hasta <strong>2 horas antes</strong> del inicio de la clase. Las inasistencias generan strikes.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" onClick={handleConfirmar} disabled={loading}>
            {loading ? 'Reservando…' : '✔ Confirmar reserva'}
          </button>
        </div>
      </div>
    </div>
  );
}
