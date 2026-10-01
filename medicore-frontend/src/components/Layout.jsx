import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = {
  PATIENT: [
    { to: '/patient', label: 'Dashboard' },
    { to: '/patient/doctors', label: 'Find Doctors' },
    { to: '/patient/appointments', label: 'My Appointments' },
    { to: '/patient/profile', label: 'Profile' },
    { to: '/patient/notifications', label: 'Notifications' },
  ],
  DOCTOR: [
    { to: '/doctor', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/profile', label: 'Profile' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user ? NAV[user.role] || [] : [];

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">✚</span> MediCore
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <span className="badge role-badge">{user.role}</span>
              <span className="user-email">{user.email}</span>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                Logout
              </button>
            </>
          ) : null}
        </div>
      </header>
      <main className="page">{children}</main>
      <footer className="footer">MediCore — Spring Boot microservices + React demo</footer>
    </div>
  );
}
