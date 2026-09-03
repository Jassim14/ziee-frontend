import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (hadToken) {
        sessionStorage.setItem('session_expired', 'true');
      }
      const publicPaths = ['/', '/businesses', '/categories', '/about', '/contact', '/organizations', '/trainings', '/challenges', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
      const isPublic = publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/businesses/') || window.location.pathname.startsWith('/organizations/') || window.location.pathname.startsWith('/trainings/') || window.location.pathname.startsWith('/challenges/');
      if (hadToken && !isPublic && window.location.pathname !== '/login') {
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;