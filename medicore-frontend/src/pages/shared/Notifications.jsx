import { useCallback, useEffect, useState } from 'react';
import { notificationService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, EmptyState, Pager } from '../../components/ui.jsx';
import { Bell, Calendar, XCircle, CheckCircle, Info } from '../../components/Icons.jsx';

const TYPE_STYLE = {
  APPOINTMENT_BOOKED: { icon: Calendar, cls: 'blue' },
  APPOINTMENT_CONFIRMED: { icon: CheckCircle, cls: 'green' },
  APPOINTMENT_COMPLETED: { icon: CheckCircle, cls: 'green' },
  APPOINTMENT_CANCELLED: { icon: XCircle, cls: 'red' },
  DEFAULT: { icon: Bell, cls: 'amber' },
};

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString();
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback((p) => {
    setLoading(true);
    notificationService.myNotifications(p, 10)
      .then(({ data }) => {
        setItems((prev) => (p === 0 ? data.data.content : [...prev, ...data.data.content]));
        setPage(data.data.page);
        setTotalPages(data.data.totalPages);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(0); }, [load]);

  return (
    <div>
      <div className="page-head">
        <h1><Bell size={22} /> Notifications</h1>
        <p>Booking confirmations, cancellations and platform updates.</p>
      </div>
      <ErrorBanner message={error} onClose={() => setError('')} />
      {loading && items.length === 0 ? <Loading /> : null}

      {!loading && items.length === 0 && !error ? (
        <div className="card">
          <EmptyState title="No notifications" hint="Booking updates will appear here." icon={Bell} />
        </div>
      ) : null}

      {items.map((n) => {
        const t = TYPE_STYLE[n.type] || TYPE_STYLE.DEFAULT;
        const Icon = t.icon;
        return (
          <div className="card notif-item" key={n.id}>
            <span className={`notif-icon ${t.cls}`}><Icon size={19} /></span>
            <div className="notif-body">
              <div className="notif-top">
                <span className="badge badge-blue">{n.type}</span>
                <span className="muted notif-time">{timeAgo(n.createdAt)}</span>
              </div>
              <p>{n.message}</p>
            </div>
          </div>
        );
      })}

      <Pager page={page} totalPages={totalPages} onPage={load} />
    </div>
  );
}
