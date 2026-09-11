/**
 * components/Navbar.jsx — Top navigation bar with active states & enterprise styling.
 */

import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true, state: null });
  };

  const getNavLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link--active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-logo-link">
            <div className="brand-icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div className="brand-text-group">
              <span className="brand-name">NexQuote</span>
              <span className="brand-tagline">B2B RFQ</span>
            </div>
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="navbar-links">
            {/* Buyer Navigation */}
            {user?.role === 'buyer' && (
              <>
                <NavLink to="/dashboard" className={getNavLinkClass}>
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/my-rfqs" className={getNavLinkClass}>
                  <span>My RFQs</span>
                </NavLink>
                <NavLink to="/rfqs/new" className="nav-link-cta">
                  <span>+ Create RFQ</span>
                </NavLink>
              </>
            )}

            {/* Supplier Navigation */}
            {user?.role === 'supplier' && (
              <>
                <NavLink to="/dashboard" className={getNavLinkClass}>
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/browse" className={getNavLinkClass}>
                  <span>Browse RFQs</span>
                </NavLink>
                <NavLink to="/my-quotations" className={getNavLinkClass}>
                  <span>My Quotations</span>
                </NavLink>
              </>
            )}

            <div className="navbar-user">
              <div className="user-profile-pill">
                <div className="user-avatar-circle">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="user-text-info">
                  <span className="user-display-name">{user?.name}</span>
                  <span className={`role-pill role-pill--${user?.role}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                className="btn btn--logout"
                onClick={handleLogout}
                title="Sign Out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-links">
            <Link to="/login" className="nav-link">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Get Started →
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
