import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';

/* ── Inline SVG icon helpers (no emoji) ──────────────────────────── */
const IconBarChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconZap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconPlusCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const IconClipboardList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconTrendingUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetches summary stats and latest items for the user's role
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'buyer') {
          const { data } = await api.get('/rfqs/my');
          const rfqs = data.data.rfqs;
          setStats({
            total: rfqs.length,
            open: rfqs.filter((r) => r.status === 'open').length,
            closed: rfqs.filter((r) => r.status === 'closed').length,
          });
          setRecentItems(rfqs.slice(0, 3));
        } else if (user?.role === 'supplier') {
          const [rfqsRes, quotesRes] = await Promise.all([
            api.get('/rfqs'),
            api.get('/quotations/my'),
          ]);
          setStats({
            openRFQs: rfqsRes.data.data.count,
            myQuotations: quotesRes.data.data.count,
          });
          setRecentItems(rfqsRes.data.data.rfqs.slice(0, 3));
        }
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return <Spinner message="Preparing your enterprise dashboard..." />;

  const isBuyer = user?.role === 'buyer';

  return (
    <div className="page-container dashboard-page">
      {/* ── Top Hero Greeting ────────────────────────────────────── */}
      <div className="dashboard-hero-banner">
        <div className="dashboard-hero-content">
          <div className="dashboard-badge">
            <span className="live-dot"></span>
            <span>Enterprise B2B Workspace</span>
          </div>
          <h1>
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="dashboard-subtitle">
            {isBuyer
              ? 'Oversee procurement, review incoming supplier bids, and award high-value contracts.'
              : 'Discover active requests for quotation, submit competitive pricing, and secure new accounts.'}
          </p>
        </div>

        <div className="dashboard-hero-cta">
          {isBuyer ? (
            <Link to="/rfqs/new" className="btn btn-primary btn-glow">
              <IconPlus />
              <span>Create New RFQ</span>
            </Link>
          ) : (
            <Link to="/browse" className="btn btn-primary btn-glow">
              <IconSearch />
              <span>Explore Open RFQs</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Metrics / KPI Grid ───────────────────────────────────── */}
      {isBuyer ? (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Total RFQs Posted</span>
              <div className="kpi-icon kpi-icon--blue"><IconBarChart /></div>
            </div>
            <div className="kpi-number">{stats?.total ?? 0}</div>
            <div className="kpi-trend">All requirements tracked</div>
          </div>

          <div className="kpi-card kpi-card--highlight">
            <div className="kpi-header">
              <span className="kpi-title">Active / Open RFQs</span>
              <div className="kpi-icon kpi-icon--green"><IconZap /></div>
            </div>
            <div className="kpi-number">{stats?.open ?? 0}</div>
            <div className="kpi-trend positive">Accepting quotations</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Completed / Closed</span>
              <div className="kpi-icon kpi-icon--purple"><IconCheckCircle /></div>
            </div>
            <div className="kpi-number">{stats?.closed ?? 0}</div>
            <div className="kpi-trend">Awarded or finalized</div>
          </div>
        </div>
      ) : (
        <div className="kpi-grid">
          <div className="kpi-card kpi-card--highlight">
            <div className="kpi-header">
              <span className="kpi-title">Market Opportunities</span>
              <div className="kpi-icon kpi-icon--green"><IconGlobe /></div>
            </div>
            <div className="kpi-number">{stats?.openRFQs ?? 0}</div>
            <div className="kpi-trend positive">Open for bidding now</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Quotes Submitted</span>
              <div className="kpi-icon kpi-icon--purple"><IconFileText /></div>
            </div>
            <div className="kpi-number">{stats?.myQuotations ?? 0}</div>
            <div className="kpi-trend">Your active proposals</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Supplier Rank</span>
              <div className="kpi-icon kpi-icon--blue"><IconStar /></div>
            </div>
            <div className="kpi-number">Verified</div>
            <div className="kpi-trend positive">Enterprise Registered</div>
          </div>
        </div>
      )}

      {/* ── Quick Action Modules ─────────────────────────────────── */}
      <div className="dashboard-sections-grid">
        {/* Left Column: Quick Workflow Actions */}
        <div className="dashboard-card">
          <div className="card-section-header">
            <div>
              <h3>Quick Workflow</h3>
              <p className="card-section-desc">Key tasks to accelerate your procurement</p>
            </div>
          </div>

          <div className="action-tile-list">
            {isBuyer ? (
              <>
                <Link to="/rfqs/new" className="action-tile">
                  <div className="action-tile-icon action-tile-icon--green"><IconPlusCircle /></div>
                  <div className="action-tile-body">
                    <h4>Draft &amp; Publish RFQ</h4>
                    <p>Specify technical specs, volume, and budget constraints</p>
                  </div>
                  <div className="action-tile-arrow"><IconArrowRight /></div>
                </Link>

                <Link to="/my-rfqs" className="action-tile">
                  <div className="action-tile-icon action-tile-icon--blue"><IconClipboardList /></div>
                  <div className="action-tile-body">
                    <h4>Compare Supplier Quotes</h4>
                    <p>Review competitive bids, evaluate pricing, and select winning suppliers</p>
                  </div>
                  <div className="action-tile-arrow"><IconArrowRight /></div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/browse" className="action-tile">
                  <div className="action-tile-icon action-tile-icon--green"><IconSearch /></div>
                  <div className="action-tile-body">
                    <h4>Browse Market RFQs</h4>
                    <p>Filter by industrial category, delivery location, and budget</p>
                  </div>
                  <div className="action-tile-arrow"><IconArrowRight /></div>
                </Link>

                <Link to="/my-quotations" className="action-tile">
                  <div className="action-tile-icon action-tile-icon--purple"><IconTrendingUp /></div>
                  <div className="action-tile-body">
                    <h4>Track Submitted Bids</h4>
                    <p>Check quotation approval status and buyer decisions in real time</p>
                  </div>
                  <div className="action-tile-arrow"><IconArrowRight /></div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Preview */}
        <div className="dashboard-card">
          <div className="card-section-header">
            <div>
              <h3>{isBuyer ? 'Your Active RFQs' : 'Latest Opportunities'}</h3>
              <p className="card-section-desc">Recently updated items</p>
            </div>
            <Link to={isBuyer ? '/my-rfqs' : '/browse'} className="card-header-link">
              View All →
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <div className="empty-preview">
              <p>No recent items found.</p>
              <Link to={isBuyer ? '/rfqs/new' : '/browse'} className="btn btn-outline btn-sm">
                {isBuyer ? 'Create First RFQ' : 'Find Opportunities'}
              </Link>
            </div>
          ) : (
            <div className="recent-items-list">
              {recentItems.map((item) => (
                <div key={item._id} className="recent-item-row">
                  <div className="recent-item-info">
                    <span className="recent-item-title">{item.productOrServiceName}</span>
                    <span className="recent-item-meta">
                      Qty: {item.quantity} · {item.deliveryLocation || 'Location flexible'}
                    </span>
                  </div>
                  <Link
                    to={isBuyer ? `/rfqs/${item._id}/quotations` : `/rfqs/${item._id}`}
                    className="btn btn-sm btn-outline"
                  >
                    {isBuyer ? 'View Quotes' : 'View RFQ'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
