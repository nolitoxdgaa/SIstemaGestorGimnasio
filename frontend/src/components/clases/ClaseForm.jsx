/* ── ClaseForm.jsx ──────────────────────────────────────────
   Modal para crear/editar una clase grupal (solo admin).
──────────────────────────────────────────────────────────── */
import { useState } from 'react';
import { clasesService } from '../../services/clases.service';

const TIPOS = ['spinning', 'crossfit', 'yoga', 'zumba'];

const INITIAL = {
  tipo:             'spinning',
  nombre:           '',
  descripcion:      '',
  instructor:       '',
  fechaHora:        '',
  duracionMinutos:  60,
  aforoMaximo:      20,
};

export default function ClaseForm({ clase, onSuccess, onCancel }) {
  const editing = !!clase;
  const [form, setForm]     = useState(editing ? {
    tipo:            clase.tipo,
    nombre:          clase.nombre,
    descripcion:     clase.descripcion ?? '',
    instructor:      clase.instructor,
    fechaHora:       (clase.fecha_hora || clase.fechaHora)?.slice(0, 16) ?? '',
    duracionMinutos: clase.duracion_minutos !== undefined ? clase.duracion_minutos : clase.duracionMinutos,
    aforoMaximo:     clase.aforo_maximo !== undefined ? clase.aforo_maximo : clase.aforoMaximo,
  } : INITIAL);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.fechaHora || !form.instructor.trim()) {
      return setError('Nombre, instructor y fecha/hora son obligatorios.');
    }
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, duracionMinutos: Number(form.duracionMinutos), aforoMaximo: Number(form.aforoMaximo) };
      if (editing) {
        await clasesService.update(clase.id, payload);
      } else {
        await clasesService.create(payload);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al guardar la clase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 className="modal-title">{editing ? '✏️ Editar clase' : '➕ Nueva clase'}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre de la clase *</label>
                <input className="form-input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Spinning Intensivo" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Instructor *</label>
              <input className="form-input" value={form.instructor} onChange={e => set('instructor', e.target.value)} placeholder="Nombre del instructor" />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input className="form-input" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Descripción opcional" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha y hora *</label>
                <input type="datetime-local" className="form-input" value={form.fechaHora} onChange={e => set('fechaHora', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Duración (min)</label>
                <input type="number" className="form-input" value={form.duracionMinutos} min={15} max={180} onChange={e => set('duracionMinutos', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Aforo máximo</label>
              <input type="number" className="form-input" value={form.aforoMaximo} min={1} max={100} onChange={e => set('aforoMaximo', e.target.value)} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Guardando…' : editing ? 'Actualizar' : 'Crear clase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
