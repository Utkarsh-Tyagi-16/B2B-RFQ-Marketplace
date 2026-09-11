import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar.jsx — Cinematic Aerospace & B2B Logistics Header
 * Features:
 * - Ultra-bold display brand lockup
 * - High-contrast uppercase tracking navigation
 * - Crisp white capsule pill CTA matching the reference aesthetic ("WORK WITH US")
 * - Dynamic authenticated role status & quick logout
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true, state: null });
  };

  const getNavLinkClass = ({ isActive }) =>
    `nav-link-item ${isActive ? 'nav-link-item--active' : ''}`;

  return (
    <header className="navbar-cinematic">
      <div className="navbar-container">
        {/* Brand Lockup */}
        <div className="navbar-brand-col">
          <Link to="/" className="brand-lockup">
            <div className="brand-symbol">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="brand-text-block">
              <span className="brand-title">NEXQUOTE</span>
              <span className="brand-sub">GLOBAL B2B</span>
            </div>
          </Link>
        </div>

        {/* Center Navigation Links */}
        <nav className={`navbar-center-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                DASHBOARD
              </NavLink>

              {user?.role === 'buyer' && (
                <>
                  <NavLink to="/my-rfqs" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    MY RFQS
                  </NavLink>
                  <NavLink to="/rfqs/new" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    + POST RFQ
                  </NavLink>
                </>
              )}

              {user?.role === 'supplier' && (
                <>
                  <NavLink to="/browse" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    BROWSE RFQS
                  </NavLink>
                  <NavLink to="/my-quotations" className={getNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    MY QUOTES
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/" className="nav-link-item" onClick={() => setMobileMenuOpen(false)}>
                OVERVIEW
              </Link>
              <Link to="/browse" className="nav-link-item" onClick={() => setMobileMenuOpen(false)}>
                MARKETPLACE
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions-col">
          {isAuthenticated ? (
            <div className="auth-user-tray">
              <div className="user-hud-badge">
                <span className="user-avatar-initial">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
                <div className="user-hud-text">
                  <span className="user-hud-name">{user?.name}</span>
                  <span className={`role-chip role-chip--${user?.role}`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                className="btn-hud-logout"
                onClick={handleLogout}
                title="Sign Out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>LOGOUT</span>
              </button>
            </div>
          ) : (
            <div className="public-auth-tray">
              <Link to="/login" className="nav-link-signin">
                SIGN IN
              </Link>
              <Link to="/signup" className="btn-capsule-nav">
                SIGN UP
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
