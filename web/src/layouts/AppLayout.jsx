import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">UTR</div>
          <div><strong>Laboratorios</strong><span>Control académico</span></div>
        </div>
        <nav>
          <NavLink to="/dashboard">Panel</NavLink>
          <NavLink to="/labs">Laboratorios</NavLink>
          <NavLink to="/my-session">Mi sesión</NavLink>
          {user?.rol === 'ADMIN' && <NavLink to="/admin">Administración</NavLink>}
        </nav>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Universidad Tecnológica El Retoño</span>
            <h1>Control de Laboratorios</h1>
          </div>
          <div className="user-chip">
            <div className="avatar">{user?.nombre?.charAt(0) || 'U'}</div>
            <div><strong>{user?.nombre}</strong><span>{user?.rol}</span></div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
