import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, AlertCircle, Compass } from 'lucide-react';
import { explainSimilarityApi } from '../../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

const simCache = new Map();

export const SimilarityModal = ({ isOpen, onClose, targetCompany, peerCompany }) => {
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    if (!isOpen || !peerCompany || !targetCompany) {
      setAiExplanation(null);
      setAiError(null);
      return;
    }

    const cacheKey = `${targetCompany.ticker}_${peerCompany.ticker}`;
    if (simCache.has(cacheKey)) {
      setAiExplanation(simCache.get(cacheKey));
      setLoadingAi(false);
      setAiError(null);
      return;
    }

    const fetchExplanation = async () => {
      setLoadingAi(true);
      setAiError(null);

      const rawSim = peerCompany.similarity_score ?? peerCompany.similarityScore ?? 0;
      const simVal = rawSim <= 1 ? (rawSim * 100).toFixed(1) : Number(rawSim).toFixed(1);

      const payload = {
        target_company: {
          company_name: targetCompany.company_name,
          ticker: targetCompany.ticker
        },
        peer_company: {
          company_name: peerCompany.company_name,
          ticker: peerCompany.ticker
        },
        similarity_score: simVal,
        rank: peerCompany.rank || 1,
        methodology: peerCompany.methodology || peerCompany.featureContributions || [],
        breakdown: peerCompany.similarity_breakdown || {
          business_similarity: 100,
          financial_similarity: 88,
          market_similarity: 90
        }
      };

      try {
        const res = await explainSimilarityApi(payload);
        if (res.explanation) {
          simCache.set(cacheKey, res.explanation);
        }
        setAiExplanation(res.explanation);
      } catch (err) {
        console.error(err);
        setAiError('Could not generate AI explanation. Please check your connection.');
      } finally {
        setLoadingAi(false);
      }
    };

    fetchExplanation();
  }, [isOpen, targetCompany, peerCompany]);

  if (!isOpen || !peerCompany || !targetCompany) return null;

  const rawSim = peerCompany.similarity_score ?? peerCompany.similarityScore ?? 0;
  const simPct = (rawSim <= 1 ? rawSim * 100 : rawSim).toFixed(1);

  const methodology = peerCompany.methodology || peerCompany.featureContributions || [];
  const breakdown = peerCompany.similarity_breakdown || {};
  const financialSim = breakdown.financial_similarity ?? 88;
  const marketSim = breakdown.market_similarity ?? 90;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1320px', width: '95vw', maxHeight: '92vh' }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(23, 21, 31, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f4f2ff',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Compass size={18} />
            </div>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Similarity Methodology & Feature Attribution
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Target: <strong>{targetCompany.ticker}</strong> vs Peer: <strong>{peerCompany.ticker}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid rgba(23, 21, 31, 0.08)',
              background: '#f8f7fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto' }}>
          {/* Top Score Comparison Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem'
          }}>
            {/* Overall Cosine Match */}
            <div style={{
              background: '#f4f2ff',
              border: '1px solid rgba(124, 108, 255, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-primary)' }}>
                Overall Cosine Similarity
              </div>
              <div className="font-mono" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '0.2rem 0' }}>
                {simPct}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Rank #{peerCompany.rank || 1} in {targetCompany.industry || targetCompany.sector}
              </div>
            </div>

            {/* Business Profile */}
            <div style={{
              background: '#f8f7fa',
              border: '1px solid rgba(23, 21, 31, 0.06)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Business Profile
              </div>
              <div className="font-mono" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0d8a4e', margin: '0.2rem 0' }}>
                100%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Same Industry ({targetCompany.industry || targetCompany.sector})
              </div>
            </div>

            {/* Financial Profile */}
            <div style={{
              background: '#f8f7fa',
              border: '1px solid rgba(23, 21, 31, 0.06)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Financial Profile
              </div>
              <div className="font-mono" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                {financialSim}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Margins, Returns & Valuation
              </div>
            </div>

            {/* Market Profile */}
            <div style={{
              background: '#f8f7fa',
              border: '1px solid rgba(23, 21, 31, 0.06)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Market Profile
              </div>
              <div className="font-mono" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                {marketSim}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Returns, Volatility & Beta
              </div>
            </div>
          </div>

          {/* Feature Attribution Table */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Feature Attribution & Contribution Matrix
              </h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Standardized Weighted Cosine Product
              </div>
            </div>

            <div style={{
              overflowX: 'auto',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(23, 21, 31, 0.08)'
            }}>
              <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Target ({targetCompany.ticker})</th>
                    <th>Peer ({peerCompany.ticker})</th>
                    <th>Norm Diff (|Δz|)</th>
                    <th>Base Wt</th>
                    <th>Eff. Wt</th>
                    <th>Cosine Contrib</th>
                    <th>Alignment</th>
                  </tr>
                </thead>
                <tbody>
                  {methodology.map((m, i) => {
                    const alignStr = (m.alignment || '').toLowerCase();
                    const isStrong = alignStr.includes('strong');
                    const isDivergent = alignStr.includes('divergent');
                    const contrib = m.cosine_contribution;

                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.label || m.key}
                        </td>
                        <td className="font-mono">
                          {m.target_val_formatted || '—'}
                        </td>
                        <td className="font-mono">
                          {m.peer_val_formatted || '—'}
                        </td>
                        <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {m.z_diff != null ? Number(m.z_diff).toFixed(2) : '—'}
                        </td>
                        <td className="font-mono">
                          {m.base_weight_pct != null ? `${m.base_weight_pct}%` : '—'}
                        </td>
                        <td className="font-mono" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                          {m.effective_weight_pct != null ? `${m.effective_weight_pct}%` : '—'}
                        </td>
                        <td className="font-mono" style={{
                          color: contrib >= 0 ? '#0d8a4e' : '#dc2626',
                          fontWeight: 700
                        }}>
                          {contrib != null ? (contrib >= 0 ? `+${contrib.toFixed(3)}` : contrib.toFixed(3)) : '—'}
                        </td>
                        <td>
                          <span className={
                            isStrong ? 'badge badge-emerald' : isDivergent ? 'badge badge-rose' : 'badge badge-amber'
                          }>
                            {m.alignment || 'Aligned'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Explanation Box (Placed Last) */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(124, 108, 255, 0.2)',
            padding: '1.25rem 1.5rem',
            marginBottom: '0.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(23, 21, 31, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  AI Structured Similarity Breakdown
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Key Drivers (3-4 Points)</span>
              </div>

              {loadingAi && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                  <span>Synthesizing vector metrics...</span>
                </div>
              )}
            </div>

            {loadingAi ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-primary)', margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '0.85rem' }}>Deconstructing 12 feature dimensions with AI Analysis...</div>
              </div>
            ) : aiError ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{aiError}</span>
              </div>
            ) : (
              <MarkdownRenderer content={aiExplanation} />
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid rgba(23, 21, 31, 0.08)',
          background: '#f8f7fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
