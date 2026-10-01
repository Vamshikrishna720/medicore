import axios from 'axios';

const TOKEN_KEY = 'medicore_token';
const USER_KEY = 'medicore_user';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request (axios interceptor)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, role) => api.post('/auth/register', { email, password, role }),
  me: () => api.get('/auth/me'),
  deactivateMe: () => api.delete('/auth/me'),
  setStatus: (userId, active) => api.patch(`/auth/users/${userId}/status`, { active }),
  listUsers: (search, page, size) =>
    api.get('/auth/users', { params: { search, page, size } }),
};

export const patientService = {
  getMyProfile: () => api.get('/patients/me'),
  createMyProfile: (data) => api.post('/patients/me', data),
  updateMyProfile: (data) => api.put('/patients/me', data),
  list: (page, size) => api.get('/patients', { params: { page, size } }),
};

export const doctorService = {
  search: (filters) => api.get('/doctors', { params: filters }),
  get: (id) => api.get(`/doctors/${id}`),
  specializations: () => api.get('/doctors/specializations'),
  getMyProfile: () => api.get('/doctors/me'),
  createMyProfile: (data) => api.post('/doctors/me', data),
  updateMyProfile: (data) => api.put('/doctors/me', data),
  setAvailability: (available) =>
    api.patch(`/doctors/me/availability?available=${available}`),
};

export const appointmentService = {
  book: (data) => api.post('/appointments', data),
  myPatient: (page, size) => api.get('/appointments/me/patient', { params: { page, size } }),
  myDoctor: (page, size) => api.get('/appointments/me/doctor', { params: { page, size } }),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status?status=${status}`),
  stats: () => api.get('/appointments/stats'),
};

export const notificationService = {
  myNotifications: (page, size) =>
    api.get('/notifications', { params: { page, size } }),
};

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export function extractError(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}
