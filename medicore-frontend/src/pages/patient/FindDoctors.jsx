import { useEffect, useState } from 'react';
import { doctorService, appointmentService, extractError } from '../../services/api.js';
import { Loading, ErrorBanner, EmptyState, Avatar } from '../../components/ui.jsx';
import { useToast } from '../../components/Toast.jsx';
import { Search, Stethoscope, Money, Clock, X, Calendar } from '../../components/Icons.jsx';

export default function FindDoctors() {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({ specialization: '', minExperience: '', maxFee: '', page: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null); // doctor being booked
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
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
        setError('');
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  const openBooking = (doctor) => {
    setBooking(doctor);
    setSlot('');
    setReason('');
    setBookError('');
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBusy(true);
    setBookError('');
    try {
      await appointmentService.book({
        doctorId: booking.id,
        appointmentDate: new Date(slot).toISOString().slice(0, 19),
        reason,
      });
      toast(`Booked with ${booking.fullName}! See My Appointments.`, 'success');
      setTimeout(() => setBooking(null), 700);
    } catch (err) {
      setBookError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value, page: 0 }));

  return (
    <div>
      <div className="page-head">
        <h1><Stethoscope size={22} /> Find doctors</h1>
      </div>

      <div className="card">
        <div className="filters">
          <label className="grow">
            <span>Specialization</span>
            <div className="input-wrap">
              <span className="input-icon"><Search size={15} /></span>
              <select value={filters.specialization} onChange={setFilter('specialization')}>
                <option value="">All specializations</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </label>
          <label>
            <span>Min experience (years)</span>
            <input type="number" min="0" placeholder="Any" value={filters.minExperience} onChange={setFilter('minExperience')} />
          </label>
          <label>
            <span>Max fee (₹)</span>
            <input type="number" min="0" placeholder="Any" value={filters.maxFee} onChange={setFilter('maxFee')} />
          </label>
        </div>
      </div>

      <ErrorBanner message={error} onClose={() => setError('')} />
      {loading && doctors.length === 0 ? <Loading /> : null}

      {!loading && doctors.length === 0 && !error ? (
        <div className="card">
          <EmptyState
            title="No doctors match your filters"
            hint="Try widening your search or clearing a filter."
            icon={Stethoscope}
          />
        </div>
      ) : null}

      <div className="doctor-grid">
        {doctors.map((d) => (
          <div className="card doctor-card" key={d.id}>
            <div className="doctor-head">
              <Avatar name={d.fullName} size="md" ring />
              <div>
                <h3>{d.fullName}</h3>
                <span className="badge badge-blue">{d.specialization}</span>
              </div>
            </div>
            <p className="doctor-bio">{d.bio || 'No bio provided yet.'}</p>
            <div className="doctor-meta">
              <span className="meta-pill"><Money size={14} /> ₹{d.consultationFee}</span>
              <span className="meta-pill"><Stethoscope size={14} /> {d.experienceYears} yrs</span>
              <span className="meta-pill"><Clock size={14} /> {d.availableFrom}–{d.availableTo}</span>
            </div>
            <button className="btn btn-primary" onClick={() => openBooking(d)}>
              <Calendar size={15} /> Book appointment
            </button>
          </div>
        ))}
      </div>

      {booking ? (
        <div className="modal-backdrop" onClick={() => setBooking(null)}>
          <form className="modal card" onClick={(e) => e.stopPropagation()} onSubmit={submitBooking}>
            <div className="card-title-row" style={{ marginBottom: 8 }}>
              <h3><Calendar size={18} /> Book appointment</h3>
              <button type="button" className="btn btn-icon btn-outline" onClick={() => setBooking(null)} aria-label="Close">
                <X size={15} />
              </button>
            </div>

            <div className="booking-summary">
              <b>{booking.fullName}</b>
              <span className="muted">
                {booking.specialization} · ₹{booking.consultationFee} per visit · {booking.experienceYears} yrs experience
              </span>
              <span className="muted">Available {booking.availableFrom}–{booking.availableTo}</span>
            </div>

            <ErrorBanner message={bookError} onClose={() => setBookError('')} />

            <label className="field">
              <span>Date &amp; time — 30-minute slots, on the hour or half-hour, within working hours</span>
              <input
                type="datetime-local"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Reason for visit (optional)</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="e.g. follow-up check, chest pain, annual physical…" />
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
