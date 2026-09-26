import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Building2, ChevronRight, X, Layers, ChevronDown, Check } from 'lucide-react';
import { searchCompaniesApi, getSectorsApi } from '../../services/api';

const QUICK_TICKERS = [
  { label: 'TCS', ticker: 'TCS.NS', sector: 'Technology' },
  { label: 'Infosys', ticker: 'INFY.NS', sector: 'Technology' },
  { label: 'HDFC Bank', ticker: 'HDFCBANK.NS', sector: 'Financial Services' },
  { label: 'Reliance', ticker: 'RELIANCE.NS', sector: 'Energy' },
  { label: 'Titan', ticker: 'TITAN.NS', sector: 'Consumer Cyclical' },
  { label: 'Sun Pharma', ticker: 'SUNPHARMA.NS', sector: 'Healthcare' }
];

const DEFAULT_SECTORS = [
  'Technology',
  'Financial Services',
  'Healthcare',
  'Energy',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Basic Materials',
  'Industrials',
  'Real Estate',
  'Communication Services',
  'Utilities',
  'Construction/Infrastructure'
];

export const SearchBox = ({ onSelectCompany, selectedTicker, isLoading }) => {
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sectors, setSectors] = useState(DEFAULT_SECTORS);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const sectorDropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch available sectors on load
  useEffect(() => {
    getSectorsApi()
      .then((data) => {
        if (data.sectors && data.sectors.length > 0) {
          setSectors(data.sectors);
        }
      })
      .catch((err) => console.error('Failed to load sectors:', err));
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(e.target)) {
        setIsSectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch matching companies when query or sector changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchCompaniesApi(query.trim(), selectedSector);
        setResults(data.results || []);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 120); // Fast 120ms debounce

    return () => clearTimeout(timer);
  }, [query, selectedSector]);

  // Initial load of sample companies for the dropdown
  useEffect(() => {
    searchCompaniesApi('', '').then((data) => {
      setResults((data.results || []).slice(0, 10));
    });
  }, []);

  const handleSelect = (ticker) => {
    setIsOpen(false);
    setIsSectorOpen(false);
    setQuery('');
    onSelectCompany(ticker);
  };

  const handleSectorChange = (sector) => {
    setSelectedSector(sector);
    setIsSectorOpen(false);
    setIsSearching(true);
    searchCompaniesApi(query.trim(), sector)
      .then((data) => {
        setResults(data.results || []);
        setIsOpen(true);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsSearching(false));
  };

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex].ticker);
      } else if (results.length > 0) {
        handleSelect(results[0].ticker);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Highlight matching letters in company name / ticker
  const renderHighlighted = (text, highlight) => {
    if (!highlight || !highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} style={{ color: 'var(--accent-primary)', fontWeight: 800, background: '#f4f2ff', padding: '0 2px', borderRadius: '2px' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '820px', margin: '0 auto', zIndex: 50 }}>
      {/* Top Search Controls: Search Input + Optional Sector Dropdown */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '0.65rem',
        flexWrap: 'wrap',
        position: 'relative'
      }}>
        {/* Search Input Box */}
        <div
          ref={dropdownRef}
          style={{
            flex: '1 1 380px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: isOpen ? '1.5px solid var(--accent-primary)' : '1.5px solid rgba(23, 21, 31, 0.14)',
            borderRadius: 'var(--radius-md)',
            boxShadow: isOpen ? '0 4px 20px rgba(124, 108, 255, 0.18)' : 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ padding: '0 0.85rem 0 1.15rem', color: 'var(--text-secondary)', display: 'flex' }}>
            {isSearching || isLoading ? (
              <Loader2 size={19} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <Search size={19} style={{ color: isOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedSector 
                ? `Search within ${selectedSector} (e.g. TCS, Tata, HDFC)...`
                : "Search by company name or ticker (e.g. TCS, Infosys, HDFCBANK)..."
            }
            style={{
              flex: 1,
              padding: '1rem 0.5rem 1rem 0',
              fontSize: '0.95rem',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              background: 'transparent'
            }}
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              style={{
                padding: '0.4rem 0.75rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {/* Floating Dropbox / Dropdown with Matching Companies */}
          {isOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(23, 21, 31, 0.12)',
              boxShadow: '0 18px 45px rgba(23, 21, 31, 0.16), 0 2px 8px rgba(23, 21, 31, 0.06)',
              maxHeight: '380px',
              overflowY: 'auto',
              zIndex: 9999,
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* Dropbox Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                background: '#f8f7fa',
                borderBottom: '1px solid rgba(23, 21, 31, 0.06)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {query.trim()
                    ? `Matching Companies (${results.length})`
                    : selectedSector
                      ? `${selectedSector} Universe (${results.length})`
                      : `Popular NSE Equities (${results.length})`}
                  {selectedSector && (
                    <span style={{
                      color: 'var(--accent-primary)',
                      background: '#f4f2ff',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      {selectedSector}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 500, textTransform: 'none', color: 'var(--text-muted)' }}>
                  Press ↑↓ to navigate • ↵ to select
                </span>
              </div>

              {/* Dropbox Items */}
              {results.length === 0 ? (
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  No companies found {query ? `matching "${query}"` : ''} {selectedSector ? `in sector "${selectedSector}"` : ''}
                  {selectedSector && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <button
                        onClick={() => handleSectorChange('')}
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--accent-primary)',
                          background: '#f4f2ff',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(124, 108, 255, 0.3)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Reset Sector Filter to "All Sectors"
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '0.35rem' }}>
                  {results.map((comp, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={comp.ticker}
                        onClick={() => handleSelect(comp.ticker)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          background: isSelected ? '#f4f2ff' : 'transparent',
                          border: isSelected ? '1px solid rgba(124, 108, 255, 0.25)' : '1px solid transparent',
                          transition: 'background var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: isSelected ? 'var(--accent-primary)' : '#f8f7fa',
                            color: isSelected ? '#ffffff' : 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all var(--transition-fast)',
                            flexShrink: 0
                          }}>
                            <Building2 size={16} />
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                              {renderHighlighted(comp.company_name, query)}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                              <span style={{ fontWeight: 600 }}>{comp.sector}</span>
                              {comp.industry && comp.industry !== 'NA' && comp.industry !== comp.sector && (
                                <span style={{ color: 'var(--text-muted)' }}> • {comp.industry}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span className="font-mono" style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: isSelected ? '#ffffff' : 'var(--accent-primary)',
                            background: isSelected ? 'var(--accent-primary)' : '#f4f2ff',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            border: isSelected ? 'none' : '1px solid rgba(124, 108, 255, 0.2)'
                          }}>
                            {renderHighlighted(comp.ticker, query)}
                          </span>
                          <ChevronRight size={16} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Beside Search Bar: Sector Dropbox (Optional) */}
        <div ref={sectorDropdownRef} style={{ position: 'relative', flex: '0 0 215px', minWidth: '180px' }}>
          <button
            type="button"
            onClick={() => setIsSectorOpen((prev) => !prev)}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '52px',
              padding: '0.65rem 0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              background: selectedSector ? '#f7f6ff' : '#ffffff',
              border: isSectorOpen || selectedSector ? '1.5px solid var(--accent-primary)' : '1.5px solid rgba(23, 21, 31, 0.14)',
              borderRadius: 'var(--radius-md)',
              boxShadow: isSectorOpen ? '0 4px 20px rgba(124, 108, 255, 0.18)' : 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            title="Filter by Sector (Optional)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', textAlign: 'left' }}>
              <Layers size={17} style={{ color: selectedSector ? 'var(--accent-primary)' : 'var(--text-secondary)', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: selectedSector ? 700 : 500,
                  color: selectedSector ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {selectedSector || 'All Sectors'}
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: selectedSector ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1
                }}>
                  {selectedSector ? 'Sector Filter Active' : 'Sector: Optional'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
              {selectedSector ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectorChange('');
                  }}
                  style={{
                    padding: '2px 4px',
                    borderRadius: '4px',
                    color: 'var(--accent-primary)',
                    background: 'rgba(124, 108, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  title="Clear sector filter"
                >
                  <X size={13} />
                </span>
              ) : (
                <ChevronDown
                  size={16}
                  style={{
                    color: 'var(--text-secondary)',
                    transform: isSectorOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }}
                />
              )}
            </div>
          </button>

          {/* Sector Dropdown Menu */}
          {isSectorOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '240px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(23, 21, 31, 0.12)',
              boxShadow: '0 18px 45px rgba(23, 21, 31, 0.16), 0 2px 8px rgba(23, 21, 31, 0.06)',
              maxHeight: '340px',
              overflowY: 'auto',
              zIndex: 9999,
              animation: 'fadeIn 0.15s ease-out',
              padding: '0.35rem'
            }}>
              {/* Dropdown Header */}
              <div style={{
                padding: '0.55rem 0.75rem',
                borderBottom: '1px solid rgba(23, 21, 31, 0.06)',
                marginBottom: '0.35rem'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Filter by Sector
                </div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Optional • Leave as "All Sectors" to discover peers across the entire market
                </div>
              </div>

              {/* All Sectors (Default) Option */}
              <div
                onClick={() => handleSectorChange('')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: !selectedSector ? 700 : 500,
                  color: !selectedSector ? 'var(--accent-primary)' : 'var(--text-primary)',
                  background: !selectedSector ? '#f4f2ff' : 'transparent',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <span>All Sectors (Default)</span>
                {!selectedSector && <Check size={15} style={{ color: 'var(--accent-primary)' }} />}
              </div>

              <div style={{ height: '1px', background: 'rgba(23, 21, 31, 0.06)', margin: '0.35rem 0' }} />

              {/* Distinct Sectors List */}
              {sectors.map((sec) => {
                const isCurrent = selectedSector.toLowerCase() === sec.toLowerCase();
                return (
                  <div
                    key={sec}
                    onClick={() => handleSectorChange(sec)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.83rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--accent-primary)' : 'var(--text-primary)',
                      background: isCurrent ? '#f4f2ff' : 'transparent',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = '#f8f7fa';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{sec}</span>
                    {isCurrent && <Check size={15} style={{ color: 'var(--accent-primary)' }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Select Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '0.85rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Popular Subjects:
        </span>
        {QUICK_TICKERS.map((item) => (
          <button
            key={item.ticker}
            onClick={() => handleSelect(item.ticker)}
            style={{
              padding: '0.25rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: 600,
              background: selectedTicker === item.ticker ? '#f4f2ff' : '#ffffff',
              color: selectedTicker === item.ticker ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: selectedTicker === item.ticker
                ? '1px solid rgba(124, 108, 255, 0.4)'
                : '1px solid rgba(23, 21, 31, 0.08)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
