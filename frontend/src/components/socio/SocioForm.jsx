import { useState, useEffect } from 'react';
import { socioService } from '../../services/socio.service';

const INIT = {
  nombre: '', apellido: '', dni: '', email: '',
  telefono: '', fechaNacimiento: '',
};

export default function SocioForm({ socio = null, onSuccess, onCancel }) {
  const [form, setForm] = useState(socio ? {
    nombre: socio.nombre ?? '',
    apellido: socio.apellido ?? '',
    dni: socio.dni ?? '',
    email: socio.email ?? '',
    telefono: socio.telefono ?? '',
    fechaNacimiento: socio.fecha_nacimiento?.slice(0, 10) ?? '',
  } : INIT);

  const [errores, setErrores] = useState([]);
  const [loading, setLoading] = useState(false);

  const edicion = !!socio;

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validar = () => {
    const errs = [];
    if (!form.nombre.trim())   errs.push('El nombre es obligatorio.');
    if (!form.apellido.trim()) errs.push('El apellido es obligatorio.');
    if (!edicion) {
      if (!/^\d{8}$/.test(form.dni)) errs.push('El DNI debe tener exactamente 8 dígitos.');
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.push('El email no tiene un formato válido.');
    if (form.telefono && !/^9\d{8}$/.test(form.telefono))
      errs.push('El teléfono debe tener 9 dígitos y empezar con 9.');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validar();
    if (errs.length > 0) return setErrores(errs);

    setLoading(true);
    setErrores([]);
    try {
      if (edicion) {
        const { dni, ...updatable } = form;
        await socioService.update(socio.id, updatable);
      } else {
        await socioService.create(form);
      }
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Error al guardar el socio.';
      const details = err.response?.data?.details ?? [];
      setErrores([msg, ...details]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h2 className="modal-title">{edicion ? '✏️ Editar Socio' : '➕ Registrar Nuevo Socio'}</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errores.length > 0 && (
              <div className="alert alert-danger">
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {errores.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" value={form.nombre} onChange={set('nombre')} placeholder="Carlos" required />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido *</label>
                <input className="form-input" value={form.apellido} onChange={set('apellido')} placeholder="Mendoza" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">DNI *</label>
                <input className="form-input" value={form.dni} onChange={set('dni')}
                  placeholder="12345678" maxLength={8}
                  disabled={edicion} style={edicion ? { opacity: 0.5 } : {}}
                  required={!edicion} />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input className="form-input" value={form.telefono} onChange={set('telefono')} placeholder="987654321" maxLength={9} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="carlos@email.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de nacimiento</label>
              <input className="form-input" type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" />Guardando...</> : edicion ? 'Guardar cambios' : 'Registrar socio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
