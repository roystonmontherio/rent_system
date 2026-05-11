import axios from 'axios';

// ============================================
// 🔄 Environment Switch
// VITE_API_URL is set in frontend/.env
// Local:      http://localhost:5000/api
// Production: https://rent-system-backend-nfky.onrender.com/api
// ============================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor for automatically attaching the JWT
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth token from local storage', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear persisted auth state
      localStorage.removeItem('auth-storage');
      // Redirect to login (only if not already there)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
