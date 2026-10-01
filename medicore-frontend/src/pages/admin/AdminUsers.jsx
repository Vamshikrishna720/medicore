import { useCallback, useEffect, useState } from 'react';
import { authService, extractError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loading, ErrorBanner, SuccessBanner, ActiveBadge, EmptyState } from '../../components/ui.jsx';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

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
    setError(''); setMsg('');
    const action = u.active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${u.email}?`)) return;
    try {
      await authService.setStatus(u.id, !u.active);
      setMsg(`${u.email} ${action}d`);
      load(page, search);
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div>
      <div className="page-head"><h1>Users</h1></div>
      <SuccessBanner message={msg} />
      <ErrorBanner message={error} />

      <form className="filters card" onSubmit={doSearch}>
        <label className="grow">
          <span>Search by email</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="doctor@…" />
        </label>
        <button className="btn btn-primary">Search</button>
      </form>

      {loading ? <Loading /> : null}

      {!loading && users.length === 0 && !error ? (
        <EmptyState title="No users found" />
      ) : null}

      {users.length > 0 ? (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td><span className="badge badge-blue">{u.role}</span></td>
                  <td><ActiveBadge active={u.active} /></td>
                  <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    {u.email === me.email ? (
                      <span className="muted">you</span>
                    ) : u.active ? (
                      <button className="btn btn-sm btn-danger" onClick={() => toggleStatus(u)}>Deactivate</button>
                    ) : (
                      <button className="btn btn-sm btn-green" onClick={() => toggleStatus(u)}>Activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="pager">
          <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => load(page - 1, search)}>← Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => load(page + 1, search)}>Next →</button>
        </div>
      ) : null}
    </div>
  );
}
