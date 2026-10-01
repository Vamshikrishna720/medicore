import { useEffect, useState } from 'react';
import { doctorService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, SuccessBanner } from '../../components/ui.jsx';
import { useToast } from '../../components/Toast.jsx';
import { User as UserIcon, Stethoscope, Money, FileText } from '../../components/Icons.jsx';

const EMPTY = {
  fullName: '', specialization: '', bio: '', consultationFee: '',
  experienceYears: '', phone: '', availableFrom: '09:00', availableTo: '17:00',
};

export default function DoctorProfile() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const toast = useToast();

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
      toast('Profile saved', 'success');
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await doctorService.createMyProfile(payload);
          setMsg('Profile created');
          toast('Profile created — you are now discoverable', 'success');
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
      <div className="page-head">
        <h1><Stethoscope size={22} /> My professional profile</h1>
        <p>This is what patients see when they search for doctors.</p>
      </div>
      <SuccessBanner message={msg} onClose={() => setMsg('')} />
      <ErrorBanner message={error} onClose={() => setError('')} />

      <form className="card form-grid" onSubmit={save}>
        <div className="form-section-title"><UserIcon size={14} /> Identity</div>
        <label className="field">
          <span>Full name *</span>
          <input value={form.fullName} onChange={update('fullName')} placeholder="Dr. …" required />
        </label>
        <label className="field">
          <span>Specialization *</span>
          <input value={form.specialization} onChange={update('specialization')} placeholder="Cardiology" required />
        </label>
        <label className="field">
          <span>Phone</span>
          <input value={form.phone || ''} onChange={update('phone')} placeholder="+91 …" />
        </label>
        <label className="field">
          <span>Experience (years) *</span>
          <input type="number" min="0" max="60" value={form.experienceYears} onChange={update('experienceYears')} required />
        </label>

        <div className="form-section-title"><Money size={14} /> Practice</div>
        <label className="field">
          <span>Consultation fee (₹) *</span>
          <input type="number" min="0" value={form.consultationFee} onChange={update('consultationFee')} required />
        </label>
        <label className="field">
          <span>Available from *</span>
          <input type="time" value={form.availableFrom} onChange={update('availableFrom')} required />
        </label>
        <label className="field">
          <span>Available to *</span>
          <input type="time" value={form.availableTo} onChange={update('availableTo')} required />
        </label>
        <div />

        <div className="form-section-title"><FileText size={14} /> About</div>
        <label className="field span-2">
          <span>Bio — shown on your card in patient search</span>
          <textarea value={form.bio || ''} onChange={update('bio')} rows={3} placeholder="Brief introduction, qualifications, approach to care…" />
        </label>

        <div className="span-2">
          <button className="btn btn-primary">Save profile</button>
        </div>
      </form>
    </div>
  );
}
