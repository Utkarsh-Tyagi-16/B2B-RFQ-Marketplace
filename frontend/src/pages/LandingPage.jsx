import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalTradeGlobe from '../components/GlobalTradeGlobe';

/**
 * LandingPage.jsx — Cinematic Aerospace & Global Logistics Portal
 * Inspired by United Carriers aesthetic:
 * - Deep cosmic void background with solar amber corona & electric cyan horizon
 * - High-impact display typography (Syne & Space Grotesk)
 * - 3D Interactive Global Trade Globe Canvas
 * - Telemetry HUD metrics & live procurement radar showcase
 */
export default function LandingPage() {
  const { user } = useAuth();

  const liveTenders = [
    {
      id: 'rfq-101',
      title: 'Aerospace-Grade Titanium Fasteners (Grade 5)',
      category: 'Advanced Manufacturing',
      quantity: '45,000 Pcs',
      location: 'Frankfurt, Germany',
      hub: 'FRA-EU',
      deadline: 'In 5 Days',
      status: 'Open',
      budget: '₹32,50,000',
    },
    {
      id: 'rfq-102',
      title: 'Industrial Lithium-Ion Battery Storage Modules',
      category: 'Renewable Energy',
      quantity: '250 Units',
      location: 'Mumbai, India',
      hub: 'BOM-IN',
      deadline: 'In 8 Days',
      status: 'Open',
      budget: '₹88,00,000',
    },
    {
      id: 'rfq-103',
      title: 'Precision CNC Machined Aluminum Enclosures',
      category: 'Telecommunications',
      quantity: '8,000 Units',
      location: 'Dubai, UAE',
      hub: 'DXB-ME',
      deadline: 'In 3 Days',
      status: 'Open',
      budget: '₹19,20,000',
    },
    {
      id: 'rfq-104',
      title: 'High-Speed Optical Fiber Transceivers (100G)',
      category: 'Data Centers',
      quantity: '1,200 Pairs',
      location: 'Singapore',
      hub: 'SIN-SEA',
      deadline: 'In 12 Days',
      status: 'Open',
      budget: '₹42,00,000',
    },
  ];

  return (
    <div className="landing-viewport">
      {/* ─── 1. CINEMATIC HERO SECTION ───────────────────────────────────── */}
      <section className="hero-cosmic">
        {/* Background 3D Interactive Globe Canvas */}
        <GlobalTradeGlobe className="hero-globe-layer" />

        <div className="hero-content-wrapper">
          <div className="hero-text-block">
            {/* Operator Subtitle Kicker */}
            <div className="hero-kicker">
              <span className="kicker-dot" />
              <span className="kicker-text">ONE OPERATOR · GLOBAL PROCUREMENT & LOGISTICS</span>
            </div>

            {/* Massive Display Headline */}
            <h1 className="hero-headline">
              EVERY ROUTE.<br />
              EVERY QUOTE.<br />
              <span className="headline-highlight">ONE NETWORK.</span>
            </h1>

            {/* Subtext */}
            <p className="hero-subtext">
              The next-generation B2B Request for Quotation ecosystem. Uniting enterprise procurement
              directors with verified international manufacturers across an intelligent, real-time bidding network.
            </p>

            {/* Primary Action Buttons */}
            <div className="hero-cta-group">
              {user ? (
                <Link to="/dashboard" className="btn-capsule-white">
                  ENTER {user.role?.toUpperCase()} DASHBOARD
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link to="/signup?role=buyer" className="btn-capsule-white">
                    POST AN RFQ
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <Link to="/signup?role=supplier" className="btn-capsule-outline">
                    JOIN AS SUPPLIER
                  </Link>
                </>
              )}
            </div>

            {/* Quick Role Direct Switch */}
            <div className="hero-role-indicators">
              <div className="role-indicator-pill">
                <span className="role-tag buyer-tag">BUYERS</span>
                <span className="role-desc">Source direct from verified manufacturers</span>
              </div>
              <div className="role-indicator-pill">
                <span className="role-tag supplier-tag">SUPPLIERS</span>
                <span className="role-desc">Access high-volume global contracts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Telemetry Bar */}
        <div className="telemetry-bar">
          <div className="telemetry-item">
            <span className="telemetry-val">₹480M+</span>
            <span className="telemetry-lbl">ANNUAL BID VOLUME</span>
          </div>
          <div className="telemetry-separator" />
          <div className="telemetry-item">
            <span className="telemetry-val">12,400+</span>
            <span className="telemetry-lbl">VERIFIED SUPPLIERS</span>
          </div>
          <div className="telemetry-separator" />
          <div className="telemetry-item">
            <span className="telemetry-val">99.8%</span>
            <span className="telemetry-lbl">FULFILLMENT SLA</span>
          </div>
          <div className="telemetry-separator" />
          <div className="telemetry-item">
            <span className="telemetry-val">&lt; 3.2h</span>
            <span className="telemetry-lbl">AVG QUOTE RESPONSE</span>
          </div>
        </div>
      </section>

      {/* ─── 2. LIVE RFQ RADAR SHOWCASE ──────────────────────────────────── */}
      <section className="section-radar" id="radar">
        <div className="section-header-hud">
          <div className="hud-badge">
            <span className="hud-pulse" />
            LIVE MARKETPLACE RADAR
          </div>
          <h2 className="section-title">ACTIVE PROCUREMENT TENDERS</h2>
          <p className="section-desc">
            Real-time procurement requirements currently open for competitive quotation.
          </p>
        </div>

        <div className="radar-grid">
          {liveTenders.map((tender) => (
            <div key={tender.id} className="radar-card">
              <div className="radar-card-top">
                <span className="radar-hub-badge">{tender.hub}</span>
                <span className="radar-status-badge">
                  <span className="status-blink-dot" /> {tender.status.toUpperCase()}
                </span>
              </div>

              <h3 className="radar-card-title">{tender.title}</h3>
              <p className="radar-category">{tender.category}</p>

              <div className="radar-card-meta">
                <div className="meta-row">
                  <span className="meta-label">QUANTITY</span>
                  <span className="meta-value">{tender.quantity}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">DELIVERY TARGET</span>
                  <span className="meta-value">{tender.location}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">CLOSING IN</span>
                  <span className="meta-value text-amber">{tender.deadline}</span>
                </div>
              </div>

              <div className="radar-card-footer">
                <Link
                  to={user ? (user.role === 'supplier' ? '/browse' : '/dashboard') : '/signup?role=supplier'}
                  className="radar-action-btn"
                >
                  {user?.role === 'supplier' ? 'SUBMIT QUOTATION' : 'VIEW SPECIFICATIONS'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="radar-cta-wrap">
          <Link to="/browse" className="btn-capsule-outline">
            BROWSE ALL OPEN MARKETPLACE RFQS
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ─── 3. BIFURCATED WORKFLOW ARCHITECTURE ──────────────────────────── */}
      <section className="section-architecture" id="architecture">
        <div className="section-header-hud">
          <div className="hud-badge">SYSTEM ARCHITECTURE</div>
          <h2 className="section-title">INTELLIGENT TRADE FLOW</h2>
          <p className="section-desc">
            A frictionless, transparent procurement protocol built for high-stakes enterprise transactions.
          </p>
        </div>

        <div className="architecture-grid">
          {/* Buyer Pipeline */}
          <div className="arch-col buyer-col">
            <div className="arch-header">
              <div className="arch-icon-squircle buyer-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
              </div>
              <div>
                <span className="arch-pill buyer-pill">BUYER PIPELINE</span>
                <h3 className="arch-col-title">Source & Procure</h3>
              </div>
            </div>

            <div className="arch-step">
              <div className="arch-step-num">01</div>
              <div className="arch-step-content">
                <h4>Publish Precise RFQ Specs</h4>
                <p>Define bill-of-materials, exact quantities, tolerance specs, and strict delivery deadlines.</p>
              </div>
            </div>

            <div className="arch-step">
              <div className="arch-step-num">02</div>
              <div className="arch-step-content">
                <h4>Receive Competitive Bids</h4>
                <p>Vetted suppliers submit transparent unit prices, verified lead times, and dispatch plans.</p>
              </div>
            </div>

            <div className="arch-step">
              <div className="arch-step-num">03</div>
              <div className="arch-step-content">
                <h4>Compare & Award Contracts</h4>
                <p>Award quotes with 1-click. Unselected bids are automatically resolved and recorded.</p>
              </div>
            </div>

            <Link to="/signup?role=buyer" className="arch-action-link buyer-link">
              Create Free Buyer Account →
            </Link>
          </div>

          {/* Supplier Pipeline */}
          <div className="arch-col supplier-col">
            <div className="arch-header">
              <div className="arch-icon-squircle supplier-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <span className="arch-pill supplier-pill">SUPPLIER PIPELINE</span>
                <h3 className="arch-col-title">Bid & Deliver</h3>
              </div>
            </div>

            <div className="arch-step">
              <div className="arch-step-num">01</div>
              <div className="arch-step-content">
                <h4>Browse Direct RFQs</h4>
                <p>Search global tenders filtered by geography, product category, or fulfillment deadlines.</p>
              </div>
            </div>

            <div className="arch-step">
              <div className="arch-step-num">02</div>
              <div className="arch-step-content">
                <h4>Submit Competitive Quotes</h4>
                <p>Offer your best per-unit pricing, guaranteed lead time, and value-added notes.</p>
              </div>
            </div>

            <div className="arch-step">
              <div className="arch-step-num">03</div>
              <div className="arch-step-content">
                <h4>Fulfill & Scale Revenue</h4>
                <p>Get awarded deals, build high-reputation vendor ratings, and establish recurring contracts.</p>
              </div>
            </div>

            <Link to="/signup?role=supplier" className="arch-action-link supplier-link">
              Register as Verified Supplier →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 5. ENTERPRISE SECURITY & SLA GRID ───────────────────────────── */}
      <section className="section-security" id="security">
        <div className="security-hud-card">
          <div className="security-grid">
            <div className="security-item">
              <div className="sec-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4>Sealed Bid Architecture</h4>
              <p>Quotations remain private and tamper-evident until buyer evaluation, eliminating price-rigging.</p>
            </div>

            <div className="security-item">
              <div className="sec-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h4>Tier-1 Verified Suppliers</h4>
              <p>Strict identity verification, tax compliance, and business credential authentication for all vendors.</p>
            </div>

            <div className="security-item">
              <div className="sec-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h4>Real-Time Deal Telemetry</h4>
              <p>Instant tracking of quotation submissions, counter-offers, and status changes in sub-second time.</p>
            </div>

            <div className="security-item">
              <div className="sec-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h4>Complete Audit Trail</h4>
              <p>Every RFQ revision, bid entry, and acceptance event is stamped for regulatory and enterprise compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. FINAL CALL TO ACTION ─────────────────────────────────────── */}
      <section className="section-final-cta">
        <div className="final-cta-backdrop" />
        <div className="final-cta-content">
          <div className="hud-badge">START TODAY</div>
          <h2 className="final-cta-title">
            TRANSFORM YOUR PROCUREMENT.<br />
            AT SCALE.
          </h2>
          <p className="final-cta-desc">
            Join thousands of procurement leaders and global suppliers already accelerating their supply chains.
          </p>

          <div className="final-cta-buttons">
            <Link to="/signup?role=buyer" className="btn-capsule-white">
              GET STARTED AS BUYER
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/signup?role=supplier" className="btn-capsule-outline">
              REGISTER AS SUPPLIER
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6. FOOTER ───────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-sq" />
              <span className="logo-name">NEXQUOTE</span>
            </div>
            <p className="footer-tagline">
              Autonomous Global B2B RFQ Marketplace & Procurement Network.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h5>PLATFORM</h5>
              <Link to="/browse">Marketplace</Link>
              <Link to="/signup?role=buyer">Buyer Portal</Link>
              <Link to="/signup?role=supplier">Supplier Network</Link>
            </div>
            <div className="footer-col">
              <h5>RESOURCES</h5>
              <Link to="/login">Account Login</Link>
              <Link to="/signup">New Registration</Link>
              <a href="https://github.com/Utkarsh-Tyagi-16/-B2B-RFQ-Marketplace" target="_blank" rel="noreferrer">
                GitHub Repository
              </a>
            </div>
            <div className="footer-col">
              <h5>TELEMETRY</h5>
              <span className="footer-status-pill">
                <span className="status-dot-green" /> CLOUD SERVICES ONLINE
              </span>
              <span className="footer-sub">Version 2.4.0-Enterprise</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NexQuote B2B Marketplace. All rights reserved.</span>
          <span className="footer-tech-stack">MERN · Express · React 19 · Vite · JWT</span>
        </div>
      </footer>
    </div>
  );
}
