/**
 * services/api.js — Centralized Axios instance for all API communication.
 *
 * An Axios request interceptor automatically attaches the JWT (stored in
 * localStorage) to every outgoing request as an Authorization header.
 * A response interceptor handles 401 errors globally — if the token has
 * expired or been revoked, the user is redirected to /login.
 *
 * WHY localStorage for the JWT:
 *   Using localStorage means the token is accessible to JavaScript (XSS risk),
 *   but allows simple Bearer-token authentication that works across different
 *   domains (e.g. Vercel frontend + Render backend) without cookie/CORS
 *   complications. For a production upgrade, switch to httpOnly cookies +
 *   CSRF tokens; the interceptor below is the only frontend code that changes.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a single reusable Axios instance pointing at our backend
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// Reads the JWT from localStorage and attaches it to every request header.
// If no token exists (unauthenticated user), the header is left out and the
// backend will respond with 401 for protected routes.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rfq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Intercepts 401 responses globally. If the token is expired/invalid, clear
// the stored credentials and redirect to /login so the user can re-authenticate.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loop if we're already on the login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        localStorage.removeItem('rfq_token');
        localStorage.removeItem('rfq_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
