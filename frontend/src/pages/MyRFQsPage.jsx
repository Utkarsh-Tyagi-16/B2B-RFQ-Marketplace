/**
 * pages/MyRFQsPage.jsx — Buyer's list of all their posted RFQs.
 * Shows status badges, quotation count links, and edit/delete actions.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

// Formats an ISO date string into a readable local date
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const MyRFQsPage = () => {
  const location = useLocation();

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || '');

  // Fetches the buyer's own RFQs from GET /api/rfqs/my
  const fetchRFQs = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/rfqs/my');
      setRfqs(data.data.rfqs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your RFQs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
    // Clear success message after 4 seconds
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  // Soft-deletes (closes) an RFQ after confirmation
  const handleDelete = async (rfqId) => {
    if (!window.confirm('Close this RFQ? Suppliers will no longer be able to quote on it.')) {
      return;
    }
    setDeletingId(rfqId);
    try {
      await api.delete(`/rfqs/${rfqId}`);
      setRfqs((prev) =>
        prev.map((r) => (r._id === rfqId ? { ...r, status: 'closed' } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close RFQ.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Spinner message="Loading your RFQs..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRFQs} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My RFQs</h1>
          <p>{rfqs.length} request{rfqs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Link to="/rfqs/new" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New RFQ
        </Link>
      </div>

      {successMsg && (
        <div className="success-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>
          {successMsg}
        </div>
      )}

      {rfqs.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No RFQs yet"
          message="You haven't posted any Requests for Quotation. Post your first one and start receiving competitive bids!"
          action={
            <Link to="/rfqs/new" className="btn btn-primary">
              Post Your First RFQ
            </Link>
          }
        />
      ) : (
        <div className="rfq-list">
          {rfqs.map((rfq) => (
            <div key={rfq._id} className="rfq-card">
              <div className="rfq-card-header">
                <div>
                  <h3 className="rfq-title">{rfq.productOrServiceName}</h3>
                  <div className="rfq-meta">
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {rfq.deliveryLocation}
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      Qty: {rfq.quantity}
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Deadline: {formatDate(rfq.deadline)}
                    </span>
                  </div>
                </div>
                <span className={`status-badge status-badge--${rfq.status}`}>
                  {rfq.status}
                </span>
              </div>

              <p className="rfq-description">{rfq.description}</p>

              <div className="rfq-card-footer">
                <div className="rfq-dates">
                  <span>Posted {formatDate(rfq.createdAt)}</span>
                </div>
                <div className="rfq-actions">
                  <Link
                    to={`/rfqs/${rfq._id}/quotations`}
                    className="btn btn-outline btn-sm"
                    id={`view-quotes-${rfq._id}`}
                  >
                    View Quotations
                  </Link>
                  {rfq.status === 'open' && (
                    <>
                      <Link
                        to={`/rfqs/${rfq._id}/edit`}
                        className="btn btn-outline btn-sm"
                        id={`edit-rfq-${rfq._id}`}
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(rfq._id)}
                        disabled={deletingId === rfq._id}
                        id={`close-rfq-${rfq._id}`}
                      >
                        {deletingId === rfq._id ? 'Closing...' : 'Close RFQ'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRFQsPage;
