import { useEffect, useState } from 'react';
import { notificationService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, StatusBadge, EmptyState } from '../../components/ui.jsx';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    notificationService.myNotifications(0, 20)
      .then(({ data }) => setItems(data.data.content))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-head"><h1>Notifications</h1></div>
      <ErrorBanner message={error} />
      {loading ? <Loading /> : null}

      {!loading && items.length === 0 && !error ? (
        <EmptyState title="No notifications" hint="Booking updates will appear here." />
      ) : null}

      <div className="notif-list">
        {items.map((n) => (
          <div className="card notif-item" key={n.id}>
            <div className="notif-top">
              <span className="badge badge-blue">{n.type}</span>
              <StatusBadge status={n.status} />
              <span className="muted">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            <p>{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
