import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner } from '../../components/ui.jsx';
import { Shield, Calendar, Clock, CheckCircle, XCircle, Users, ArrowRight, Activity } from '../../components/Icons.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    appointmentService.stats()
      .then(({ data }) => setStats(data.data))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats
    ? [
        { label: 'Scheduled', value: stats.scheduled, cls: '' },
        { label: 'Confirmed', value: stats.confirmed, cls: 'cyan' },
        { label: 'Completed', value: stats.completed, cls: 'green' },
        { label: 'Cancelled', value: stats.cancelled, cls: 'red' },
      ]
    : [];
  const max = Math.max(1, ...(chartData.map((c) => c.value)));

  return (
    <div>
      <section className="hero">
        <div className="hero-eyebrow"><Shield size={13} /> Admin console</div>
        <h1>Platform overview</h1>
        <p className="hero-sub">
          Appointment throughput and user management for the whole MediCore platform.
        </p>
        <div className="hero-actions">
          <Link to="/admin/users" className="btn-hero"><Users size={16} /> Manage users</Link>
          <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" className="btn-hero ghost">
            API docs <ArrowRight size={14} />
          </a>
        </div>
      </section>

      <ErrorBanner message={error} />
      {loading ? <Loading /> : null}

      {stats ? (
        <>
          <div className="stats-grid">
            <div className="card stat-card">
              <span className="stat-icon blue"><Calendar size={20} /></span>
              <div>
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total appointments</span>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon cyan"><Clock size={20} /></span>
              <div>
                <span className="stat-value">{stats.scheduled}</span>
                <span className="stat-label">Scheduled</span>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon violet" style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}><Activity size={20} /></span>
              <div>
                <span className="stat-value">{stats.confirmed}</span>
                <span className="stat-label">Confirmed</span>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon green"><CheckCircle size={20} /></span>
              <div>
                <span className="stat-value">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon red"><XCircle size={20} /></span>
              <div>
                <span className="stat-value">{stats.cancelled}</span>
                <span className="stat-label">Cancelled</span>
              </div>
            </div>
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-title-row">
                <h3><Activity size={18} /> Appointments by status</h3>
              </div>
              <div className="chart">
                {chartData.map((c) => (
                  <div className="chart-col" key={c.label}>
                    <span className="chart-value">{c.value}</span>
                    <div
                      className={`chart-bar ${c.cls}`}
                      style={{ height: `${Math.max(6, Math.round((c.value / max) * 130))}px` }}
                    />
                    <span className="chart-label">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title-row"><h3>Quick actions</h3></div>
              <p className="muted" style={{ marginTop: 0, fontSize: '0.9rem' }}>
                Manage platform accounts — deactivate abusive users or restore deactivated ones.
              </p>
              <Link to="/admin/users" className="btn btn-primary btn-block" style={{ marginBottom: 10 }}>
                <Users size={15} /> Manage users
              </Link>
              <a
                href="http://localhost:8080/swagger-ui.html"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-block"
              >
                Open API docs <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
