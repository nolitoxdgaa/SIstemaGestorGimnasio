import { useState, useEffect, useCallback } from 'react';
import { socioService } from '../services/socio.service';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function MembresiasPage() {
  const [socios, setSocios]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState('activa');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await socioService.getAll({ estado: 'activo', limite: 1000 });
      setSocios(data.data.socios ?? []);
    } catch { /* handler */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const hoy = new Date();
  const en3 = new Date(); en3.setDate(en3.getDate() + 3);

  const sociosFiltrados = socios.filter(s => {
    if (!s.fecha_fin) return filtro === 'sin_membresia';
    const fechaFin = new Date(s.fecha_fin);
    if (filtro === 'activa')    return fechaFin >= hoy && s.membresia_estado === 'activa';
    if (filtro === 'por_vencer') return fechaFin >= hoy && fechaFin <= en3;
    if (filtro === 'vencida')   return s.membresia_estado === 'vencida' || fechaFin < hoy;
    return true;
  });

  const counts = {
    activa:      socios.filter(s => s.membresia_estado === 'activa' && new Date(s.fecha_fin) >= hoy).length,
    por_vencer:  socios.filter(s => { const f = new Date(s.fecha_fin); return f >= hoy && f <= en3; }).length,
    vencida:     socios.filter(s => s.membresia_estado === 'vencida' || (s.fecha_fin && new Date(s.fecha_fin) < hoy)).length,
  };

  return (
    <>
      <Navbar title="Membresías" />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>Estado de Membresías</h1>
            <p>Consulta y monitorea las membresías de todos los socios</p>
          </div>

          {/* Tabs filtro */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'activa',     label: '✅ Activas',       badge: counts.activa,     cls: 'badge-success' },
              { key: 'por_vencer', label: '⚠️ Por vencer (3d)', badge: counts.por_vencer, cls: 'badge-warning' },
              { key: 'vencida',    label: '❌ Vencidas',       badge: counts.vencida,    cls: 'badge-danger' },
            ].map(t => (
              <button key={t.key}
                className={`btn btn-sm ${filtro === t.key ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFiltro(t.key)}>
                {t.label}
                <span className={`badge ${t.cls}`} style={{ marginLeft: '0.25rem' }}>{t.badge}</span>
              </button>
            ))}
          </div>

          {loading ? <LoadingSpinner /> : sociosFiltrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">Sin registros en esta categoría</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Socio</th>
                    <th>DNI</th>
                    <th>Plan</th>
                    <th>Inicio</th>
                    <th>Vencimiento</th>
                    <th>Días restantes</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sociosFiltrados.map(s => {
                    const fechaFin = s.fecha_fin ? new Date(s.fecha_fin) : null;
                    const diasRestantes = fechaFin
                      ? Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24))
                      : null;
                    const estadoCls = {
                      activa:    'badge-success',
                      vencida:   'badge-danger',
                      bloqueada: 'badge-warning',
                    }[s.membresia_estado] ?? 'badge-neutral';

                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div className="socio-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                              {s.nombre?.[0]}{s.apellido?.[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.nombre} {s.apellido}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.dni}</td>
                        <td>{s.plan_nombre ?? '—'}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString('es-PE') : '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {fechaFin ? fechaFin.toLocaleDateString('es-PE') : '—'}
                        </td>
                        <td>
                          {diasRestantes !== null ? (
                            <span style={{ fontWeight: 700, color: diasRestantes <= 3 ? 'var(--warning)' : diasRestantes <= 0 ? 'var(--danger)' : 'var(--success)' }}>
                              {diasRestantes > 0 ? `${diasRestantes}d` : 'Vencida'}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          <span className={`badge ${estadoCls}`}>{s.membresia_estado ?? 'sin membresía'}</span>
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
    </>
  );
}
