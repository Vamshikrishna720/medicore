import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/api.js';
import { Loading, ErrorBanner, StatusBadge, EmptyState } from '../../components/ui.jsx';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    appointmentService.myPatient(0, 5)
      .then(({ data }) => setAppointments(data.data.content))
      .catch((err) => setError(extractErrorLocal(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-head">
        <h1>My care</h1>
        <Link to="/patient/doctors" className="btn btn-primary">Book an appointment</Link>
      </div>

      <ErrorBanner message={error} />
      {loading ? <Loading /> : null}

      {!loading && appointments.length === 0 && !error ? (
        <EmptyState title="No appointments yet" hint="Find a doctor and book your first visit." />
      ) : null}

      {!loading && appointments.length > 0 ? (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Doctor</th><th>Specialization</th><th>When</th><th>Status</th></tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.doctorName}</td>
                  <td>{a.specialization}</td>
                  <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function extractErrorLocal(err) {
  return err?.response?.data?.message || 'Failed to load dashboard';
}
