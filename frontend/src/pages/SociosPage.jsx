import { useState, useEffect, useCallback } from 'react';
import { socioService } from '../services/socio.service';
import { pagoService }  from '../services/pago.service';
import Navbar from '../components/common/Navbar';
import SocioCard from '../components/socio/SocioCard';
import SocioForm from '../components/socio/SocioForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

/* ── Modal QR ─────────────────────────────────────────────── */
function ModalQR({ socio, onClose }) {
  const [qr, setQr]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    socioService.getQR(socio.id)
      .then(r => setQr(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [socio.id]);

  const handleCopy = () => {
    if (qr?.token) {
      navigator.clipboard.writeText(qr.token)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error("Error al copiar token: ", err);
        });
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 380, textAlign: 'center' }}>
        <div className="modal-header">
          <h3 className="modal-title">Código QR — {socio.nombre} {socio.apellido}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="qr-container">
          {loading ? <LoadingSpinner /> : qr ? (
            <>
              <div className="qr-frame">
                <img src={qr.codigoQR} alt="QR de acceso" style={{ width: 220, height: 220 }} />
              </div>
              <p style={{ fontSize: '0.8rem' }}>
                Válido hasta: {new Date(qr.expiracion).toLocaleString('es-PE')}
              </p>
            </>
          ) : <p>No se pudo generar el QR</p>}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          {qr && (
            <>
              <button 
                onClick={handleCopy} 
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {copied ? '✓ Copiado' : '📋 Copiar Token'}
              </button>
              <a href={qr.codigoQR} download={`qr-socio-${socio.id}.png`}
                className="btn btn-primary btn-sm">
                ⬇ Descargar QR
              </a>
            </>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Pago ───────────────────────────────────────────── */
function ModalPago({ socio, onClose, onSuccess }) {
  const [planes, setPlanes] = useState([]);
  const [form, setForm]     = useState({ planId: '', metodoPago: 'efectivo' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    pagoService.getPlanes().then(r => setPlanes(r.data.data.planes));
  }, []);

  const planSeleccionado = planes.find(p => p.id === parseInt(form.planId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.planId) return setError('Selecciona un plan.');
    setLoading(true);
    setError('');
    try {
      await pagoService.create({ socioId: socio.id, planId: parseInt(form.planId), metodoPago: form.metodoPago });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al registrar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 className="modal-title">💳 Registrar Pago</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Socio</div>
              <div style={{ fontWeight: 700 }}>{socio.nombre} {socio.apellido} — DNI: {socio.dni}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Plan *</label>
              <select className="form-select" value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))} required>
                <option value="">Seleccionar plan...</option>
                {planes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — S/ {p.precio} ({p.duracion_dias} días)</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Método de pago *</label>
              <select className="form-select" value={form.metodoPago} onChange={e => setForm(f => ({ ...f, metodoPago: e.target.value }))}>
                <option value="efectivo">💵 Efectivo</option>
                <option value="yape">📱 Yape</option>
                <option value="plin">📱 Plin</option>
                <option value="tarjeta">💳 Tarjeta</option>
              </select>
            </div>

            {planSeleccionado && (
              <div style={{ background: 'var(--accent-light)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Plan</span>
                  <span style={{ fontWeight: 600 }}>{planSeleccionado.nombre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total a cobrar</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                    S/ {parseFloat(planSeleccionado.precio).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" /> Procesando...</> : '✅ Confirmar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────── */
export default function SociosPage() {
  const { usuario } = useAuth();
  const esEntrenador = usuario?.rol === 'entrenador';

  const [socios, setSocios]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [busqueda, setBusqueda]   = useState('');
  const [filtroEstado, setFiltro] = useState('');
  const [pagina, setPagina]       = useState(1);
  const LIMITE = 12;

  const [modalCrear,  setModalCrear]  = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalQR,     setModalQR]     = useState(null);
  const [modalPago,   setModalPago]   = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await socioService.getAll({
        busqueda: busqueda || undefined,
        estado: filtroEstado || undefined,
        pagina, limite: LIMITE,
      });
      setSocios(data.data.socios);
      setTotal(data.data.total);
    } catch {
      showToast('Error al cargar socios.', 'error');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroEstado, pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalPaginas = Math.ceil(total / LIMITE);

  return (
    <>
      <Navbar title="Socios" />
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
            <h1>Gestión de Socios</h1>
            <p>Registra, edita y gestiona los miembros del gimnasio</p>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-bar">
                <span className="search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input id="busqueda-socios" className="form-input" style={{ width: 280 }}
                  placeholder="Buscar por nombre o DNI..."
                  value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
              </div>
              <select id="filtro-estado" className="form-select" style={{ width: 160 }}
                value={filtroEstado} onChange={e => { setFiltro(e.target.value); setPagina(1); }}>
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
            <div className="toolbar-right">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{total} socios</span>
              {!esEntrenador && (
                <button id="btn-nuevo-socio" className="btn btn-primary" onClick={() => setModalCrear(true)}>
                  + Nuevo Socio
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          {loading ? <LoadingSpinner /> : socios.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">No se encontraron socios</div>
              <div className="empty-desc">
                {esEntrenador ? 'No hay socios registrados con estos filtros.' : 'Cambia los filtros o registra un nuevo socio'}
              </div>
              {!esEntrenador && (
                <button className="btn btn-primary" onClick={() => setModalCrear(true)}>Registrar socio</button>
              )}
            </div>
          ) : (
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              {socios.map(s => (
                <SocioCard key={s.id} socio={s}
                  onVerQR={esEntrenador ? null : () => setModalQR(s)}
                  onEditar={esEntrenador ? null : () => setModalEditar(s)}
                  onPago={esEntrenador ? null : () => setModalPago(s)} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <div className="pagination">
                <button className="pagination-btn" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`pagination-btn ${n === pagina ? 'active' : ''}`} onClick={() => setPagina(n)}>{n}</button>
                ))}
                <button className="pagination-btn" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalCrear  && <SocioForm onSuccess={() => { setModalCrear(false); cargar(); showToast('Socio registrado correctamente.'); }} onCancel={() => setModalCrear(false)} />}
      {modalEditar && <SocioForm socio={modalEditar} onSuccess={() => { setModalEditar(null); cargar(); showToast('Datos actualizados.'); }} onCancel={() => setModalEditar(null)} />}
      {modalQR     && <ModalQR socio={modalQR} onClose={() => setModalQR(null)} />}
      {modalPago   && <ModalPago socio={modalPago} onClose={() => setModalPago(null)} onSuccess={() => { cargar(); showToast('Pago registrado y membresía activada.'); }} />}
    </>
  );
}
