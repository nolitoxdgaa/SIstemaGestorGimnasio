import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import Sidebar from './components/common/Sidebar';

// Pages
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import SociosPage      from './pages/SociosPage';
import PagosPage       from './pages/PagosPage';
import AccesoQRPage    from './pages/AccesoQRPage';
import MembresiasPage  from './pages/MembresiasPage';

/* ── Layout con sidebar ─────────────────────────────────── */
function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Outlet />
    </div>
  );
}

/* ── Ruta protegida ─────────────────────────────────────── */
function ProtectedRoute({ roles = [] }) {
  const { estaAutenticado, usuario, cargando } = useAuth();
  if (cargando) return <LoadingSpinner fullPage />;
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(usuario?.rol)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/* ── App ────────────────────────────────────────────────── */
export default function App() {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) return <LoadingSpinner fullPage />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/login" element={
          estaAutenticado ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />

        {/* Privado — con sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/socios"     element={<SociosPage />} />
            <Route path="/membresias" element={<MembresiasPage />} />
            <Route path="/pagos"      element={
              <ProtectedRoute roles={['administrador', 'recepcionista']}>
                <PagosPage />
              </ProtectedRoute>
            } />
            <Route path="/acceso"     element={
              <ProtectedRoute roles={['administrador', 'recepcionista']}>
                <AccesoQRPage />
              </ProtectedRoute>
            } />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={estaAutenticado ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
