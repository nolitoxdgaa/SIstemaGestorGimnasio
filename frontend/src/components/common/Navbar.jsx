import { useAuth } from '../../context/AuthContext';

export default function Navbar({ title }) {
  const { usuario } = useAuth();
  const initials = usuario
    ? usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <div style={{
          fontSize: '0.8rem', color: 'var(--text-muted)',
          textAlign: 'right', lineHeight: 1.3,
        }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{usuario?.nombre}</div>
          <div style={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>{usuario?.rol}</div>
        </div>
        <div className="topbar-avatar">{initials}</div>
      </div>
    </header>
  );
}
