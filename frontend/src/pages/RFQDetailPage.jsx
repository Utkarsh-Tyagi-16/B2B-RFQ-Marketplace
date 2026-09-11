/**
 * pages/RFQDetailPage.jsx — Full RFQ detail view for suppliers.
 * Shows complete RFQ information and a "Submit Quotation" form at the bottom.
 * Prevents submission if the supplier has already quoted.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

const RFQDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quotation form state
  const [form, setForm] = useState({
    quotedPrice: '',
    estimatedDeliveryTime: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetches the full RFQ detail from GET /api/rfqs/:id
  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const { data } = await api.get(`/rfqs/${id}`);
        setRfq(data.data.rfq);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load RFQ details.');
      } finally {
        setLoading(false);
      }
    };
    fetchRFQ();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  // Validates the quotation form before submission
  const validateForm = () => {
    const newErrors = {};
    const price = parseFloat(form.quotedPrice);
    if (!form.quotedPrice || isNaN(price) || price <= 0) {
      newErrors.quotedPrice = 'Please enter a valid price greater than 0';
    }
    if (!form.estimatedDeliveryTime.trim()) {
      newErrors.estimatedDeliveryTime = 'Estimated delivery time is required';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submits the supplier's quotation to POST /api/quotations
  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await api.post('/quotations', {
        rfqId: id,
        quotedPrice: parseFloat(form.quotedPrice),
        estimatedDeliveryTime: form.estimatedDeliveryTime.trim(),
        message: form.message.trim(),
      });
      setSubmitSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit quotation.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner message="Loading RFQ details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!rfq) return null;

  const isOpen = rfq.status === 'open';

  return (
    <div className="page-container">
      <button className="back-link" onClick={() => navigate(-1)} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
        ← Back to Browse
      </button>

      {/* ── RFQ Detail Card ──────────────────────────────────── */}
      <div className="rfq-detail-card">
        <div className="rfq-detail-header">
          <div>
            <h1>{rfq.productOrServiceName}</h1>
            <div className="rfq-detail-meta">
              <span>Posted by {rfq.buyerId?.name}</span>
              <span>Deadline: {formatDate(rfq.deadline)}</span>
              <span>{rfq.deliveryLocation}</span>
              <span>Quantity: {rfq.quantity}</span>
            </div>
          </div>
          <span className={`status-badge status-badge--${rfq.status} status-badge--lg`}>
            {rfq.status}
          </span>
        </div>

        <div className="rfq-detail-body">
          <h3>Description</h3>
          <p className="rfq-full-description">{rfq.description}</p>
        </div>
      </div>

      {/* ── Quotation Submission Form ─────────────────────────── */}
      <div className="quotation-form-card">
        <h2>Submit Your Quotation</h2>

        {!isOpen && (
          <div className="info-banner info-banner--warning">
            ⚠️ This RFQ is <strong>closed</strong> and no longer accepting quotations.
          </div>
        )}

        {submitSuccess ? (
          <div className="submit-success">
            <div className="submit-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>Quotation Submitted!</h3>
            <p>Your quotation has been sent to the buyer. You can track it in My Quotations.</p>
            <button className="btn btn-primary" onClick={() => navigate('/my-quotations')}>
              View My Quotations
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitQuotation} noValidate>
            {submitError && (
              <div className="form-api-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {submitError}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quotedPrice">Quoted Price (₹) *</label>
                <input
                  id="quotedPrice"
                  name="quotedPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 25000"
                  value={form.quotedPrice}
                  onChange={handleChange}
                  className={formErrors.quotedPrice ? 'input-error' : ''}
                  disabled={!isOpen}
                />
                {formErrors.quotedPrice && (
                  <span className="field-error">{formErrors.quotedPrice}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="estimatedDeliveryTime">Estimated Delivery Time *</label>
                <input
                  id="estimatedDeliveryTime"
                  name="estimatedDeliveryTime"
                  type="text"
                  placeholder="e.g. 5-7 business days"
                  value={form.estimatedDeliveryTime}
                  onChange={handleChange}
                  className={formErrors.estimatedDeliveryTime ? 'input-error' : ''}
                  disabled={!isOpen}
                />
                {formErrors.estimatedDeliveryTime && (
                  <span className="field-error">{formErrors.estimatedDeliveryTime}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quote-message">Message to Buyer (optional)</label>
              <textarea
                id="quote-message"
                name="message"
                rows={3}
                placeholder="Any additional information, terms, or notes..."
                value={form.message}
                onChange={handleChange}
                disabled={!isOpen}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !isOpen}
                id="submit-quotation-btn"
              >
                {submitting ? 'Submitting...' : 'Submit Quotation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RFQDetailPage;
