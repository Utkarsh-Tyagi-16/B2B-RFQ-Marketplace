/**
 * pages/LoginPage.jsx — User login form.
 * Validates credentials client-side, then calls POST /api/auth/login.
 * On success, stores the JWT and user in context and redirects to dashboard.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Redirect back to the page the user was trying to access (if any)
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  // Basic client-side validation before hitting the network
  const validate = () => {
    const newErrors = {};
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      login(data.data.user, data.data.token);

      const userRole = data.data.user?.role;
      const intendedDestination = location.state?.from?.pathname;
      const requiredRole = location.state?.requiredRole;

      let destination = '/dashboard';

      // Only redirect to the previous page if the logged-in user's role is allowed
      if (intendedDestination && intendedDestination !== '/login' && intendedDestination !== '/signup') {
        if (!requiredRole || requiredRole === userRole) {
          const buyerOnlyPrefixes = ['/my-rfqs', '/rfqs/new'];
          const supplierOnlyPrefixes = ['/browse', '/my-quotations'];

          const isBuyerPath = buyerOnlyPrefixes.some((p) => intendedDestination.startsWith(p)) || intendedDestination.includes('/quotations');
          const isSupplierPath = supplierOnlyPrefixes.some((p) => intendedDestination.startsWith(p));

          if (userRole === 'buyer' && !isSupplierPath) {
            destination = intendedDestination;
          } else if (userRole === 'supplier' && !isBuyerPath) {
            destination = intendedDestination;
          }
        }
      }

      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left: Marketing Panel ──────────────────────────────────── */}
      <div className="auth-panel-left">
        <div className="auth-left-badge">
          <span className="live-dot" />
          Live B2B Marketplace
        </div>

        <h1 className="auth-left-heading">
          Procurement that<br />
          <span style={{ color: '#60a5fa' }}>moves at speed.</span>
        </h1>

        <p className="auth-left-sub">
          NexQuote connects enterprise buyers with verified suppliers. Post an RFQ in minutes, receive competitive bids, and award contracts — all in one place.
        </p>

        <div className="auth-stat-row">
          <div className="auth-stat">
            <span className="auth-stat-value">2,400+</span>
            <span className="auth-stat-label">Active suppliers</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-value">₹8.5Cr</span>
            <span className="auth-stat-label">Contracts awarded</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-value">94%</span>
            <span className="auth-stat-label">Bid success rate</span>
          </div>
        </div>

        <ul className="auth-feature-list">
          {[
            'Post RFQs in under 3 minutes',
            'Receive competitive bids instantly',
            'Award contracts with one click',
            'Track all procurement in one dashboard',
          ].map((f) => (
            <li key={f} className="auth-feature-item">
              <span className="check-icon">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right: Form Panel ──────────────────────────────────────── */}
      <div className="auth-panel-right">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-icon-wrapper" style={{ margin: '0 auto 14px', width: '46px', height: '46px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your NexQuote account</p>
          </div>

          {apiError && (
            <div className="form-api-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              id="login-submit"
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/signup">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

