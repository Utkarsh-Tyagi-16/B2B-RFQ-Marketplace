import { useState } from 'react';

/**
 * LaptopShowcase.jsx — Photorealistic Laptop Display with Interactive Demo Video
 * Features:
 * - Ultra-sleek metallic space-gray laptop chassis (MacBook Pro bezel, notch, keyboard deck base)
 * - Real live recorded video walkthrough of buyer and supplier workflows
 * - Interactive workflow tabs (Buyer RFQ Creation, Supplier Quotation, Deal Award)
 * - Floating telemetry callout cards
 */
export default function LaptopShowcase() {
  const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' | 'supplier' | 'award'
  const [isPlaying, setIsPlaying] = useState(true);

  const workflows = {
    buyer: {
      title: 'Buyer Experience: Post & Manage RFQs',
      badge: 'BUYER PORTAL',
      desc: 'Define product specs, exact unit counts, delivery location, and bidding deadlines in under 3 minutes.',
      src: '/demo-buyer.webp',
      stats: [
        { label: 'Form Completion', value: '< 2.5 min' },
        { label: 'Supplier Reach', value: '12,400+ Verified' },
        { label: 'Format', value: 'ISO / Spec Compliant' },
      ],
    },
    supplier: {
      title: 'Supplier Experience: Browse & Submit Bids',
      badge: 'SUPPLIER PORTAL',
      desc: 'Filter live global requirements by territory, input price per unit, estimate lead times, and attach dispatch notes.',
      src: '/demo-supplier.webp',
      stats: [
        { label: 'Search Latency', value: '< 120ms' },
        { label: 'Competitive Bids', value: 'Private & Sealed' },
        { label: 'Margin Calculation', value: 'Direct Unit Pricing' },
      ],
    },
  };

  const current = workflows[activeTab] || workflows.buyer;

  return (
    <section id="demo" className="section-laptop-demo">
      <div className="section-header-hud">
        <div className="hud-badge">
          <span className="hud-pulse" />
          INTERACTIVE PRODUCT DEMONSTRATION
        </div>
        <h2 className="section-title">SEE THE PLATFORM IN ACTION</h2>
        <p className="section-desc">
          Watch how enterprise buyers and certified suppliers negotiate, quote, and close procurement contracts in real time.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="laptop-tabs-container">
        <button
          className={`laptop-tab-btn ${activeTab === 'buyer' ? 'active' : ''}`}
          onClick={() => setActiveTab('buyer')}
        >
          <span className="tab-dot" />
          BUYER: DRAFT & PUBLISH RFQ
        </button>
        <button
          className={`laptop-tab-btn ${activeTab === 'supplier' ? 'active' : ''}`}
          onClick={() => setActiveTab('supplier')}
        >
          <span className="tab-dot" />
          SUPPLIER: BROWSE & SUBMIT BID
        </button>
      </div>

      {/* ─── REALISTIC LAPTOP DEVICE MOCKUP ───────────────────────────────── */}
      <div className="laptop-device-wrapper">
        <div className="laptop-chassis">
          {/* Top Bezel & Screen Lid */}
          <div className="laptop-lid">
            <div className="laptop-webcam">
              <span className="camera-lens" />
              <span className="camera-indicator" />
            </div>

            {/* Display Screen */}
            <div className="laptop-screen">
              {/* Screen Top Status Bar */}
              <div className="screen-header-bar">
                <div className="screen-window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="screen-url-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>app.nexquote.com/{activeTab === 'buyer' ? 'rfqs/new' : 'browse'}</span>
                </div>
                <div className="screen-live-tag">
                  <span className="live-rec-dot" />
                  <span>LIVE DEMO</span>
                </div>
              </div>

              {/* Video / Animated Display Media */}
              <div className="screen-media-canvas">
                <img
                  key={current.src}
                  src={current.src}
                  alt={current.title}
                  className="screen-video-asset"
                />

                {/* Subtle Glass Reflection Overlay */}
                <div className="screen-reflection-glaze" />
              </div>
            </div>
          </div>

          {/* Laptop Hinge & Base Chassis */}
          <div className="laptop-base">
            <div className="laptop-notch-recess" />
          </div>
          <div className="laptop-bottom-lip" />
        </div>

        {/* Ambient Underglow Shadow */}
        <div className="laptop-ambient-glow" />

        {/* Floating Telemetry Metric Cards */}
        <div className="floating-hud-card card-left">
          <div className="hud-metric-row">
            <span className="hud-metric-tag">{current.badge}</span>
            <span className="hud-status-live">ONLINE</span>
          </div>
          <h4>{current.title}</h4>
          <p>{current.desc}</p>
        </div>

        <div className="floating-hud-card card-right">
          <div className="hud-metric-header">PERFORMANCE TELEMETRY</div>
          {current.stats.map((s, idx) => (
            <div key={idx} className="hud-telemetry-stat">
              <span className="hud-stat-lbl">{s.label}</span>
              <span className="hud-stat-val">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
