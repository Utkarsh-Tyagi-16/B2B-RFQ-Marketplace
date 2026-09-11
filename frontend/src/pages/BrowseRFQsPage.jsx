/**
 * pages/BrowseRFQsPage.jsx — Supplier's marketplace view.
 * Lists all open RFQs with live search and filter controls.
 * Fetches from GET /api/rfqs with query parameters.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

// Returns how many days remain until the deadline (can be negative if past)
const daysUntil = (dateStr) => {
  const now = new Date();
  const deadline = new Date(dateStr);
  return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
};

const BrowseRFQsPage = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter/search state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [deadlineFrom, setDeadlineFrom] = useState('');
  const [deadlineTo, setDeadlineTo] = useState('');

  // Builds query params and fetches matching RFQs from the backend
  const fetchRFQs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      if (deadlineFrom) params.deadlineFrom = deadlineFrom;
      if (deadlineTo) params.deadlineTo = deadlineTo;

      const { data } = await api.get('/rfqs', { params });
      setRfqs(data.data.rfqs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load RFQs.');
    } finally {
      setLoading(false);
    }
  }, [search, location, deadlineFrom, deadlineTo]);

  // Re-fetch whenever filters change (with a small debounce for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRFQs();
    }, 400); // debounce 400ms so we don't hit the API on every keystroke
    return () => clearTimeout(timer);
  }, [fetchRFQs]);

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setDeadlineFrom('');
    setDeadlineTo('');
  };

  const hasActiveFilters = search || location || deadlineFrom || deadlineTo;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Browse RFQs</h1>
          <p>Find opportunities and submit competitive quotations.</p>
        </div>
      </div>

      {/* ── Search & Filter Panel ──────────────────────────────── */}
      <div className="filter-panel">
        <div className="filter-row">
          <div className="filter-group filter-group--wide">
            <label htmlFor="browse-search">Search by Product / Service</label>
            <input
              id="browse-search"
              type="text"
              placeholder="e.g. Steel bolts, Office chairs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="browse-location">Delivery Location</label>
            <input
              id="browse-location"
              type="text"
              placeholder="e.g. Mumbai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="browse-deadline-from">Deadline From</label>
            <input
              id="browse-deadline-from"
              type="date"
              value={deadlineFrom}
              onChange={(e) => setDeadlineFrom(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="browse-deadline-to">Deadline To</label>
            <input
              id="browse-deadline-to"
              type="date"
              value={deadlineTo}
              onChange={(e) => setDeadlineTo(e.target.value)}
            />
          </div>
          {hasActiveFilters && (
            <button className="btn btn-outline btn-sm filter-clear" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      {loading ? (
        <Spinner message="Searching RFQs..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchRFQs} />
      ) : rfqs.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No RFQs found"
          message={
            hasActiveFilters
              ? 'No open RFQs match your filters. Try adjusting your search.'
              : 'There are no open RFQs at the moment. Check back later!'
          }
          action={
            hasActiveFilters ? (
              <button className="btn btn-outline" onClick={clearFilters}>
                Clear Filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <p className="result-count">{rfqs.length} open RFQ{rfqs.length !== 1 ? 's' : ''} found</p>
          <div className="rfq-grid">
            {rfqs.map((rfq) => {
              const days = daysUntil(rfq.deadline);
              return (
                <div key={rfq._id} className="rfq-browse-card">
                  <div className="rfq-browse-card-header">
                    <h3>{rfq.productOrServiceName}</h3>
                    <span
                      className={`deadline-chip ${days <= 3 ? 'deadline-chip--urgent' : ''
                        }`}
                    >
                      {days > 0 ? `${days}d left` : 'Expired'}
                    </span>
                  </div>

                  <p className="rfq-description-preview">
                    {rfq.description.length > 100
                      ? rfq.description.slice(0, 100) + '...'
                      : rfq.description}
                  </p>

                  <div className="rfq-browse-meta">
                    <span>{rfq.deliveryLocation}</span>
                    <span>Qty: {rfq.quantity}</span>
                    <span>Due: {formatDate(rfq.deadline)}</span>
                    <span>{rfq.buyerId?.name}</span>
                  </div>

                  <Link
                    to={`/rfqs/${rfq._id}`}
                    className="btn btn-primary btn-sm rfq-detail-btn"
                    id={`view-rfq-${rfq._id}`}
                  >
                    View & Quote →
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default BrowseRFQsPage;
