const API_BASE = '/api';

export const getSectorsApi = async () => {
  try {
    const res = await fetch(`${API_BASE}/sectors`);
    if (!res.ok) throw new Error('Failed to fetch sectors');
    return await res.json();
  } catch (err) {
    console.error('Sectors API error:', err);
    return { sectors: [] };
  }
};

export const searchCompaniesApi = async (query = '', sector = '') => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (sector && sector !== 'all') params.append('sector', sector);
    const res = await fetch(`${API_BASE}/companies/search?${params.toString()}`);
    if (!res.ok) throw new Error('Search failed');
    return await res.json();
  } catch (err) {
    console.error('Search API error:', err);
    return { results: [] };
  }
};

export const discoverPeersApi = async (ticker) => {
  const res = await fetch(`${API_BASE}/peers/discover?ticker=${encodeURIComponent(ticker)}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch peers for ${ticker}`);
  }
  return await res.json();
};

export const explainSimilarityApi = async (payload) => {
  const res = await fetch(`${API_BASE}/ai/explain-similarity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate similarity explanation');
  return await res.json();
};

export const explainScoreApi = async (payload) => {
  const res = await fetch(`${API_BASE}/ai/explain-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate score explanation');
  return await res.json();
};
