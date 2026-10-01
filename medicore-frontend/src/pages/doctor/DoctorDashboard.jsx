import { useEffect, useState } from 'react';
import { doctorService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, SuccessBanner } from '../../components/ui.jsx';

export default function DoctorDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    doctorService.getMyProfile()
      .then(({ data }) => setProfile(data.data))
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async () => {
    setError(''); setMsg('');
    try {
      const { data } = await doctorService.setAvailability(!profile.available);
      setProfile(data.data);
      setMsg(data.data.available ? 'You are on duty — visible in patient search' : 'You are off duty — hidden from search');
    } catch (err) {
      setError(extractError(err));
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-head"><h1>Doctor dashboard</h1></div>
      <SuccessBanner message={msg} />
      <ErrorBanner message={error} />

      {!profile ? (
        <div className="card">
          <h3>Welcome! Create your profile</h3>
          <p className="muted">Patients can only find you after your profile exists.</p>
          <a className="btn btn-primary" href="/doctor/profile">Create profile</a>
        </div>
      ) : (
        <div className="card">
          <h3>{profile.fullName}</h3>
          <span className="badge badge-blue">{profile.specialization}</span>
          <div className="doctor-meta" style={{ margin: '12px 0' }}>
            <span>💰 ₹{profile.consultationFee}</span>
            <span>🩺 {profile.experienceYears} yrs</span>
            <span>🕒 {profile.availableFrom}–{profile.availableTo}</span>
          </div>
          <p>
            Status: <strong>{profile.available ? 'On duty (visible in search)' : 'Off duty (hidden)'}</strong>
          </p>
          <button className={profile.available ? 'btn btn-danger' : 'btn btn-primary'} onClick={toggle}>
            {profile.available ? 'Go off duty' : 'Go on duty'}
          </button>
        </div>
      )}
    </div>
  );
}
