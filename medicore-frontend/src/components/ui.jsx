export function Loading({ label = 'Loading…' }) {
  return <div className="loading">{label}</div>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="alert alert-error">{message}</div>;
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return <div className="alert alert-success">{message}</div>;
}

const STATUS_CLASS = {
  SCHEDULED: 'badge badge-blue',
  CONFIRMED: 'badge badge-green',
  COMPLETED: 'badge badge-gray',
  CANCELLED: 'badge badge-red',
  SENT: 'badge badge-green',
  QUEUED: 'badge badge-blue',
  FAILED: 'badge badge-red',
};

export function StatusBadge({ status }) {
  return <span className={STATUS_CLASS[status] || 'badge'}>{status}</span>;
}

export function ActiveBadge({ active }) {
  return (
    <span className={active ? 'badge badge-green' : 'badge badge-red'}>
      {active ? 'ACTIVE' : 'DEACTIVATED'}
    </span>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {hint ? <p>{hint}</p> : null}
    </div>
  );
}
