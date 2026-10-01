import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>403</h1>
        <p>You don't have access to this page.</p>
        <Link className="btn btn-primary" to="/login">Go to login</Link>
      </div>
    </div>
  );
}
