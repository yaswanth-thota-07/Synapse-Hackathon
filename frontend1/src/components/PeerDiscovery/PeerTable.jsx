import React from 'react';
import { Percent, BarChart2, ArrowUpRight } from 'lucide-react';

export const PeerTable = ({
  peers = [],
  targetCompany,
  universeType,
  universeCount,
  onOpenSimilarityModal,
  onOpenScoreModal,
  onSelectCompany
}) => {
  const formatCurrency = (val) => {
    const num = Number(val);
    if (!num || isNaN(num)) return '—';
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
    return `₹${num.toLocaleString()}`;
  };

  const formatPct = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    const num = Number(val);
    if (isNaN(num)) return '—';
    const displayNum = (num * 100).toFixed(1);
    const isPos = num >= 0;
    return (
      <span style={{ color: isPos ? '#0d8a4e' : '#dc2626', fontWeight: 600 }}>
        {isPos ? `+${displayNum}%` : `${displayNum}%`}
      </span>
    );
  };

  const formatRatio = (val) => {
    const num = Number(val);
    if (!num || isNaN(num)) return '—';
    return `${num.toFixed(1)}x`;
  };



  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(23, 21, 31, 0.08)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      marginBottom: '3rem'
    }}>
      {/* Header bar */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(23, 21, 31, 0.08)',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Discovered Peer Universe
            <span className="badge badge-purple">
              Top {peers.length} of {universeCount || peers.length} Peers
            </span>
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Universe cluster: <strong>{targetCompany?.industry || targetCompany?.sector}</strong> ({universeType === 'industry' ? 'Industry Match' : 'Sector Match'})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
            <span>Similarity determines Rank</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d8a4e' }} />
            <span>Score indicates Financial Health</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
              <th>Company</th>
              <th style={{ minWidth: '180px' }}>
                Similarity Score
                <div style={{ fontSize: '0.65rem', textTransform: 'none', color: 'var(--text-muted)', fontWeight: 400 }}>
                  Normalized Cosine Metric
                </div>
              </th>
              <th style={{ minWidth: '170px' }}>
                Company Score
                <div style={{ fontSize: '0.65rem', textTransform: 'none', color: 'var(--text-muted)', fontWeight: 400 }}>
                  Decoupled 6-Pillar Health (0-100)
                </div>
              </th>
              <th>Market Cap</th>
              <th>P/E</th>
              <th>Rev Growth</th>
              <th>Profit Margin</th>
              <th>1Y Return</th>
              <th>Volatility</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((peer, idx) => {
              // similarity_score can be 88.2 or 0.882
              const rawSim = peer.similarity_score ?? peer.similarityScore ?? 0;
              const simPct = (rawSim <= 1 ? rawSim * 100 : rawSim).toFixed(1);

              const scoreObj = peer.company_score || peer.companyScore || {};
              const scoreVal = scoreObj.final_score ?? scoreObj.overallScore ?? 'N/A';

              const metrics = peer.key_metrics || {};

              return (
                <tr key={peer.ticker}>
                  {/* Rank */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: idx === 0 ? '#f4f2ff' : '#f8f7fa',
                      color: idx === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-heading)',
                      border: idx === 0 ? '1px solid rgba(124, 108, 255, 0.3)' : '1px solid rgba(23, 21, 31, 0.06)'
                    }}>
                      #{peer.rank || idx + 1}
                    </div>
                  </td>

                  {/* Company Name & Ticker */}
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {peer.company_name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          {peer.ticker}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {peer.industry || peer.sector}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Similarity Score & View Details Button */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                          {simPct}%
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>match</span>
                      </div>

                      {/* Similarity progress bar */}
                      <div style={{ width: '100%', height: '5px', background: '#eceaf0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.max(0, simPct))}%`, height: '100%', background: 'var(--accent-primary)' }} />
                      </div>

                      <button
                        onClick={() => onOpenSimilarityModal(peer)}
                        className="btn-view-sim"
                        style={{
                          marginTop: '0.45rem',
                          alignSelf: 'flex-start'
                        }}
                        title="View Full Similarity Breakdown"
                      >
                        <Percent size={13} />
                        <span>View Details</span>
                        <ArrowUpRight size={13} style={{ opacity: 0.75 }} />
                      </button>
                    </div>
                  </td>

                  {/* Company Score & View Details Button */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d8a4e' }}>
                          {scoreVal}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
                      </div>

                      {/* Score progress bar */}
                      <div style={{ width: '100%', height: '5px', background: '#eceaf0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.max(0, Number(scoreVal) || 0))}%`, height: '100%', background: '#0d8a4e' }} />
                      </div>

                      <button
                        onClick={() => onOpenScoreModal(peer)}
                        className="btn-view-score"
                        style={{
                          marginTop: '0.45rem',
                          alignSelf: 'flex-start'
                        }}
                        title="View 6-Pillar Financial Health Breakdown"
                      >
                        <BarChart2 size={13} />
                        <span>View Details</span>
                        <ArrowUpRight size={13} style={{ opacity: 0.75 }} />
                      </button>
                    </div>
                  </td>

                  {/* Market Cap */}
                  <td className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(metrics.market_cap)}
                  </td>

                  {/* P/E */}
                  <td className="font-mono" style={{ fontWeight: 600 }}>
                    {formatRatio(metrics.PE)}
                  </td>

                  {/* Revenue Growth */}
                  <td className="font-mono">
                    {formatPct(metrics.revenue_growth)}
                  </td>

                  {/* Profit Margin */}
                  <td className="font-mono">
                    {formatPct(metrics.profit_margin)}
                  </td>

                  {/* 1Y Return */}
                  <td className="font-mono">
                    {formatPct(metrics.return_1y)}
                  </td>

                  {/* Volatility */}
                  <td className="font-mono">
                    {metrics.volatility ? `${(Number(metrics.volatility) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
