import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
  const [datos, setDatos]       = useState(null);
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

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return (
    <div className="app-layout">
      <div className="main-content"><LoadingSpinner /></div>
    </div>
  );

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
