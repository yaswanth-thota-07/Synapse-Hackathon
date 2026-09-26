import React, { useState, useEffect } from 'react';
import BackgroundVideo from './components/BackgroundVideo/BackgroundVideo';
import { Navbar } from './components/PeerDiscovery/Navbar';
import { SearchBox } from './components/PeerDiscovery/SearchBox';
import { TargetCompanyBanner } from './components/PeerDiscovery/TargetCompanyBanner';
import { PeerTable } from './components/PeerDiscovery/PeerTable';
import { SimilarityModal } from './components/PeerDiscovery/SimilarityModal';
import { ScoreModal } from './components/PeerDiscovery/ScoreModal';
import { discoverPeersApi } from './services/api';
import { Loader2, AlertCircle, Info } from 'lucide-react';

function App() {
  const [selectedTicker, setSelectedTicker] = useState('TCS.NS');
  const [targetCompany, setTargetCompany] = useState(null);
  const [peers, setPeers] = useState([]);
  const [universeType, setUniverseType] = useState('industry');
  const [universeCount, setUniverseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [similarityModalOpen, setSimilarityModalOpen] = useState(false);
  const [selectedPeerForSim, setSelectedPeerForSim] = useState(null);

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedCompanyForScore, setSelectedCompanyForScore] = useState(null);

  const fetchPeers = async (ticker) => {
    setLoading(true);
    setError(null);
    try {
      const data = await discoverPeersApi(ticker);
      const target = data.target_company || data.targetCompany;
      setTargetCompany(target);
      setPeers(data.peers || []);
      setUniverseType(data.universe_info?.is_sector_fallback ? 'sector' : 'industry');
      setUniverseCount(data.universe_info?.peer_count || (data.peers || []).length);
      setSelectedTicker(ticker);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load company peers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeers('TCS.NS');
  }, []);

  const handleSelectCompany = (ticker) => {
    fetchPeers(ticker);
  };

  const handleOpenSimilarityModal = (peer) => {
    setSelectedPeerForSim(peer);
    setSimilarityModalOpen(true);
  };

  const handleOpenScoreModal = (company) => {
    setSelectedCompanyForScore(company);
    setScoreModalOpen(true);
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* 1. Ambient Background Video with Pastel Wash Scrim */}
      <BackgroundVideo isPaused={similarityModalOpen || scoreModalOpen} />

      {/* 2. Top FLUX Navbar */}
      <Navbar />

      {/* 3. Main Content (z-index 2) */}
      <main style={{ position: 'relative', zIndex: 2, flex: 1, paddingBottom: '4rem', width: '100%' }}>
        {/* FLUX Centered Minimal Hero & Search */}
        <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 24px' }}>
          <section style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '3rem 0 2rem 0'
          }}>
            {/* Mono Kicker with flanking violet rule lines */}
            <div className="hero-kicker rise delay-300">
              DYNAMIC PEER GROUP DISCOVERY ENGINE
            </div>

            {/* Giant Display Headline */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(46px, 6.5vw, 96px)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              margin: '1.25rem 0 1rem 0'
            }} className="rise delay-380">
              Discover True Peers<span style={{ color: 'var(--accent-primary)' }}>.</span>
            </h1>

            {/* Sub-line directly addressing the Problem Statement */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: 'clamp(15px, 1.5vw, 18px)',
              color: 'var(--text-secondary)',
              maxWidth: '640px',
              lineHeight: 1.6,
              margin: '0 auto 2.25rem auto'
            }} className="rise delay-490">
              Exchanges and analysts rely on manual, static peer groups that quickly become outdated. Our AI system automatically figures out which companies are truly similar based on actual business and financial behavior—not just their industry label.
            </p>

            {/* Search Box */}
            <div id="discovery" style={{ width: '100%', maxWidth: '740px' }} className="rise delay-600">
              <SearchBox
                onSelectCompany={handleSelectCompany}
                selectedTicker={selectedTicker}
                isLoading={loading}
              />
            </div>
          </section>
        </div>

        {/* Full-Screen Results Container (Uses entire screen width, eliminating blank space on left & right) */}
        <div style={{ width: '100%', padding: '0 clamp(20px, 3vw, 56px)', margin: '0 auto' }}>
          {/* Error Banner */}
          {error && (
            <div style={{
              maxWidth: '880px',
              margin: '0 auto 2rem auto',
              background: '#fef2f2',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#dc2626'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Error Discovering Peers</div>
                <div style={{ fontSize: '0.82rem' }}>{error}</div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && !targetCompany && (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Analyzing Market Universe...
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Standardizing 12 financial dimensions across NSE
              </div>
            </div>
          )}

          {/* Peer Discovery Results — Expanded to Full Screen */}
          {targetCompany && (
            <div id="universe" style={{ marginTop: '1.5rem', width: '100%' }}>
              {/* Target Company Header Card */}
              <TargetCompanyBanner
                targetCompany={targetCompany}
                onOpenScoreModal={handleOpenScoreModal}
              />

              {/* Peers Table — Spans Full Screen Width */}
              <PeerTable
                peers={peers}
                targetCompany={targetCompany}
                universeType={universeType}
                universeCount={universeCount}
                onOpenSimilarityModal={handleOpenSimilarityModal}
                onOpenScoreModal={handleOpenScoreModal}
                onSelectCompany={handleSelectCompany}
              />
            </div>
          )}

          {/* Methodological Guidance Note — Expanded to Full Screen Width */}
          <div id="methodology" style={{
            background: '#ffffff',
            border: '1px solid rgba(23, 21, 31, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem clamp(1.5rem, 2vw, 2.5rem)',
            marginTop: '2rem',
            boxShadow: 'var(--shadow-sm)',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Info size={16} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Why Actual Business &amp; Financial Behavior Matters
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65
            }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>1. Beyond Static Industry Labels:</strong>
                <p style={{ marginTop: '0.35rem' }}>
                  Traditional exchanges group companies into rigid industry buckets that become outdated. Our system standardizes 12 multi-dimensional features (margins, returns, leverage, and volatility) to discover true operational peers.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>2. Decoupled Valuation &amp; Health (0–100):</strong>
                <p style={{ marginTop: '0.35rem' }}>
                  Judges whether a firm is fundamentally sound, overvalued, or undervalued across 6 independent pillars (Profitability 25%, Growth 20%, Health 20%, Valuation 15%, Performance 15%, Risk 5%) without distorting similarity ranking.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>3. AI Financial Synthesis:</strong>
                <p style={{ marginTop: '0.35rem' }}>
                  Generates transparent, point-wise and table-wise explanations of feature divergence and valuation trade-offs so analysts can evaluate why two firms are truly comparable.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Meta Row */}
          <footer className="footer-meta rise delay-720">
            <span className="meta-item">Actual Business &amp; Financial Behavior</span>
            <span className="meta-dot"></span>
            <span className="meta-item">Normalized Cosine Similarity</span>
            <span className="meta-dot"></span>
            <span className="meta-item">Decoupled 6-Pillar Model</span>
          </footer>
        </div>
      </main>

      {/* Similarity Modal */}
      <SimilarityModal
        isOpen={similarityModalOpen}
        onClose={() => setSimilarityModalOpen(false)}
        targetCompany={targetCompany}
        peerCompany={selectedPeerForSim}
      />

      {/* Score Modal */}
      <ScoreModal
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        company={selectedCompanyForScore}
      />
    </div>
  );
}

export default App;
