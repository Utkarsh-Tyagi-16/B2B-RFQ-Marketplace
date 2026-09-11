/**
 * pages/RFQQuotationsPage.jsx — Buyer's view of all quotations for one RFQ.
 * Fetches from GET /api/rfqs/:id/quotations — only accessible by the RFQ owner.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const RFQQuotationsPage = () => {
  const { id } = useParams();
  const [quotations, setQuotations] = useState([]);
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetches all quotations for this specific RFQ (buyer-only route)
  const fetchQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/rfqs/${id}/quotations`);
      setQuotations(data.data.quotations);
      setRfq(data.data.rfq);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quotations.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (quotationId) => {
    if (!window.confirm('Are you sure you want to accept this quotation? This will officially award this RFQ to this supplier and close further bidding.')) {
      return;
    }
    setAcceptingId(quotationId);
    setError('');
    setActionSuccess('');
    try {
      const { data } = await api.patch(`/quotations/${quotationId}/accept`);
      setActionSuccess(data.message || 'Quotation accepted successfully!');
      await fetchQuotations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept quotation.');
    } finally {
      setAcceptingId(null);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [id]);

  if (loading) return <Spinner message="Loading quotations..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchQuotations} />;

  const acceptedQuotation = quotations.find((q) => q.status === 'accepted');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Link to="/my-rfqs" className="back-link">← My RFQs</Link>
          <h1>Quotations Received</h1>
          {rfq && (
            <p className="page-subtitle">
              For: <strong>{rfq.productOrServiceName}</strong> ·{' '}
              <span className={`status-badge status-badge--${rfq.status}`}>{rfq.status}</span>
            </p>
          )}
        </div>
        <div className="quotation-count-badge">
          {quotations.length} Quote{quotations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {actionSuccess && (
        <div className="alert-banner alert-banner--success" style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>
          {actionSuccess}
        </div>
      )}

      {acceptedQuotation && (
        <div className="alert-banner alert-banner--success" style={{ marginBottom: '1.5rem' }}>
          <strong>Deal Awarded!</strong> You accepted the quote from <strong>{acceptedQuotation.supplierId?.name}</strong> (₹{acceptedQuotation.quotedPrice.toLocaleString('en-IN')}). Contact them at <a href={`mailto:${acceptedQuotation.supplierId?.email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{acceptedQuotation.supplierId?.email}</a> to proceed with order fulfillment.
        </div>
      )}

      {quotations.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No quotations yet"
          message="Suppliers haven't submitted any quotations for this RFQ yet. Share your RFQ details to attract more suppliers."
        />
      ) : (
        <div className="quotation-list">
          {quotations.map((q, index) => {
            const isAccepted = q.status === 'accepted';
            const isRejected = q.status === 'rejected';

            return (
              <div
                key={q._id}
                className={`quotation-card ${isAccepted ? 'quotation-card--accepted' : ''} ${isRejected ? 'quotation-card--rejected' : ''}`}
              >
                <div className="quotation-card-header">
                  <div className="quotation-rank">#{index + 1}</div>
                  <div className="quotation-supplier">
                    <div className="supplier-avatar">
                      {q.supplierId?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="supplier-name">{q.supplierId?.name}</div>
                      <div className="supplier-email">{q.supplierId?.email}</div>
                    </div>
                  </div>
                  <div className="quotation-price">
                    <span className="price-label">Quoted Price</span>
                    <span className="price-value">₹{q.quotedPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="quotation-details">
                  <div className="detail-item">
                    <span className="detail-label">Delivery Time</span>
                    <span className="detail-value">{q.estimatedDeliveryTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted</span>
                    <span className="detail-value">{formatDate(q.createdAt)}</span>
                  </div>
                </div>

                {q.message && (
                  <div className="quotation-message">
                    <span className="detail-label">Supplier Message</span>
                    <p>{q.message}</p>
                  </div>
                )}

                <div className="quotation-card-actions">
                  <div>
                    <span className={`status-badge status-badge--${q.status || 'pending'}`}>
                      {isAccepted ? '✓ Accepted' : isRejected ? 'Declined' : 'Under Review'}
                    </span>
                  </div>

                  {rfq?.status === 'open' && !acceptedQuotation && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAccept(q._id)}
                      disabled={acceptingId === q._id}
                    >
                      {acceptingId === q._id ? 'Accepting...' : 'Accept Quotation'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RFQQuotationsPage;
