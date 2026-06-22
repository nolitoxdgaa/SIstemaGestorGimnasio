import { useState, useEffect, useRef, useCallback } from 'react';
import { accesoService } from '../services/acceso.service';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MOTIVOS = {
  QR_INVALIDO:      'QR inválido o expirado',
  SOCIO_INACTIVO:   'Socio inactivo en el sistema',
  PENALIZACION_ACTIVA: 'Bloqueado por penalizaciones',
  MEMBRESIA_VENCIDA:  'Membresía vencida',
};

/* ── Resultado visual de acceso ─────────────────────────── */
function ResultadoAcceso({ resultado, onLimpiar }) {
  const permitido = resultado?.resultado === 'PERMITIDO';

  return (
    <div className={`acceso-result ${permitido ? 'allowed' : 'denied'}`}>
      <div className="acceso-result-icon">{permitido ? '✅' : '🚫'}</div>
      <div className="acceso-result-title">{permitido ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}</div>
      {resultado?.socio && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {resultado.socio.nombre} {resultado.socio.apellido}
          </div>
          {permitido && resultado.membresia && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Membresía activa — vence {new Date(resultado.membresia.fechaFin).toLocaleDateString('es-PE')}
            </div>
          )}
        </div>
      )}
      {!permitido && resultado?.motivo && (
        <div className="badge badge-danger" style={{ margin: '0 auto 0.75rem', fontSize: '0.82rem' }}>
          {MOTIVOS[resultado.motivo] ?? resultado.motivo}
        </div>
      )}
      {!permitido && resultado?.penalizacion && (
        <div style={{ fontSize: '0.82rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
          Bloqueado hasta: {new Date(resultado.penalizacion.bloqueadoHasta).toLocaleDateString('es-PE')}
        </div>
      )}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        {new Date(resultado.registradoEn).toLocaleTimeString('es-PE')}
      </div>
      <button className="btn btn-secondary btn-sm" onClick={onLimpiar}>Escanear otro</button>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────── */
export default function AccesoQRPage() {
  const [resultado, setResultado]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [logs, setLogs]             = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Input manual de token
  const [tokenManual, setTokenManual] = useState('');
  const [modoManual, setModoManual]   = useState(false);
  const inputRef = useRef(null);

  const cargarLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const { data } = await accesoService.getLogs({ limite: 20 });
      setLogs(data.data.logs);
    } catch { /* sin permisos */ }
    finally { setLoadingLogs(false); }
  }, []);

  useEffect(() => { cargarLogs(); }, [cargarLogs]);

  // Auto-focus del input cuando el modo manual está activo
  useEffect(() => {
    if (modoManual && inputRef.current) inputRef.current.focus();
  }, [modoManual]);

  const validarToken = async (token) => {
    if (!token?.trim()) return;
    setLoading(true);
    try {
      const { data } = await accesoService.validarQR(token.trim());
      setResultado(data.data);
      cargarLogs();
    } catch (err) {
      setResultado({ resultado: 'DENEGADO', motivo: 'QR_INVALIDO', registradoEn: new Date().toISOString() });
    } finally {
      setLoading(false);
      setTokenManual('');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    validarToken(tokenManual);
  };

  // Leer QR escaneado — si viene como un keydown acumulado (scanner USB/HID)
  useEffect(() => {
    if (resultado || modoManual) return;
    let buffer = '';
    let timer;
    const onKey = (e) => {
      if (e.key === 'Enter') {
        if (buffer.length > 10) validarToken(buffer);
        buffer = '';
        clearTimeout(timer);
      } else {
        buffer += e.key;
        clearTimeout(timer);
        timer = setTimeout(() => { buffer = ''; }, 300);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resultado, modoManual]);

  return (
    <>
      <Navbar title="Control de Acceso QR" />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>Control de Acceso</h1>
            <p>Escanea el QR del socio para verificar su acceso al gimnasio</p>
          </div>

          <div className="grid-2" style={{ alignItems: 'start' }}>
            {/* Panel de escaneo */}
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Verificación de acceso</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModoManual(v => !v)}>
                    {modoManual ? '📷 Modo escáner' : '⌨️ Ingresar token'}
                  </button>
                </div>

                {loading ? (
                  <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
                    <p>Verificando acceso...</p>
                  </div>
                ) : resultado ? (
                  <ResultadoAcceso resultado={resultado} onLimpiar={() => setResultado(null)} />
                ) : modoManual ? (
                  <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Token QR</label>
                      <textarea
                        ref={inputRef}
                        className="form-input"
                        rows={4}
                        placeholder="Pega aquí el token QR del socio..."
                        value={tokenManual}
                        onChange={e => setTokenManual(e.target.value)}
                        style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!tokenManual.trim()}>
                      ✅ Verificar acceso
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    {/* Visualizador de escáner */}
                    <div style={{
                      width: 200, height: 200, margin: '0 auto 1.5rem',
                      border: '2px solid var(--accent)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden',
                      boxShadow: 'var(--shadow-glow)',
                    }}>
                      {/* Scanner line animation */}
                      <div style={{
                        position: 'absolute', left: 0, right: 0, height: 2,
                        background: 'var(--accent)', opacity: 0.8,
                        animation: 'scanLine 2s ease-in-out infinite',
                        boxShadow: '0 0 8px var(--accent)',
                      }} />
                      <style>{`@keyframes scanLine { 0%,100%{top:10%} 50%{top:80%} }`}</style>
                      <span style={{ fontSize: '4rem', opacity: 0.3 }}>📷</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Apunta el escáner al código QR del socio
                    </p>
                    <p style={{ color: 'var(--text-disabled)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
                      El sistema detecta automáticamente el código
                    </p>
                  </div>
                )}
              </div>

              {/* Leyenda de motivos */}
              <div className="card card-sm">
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Motivos de denegación
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {Object.entries(MOTIVOS).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className="badge badge-danger" style={{ minWidth: 80 }}>{k.replace('_', ' ').slice(0, 8)}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Log de accesos recientes */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3>Accesos recientes</h3>
                <button className="btn btn-ghost btn-sm" onClick={cargarLogs}>↻</button>
              </div>

              {loadingLogs ? <LoadingSpinner /> : logs.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">Sin registros</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 520, overflowY: 'auto' }}>
                  {logs.map(log => (
                    <div key={log.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.75rem 0.875rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius)',
                      border: `1px solid ${log.resultado === 'PERMITIDO' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                    }}>
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                        {log.resultado === 'PERMITIDO' ? '✅' : '🚫'}
                      </span>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.socio_nombre} {log.socio_apellido}
                        </div>
                        {log.motivo && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>
                            {MOTIVOS[log.motivo] ?? log.motivo}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                        {new Date(log.registrado_en).toLocaleTimeString('es-PE')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
