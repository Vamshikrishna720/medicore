import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService, authService, extractError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loading, ErrorBanner, SuccessBanner } from '../../components/ui.jsx';
import { useToast } from '../../components/Toast.jsx';
import { User as UserIcon, Droplet, FileText, AlertCircle, Shield } from '../../components/Icons.jsx';

const EMPTY = {
  fullName: '', dateOfBirth: '', gender: '', phone: '', address: '',
  bloodGroup: '', allergies: '', chronicConditions: '',
};

export default function PatientProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

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
      toast('Profile saved', 'success');
    } catch (err) {
      if (err?.response?.status === 404) {
        await patientService.createMyProfile(payload);
        setMsg('Profile created');
        toast('Profile created', 'success');
      } else {
        setError(extractError(err));
      }
    }
  };

  const deactivate = async () => {
    setConfirmDeactivate(false);
    try {
      await authService.deactivateMe();
      toast('Account deactivated', 'success');
      logout();
      navigate('/login');
    } catch (err) {
      setError(extractError(err));
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-head">
        <h1><UserIcon size={22} /> My profile</h1>
        <p>Keep your medical details up to date — doctors see these with your appointments.</p>
      </div>
      <SuccessBanner message={msg} onClose={() => setMsg('')} />
      <ErrorBanner message={error} onClose={() => setError('')} />

      <form className="card form-grid" onSubmit={save}>
        <div className="form-section-title"><UserIcon size={14} /> Personal details</div>
        <label className="field">
          <span>Full name *</span>
          <input value={form.fullName} onChange={update('fullName')} placeholder="Your full name" required />
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
          <span>Phone</span>
          <input value={form.phone || ''} onChange={update('phone')} placeholder="+91 …" />
        </label>
        <label className="field span-2">
          <span>Address</span>
          <input value={form.address || ''} onChange={update('address')} placeholder="Street, city, PIN" />
        </label>

        <div className="form-section-title"><Droplet size={14} /> Medical details</div>
        <label className="field">
          <span>Blood group</span>
          <input value={form.bloodGroup || ''} onChange={update('bloodGroup')} placeholder="O+" />
        </label>
        <div />
        <label className="field span-2">
          <span><AlertCircle size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> Allergies</span>
          <textarea value={form.allergies || ''} onChange={update('allergies')} rows={2} placeholder="Penicillin, peanuts, …" />
        </label>
        <label className="field span-2">
          <span>Chronic conditions</span>
          <textarea value={form.chronicConditions || ''} onChange={update('chronicConditions')} rows={2} placeholder="Diabetes, hypertension, …" />
        </label>
        <div className="span-2">
          <button className="btn btn-primary">Save profile</button>
        </div>
      </form>

      <div className="card danger-zone">
        <h3><Shield size={17} /> Danger zone</h3>
        <p className="muted">Deactivation is a soft delete — your history is retained and an admin can restore access.</p>
        <button className="btn btn-danger" onClick={() => setConfirmDeactivate(true)}>Deactivate my account</button>
      </div>

      {confirmDeactivate ? (
        <div className="modal-backdrop" onClick={() => setConfirmDeactivate(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h3>Deactivate your account?</h3>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              You will be logged out immediately. Your data is retained (soft delete) and an
              administrator can restore your access later.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setConfirmDeactivate(false)}>Keep my account</button>
              <button className="btn btn-danger" onClick={deactivate}>Yes, deactivate</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
