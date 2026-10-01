import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import PatientDashboard from './pages/patient/PatientDashboard.jsx';
import FindDoctors from './pages/patient/FindDoctors.jsx';
import MyAppointments from './pages/patient/MyAppointments.jsx';
import PatientProfile from './pages/patient/PatientProfile.jsx';
import Notifications from './pages/shared/Notifications.jsx';
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import DoctorAppointments from './pages/doctor/DoctorAppointments.jsx';
import DoctorProfile from './pages/doctor/DoctorProfile.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/" element={<ProtectedRoute roles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient" element={<ProtectedRoute roles={['PATIENT']}><Layout><PatientDashboard /></Layout></ProtectedRoute>} />
        <Route path="/patient/doctors" element={<ProtectedRoute roles={['PATIENT']}><Layout><FindDoctors /></Layout></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute roles={['PATIENT']}><Layout><MyAppointments /></Layout></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute roles={['PATIENT']}><Layout><PatientProfile /></Layout></ProtectedRoute>} />
        <Route path="/patient/notifications" element={<ProtectedRoute roles={['PATIENT']}><Layout><Notifications /></Layout></ProtectedRoute>} />

        <Route path="/doctor" element={<ProtectedRoute roles={['DOCTOR']}><Layout><DoctorDashboard /></Layout></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute roles={['DOCTOR']}><Layout><DoctorAppointments /></Layout></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute roles={['DOCTOR']}><Layout><DoctorProfile /></Layout></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><Layout><AdminUsers /></Layout></ProtectedRoute>} />

        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}
