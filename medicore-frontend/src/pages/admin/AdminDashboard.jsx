import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner } from '../../components/ui.jsx';

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

  return (
    <div>
      <div className="page-head"><h1>Administration</h1></div>
      <ErrorBanner message={error} />
      {loading ? <Loading /> : null}

      {stats ? (
        <>
          <div className="stats-grid">
            <div className="card stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total appointments</span>
            </div>
            <div className="card stat-card">
              <span className="stat-value">{stats.scheduled}</span>
              <span className="stat-label">Scheduled</span>
            </div>
            <div className="card stat-card">
              <span className="stat-value">{stats.confirmed}</span>
              <span className="stat-label">Confirmed</span>
            </div>
            <div className="card stat-card">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="card stat-card">
              <span className="stat-value">{stats.cancelled}</span>
              <span className="stat-label">Cancelled</span>
            </div>
          </div>
          <Link to="/admin/users" className="btn btn-primary">Manage users →</Link>
        </>
      ) : null}
    </div>
  );
}
