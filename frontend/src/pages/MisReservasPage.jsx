/* ── MisReservasPage.jsx ────────────────────────────────────
   Vista del socio: sus reservas + historial + cancelación.
──────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback } from 'react';
import { reservasService } from '../services/reservas.service';
import { useAuth }         from '../context/AuthContext';
import Navbar              from '../components/common/Navbar';
import LoadingSpinner      from '../components/common/LoadingSpinner';
import ReservaList         from '../components/reservas/ReservaList';
import CancelacionModal    from '../components/reservas/CancelacionModal';

const TABS = ['Próximas', 'Historial'];

export default function MisReservasPage() {
  const { usuario } = useAuth();

  const [reservas,     setReservas]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);
  const [tab,          setTab]          = useState(0);
  const [modalCancelar, setModalCancelar] = useState(null);

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reservasService.getAll({ params: { socioId: usuario.id } });
      setReservas(data.data.reservas ?? []);
    } catch {
      showToast('Error al cargar tus reservas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [usuario.id]);

  useEffect(() => { cargar(); }, [cargar]);

  const ahora = new Date();
  const proximas  = reservas.filter(r => r.estado === 'confirmada' && new Date(r.clase_hora || r.claseHora) >= ahora);
  const historial = reservas.filter(r => r.estado !== 'confirmada' || new Date(r.clase_hora || r.claseHora) < ahora);

  const lista = tab === 0 ? proximas : historial;

  return (
    <div className="main-content">
      <Navbar title="Mis Reservas" subtitle="Tus clases reservadas" />
      <div className="page-container">

        {toast && (
          <div className="notif-container">
            <div className={`notif-toast ${toast.tipo}`}>
              <span>{toast.tipo === 'success' ? '✅' : '❌'}</span>
              <span className="notif-msg">{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>📅</div>
            <div>
              <div className="stat-label">Próximas</div>
              <div className="stat-value">{proximas.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>🏆</div>
            <div>
              <div className="stat-label">Asistencias</div>
              <div className="stat-value">{reservas.filter(r => r.estado === 'asistio').length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>⚠️</div>
            <div>
              <div className="stat-label">Inasistencias</div>
              <div className="stat-value">{reservas.filter(r => r.estado === 'inasistencia').length}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: 600, paddingBottom: '0.5rem',
                color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: tab === i ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'var(--transition)',
              }}
            >
              {t} {i === 0 && proximas.length > 0 && (
                <span className="badge badge-accent" style={{ marginLeft: '0.25rem' }}>{proximas.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <ReservaList reservas={lista} onCancelar={r => setModalCancelar(r)} />
        )}
      </div>

      {modalCancelar && (
        <CancelacionModal
          reserva={modalCancelar}
          onClose={() => setModalCancelar(null)}
          onSuccess={() => { cargar(); showToast('Reserva cancelada.'); setModalCancelar(null); }}
        />
      )}
    </div>
  );
}
