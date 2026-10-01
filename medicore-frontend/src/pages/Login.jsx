import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { extractError } from '../services/api.js';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@medicore.com', password: 'Admin@123' },
  { label: 'Doctor', email: 'doctor@medicore.com', password: 'Doctor@123' },
  { label: 'Patient', email: 'patient@medicore.com', password: 'Patient@123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const auth = await login(email, password);
      navigate(
        auth.role === 'ADMIN' ? '/admin' : auth.role === 'DOCTOR' ? '/doctor' : '/patient'
      );
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="auth-title">✚ MediCore</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth-alt">
          No account? <Link to="/register">Register</Link>
        </p>

        <div className="demo-accounts">
          <p>Demo accounts (click to fill):</p>
          {DEMO_ACCOUNTS.map((a) => (
            <button type="button" key={a.email} className="chip" onClick={() => fillDemo(a)}>
              {a.label}: {a.email}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
