/* ── MiPerfilPage.jsx ───────────────────────────────────────
   Vista del SOCIO: su QR de acceso, membresía activa y strikes.
──────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback } from 'react';
import { socioService }    from '../services/socio.service';
import { reservasService } from '../services/reservas.service';
import { useAuth }         from '../context/AuthContext';
import Navbar              from '../components/common/Navbar';
import LoadingSpinner      from '../components/common/LoadingSpinner';
import StrikesBadge        from '../components/reservas/StrikesBadge';

export default function MiPerfilPage() {
  const { usuario } = useAuth();

  const [qr,       setQr]       = useState(null);
  const [strikes,  setStrikes]  = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [copied,   setCopied]   = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [qrRes, stRes, rRes] = await Promise.allSettled([
        socioService.getQR(usuario.id),
        fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'}/socios/${usuario.id}/strikes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('olympus_token')}` },
        }).then(r => r.json()),
        reservasService.getAll({ params: { socioId: usuario.id } }),
      ]);

      if (qrRes.status === 'fulfilled')  setQr(qrRes.value.data.data);
      if (stRes.status === 'fulfilled' && stRes.value.success) setStrikes(stRes.value.data);
      if (rRes.status === 'fulfilled')   setReservas(rRes.value.data.data.reservas ?? []);
    } finally {
      setLoading(false);
    }
  }, [usuario.id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleCopy = () => {
    if (qr?.token) {
      navigator.clipboard.writeText(qr.token).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const membresia = usuario?.membresia;
  const diasRestantes = membresia?.fechaFin
    ? Math.max(0, Math.ceil((new Date(membresia.fechaFin) - new Date()) / 86400000))
    : null;

  const proximas = reservas.filter(r => r.estado === 'confirmada' && new Date(r.clase_hora || r.claseHora) >= new Date());

  if (loading) return <div className="main-content"><Navbar title="Mi Perfil" /><LoadingSpinner /></div>;

  return (
    <div className="main-content">
      <Navbar title="Mi Perfil" subtitle={`Bienvenido, ${usuario?.nombre}`} />
      <div className="page-container">
        <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>

          {/* Col izquierda: QR + membresía */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Tarjeta QR */}
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🪪 Mi código QR de acceso</h3>
              {qr ? (
                <>
                  <div className="qr-frame" style={{ margin: '0 auto 1rem', display: 'inline-block' }}>
                    <img src={qr.codigoQR} alt="Mi QR" style={{ width: 200, height: 200 }} />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Válido hasta: {new Date(qr.expiracion).toLocaleString('es-PE')}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                      {copied ? '✓ Copiado' : '📋 Copiar Token'}
                    </button>
                    <a href={qr.codigoQR} download={`mi-qr.png`} className="btn btn-primary btn-sm">
                      ⬇ Descargar QR
                    </a>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No se pudo cargar el QR</p>
              )}
            </div>

            {/* Membresía */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🏅 Mi membresía</h3>
              {membresia ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Plan</span>
                    <span style={{ fontWeight: 600 }}>{membresia.planNombre}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Estado</span>
                    <span className={`badge ${membresia.estado === 'activa' ? 'badge-success' : 'badge-danger'}`}>
                      {membresia.estado}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Vence</span>
                    <span style={{ fontWeight: 600 }}>
                      {new Date(membresia.fechaFin).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                  {diasRestantes !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Días restantes</span>
                      <span style={{
                        fontWeight: 700,
                        color: diasRestantes > 3 ? 'var(--success)' : diasRestantes > 0 ? 'var(--warning)' : 'var(--danger)',
                      }}>
                        {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencida'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tienes membresía activa. Acércate a recepción para renovar.</p>
              )}
            </div>
          </div>

          {/* Col derecha: Strikes + próximas reservas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Strikes */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>⚠️ Mis strikes</h3>
              {strikes ? (
                <>
                  <StrikesBadge
                    strikes={strikes.strikesActivos}
                    bloqueado={strikes.bloqueado}
                    bloqueadoHasta={strikes.bloqueadoHasta}
                  />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    3 inasistencias en 30 días generan un bloqueo de 7 días para reservar clases.
                  </p>
                  {strikes.historial?.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Últimas inasistencias
                      </div>
                      {strikes.historial.slice(0, 3).map(h => (
                        <div key={h.id} style={{
                          fontSize: '0.78rem', color: 'var(--text-secondary)',
                          padding: '0.3rem 0', borderBottom: '1px solid var(--border-card)',
                        }}>
                          {h.claseNombre} — {new Date(h.fecha).toLocaleDateString('es-PE')}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin información de strikes.</p>
              )}
            </div>

            {/* Próximas reservas */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📅 Mis próximas clases</h3>
              {proximas.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tienes clases reservadas. Ve a <a href="/clases" style={{ color: 'var(--accent)' }}>Clases</a> para reservar.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {proximas.slice(0, 5).map(r => (
                    <div key={r.id} style={{
                      padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.claseNombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(r.claseHora).toLocaleString('es-PE')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
