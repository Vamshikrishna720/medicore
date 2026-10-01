import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Avatar } from './ui.jsx';
import { Cross, Logout, Bell, User as UserIcon } from './Icons.jsx';

const NAV = {
  PATIENT: [
    { to: '/patient', label: 'Dashboard', icon: null },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const links = user ? NAV[user.role] || [] : [];

  // Close the avatar dropdown when clicking anywhere outside it.
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark"><Cross size={16} /></span> MediCore
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-user" ref={menuRef}>
          {user ? (
            <>
              <span className="badge role-badge">{user.role}</span>
              <button
                type="button"
                className="btn btn-icon btn-outline"
                style={{ position: 'relative' }}
                onClick={() => navigate(`/${user.role.toLowerCase()}/notifications`)}
                aria-label="Notifications"
              >
                <Bell size={16} />
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px' }}
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <Avatar name={user.email} size="sm" />
                  <span className="user-email">{user.email}</span>
                </button>
                {menuOpen ? (
                  <div
                    className="card"
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      minWidth: 220, padding: 8, zIndex: 50, marginBottom: 0,
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8 }}>
                      <Avatar name={user.email} size="md" ring />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.email}</div>
                        <span className="badge role-badge" style={{ marginTop: 4 }}>{user.role}</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm btn-block"
                      style={{ justifyContent: 'flex-start', border: 'none' }}
                      onClick={() => { setMenuOpen(false); navigate(`/${user.role.toLowerCase()}/profile`); }}
                    >
                      <UserIcon size={15} /> My profile
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm btn-block"
                      style={{ justifyContent: 'flex-start', border: 'none', color: 'var(--red)' }}
                      onClick={handleLogout}
                    >
                      <Logout size={15} /> Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </header>
      <main className="page page-enter">{children}</main>
      <footer className="footer">
        <strong>MediCore</strong> — Spring Boot microservices (Gateway · JWT · Eureka · Feign · Resilience4j) + React 18
      </footer>
    </div>
  );
}
