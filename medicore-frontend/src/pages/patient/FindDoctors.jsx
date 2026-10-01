import { useEffect, useState } from 'react';
import { doctorService, appointmentService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, SuccessBanner, EmptyState } from '../../components/ui.jsx';

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({ specialization: '', minExperience: '', maxFee: '', page: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null); // doctor being booked
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookMsg, setBookMsg] = useState('');
  const [bookError, setBookError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    doctorService.specializations()
      .then(({ data }) => setSpecializations(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    doctorService.search(filters)
      .then(({ data }) => {
        setDoctors(data.data.content);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  const openBooking = (doctor) => {
    setBooking(doctor);
    setSlot('');
    setReason('');
    setBookMsg('');
    setBookError('');
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBusy(true);
    setBookError('');
    setBookMsg('');
    try {
      await appointmentService.book({
        doctorId: booking.id,
        appointmentDate: new Date(slot).toISOString().slice(0, 19),
        reason,
      });
      setBookMsg(`Booked with ${booking.fullName}! Check My Appointments.`);
      setTimeout(() => setBooking(null), 1200);
    } catch (err) {
      setBookError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Find doctors</h1>
      </div>

      <div className="filters card">
        <label>
          <span>Specialization</span>
          <select
            value={filters.specialization}
            onChange={(e) => setFilters({ ...filters, specialization: e.target.value, page: 0 })}
          >
            <option value="">All</option>
            {specializations.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Min experience (years)</span>
          <input
            type="number" min="0"
            value={filters.minExperience}
            onChange={(e) => setFilters({ ...filters, minExperience: e.target.value || undefined, page: 0 })}
          />
        </label>
        <label>
          <span>Max fee</span>
          <input
            type="number" min="0"
            value={filters.maxFee}
            onChange={(e) => setFilters({ ...filters, maxFee: e.target.value || undefined, page: 0 })}
          />
        </label>
      </div>

      <ErrorBanner message={error} />
      {loading ? <Loading /> : null}

      {!loading && doctors.length === 0 && !error ? (
        <EmptyState title="No doctors match your filters" hint="Try clearing a filter." />
      ) : null}

      <div className="doctor-grid">
        {doctors.map((d) => (
          <div className="card doctor-card" key={d.id}>
            <div className="doctor-head">
              <h3>{d.fullName}</h3>
              <span className="badge badge-blue">{d.specialization}</span>
            </div>
            <p className="muted">{d.bio || 'No bio provided'}</p>
            <div className="doctor-meta">
              <span>💰 ₹{d.consultationFee}</span>
              <span>🩺 {d.experienceYears} yrs</span>
              <span>🕒 {d.availableFrom}–{d.availableTo}</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => openBooking(d)}>
              Book appointment
            </button>
          </div>
        ))}
      </div>

      {booking ? (
        <div className="modal-backdrop" onClick={() => setBooking(null)}>
          <form className="modal card" onClick={(e) => e.stopPropagation()} onSubmit={submitBooking}>
            <h3>Book with {booking.fullName}</h3>
            <p className="muted">{booking.specialization} · ₹{booking.consultationFee} per visit</p>
            <SuccessBanner message={bookMsg} />
            <ErrorBanner message={bookError} />
            <label className="field">
              <span>Date &amp; time (30-min slot, :00 or :30)</span>
              <input
                type="datetime-local"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Reason (optional)</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setBooking(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>
                {busy ? 'Booking…' : 'Confirm booking'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
