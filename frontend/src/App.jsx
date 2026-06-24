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
import ClasesPage      from './pages/ClasesPage';
import ReservasPage    from './pages/ReservasPage';
import MisReservasPage from './pages/MisReservasPage';
import MiPerfilPage    from './pages/MiPerfilPage';

/* ── ProtectedRoute ─────────────────────────────────────────
   Soporta dos modos de uso:
   1. Como wrapper de <Route>:  <Route element={<ProtectedRoute />}> → renderiza <Outlet />
   2. Como wrapper de componente: <ProtectedRoute roles={[...]}>><Page /></ProtectedRoute> → renderiza children
*/
function ProtectedRoute({ roles = [], children }) {
  const { estaAutenticado, usuario } = useAuth();

  if (!estaAutenticado) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(usuario?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children ?? <Outlet />;
}

/* ── Layout principal con sidebar ────────────────────────── */
function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Outlet />
    </div>
  );
}

/* ── App ────────────────────────────────────────────────── */
export default function App() {
  const { estaAutenticado } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Público ── */}
        <Route
          path="/login"
          element={estaAutenticado ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* ── Privado — requiere sesión ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* Accesible para todos los roles autenticados */}
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/clases"     element={<ClasesPage />} />

            {/* Solo administrador y recepcionista */}
            <Route
              path="/socios"
              element={
                <ProtectedRoute roles={['administrador', 'recepcionista']}>
                  <SociosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pagos"
              element={
                <ProtectedRoute roles={['administrador', 'recepcionista']}>
                  <PagosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/acceso"
              element={
                <ProtectedRoute roles={['administrador', 'recepcionista']}>
                  <AccesoQRPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/membresias"
              element={
                <ProtectedRoute roles={['administrador', 'recepcionista']}>
                  <MembresiasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservas"
              element={
                <ProtectedRoute roles={['administrador', 'recepcionista']}>
                  <ReservasPage />
                </ProtectedRoute>
              }
            />

            {/* Solo socio */}
            <Route
              path="/mis-reservas"
              element={
                <ProtectedRoute roles={['socio']}>
                  <MisReservasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-perfil"
              element={
                <ProtectedRoute roles={['socio']}>
                  <MiPerfilPage />
                </ProtectedRoute>
              }
            />

          </Route>
        </Route>

        {/* ── Raíz y fallback ── */}
        <Route
          path="/"
          element={<Navigate to={estaAutenticado ? '/dashboard' : '/login'} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={estaAutenticado ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

