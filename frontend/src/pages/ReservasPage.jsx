/* ── ReservasPage.jsx ───────────────────────────────────────
   Vista Admin/Recepcionista: todas las reservas del sistema.
   Filtros por socio, clase, estado y fecha.
──────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback } from 'react';
import { reservasService } from '../services/reservas.service';
import Navbar              from '../components/common/Navbar';
import LoadingSpinner      from '../components/common/LoadingSpinner';

const ESTADO_CONFIG = {
  confirmada:   { badge: 'badge-accent',   label: 'Confirmada' },
  cancelada:    { badge: 'badge-neutral',  label: 'Cancelada' },
  asistio:      { badge: 'badge-success',  label: 'Asistió' },
  inasistencia: { badge: 'badge-danger',   label: 'Inasistencia' },
};

export default function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFecha,  setFiltroFecha]  = useState('');
  const [busqueda,     setBusqueda]     = useState('');

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroFecha)  params.fecha  = filtroFecha;
      const { data } = await reservasService.getAll({ params });
      const raw = data.data.reservas ?? [];
      const mapped = raw.map(r => ({
        ...r,
        socioNombre: r.socioNombre || (r.socio_nombre ? `${r.socio_nombre} ${r.socio_apellido || ''}`.trim() : ''),
        claseNombre: r.claseNombre || r.clase_nombre,
        claseHora:   r.claseHora || r.clase_hora,
        creadaEn:    r.creadaEn || r.creada_en || r.creado_en,
      }));
      setReservas(mapped);
    } catch {
      showToast('Error al cargar las reservas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroFecha]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleRegistrarAsistencia = async (reservaId, asistio) => {
    try {
      await reservasService.registrarAsistencia(reservaId, asistio);
      showToast(asistio ? 'Asistencia registrada.' : 'Inasistencia registrada.');
      cargar();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Error al registrar asistencia.', 'error');
    }
  };

  const reservasFiltradas = reservas.filter(r => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      r.socioNombre?.toLowerCase().includes(q) ||
      r.claseNombre?.toLowerCase().includes(q)
    );
  });

  // Stats
  const stats = reservas.reduce((acc, r) => {
    acc[r.estado] = (acc[r.estado] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="main-content">
      <Navbar title="Reservas" subtitle="Gestión de reservas del gimnasio" />
      <div className="page-container">

        {toast && (
          <div className="notif-container">
            <div className={`notif-toast ${toast.tipo}`}>
              <span>{toast.tipo === 'success' ? '✅' : '❌'}</span>
              <span className="notif-msg">{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>📋</div>
            <div><div className="stat-label">Total</div><div className="stat-value">{reservas.length}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>✅</div>
            <div><div className="stat-label">Confirmadas</div><div className="stat-value">{stats.confirmada ?? 0}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>🏆</div>
            <div><div className="stat-label">Asistencias</div><div className="stat-value">{stats.asistio ?? 0}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>⚠️</div>
            <div><div className="stat-label">Inasistencias</div><div className="stat-value">{stats.inasistencia ?? 0}</div></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-bar" style={{ width: 260 }}>
              <span className="search-icon">🔍</span>
              <input
                className="form-input"
                placeholder="Buscar socio o clase…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: 170 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="asistio">Asistió</option>
              <option value="inasistencia">Inasistencia</option>
            </select>
            <input type="date" className="form-input" style={{ width: 180 }} value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={cargar}>↻ Actualizar</button>
        </div>

        {/* Tabla */}
        {loading ? <LoadingSpinner /> : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>Clase</th>
                  <th>Fecha / Hora</th>
                  <th>Estado</th>
                  <th>Registrada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay reservas</td></tr>
                ) : reservasFiltradas.map(r => {
                  const config = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG.confirmada;
                  const claseHora = r.claseHora ? new Date(r.claseHora) : null;
                  const pasada = claseHora && claseHora < new Date();
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.socioNombre}</td>
                      <td>{r.claseNombre}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {claseHora ? claseHora.toLocaleString('es-PE') : '—'}
                      </td>
                      <td><span className={`badge ${config.badge}`}>{config.label}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {r.creadaEn ? new Date(r.creadaEn).toLocaleDateString('es-PE') : '—'}
                      </td>
                      <td>
                        {r.estado === 'confirmada' && pasada && (
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              className="btn btn-success btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => handleRegistrarAsistencia(r.id, true)}
                            >✔</button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => handleRegistrarAsistencia(r.id, false)}
                            >✕</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
