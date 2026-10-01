import { useEffect, useState } from 'react';
import { doctorService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, SuccessBanner } from '../../components/ui.jsx';

const EMPTY = {
  fullName: '', specialization: '', bio: '', consultationFee: '',
  experienceYears: '', phone: '', availableFrom: '09:00', availableTo: '17:00',
};

export default function DoctorProfile() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    doctorService.getMyProfile()
      .then(({ data }) => setForm({ ...EMPTY, ...data.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    const payload = {
      ...form,
      consultationFee: Number(form.consultationFee),
      experienceYears: Number(form.experienceYears),
    };
    try {
      await doctorService.updateMyProfile(payload);
      setMsg('Profile saved');
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await doctorService.createMyProfile(payload);
          setMsg('Profile created');
        } catch (err2) {
          setError(extractError(err2));
        }
      } else {
        setError(extractError(err));
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-head"><h1>My professional profile</h1></div>
      <SuccessBanner message={msg} />
      <ErrorBanner message={error} />

      <form className="card form-grid" onSubmit={save}>
        <label className="field">
          <span>Full name *</span>
          <input value={form.fullName} onChange={update('fullName')} required />
        </label>
        <label className="field">
          <span>Specialization *</span>
          <input value={form.specialization} onChange={update('specialization')} placeholder="Cardiology" required />
        </label>
        <label className="field">
          <span>Consultation fee (₹) *</span>
          <input type="number" min="0" value={form.consultationFee} onChange={update('consultationFee')} required />
        </label>
        <label className="field">
          <span>Experience (years) *</span>
          <input type="number" min="0" max="60" value={form.experienceYears} onChange={update('experienceYears')} required />
        </label>
        <label className="field">
          <span>Available from *</span>
          <input type="time" value={form.availableFrom} onChange={update('availableFrom')} required />
        </label>
        <label className="field">
          <span>Available to *</span>
          <input type="time" value={form.availableTo} onChange={update('availableTo')} required />
        </label>
        <label className="field">
          <span>Phone</span>
          <input value={form.phone || ''} onChange={update('phone')} />
        </label>
        <label className="field span-2">
          <span>Bio</span>
          <textarea value={form.bio || ''} onChange={update('bio')} rows={3} />
        </label>
        <div className="span-2">
          <button className="btn btn-primary">Save profile</button>
        </div>
      </form>
    </div>
  );
}
