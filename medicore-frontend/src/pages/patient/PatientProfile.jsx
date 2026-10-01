import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService, authService, extractError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loading, ErrorBanner, SuccessBanner } from '../../components/ui.jsx';

const EMPTY = {
  fullName: '', dateOfBirth: '', gender: '', phone: '', address: '',
  bloodGroup: '', allergies: '', chronicConditions: '',
};

export default function PatientProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    patientService.getMyProfile()
      .then(({ data }) => setForm({ ...EMPTY, ...data.data }))
      .catch(() => setLoading(false)) // 404 = profile not created yet
      .finally(() => setLoading(false));
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    const payload = { ...form, dateOfBirth: form.dateOfBirth || null, gender: form.gender || null };
    try {
      await patientService.updateMyProfile(payload);
      setMsg('Profile saved');
    } catch (err) {
      if (err?.response?.status === 404) {
        await patientService.createMyProfile(payload);
        setMsg('Profile created');
      } else {
        setError(extractError(err));
      }
    }
  };

  const deactivate = async () => {
    if (!window.confirm('Deactivate your account? You will be logged out. An admin can restore it later.')) return;
    try {
      await authService.deactivateMe();
      logout();
      navigate('/login');
    } catch (err) {
      setError(extractError(err));
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-head"><h1>My profile</h1></div>
      <SuccessBanner message={msg} />
      <ErrorBanner message={error} />

      <form className="card form-grid" onSubmit={save}>
        <label className="field">
          <span>Full name *</span>
          <input value={form.fullName} onChange={update('fullName')} required />
        </label>
        <label className="field">
          <span>Date of birth</span>
          <input type="date" value={form.dateOfBirth || ''} onChange={update('dateOfBirth')} />
        </label>
        <label className="field">
          <span>Gender</span>
          <select value={form.gender || ''} onChange={update('gender')}>
            <option value="">—</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="field">
          <span>Blood group</span>
          <input value={form.bloodGroup || ''} onChange={update('bloodGroup')} placeholder="O+" />
        </label>
        <label className="field">
          <span>Phone</span>
          <input value={form.phone || ''} onChange={update('phone')} />
        </label>
        <label className="field">
          <span>Address</span>
          <input value={form.address || ''} onChange={update('address')} />
        </label>
        <label className="field span-2">
          <span>Allergies</span>
          <textarea value={form.allergies || ''} onChange={update('allergies')} rows={2} />
        </label>
        <label className="field span-2">
          <span>Chronic conditions</span>
          <textarea value={form.chronicConditions || ''} onChange={update('chronicConditions')} rows={2} />
        </label>
        <div className="span-2">
          <button className="btn btn-primary">Save profile</button>
        </div>
      </form>

      <div className="card danger-zone">
        <h3>Danger zone</h3>
        <p className="muted">Deactivation is a soft delete — your history is retained and an admin can restore access.</p>
        <button className="btn btn-danger" onClick={deactivate}>Deactivate my account</button>
      </div>
    </div>
  );
}
