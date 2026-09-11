/**
 * App.jsx — Root component. Defines all client-side routes and wraps the
 * entire app in the AuthProvider so every component can access auth state.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateRFQPage from './pages/CreateRFQPage';
import EditRFQPage from './pages/EditRFQPage';
import MyRFQsPage from './pages/MyRFQsPage';
import RFQQuotationsPage from './pages/RFQQuotationsPage';
import BrowseRFQsPage from './pages/BrowseRFQsPage';
import RFQDetailPage from './pages/RFQDetailPage';
import MyQuotationsPage from './pages/MyQuotationsPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="app-main">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected: any authenticated user */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Buyer-only routes */}
              <Route
                path="/rfqs/new"
                element={
                  <ProtectedRoute requiredRole="buyer">
                    <CreateRFQPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfqs/:id/edit"
                element={
                  <ProtectedRoute requiredRole="buyer">
                    <EditRFQPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-rfqs"
                element={
                  <ProtectedRoute requiredRole="buyer">
                    <MyRFQsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfqs/:id/quotations"
                element={
                  <ProtectedRoute requiredRole="buyer">
                    <RFQQuotationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Supplier-only routes */}
              <Route
                path="/browse"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <BrowseRFQsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfqs/:id"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <RFQDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-quotations"
                element={
                  <ProtectedRoute requiredRole="supplier">
                    <MyQuotationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
