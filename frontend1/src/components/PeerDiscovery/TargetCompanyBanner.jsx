import React from 'react';
import { Building2, Layers, BarChart3, ArrowUpRight } from 'lucide-react';

export const TargetCompanyBanner = ({ targetCompany, onOpenScoreModal }) => {
  if (!targetCompany) return null;

  const raw = targetCompany.raw_metrics || targetCompany;
  const scoreObj = targetCompany.company_score || targetCompany.companyScore || {};
  const scoreVal = scoreObj.final_score ?? scoreObj.overallScore ?? 'N/A';



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
    return `${num.toFixed(2)}x`;
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(23, 21, 31, 0.08)',
      padding: '1.75rem',
      boxShadow: 'var(--shadow-md)',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid rgba(23, 21, 31, 0.06)'
      }}>
        {/* Left: Target subject info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
              background: '#f4f2ff',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px'
            }}>
              Target Subject
            </span>
            <span className="font-mono" style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--text-secondary)'
            }}>
              {targetCompany.ticker}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            {targetCompany.company_name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-purple">
              <Building2 size={12} />
              {targetCompany.sector || 'Sector'}
            </span>
            <span className="badge badge-neutral">
              <Layers size={12} />
              {targetCompany.industry || 'Industry'}
            </span>
          </div>
        </div>

        {/* Right: Company Strength Score Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          background: '#f8f7fa',
          padding: '1rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(23, 21, 31, 0.06)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              Company Score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {scoreVal}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Independent Financial Composite
            </div>
          </div>

          <button
            onClick={() => onOpenScoreModal(targetCompany)}
            className="btn-view-sim"
            style={{
              padding: '0.55rem 1.05rem',
              fontSize: '0.84rem'
            }}
            title="View Target Financial Health Assessment"
          >
            <BarChart3 size={15} />
            <span>View Details</span>
            <ArrowUpRight size={14} style={{ opacity: 0.75 }} />
          </button>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginTop: '1.25rem'
      }}>
        <MetricItem label="Market Cap" value={formatCurrency(raw.market_cap)} />
        <MetricItem label="P/E Ratio" value={formatRatio(raw.PE || raw.pe_ratio)} />
        <MetricItem label="ROE" value={formatPct(raw.ROE || raw.roe)} />
        <MetricItem label="Profit Margin" value={formatPct(raw.profit_margin)} />
        <MetricItem label="Rev Growth" value={formatPct(raw.revenue_growth)} />
        <MetricItem label="Debt/Equity" value={raw.debt_equity ? `${Number(raw.debt_equity).toFixed(2)}` : '—'} />
      </div>
    </div>
  );
};

const MetricItem = ({ label, value }) => (
  <div style={{
    background: '#ffffff',
    border: '1px solid rgba(23, 21, 31, 0.06)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.85rem 1.1rem'
  }}>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
      {label}
    </div>
    <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
      {value}
    </div>
  </div>
);
