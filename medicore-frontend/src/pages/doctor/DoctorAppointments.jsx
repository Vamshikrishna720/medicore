import { useCallback, useEffect, useMemo, useState } from 'react';
import { appointmentService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, StatusBadge, EmptyState, Avatar, Pager } from '../../components/ui.jsx';
import { useToast } from '../../components/Toast.jsx';
import { Calendar, Check, X } from '../../components/Icons.jsx';

const TABS = ['ALL', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function DoctorAppointments() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [busyId, setBusyId] = useState(null);

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

  const filtered = useMemo(() => {
    if (tab === 'ALL') return items;
    return items.filter((a) => a.status === tab);
  }, [items, tab]);

  const counts = useMemo(() => ({
    ALL: items.length,
    SCHEDULED: items.filter((a) => a.status === 'SCHEDULED').length,
    CONFIRMED: items.filter((a) => a.status === 'CONFIRMED').length,
    COMPLETED: items.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: items.filter((a) => a.status === 'CANCELLED').length,
  }), [items]);

  const act = async (a, action, status) => {
    setBusyId(a.id);
    setError('');
    try {
      if (action === 'cancel') {
        await appointmentService.cancel(a.id);
        toast('Appointment cancelled', 'success');
        setConfirmCancel(null);
      } else {
        await appointmentService.updateStatus(a.id, status);
        toast(`Marked ${status.toLowerCase()}`, 'success');
      }
      load(page);
    } catch (err) {
      setError(extractError(err));
      toast(extractError(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1><Calendar size={22} /> Appointments</h1>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />
      {loading && items.length === 0 ? <Loading /> : null}

      <div className="filter-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`filter-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            <span className="count"> ({counts[t]})</span>
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && !error ? (
        <div className="card">
          <EmptyState
            title={tab === 'ALL' ? 'No appointments' : `No ${tab.toLowerCase()} appointments on this page`}
            hint={tab === 'ALL' ? 'They appear here once patients book you.' : 'Try another filter or page.'}
            icon={Calendar}
          />
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>Patient</th><th>When</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="cell-person">
                      <Avatar name={a.patientName} size="sm" />
                      <span className="cell-strong">{a.patientName}</span>
                    </div>
                  </td>
                  <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                  <td className="muted">{a.reason || '—'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div className="actions-cell">
                      {a.status === 'SCHEDULED' ? (
                        <button className="btn btn-sm btn-primary" disabled={busyId === a.id} onClick={() => act(a, 'status', 'CONFIRMED')}>
                          <Check size={13} /> Confirm
                        </button>
                      ) : null}
                      {a.status === 'CONFIRMED' ? (
                        <button className="btn btn-sm btn-green" disabled={busyId === a.id} onClick={() => act(a, 'status', 'COMPLETED')}>
                          <Check size={13} /> Complete
                        </button>
                      ) : null}
                      {a.status === 'SCHEDULED' || a.status === 'CONFIRMED' ? (
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmCancel(a)}>Cancel</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Pager page={page} totalPages={totalPages} onPage={load} />

      {confirmCancel ? (
        <div className="modal-backdrop" onClick={() => setConfirmCancel(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3><X size={18} /> Cancel this appointment?</h3>
            <div className="booking-summary">
              <b>{confirmCancel.patientName}</b>
              <span className="muted">{new Date(confirmCancel.appointmentDate).toLocaleString()}</span>
            </div>
            <p className="muted" style={{ fontSize: '0.88rem' }}>
              The patient will be notified. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setConfirmCancel(null)}>Keep it</button>
              <button className="btn btn-danger" disabled={busyId === confirmCancel.id} onClick={() => act(confirmCancel, 'cancel')}>
                {busyId === confirmCancel.id ? 'Cancelling…' : 'Yes, cancel it'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
