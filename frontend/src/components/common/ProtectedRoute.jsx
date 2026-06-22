import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — redirige al login si no hay sesión activa.
 * Opcionalmente verifica que el usuario tenga uno de los roles permitidos.
 *
 * Uso:
 *   <Route element={<ProtectedRoute roles={['administrador','recepcionista']} />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 */
export default function ProtectedRoute({ roles = [] }) {
  const { estaAutenticado, usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <LoadingSpinner fullPage />;

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(usuario?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Renderiza las rutas hijas via Outlet (usado en App.jsx)
  const { Outlet } = require('react-router-dom');
  return <Outlet />;
}
