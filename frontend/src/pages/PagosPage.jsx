import { useState, useEffect, useCallback } from 'react';
import { pagoService }  from '../services/pago.service';
import { socioService } from '../services/socio.service';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const METODOS_PAGO = ['efectivo', 'yape', 'plin', 'tarjeta'];
const METODO_ICONS = { efectivo: '💵', yape: '📱', plin: '📱', tarjeta: '💳' };

export default function PagosPage() {
  const [pagos, setPagos]         = useState([]);
  const [planes, setPlanes]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formFiltro, setFormFiltro] = useState({ fechaDesde: '', fechaHasta: '', metodoPago: '' });
  const [filtrosAplicados, setFiltrosAplicados] = useState({ fechaDesde: '', fechaHasta: '', metodoPago: '' });
  const [toast, setToast]         = useState(null);

  // Form pago rápido
  const [formPago, setFormPago]   = useState({ socioId: '', planId: '', metodoPago: 'efectivo' });
  const [socioBuscado, setSocioBuscado] = useState(null);
  const [buscando, setBuscando]   = useState(false);
  const [dniBusqueda, setDniBusqueda]  = useState('');
  const [errorPago, setErrorPago] = useState('');
  const [loadingPago, setLoadingPago]  = useState(false);

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  const cargarPagos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtrosAplicados.fechaDesde) params.fechaDesde = filtrosAplicados.fechaDesde;
      if (filtrosAplicados.fechaHasta) params.fechaHasta = filtrosAplicados.fechaHasta;
      if (filtrosAplicados.metodoPago) params.metodoPago = filtrosAplicados.metodoPago;
      const { data } = await pagoService.getAll(params);
      setPagos(data.data.pagos);
    } catch { /* admin only */ }
    finally { setLoading(false); }
  }, [filtrosAplicados]);

  useEffect(() => {
    pagoService.getPlanes().then(r => setPlanes(r.data.data.planes));
    cargarPagos();
  }, [cargarPagos]);

  const buscarSocioPorDNI = async () => {
    if (!/^\d{8}$/.test(dniBusqueda)) return setErrorPago('DNI debe tener 8 dígitos.');
    setBuscando(true);
    setErrorPago('');
    try {
      const { data } = await socioService.getAll({ busqueda: dniBusqueda });
      const encontrado = data.data.socios.find(s => s.dni === dniBusqueda);
      if (encontrado) {
        setSocioBuscado(encontrado);
        setFormPago(f => ({ ...f, socioId: encontrado.id }));
      } else {
        setErrorPago('No se encontró un socio con ese DNI.');
        setSocioBuscado(null);
      }
    } catch { setErrorPago('Error al buscar socio.'); }
    finally { setBuscando(false); }
  };

  const handleSubmitPago = async (e) => {
    e.preventDefault();
    if (!formPago.socioId) return setErrorPago('Busca un socio primero.');
    if (!formPago.planId)  return setErrorPago('Selecciona un plan.');
    setLoadingPago(true);
    setErrorPago('');
    try {
      await pagoService.create({
        socioId: formPago.socioId,
        planId: parseInt(formPago.planId),
        metodoPago: formPago.metodoPago,
      });
      setMostrarForm(false);
      setSocioBuscado(null);
      setDniBusqueda('');
      setFormPago({ socioId: '', planId: '', metodoPago: 'efectivo' });
      cargarPagos();
      showToast('Pago registrado y membresía activada.');
    } catch (err) {
      setErrorPago(err.response?.data?.message ?? 'Error al registrar el pago.');
    } finally {
      setLoadingPago(false);
    }
  };

  const planSeleccionado = planes.find(p => p.id === parseInt(formPago.planId));
  const totalPagos = pagos.reduce((s, p) => s + parseFloat(p.monto || 0), 0);

  return (
    <>
      <Navbar title="Pagos" />
      {toast && (
        <div className="notif-container">
          <div className={`notif-toast ${toast.tipo}`}>
            <span>{toast.tipo === 'success' ? '✅' : '❌'}</span>
            <span className="notif-msg">{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>Gestión de Pagos</h1>
            <p>Registra pagos y activa membresías en una sola operación</p>
          </div>

          {/* Stat rápida */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div className="stat-card" style={{ flex: '1 1 200px' }}>
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>💰</div>
              <div className="stat-info">
                <div className="stat-label">Total mostrado</div>
                <div className="stat-value">S/ {totalPagos.toFixed(2)}</div>
                <div className="stat-sub">{pagos.length} transacciones</div>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {/* Filtros */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Filtrar historial</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Desde</label>
                    <input type="date" className="form-input"
                      value={formFiltro.fechaDesde} onChange={e => setFormFiltro(f => ({ ...f, fechaDesde: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hasta</label>
                    <input type="date" className="form-input"
                      value={formFiltro.fechaHasta} onChange={e => setFormFiltro(f => ({ ...f, fechaHasta: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Método de pago</label>
                  <select className="form-select" value={formFiltro.metodoPago}
                    onChange={e => setFormFiltro(f => ({ ...f, metodoPago: e.target.value }))}>
                    <option value="">Todos</option>
                    {METODOS_PAGO.map(m => <option key={m} value={m}>{METODO_ICONS[m]} {m}</option>)}
                  </select>
                </div>
                <button className="btn btn-secondary" onClick={() => setFiltrosAplicados(formFiltro)}>Aplicar filtros</button>
              </div>
            </div>

            {/* Formulario de pago rápido */}
            <div className="card" style={{ borderColor: mostrarForm ? 'var(--border-focus)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Registrar pago</h3>
                <button className={`btn ${mostrarForm ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                  onClick={() => setMostrarForm(v => !v)}>
                  {mostrarForm ? '✕ Cancelar' : '+ Nuevo pago'}
                </button>
              </div>

              {mostrarForm ? (
                <form onSubmit={handleSubmitPago} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {errorPago && <div className="alert alert-danger">{errorPago}</div>}

                  <div className="form-group">
                    <label className="form-label">Buscar socio por DNI</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="form-input" placeholder="12345678" maxLength={8}
                        value={dniBusqueda} onChange={e => setDniBusqueda(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), buscarSocioPorDNI())} />
                      <button type="button" className="btn btn-secondary" onClick={buscarSocioPorDNI} disabled={buscando}>
                        {buscando ? <div className="spinner" /> : '🔍'}
                      </button>
                    </div>
                  </div>

                  {socioBuscado && (
                    <div style={{ background: 'var(--success-light)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--success)' }}>
                        ✅ {socioBuscado.nombre} {socioBuscado.apellido}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DNI: {socioBuscado.dni}</div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Plan *</label>
                    <select className="form-select" value={formPago.planId}
                      onChange={e => setFormPago(f => ({ ...f, planId: e.target.value }))} required>
                      <option value="">Seleccionar plan...</option>
                      {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} — S/ {p.precio}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Método *</label>
                    <select className="form-select" value={formPago.metodoPago}
                      onChange={e => setFormPago(f => ({ ...f, metodoPago: e.target.value }))}>
                      {METODOS_PAGO.map(m => <option key={m} value={m}>{METODO_ICONS[m]} {m}</option>)}
                    </select>
                  </div>

                  {planSeleccionado && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--accent-light)', borderRadius: 'var(--radius)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total a cobrar</span>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
                        S/ {parseFloat(planSeleccionado.precio).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={loadingPago}>
                    {loadingPago ? <><div className="spinner" /> Procesando...</> : '✅ Confirmar pago y activar membresía'}
                  </button>
                </form>
              ) : (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-icon">💳</div>
                  <div className="empty-title">Registrar nuevo pago</div>
                  <div className="empty-desc">Busca un socio por DNI y selecciona su plan</div>
                </div>
              )}
            </div>
          </div>

          {/* Tabla historial */}
          <div className="card">
            <div style={{ marginBottom: '1rem' }}>
              <h3>Historial de pagos</h3>
            </div>
            {loading ? <LoadingSpinner /> : pagos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No hay pagos registrados</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Comprobante</th>
                      <th>Socio</th>
                      <th>Plan</th>
                      <th>Método</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                      <th>Registrado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map(p => (
                      <tr key={p.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.comprobante ?? `#${p.id}`}</span></td>
                        <td><div style={{ fontWeight: 600 }}>{p.socio_nombre} {p.socio_apellido}</div></td>
                        <td>{p.plan_nombre}</td>
                        <td><span className="badge badge-neutral">{METODO_ICONS[p.metodo_pago]} {p.metodo_pago}</span></td>
                        <td><span style={{ fontWeight: 700, color: 'var(--success)' }}>S/ {parseFloat(p.monto).toFixed(2)}</span></td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(p.creado_en).toLocaleString('es-PE')}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.registrado_por_nombre ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
