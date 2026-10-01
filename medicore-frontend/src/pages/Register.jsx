import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { extractError } from '../services/api.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '', role: 'PATIENT' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await register(form.email, form.password, form.role);
      navigate('/login');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="auth-title">✚ MediCore</h1>
        <p className="auth-subtitle">Create your account</p>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={update('email')} required />
        </label>

        <label className="field">
          <span>Password (min 8 chars)</span>
          <input type="password" value={form.password} onChange={update('password')} minLength={8} required />
        </label>

        <label className="field">
          <span>Confirm password</span>
          <input type="password" value={form.confirm} onChange={update('confirm')} required />
        </label>

        <label className="field">
          <span>I am a</span>
          <select value={form.role} onChange={update('role')}>
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
          </select>
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>

        <p className="auth-alt">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
