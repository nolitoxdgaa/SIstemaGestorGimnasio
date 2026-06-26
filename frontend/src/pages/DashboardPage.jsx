import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { reservasService } from '../services/reservas.service';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

const StatCard = ({ icon, label, value, sub, accentColor }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${accentColor}22`, color: accentColor }}>
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
    </div>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-sm" style={{ padding: '0.5rem 0.875rem', minWidth: 120 }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{payload[0]?.payload?.nombre}</div>
      <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{payload[0]?.value}% ocupado</div>
    </div>
  );
};

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [datos, setDatos]       = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await dashboardService.getResumen();
      setDatos(data.data);
    } catch {
      setError('No se pudo cargar el dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarSocio = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await reservasService.getAll({ params: { socioId: usuario.id } });
      setReservas(data.data.reservas ?? []);
    } catch (err) {
      console.error('Error al cargar reservas del socio:', err);
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    if (usuario?.rol === 'socio') {
      cargarSocio();
    } else {
      cargar();
    }
  }, [usuario, cargar, cargarSocio]);

  if (loading) return (
    <div className="app-layout">
      <div className="main-content"><LoadingSpinner /></div>
    </div>
  );

  if (usuario?.rol === 'socio') {
    const membresia = usuario?.membresia;
    const diasRestantes = membresia?.fechaFin
      ? Math.max(0, Math.ceil((new Date(membresia.fechaFin) - new Date()) / 86400000))
      : null;

    const proximas = reservas.filter(
      (r) => r.estado === 'confirmada' && new Date(r.clase_hora || r.claseHora) >= new Date()
    );

    return (
      <>
        <Navbar title="Dashboard" subtitle={`¡Hola, ${usuario?.nombre}!`} />
        <div className="main-content">
          <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h1>Mi Panel</h1>
                <p>{new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={cargarSocio}>↻ Actualizar</button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <Link id="qa-qr" to="/mi-perfil" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ fontSize: '2rem', background: 'rgba(var(--accent-rgb), 0.1)', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>🪪</div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Mi Código QR</h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Acceso al gimnasio</p>
                </div>
              </Link>

              <Link id="qa-reserve" to="/clases" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ fontSize: '2rem', background: 'rgba(var(--success-rgb), 0.1)', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>🏋️</div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Reservar Clase</h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ver clases disponibles</p>
                </div>
              </Link>

              <Link id="qa-bookings" to="/mis-reservas" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ fontSize: '2rem', background: 'rgba(var(--info-rgb), 0.1)', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>📅</div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Mis Reservas</h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Historial y próximas</p>
                </div>
              </Link>
            </div>

            <div className="grid-2">
              {/* Membresía card */}
              <div className="card">
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ marginBottom: '0.2rem' }}>Estado de membresía</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Información sobre tu plan activo</p>
                </div>
                {membresia ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Plan</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{membresia.planNombre}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Estado</span>
                      <span className={`badge ${membresia.estado === 'activa' ? 'badge-success' : 'badge-danger'}`}>
                        {membresia.estado}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fecha de vencimiento</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(membresia.fechaFin).toLocaleDateString('es-PE')}</span>
                    </div>
                    {diasRestantes !== null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
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
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <div className="empty-icon">⚠️</div>
                    <div className="empty-title">Sin membresía activa</div>
                    <div className="empty-desc">Para poder reservar clases grupales, por favor acércate a recepción y adquiere un plan.</div>
                  </div>
                )}
              </div>

              {/* Próximas reservas card */}
              <div className="card">
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ marginBottom: '0.2rem' }}>Mis próximas clases</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clases agendadas para los siguientes días</p>
                </div>
                {proximas.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                    <div className="empty-icon">📅</div>
                    <div className="empty-title">No tienes reservas programadas</div>
                    <div className="empty-desc">Revisa el horario para ver las clases de spinning y crossfit disponibles hoy.</div>
                    <Link to="/clases" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', textDecoration: 'none' }}>Ver Horarios</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {proximas.slice(0, 4).map((r) => (
                      <div key={r.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.75rem 1rem', background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius)', border: '1px solid var(--border-card)',
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{r.clase_nombre || r.claseNombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {new Date(r.clase_hora || r.claseHora).toLocaleString('es-PE', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{r.instructor}</span>
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

  return (
    <>
      <Navbar title="Dashboard" />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1>Resumen del día</h1>
              <p>{new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={cargar}>↻ Actualizar</button>
          </div>

          {error && <div className="alert alert-danger mb-2">{error}</div>}

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <StatCard icon="💰" label="Ingresos hoy"
              value={`S/ ${datos?.ingresosDiarios?.monto?.toLocaleString('es-PE', { minimumFractionDigits: 2 }) ?? '0.00'}`}
              sub={`${datos?.ingresosDiarios?.cantidadPagos ?? 0} pagos registrados`}
              accentColor="var(--success)" />
            <StatCard icon="👥" label="Socios activos"
              value={datos?.totalSociosActivos ?? '—'}
              sub="En el sistema"
              accentColor="var(--accent)" />
            <StatCard icon="⚠️" label="Vencen en 3 días"
              value={datos?.membresiasPorVencer?.cantidad ?? 0}
              sub="Requieren renovación"
              accentColor="var(--warning)" />
            <StatCard icon="🏋️" label="Clases hoy"
              value={datos?.ocupacionClases?.hoy?.length ?? 0}
              sub="Programadas"
              accentColor="var(--info)" />
          </div>

          <div className="grid-2">
            {/* Ocupación de clases */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.2rem' }}>Ocupación de clases</h3>
                  <p style={{ fontSize: '0.8rem' }}>Aforo en tiempo real — hoy</p>
                </div>
              </div>
              {datos?.ocupacionClases?.hoy?.length > 0 ? (
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datos.ocupacionClases.hoy} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="nombre" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="porcentaje" radius={[6, 6, 0, 0]}>
                        {datos.ocupacionClases.hoy.map((entry, i) => (
                          <Cell key={i} fill={entry.porcentaje >= 90 ? 'var(--danger)' : entry.porcentaje >= 60 ? 'var(--warning)' : 'var(--accent)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏋️</div>
                  <div className="empty-title">Sin clases programadas hoy</div>
                </div>
              )}
            </div>

            {/* Membresías por vencer */}
            <div className="card">
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ marginBottom: '0.2rem' }}>Membresías por vencer</h3>
                <p style={{ fontSize: '0.8rem' }}>Próximos 3 días — requieren atención</p>
              </div>
              {datos?.membresiasPorVencer?.cantidad > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {datos.membresiasPorVencer.socios.slice(0, 8).map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.625rem 0.875rem', background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius)', border: '1px solid var(--border-card)',
                    }}>
                      <span style={{ fontSize: '0.85rem' }}>Socio #{m.id}</span>
                      <span className="badge badge-warning">
                        Vence {new Date(m.fechaFin).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <div className="empty-title">Sin vencimientos próximos</div>
                  <div className="empty-desc">Todas las membresías están al día</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
