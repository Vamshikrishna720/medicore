import { useCallback, useEffect, useState } from 'react';
import { authService, extractError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loading, ErrorBanner, SuccessBanner, ActiveBadge, EmptyState, Avatar, Pager } from '../../components/ui.jsx';
import { useToast } from '../../components/Toast.jsx';
import { Users, Search, Shield } from '../../components/Icons.jsx';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmUser, setConfirmUser] = useState(null); // user pending activation/deactivation
  const [busyId, setBusyId] = useState(null);

  const load = useCallback((p, term) => {
    setLoading(true);
    authService.listUsers(term, p, 10)
      .then(({ data }) => {
        setUsers(data.data.content);
        setPage(data.data.page);
        setTotalPages(data.data.totalPages);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(0, ''); }, [load]);

  const doSearch = (e) => {
    e.preventDefault();
    load(0, search);
  };

  const toggleStatus = async (u) => {
    setBusyId(u.id);
    setError(''); setMsg('');
    const action = u.active ? 'deactivated' : 'activated';
    try {
      await authService.setStatus(u.id, !u.active);
      toast(`${u.email} ${action}`, 'success');
      setConfirmUser(null);
      load(page, search);
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
        <h1><Users size={22} /> Users</h1>
        <p>All registered accounts across patients, doctors and admins.</p>
      </div>
      <SuccessBanner message={msg} onClose={() => setMsg('')} />
      <ErrorBanner message={error} onClose={() => setError('')} />

      <form className="card filters" onSubmit={doSearch}>
        <label className="grow">
          <span>Search by email</span>
          <div className="input-wrap">
            <span className="input-icon"><Search size={15} /></span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="doctor@…" />
          </div>
        </label>
        <button className="btn btn-primary">Search</button>
      </form>

      {loading && users.length === 0 ? <Loading /> : null}

      {!loading && users.length === 0 && !error ? (
        <div className="card"><EmptyState title="No users found" icon={Users} /></div>
      ) : null}

      {users.length > 0 ? (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="cell-person">
                      <Avatar name={u.email} size="sm" />
                      <span className="cell-strong">{u.email}</span>
                    </div>
                  </td>
                  <td><span className="badge role-badge">{u.role}</span></td>
                  <td><ActiveBadge active={u.active} /></td>
                  <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    {u.email === me.email ? (
                      <span className="muted">you</span>
                    ) : u.active ? (
                      <button className="btn btn-sm btn-danger" onClick={() => setConfirmUser(u)}>Deactivate</button>
                    ) : (
                      <button className="btn btn-sm btn-green" onClick={() => setConfirmUser(u)}>Activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Pager page={page} totalPages={totalPages} onPage={(p) => load(p, search)} />

      {confirmUser ? (
        <div className="modal-backdrop" onClick={() => setConfirmUser(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3><Shield size={18} /> {confirmUser.active ? 'Deactivate' : 'Activate'} {confirmUser.email}?</h3>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              {confirmUser.active
                ? 'Deactivation is a soft delete — the user can no longer log in or book, but their history is retained and you can restore them.'
                : 'The user will be able to sign in and use the platform again.'}
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setConfirmUser(null)}>Close</button>
              <button
                className={`btn ${confirmUser.active ? 'btn-danger' : 'btn-green'}`}
                disabled={busyId === confirmUser.id}
                onClick={() => toggleStatus(confirmUser)}
              >
                {busyId === confirmUser.id ? 'Working…' : confirmUser.active ? 'Yes, deactivate' : 'Yes, activate'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
