/* ── CancelacionModal.jsx ───────────────────────────────────
   Modal de confirmación para cancelar una reserva.
──────────────────────────────────────────────────────────── */
import { useState } from 'react';
import { reservasService } from '../../services/reservas.service';

export default function CancelacionModal({ reserva, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const claseHoraStr = reserva.clase_hora || reserva.claseHora;
  const claseNombreStr = reserva.clase_nombre || reserva.claseNombre;

  const fechaHora = claseHoraStr ? new Date(claseHoraStr) : null;
  const fecha = fechaHora?.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }) ?? '—';
  const hora  = fechaHora?.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) ?? '';

  const handleCancelar = async () => {
    setLoading(true);
    setError('');
    try {
      await reservasService.cancel(reserva.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Error al cancelar la reserva.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h3 className="modal-title">❌ Cancelar reserva</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ padding: '1rem', background: 'var(--danger-light)', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--danger)', marginBottom: '0.4rem' }}>
              {claseNombreStr ?? 'Clase'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              📅 {fecha} {hora && `• ⏰ ${hora}`}
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ¿Estás seguro de que quieres cancelar esta reserva? Solo puedes cancelar hasta <strong>2 horas antes</strong> del inicio. Las cancelaciones tardías cuentan como inasistencia.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Volver</button>
          <button className="btn btn-danger btn-sm" onClick={handleCancelar} disabled={loading}>
            {loading ? 'Cancelando…' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}
