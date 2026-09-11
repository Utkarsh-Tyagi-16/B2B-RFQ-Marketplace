/**
 * components/ProtectedRoute.jsx — Guards routes that require authentication.
 * Redirects unauthenticated users to /login.
 * If a requiredRole is specified, also redirects users with the wrong role.
 */

import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Not logged in — redirect to login, preserving intended destination and required role
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location, requiredRole }} replace />;
  }

  // Logged in but wrong role — show a not-authorized screen
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="not-authorized">
        <div className="not-authorized-card">
          <div className="not-authorized-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>
            This page is only accessible to <strong>{requiredRole}s</strong>.
          </p>
          <p>
            You are logged in as a <strong>{user?.role}</strong>.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
