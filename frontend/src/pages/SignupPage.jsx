/**
 * pages/SignupPage.jsx — User registration form.
 * Collects name, email, password, and role. Validates client-side before
 * submitting to POST /api/auth/signup. On success, logs the user in and
 * redirects to the dashboard.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form field state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Updates a single form field and clears its validation error
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  // Client-side validation — returns true if all fields are valid
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!['buyer', 'supplier'].includes(form.role)) {
      newErrors.role = 'Please select a role';
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
      const { data } = await api.post('/auth/signup', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      // Store credentials and redirect to dashboard
      login(data.data.user, data.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
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
          Free to Join
        </div>

        <h1 className="auth-left-heading">
          Your smarter<br />
          <span style={{ color: '#60a5fa' }}>supply chain</span><br />
          starts here.
        </h1>

        <p className="auth-left-sub">
          Whether you're a procurement manager or an industrial supplier, NexQuote gives you the tools to do deals faster and smarter.
        </p>

        <div className="auth-stat-row">
          <div className="auth-stat">
            <span className="auth-stat-value">3 min</span>
            <span className="auth-stat-label">Avg RFQ post time</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-value">12+</span>
            <span className="auth-stat-label">Bids per RFQ</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-value">Free</span>
            <span className="auth-stat-label">Forever plan</span>
          </div>
        </div>

        <ul className="auth-feature-list">
          {[
            'Zero subscription fees to get started',
            'Verified supplier network across India',
            'Real-time bid notifications',
            'Secure contract award workflow',
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
            <h1>Create an Account</h1>
            <p>Join verified buyers &amp; suppliers worldwide</p>
          </div>

        {apiError && (
          <div className="form-api-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              autoComplete="name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
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

          {/* Password */}
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selector">
              <label
                className={`role-option ${form.role === 'buyer' ? 'role-option--active' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={form.role === 'buyer'}
                  onChange={handleChange}
                />
                <span className="role-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </span>
                <span className="role-label">Buyer</span>
                <span className="role-desc">Post RFQs, receive quotations</span>
              </label>
              <label
                className={`role-option ${form.role === 'supplier' ? 'role-option--active' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="supplier"
                  checked={form.role === 'supplier'}
                  onChange={handleChange}
                />
                <span className="role-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </span>
                <span className="role-label">Supplier</span>
                <span className="role-desc">Browse RFQs, submit quotations</span>
              </label>
            </div>
            {errors.role && <span className="field-error">{errors.role}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            id="signup-submit"
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
