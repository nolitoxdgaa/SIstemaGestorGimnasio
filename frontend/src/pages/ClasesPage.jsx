/* ── ClasesPage.jsx ─────────────────────────────────────────
   Módulo 4 (Int.4): Vista de clases grupales.
   - Admin/Recepcionista: ve todas, puede crear/editar/cancelar
   - Entrenador/Socio: ve y puede reservar
──────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback } from 'react';
import { clasesService }   from '../services/clases.service';
import { reservasService } from '../services/reservas.service';
import { useAuth }         from '../context/AuthContext';
import Navbar              from '../components/common/Navbar';
import LoadingSpinner      from '../components/common/LoadingSpinner';
import ClaseList           from '../components/clases/ClaseList';
import ClaseForm           from '../components/clases/ClaseForm';
import ReservaModal        from '../components/reservas/ReservaModal';
import CancelacionModal    from '../components/reservas/CancelacionModal';

export default function ClasesPage() {
  const { usuario } = useAuth();
  const esAdmin     = usuario?.rol === 'administrador';
  const esSocio     = usuario?.rol === 'socio';

  const [clases,      setClases]      = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);

  // Filtros
  const [filtroTipo,  setFiltroTipo]  = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [soloDisp,    setSoloDisp]    = useState(false);

  // Modales
  const [modalForm,      setModalForm]      = useState(false);
  const [editando,       setEditando]       = useState(null);
  const [modalReserva,   setModalReserva]   = useState(null); // clase a reservar
  const [modalCancelar,  setModalCancelar]  = useState(null); // reserva a cancelar

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  const cargarClases = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroTipo)  params.tipo       = filtroTipo;
      if (filtroFecha) params.fecha      = filtroFecha;
      if (soloDisp)    params.disponibles = 'true';
      const { data } = await clasesService.getAll({ params });
      setClases(data.data.clases ?? []);
    } catch {
      showToast('Error al cargar las clases.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroTipo, filtroFecha, soloDisp]);

  const cargarMisReservas = useCallback(async () => {
    if (!esSocio && usuario?.rol !== 'entrenador') return;
    try {
      const { data } = await reservasService.getAll({ params: { socioId: usuario.id } });
      setMisReservas(data.data.reservas ?? []);
    } catch { /* silencioso */ }
  }, [esSocio, usuario]);

  useEffect(() => {
    cargarClases();
    cargarMisReservas();
  }, [cargarClases, cargarMisReservas]);

  const handleCancelarClase = async (claseId) => {
    if (!window.confirm('¿Cancelar esta clase? Se notificará a los inscritos.')) return;
    try {
      await clasesService.cancel(claseId);
      showToast('Clase cancelada.');
      cargarClases();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Error al cancelar la clase.', 'error');
    }
  };

  // Reserva rápida (para socios sin modal si ya tiene reserva)
  const handleReservar = (clase) => setModalReserva(clase);
  const handleCancelarReserva = (reservaId) => {
    const r = misReservas.find(r => r.id === reservaId);
    setModalCancelar(r ?? { id: reservaId });
  };

  return (
    <div className="main-content">
      <Navbar title="Clases Grupales" subtitle="Reserva tu próxima sesión" />
      <div className="page-container">

        {/* Toast */}
        {toast && (
          <div className="notif-container">
            <div className={`notif-toast ${toast.tipo}`}>
              <span>{toast.tipo === 'success' ? '✅' : '❌'}</span>
              <span className="notif-msg">{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <select
              className="form-select"
              style={{ width: 150 }}
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="spinning">🚴 Spinning</option>
              <option value="crossfit">🏋️ CrossFit</option>
              <option value="yoga">🧘 Yoga</option>
              <option value="zumba">💃 Zumba</option>
            </select>
            <input
              type="date"
              className="form-input"
              style={{ width: 180 }}
              value={filtroFecha}
              onChange={e => setFiltroFecha(e.target.value)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={soloDisp} onChange={e => setSoloDisp(e.target.checked)} />
              Solo con cupos
            </label>
          </div>
          <div className="toolbar-right">
            {esAdmin && (
              <button className="btn btn-primary btn-sm" onClick={() => { setEditando(null); setModalForm(true); }}>
                ➕ Nueva clase
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={cargarClases}>↻ Actualizar</button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <ClaseList
            clases={clases}
            misReservas={misReservas}
            onReservar={esSocio ? handleReservar : undefined}
            onCancelar={esSocio ? handleCancelarReserva : undefined}
            cargando={false}
          />
        )}
      </div>

      {/* Modales */}
      {modalForm && (
        <ClaseForm
          clase={editando}
          onSuccess={() => { setModalForm(false); setEditando(null); cargarClases(); showToast(editando ? 'Clase actualizada.' : 'Clase creada.'); }}
          onCancel={() => { setModalForm(false); setEditando(null); }}
        />
      )}
      {modalReserva && (
        <ReservaModal
          clase={modalReserva}
          onClose={() => setModalReserva(null)}
          onSuccess={() => { cargarMisReservas(); cargarClases(); showToast('Reserva confirmada.'); setModalReserva(null); }}
        />
      )}
      {modalCancelar && (
        <CancelacionModal
          reserva={modalCancelar}
          onClose={() => setModalCancelar(null)}
          onSuccess={() => { cargarMisReservas(); cargarClases(); showToast('Reserva cancelada.'); setModalCancelar(null); }}
        />
      )}
    </div>
  );
}
