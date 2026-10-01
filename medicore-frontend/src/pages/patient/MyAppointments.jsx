import { useCallback, useEffect, useState } from 'react';
import { appointmentService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, SuccessBanner, StatusBadge, EmptyState } from '../../components/ui.jsx';

export default function MyAppointments() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback((p) => {
    setLoading(true);
    appointmentService.myPatient(p, 10)
      .then(({ data }) => {
        setItems(data.data.content);
        setPage(data.data.page);
        setTotalPages(data.data.totalPages);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(0); }, [load]);

  const cancel = async (id) => {
    setMsg('');
    setError('');
    try {
      await appointmentService.cancel(id);
      setMsg('Appointment cancelled');
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
        <EmptyState title="Nothing here yet" hint="Book an appointment from Find Doctors." />
      ) : null}

      {items.length > 0 ? (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Doctor</th><th>When</th><th>Fee</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.doctorName}</td>
                  <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                  <td>₹{a.feeAtBooking}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status === 'SCHEDULED' || a.status === 'CONFIRMED' ? (
                      <button className="btn btn-danger btn-sm" onClick={() => cancel(a.id)}>Cancel</button>
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
