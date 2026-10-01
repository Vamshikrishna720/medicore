import { useCallback, useEffect, useState } from 'react';
import { appointmentService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, SuccessBanner, StatusBadge, EmptyState } from '../../components/ui.jsx';

export default function DoctorAppointments() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback((p) => {
    setLoading(true);
    appointmentService.myDoctor(p, 10)
      .then(({ data }) => {
        setItems(data.data.content);
        setPage(data.data.page);
        setTotalPages(data.data.totalPages);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(0); }, [load]);

  const act = async (id, action, status) => {
    setError(''); setMsg('');
    try {
      if (action === 'cancel') {
        await appointmentService.cancel(id);
        setMsg('Appointment cancelled');
      } else {
        await appointmentService.updateStatus(id, status);
        setMsg(`Marked ${status.toLowerCase()}`);
      }
      load(page);
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div>
      <div className="page-head"><h1>My appointments</h1></div>
      <SuccessBanner message={msg} />
      <ErrorBanner message={error} />
      {loading ? <Loading /> : null}

      {!loading && items.length === 0 && !error ? (
        <EmptyState title="No appointments" hint="They appear here once patients book you." />
      ) : null}

      {items.length > 0 ? (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Patient</th><th>When</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.patientName}</td>
                  <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                  <td className="muted">{a.reason || '—'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="actions-cell">
                    {a.status === 'SCHEDULED' ? (
                      <button className="btn btn-sm btn-primary" onClick={() => act(a.id, 'status', 'CONFIRMED')}>Confirm</button>
                    ) : null}
                    {a.status === 'CONFIRMED' ? (
                      <button className="btn btn-sm btn-green" onClick={() => act(a.id, 'status', 'COMPLETED')}>Complete</button>
                    ) : null}
                    {a.status === 'SCHEDULED' || a.status === 'CONFIRMED' ? (
                      <button className="btn btn-sm btn-danger" onClick={() => act(a.id, 'cancel')}>Cancel</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="pager">
          <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => load(page - 1)}>← Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => load(page + 1)}>Next →</button>
        </div>
      ) : null}
    </div>
  );
}
