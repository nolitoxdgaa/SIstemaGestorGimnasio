import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: [] },
  { to: '/socios',       label: 'Socios',        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA] },
  { to: '/clases',       label: 'Clases',        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: [] },
  { to: '/pagos',        label: 'Pagos',         icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA] },
  { to: '/acceso',       label: 'Acceso QR',     icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 20h4m-2-8h2m2-2h.01M8 4h.01M8 20h.01', roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA] },
  { to: '/membresias',   label: 'Membresías',    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA] },
  { to: '/reservas',     label: 'Reservas',      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA] },
  { to: '/mis-reservas', label: 'Mis Reservas',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: [ROLES.SOCIO] },
  { to: '/mi-perfil',    label: 'Mi Perfil',     icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: [ROLES.SOCIO] },
];


export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = usuario
    ? usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const navItems = NAV_ITEMS.filter(
    item => item.roles.length === 0 || item.roles.includes(usuario?.rol)
  );

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">OLYMPUS CORE</div>
        <div className="sidebar-logo-sub">Enterprise Suite</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Principal</span>
        {navItems.slice(0, 2).map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon d={item.icon} />
            {item.label}
          </NavLink>
        ))}

        <span className="sidebar-section-label" style={{ marginTop: '0.5rem' }}>Operaciones</span>
        {navItems.slice(2).map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon d={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button className="sidebar-item" onClick={handleLogout}>
          <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          Cerrar sesión
        </button>

        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 0.5rem', borderTop: '1px solid var(--border)',
          marginTop: '0.25rem',
        }}>
          <div className="topbar-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.nombre}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {usuario?.rol}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
