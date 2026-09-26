import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, AlertCircle, BarChart3, ShieldCheck } from 'lucide-react';
import { explainScoreApi } from '../../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

const scoreCache = new Map();

export const ScoreModal = ({ isOpen, onClose, company }) => {
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    if (!isOpen || !company) {
      setAiExplanation(null);
      setAiError(null);
      return;
    }

    const cacheKey = `${company.ticker}_score`;
    if (scoreCache.has(cacheKey)) {
      setAiExplanation(scoreCache.get(cacheKey));
      setLoadingAi(false);
      setAiError(null);
      return;
    }

    const fetchScoreAi = async () => {
      setLoadingAi(true);
      setAiError(null);

      const scoreObj = company.company_score || company.companyScore || {};
      const finalScore = scoreObj.final_score ?? scoreObj.overallScore ?? 50;

      const payload = {
        company_name: company.company_name,
        ticker: company.ticker,
        final_score: finalScore,
        categories: scoreObj.categories || []
      };

      try {
        const res = await explainScoreApi(payload);
        if (res.explanation) {
          scoreCache.set(cacheKey, res.explanation);
        }
        setAiExplanation(res.explanation);
      } catch (err) {
        console.error(err);
        setAiError('Could not generate score analysis. Please check your connection.');
      } finally {
        setLoadingAi(false);
      }
    };

    fetchScoreAi();
  }, [isOpen, company]);

  if (!isOpen || !company) return null;

  const scoreObj = company.company_score || company.companyScore || {};
  const overallScore = scoreObj.final_score ?? scoreObj.overallScore ?? 'N/A';

  const categories = Array.isArray(scoreObj.categories) ? scoreObj.categories : [];

  // Extract all metrics across categories for the metrics table
  const allMetrics = [];
  categories.forEach(cat => {
    if (Array.isArray(cat.metrics)) {
      cat.metrics.forEach(m => {
        allMetrics.push({
          category: cat.category_name,
          label: m.label || m.key,
          formatted_value: m.formatted_value || m.raw_value,
          metric_weight: m.metric_weight != null ? `${(m.metric_weight * 100).toFixed(0)}%` : '—',
          metric_score: m.metric_score != null ? `${Number(m.metric_score).toFixed(0)}th %ile` : '—'
        });
      });
    }
  });

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
              background: '#eefcf4',
              color: '#0d8a4e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Company Financial Strength Model (0–100)
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Analysis for: <strong>{company.company_name}</strong> ({company.ticker})
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
          {/* Decoupling banner */}
          <div style={{
            background: '#f8f7fa',
            border: '1px solid rgba(23, 21, 31, 0.08)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldCheck size={16} style={{ color: '#0d8a4e', flexShrink: 0 }} />
            <span>
              <strong>Completely Decoupled Metric:</strong> This score assesses standalone financial health, profitability, and operational quality. It does <em>not</em> alter peer similarity rankings.
            </span>
          </div>

          {/* Top Score Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(13, 138, 78, 0.25)',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#0d8a4e' }}>
                Composite Financial Strength Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.25rem 0' }}>
                <span className="font-mono" style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {overallScore}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Percentile-weighted multi-pillar framework benchmarked across 265 NSE firms
              </div>
            </div>

            <div style={{ width: '160px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <span>Health Index</span>
                <span>{overallScore}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#eefcf4', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(13, 138, 78, 0.2)' }}>
                <div style={{ width: `${Math.min(100, Math.max(0, Number(overallScore) || 0))}%`, height: '100%', background: '#0d8a4e' }} />
              </div>
            </div>
          </div>

          {/* 6 Category Breakdown Grid */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.75rem'
            }}>
              6-Pillar Score Attainment
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.85rem'
            }}>
              {categories.map((cat, idx) => {
                const weight = Number(cat.category_weight) || 1;
                const score = Number(cat.category_score) || 0;
                const attainmentPct = Math.min(100, Math.round((score / weight) * 100));

                return (
                  <div key={idx} style={{
                    background: '#f8f7fa',
                    border: '1px solid rgba(23, 21, 31, 0.06)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.9rem 1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cat.category_name}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d8a4e' }}>
                        {score.toFixed(1)} / {weight} pts
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '6px', background: '#eceaf0', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.35rem' }}>
                      <div style={{ width: `${attainmentPct}%`, height: '100%', background: '#0d8a4e' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <span>Model Weight: {weight}%</span>
                      <span>Attainment: {attainmentPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metric Percentile Table */}
          {allMetrics.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem'
              }}>
                Universe Percentile Ranking by Metric
              </h3>

              <div style={{
                overflowX: 'auto',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(23, 21, 31, 0.08)'
              }}>
                <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Pillar Category</th>
                      <th>Reported Value</th>
                      <th>Pillar Weight</th>
                      <th>Percentile Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMetrics.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.label}
                        </td>
                        <td>
                          <span className="badge badge-neutral">
                            {m.category}
                          </span>
                        </td>
                        <td className="font-mono">
                          {m.formatted_value}
                        </td>
                        <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {m.metric_weight}
                        </td>
                        <td className="font-mono" style={{ color: '#0d8a4e', fontWeight: 700 }}>
                          {m.metric_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Score Explanation (Placed Last) */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(13, 138, 78, 0.25)',
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
                <Sparkles size={16} style={{ color: '#0d8a4e' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  AI Financial Health Assessment
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Key Drivers (3-4 Points)</span>
              </div>

              {loadingAi && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Loader2 size={14} className="animate-spin" style={{ color: '#0d8a4e' }} />
                  <span>Synthesizing balance sheet metrics...</span>
                </div>
              )}
            </div>

            {loadingAi ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: '#0d8a4e', margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '0.85rem' }}>Generating financial score breakdown with AI Analysis...</div>
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
