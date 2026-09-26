import React from 'react';

/**
 * Parses and renders Markdown with table-wise and point-wise layout.
 * Matches frontend1's clean, high-contrast light design with zero raw '##' symbols.
 */
export const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentTable = null;
  let currentList = null;

  const flushTable = () => {
    if (currentTable && currentTable.rows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} style={{
          overflowX: 'auto',
          margin: '1rem 0',
          borderRadius: '8px',
          border: '1px solid rgba(23, 21, 31, 0.08)',
          background: '#ffffff',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <table className="custom-table" style={{ fontSize: '0.82rem' }}>
            {currentTable.headers && (
              <thead>
                <tr>
                  {currentTable.headers.map((h, i) => (
                    <th key={i} style={{ color: 'var(--accent-primary)', padding: '0.75rem 1rem' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {currentTable.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '0.65rem 1rem' }}>
                      {renderFormattedInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      elements.push(
        <div key={`list-${elements.length}`} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          margin: '0.65rem 0 1rem 0'
        }}>
          {currentList.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              fontSize: '0.88rem',
              background: '#fcfbfe',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid rgba(23, 21, 31, 0.05)'
            }}>
              <span style={{
                color: 'var(--accent-primary)',
                fontWeight: 800,
                fontSize: '1rem',
                lineHeight: 1.4,
                userSelect: 'none'
              }}>•</span>
              <div style={{ flex: 1 }}>
                {renderFormattedInline(item)}
              </div>
            </div>
          ))}
        </div>
      );
      currentList = null;
    }
  };

  const renderFormattedInline = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    // Table rows: | col1 | col2 |
    if (rawLine.startsWith('|') && rawLine.endsWith('|')) {
      flushList();
      const cells = rawLine.split('|').slice(1, -1).map(c => c.trim());

      // Separator line: | :--- |
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Bullet points (-, *, •, or numbered 1.)
    if (rawLine.startsWith('- ') || rawLine.startsWith('* ') || rawLine.startsWith('• ') || /^\d+[\.\)]\s+/.test(rawLine)) {
      const itemText = rawLine.replace(/^([-*•]|\d+[\.\)])\s+/, '').trim();
      if (!currentList) currentList = [];
      currentList.push(itemText);
      continue;
    } else {
      flushList();
    }

    if (!rawLine) continue;

    // Headings or labels (remove any raw #, ##, ###)
    const cleanLine = rawLine.replace(/^#{1,6}\s*/, '');
    const isHeaderLike = rawLine.startsWith('#') || rawLine.endsWith(':');

    if (isHeaderLike) {
      elements.push(
        <div key={`head-${elements.length}`} style={{
          fontSize: '0.92rem',
          fontWeight: 700,
          color: 'var(--accent-primary)',
          letterSpacing: '-0.01em',
          marginTop: '0.85rem',
          marginBottom: '0.35rem',
          fontFamily: 'var(--font-heading)'
        }}>
          {cleanLine}
        </div>
      );
    } else {
      elements.push(
        <p key={`p-${elements.length}`} style={{
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '0.45rem'
        }}>
          {renderFormattedInline(cleanLine)}
        </p>
      );
    }
  }

  flushTable();
  flushList();

  return <div>{elements}</div>;
};
