/**
 * pages/MyQuotationsPage.jsx — Supplier's history of submitted quotations.
 * Shows each quotation alongside the related RFQ's name, location, and status.
 * Fetches from GET /api/quotations/my.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const MyQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetches this supplier's submitted quotations from GET /api/quotations/my
  const fetchQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/quotations/my');
      setQuotations(data.data.quotations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your quotations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  if (loading) return <Spinner message="Loading your quotations..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchQuotations} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Quotations</h1>
          <p>{quotations.length} quotation{quotations.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <Link to="/browse" className="btn btn-primary">
          Browse More RFQs
        </Link>
      </div>

      {quotations.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No quotations submitted yet"
          message="You haven't submitted any quotations. Browse open RFQs and start bidding!"
          action={
            <Link to="/browse" className="btn btn-primary">
              Browse Open RFQs
            </Link>
          }
        />
      ) : (
        <div className="rfq-list">
          {quotations.map((q) => {
            const rfq = q.rfqId;
            return (
              <div key={q._id} className="quotation-my-card">
                <div className="quotation-my-header">
                  <div>
                    <h3>{rfq?.productOrServiceName || 'RFQ Deleted'}</h3>
                    <div className="rfq-meta">
                      {rfq?.deliveryLocation && <span>{rfq.deliveryLocation}</span>}
                      {rfq?.quantity && <span>Qty: {rfq.quantity}</span>}
                      {rfq?.deadline && <span>RFQ Deadline: {formatDate(rfq.deadline)}</span>}
                    </div>
                  </div>
                  <div className="quotation-my-status" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className={`status-badge status-badge--${q.status || 'pending'}`}>
                      {q.status === 'accepted' ? 'Awarded' : q.status === 'rejected' ? 'Declined' : 'Under Review'}
                    </span>
                    {rfq && (
                      <span className={`status-badge status-badge--${rfq.status}`}>
                        RFQ {rfq.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="quotation-my-details">
                  <div className="detail-item">
                    <span className="detail-label">Your Quoted Price</span>
                    <span className="detail-value price-highlight">
                      ₹{q.quotedPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delivery Time</span>
                    <span className="detail-value">{q.estimatedDeliveryTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Submitted On</span>
                    <span className="detail-value">{formatDate(q.createdAt)}</span>
                  </div>
                </div>

                {q.message && (
                  <div className="quotation-my-message">
                    <span className="detail-label">Your Message</span>
                    <p>{q.message}</p>
                  </div>
                )}

                {rfq && (
                  <div className="quotation-my-footer">
                    <Link
                      to={`/rfqs/${rfq._id}`}
                      className="btn btn-outline btn-sm"
                      id={`view-rfq-from-quote-${q._id}`}
                    >
                      View Original RFQ →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyQuotationsPage;
