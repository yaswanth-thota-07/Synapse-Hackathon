import React from 'react';

export const Navbar = ({ onScrollToUniverse }) => {
  return (
    <header style={{
      width: '100%',
      padding: '24px 0',
      background: 'transparent',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        width: '100%',
        padding: '0 clamp(20px, 3.5vw, 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Brand / Problem Statement Wordmark */}
        <div className="rise delay-0" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-mark" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="brand-wordmark" style={{ letterSpacing: '-0.02em' }}>PeerDiscovery</span>
            <span style={{
              fontFamily: 'var(--font-code)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.14em',
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              background: '#f4f2ff',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(124, 108, 255, 0.2)'
            }}>
              AI ENGINE
            </span>
          </div>
        </div>

        {/* Center: Nav links directly reflecting the Problem Statement */}
        <nav className="nav-center" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#discovery" className="rise delay-70" style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            color: 'var(--text-secondary)',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Peer Discovery
          </a>
          <a href="#methodology" className="rise delay-120" style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            color: 'var(--text-secondary)',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Behavioral Similarity
          </a>
          <a href="#methodology" className="rise delay-170" style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            color: 'var(--text-secondary)',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Valuation &amp; Health
          </a>
          <a href="#universe" className="rise delay-220" style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            color: 'var(--text-secondary)',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            NSE Universe (265)
          </a>
        </nav>

        {/* Right: Dark Pill CTA */}
        <div className="rise delay-220">
          <a
            href="#discovery"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--text-primary)',
              color: '#ffffff',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '13px',
              padding: '11px 22px',
              borderRadius: '999px',
              boxShadow: '0 2px 10px rgba(23, 21, 31, 0.12)',
              transition: 'transform 0.2s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.2s cubic-bezier(0.2, 0.7, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1.5px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(23, 21, 31, 0.20)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(23, 21, 31, 0.12)';
            }}
          >
            Discover True Peers
          </a>
        </div>
      </div>
    </header>
  );
};
