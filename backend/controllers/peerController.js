import { 
  searchCompanies, 
  getCompanyByTickerOrName, 
  getPeerUniverse,
  getAllCompanies,
  getUniqueSectors
} from '../dataLoader.js';
import { calculatePeerSimilarities } from '../similarity/similarityEngine.js';
import { calculateCompanyScore } from '../scoring/companyScore.js';
import { explainSimilarity, explainCompanyScore } from '../ai/geminiService.js';

export const handleGetSectors = (req, res) => {
  try {
    const sectors = getUniqueSectors();
    return res.json({ sectors });
  } catch (err) {
    console.error('Sectors fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch sectors' });
  }
};

export const handleSearchCompanies = (req, res) => {
  try {
    const query = req.query.q || '';
    const sector = req.query.sector || '';

    // If both query and sector are empty/all, return default sample
    if (!query.trim() && (!sector || sector.toLowerCase() === 'all')) {
      return res.json({ results: getAllCompanies().slice(0, 10) });
    }

    const results = searchCompanies(query, sector);
    return res.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Failed to search companies' });
  }
};

export const handleDiscoverPeers = (req, res) => {
  try {
    const identifier = req.query.ticker || req.query.q || 'TCS.NS';
    const targetCompany = getCompanyByTickerOrName(identifier);

    if (!targetCompany) {
      return res.status(404).json({ error: `Company '${identifier}' not found in dataset` });
    }

    // 1. Get Peer Universe (Initial: Same Industry; Fallback: Same Sector if < 5 peers)
    const { universe: peerUniverse, isFallback } = getPeerUniverse(targetCompany);

    // 2. Calculate Similarity Score for all peers in the universe
    const scoredPeers = calculatePeerSimilarities(targetCompany, peerUniverse);

    // 3. Calculate Company Strength Score separately for target company and peers
    // (Load entire dataset for score percentiles)
    const allCompanies = getPeerUniverse({ industry: '', sector: '', ticker: '' }).universe;
    // or pass peerUniverse / entire dataset
    const targetScore = calculateCompanyScore(targetCompany, peerUniverse.concat([targetCompany]));

    const enrichedPeers = scoredPeers.map((peer, idx) => {
      // Calculate independent company strength score
      const companyStrength = calculateCompanyScore(peer.raw_metrics, peerUniverse.concat([targetCompany]));

      return {
        rank: idx + 1,
        company_name: peer.company_name,
        ticker: peer.ticker,
        sector: peer.sector,
        industry: peer.industry,
        business_description: peer.business_description,
        similarity_score: peer.similarity_score,
        similarity_breakdown: peer.similarity_breakdown,
        methodology: peer.methodology,
        company_score: companyStrength,
        key_metrics: {
          revenue_growth: peer.raw_metrics.revenue_growth,
          profit_margin: peer.raw_metrics.profit_margin,
          market_cap: peer.raw_metrics.market_cap,
          return_1y: peer.raw_metrics.return_1y,
          return_3y: peer.raw_metrics.return_3y,
          volatility: peer.raw_metrics.volatility,
          PE: peer.raw_metrics.PE,
          PB: peer.raw_metrics.PB
        }
      };
    });

    return res.json({
      target_company: {
        company_name: targetCompany.company_name,
        ticker: targetCompany.ticker,
        sector: targetCompany.sector,
        industry: targetCompany.industry,
        business_description: targetCompany.business_description,
        company_score: targetScore,
        raw_metrics: targetCompany
      },
      universe_info: {
        industry: targetCompany.industry,
        sector: targetCompany.sector,
        peer_count: enrichedPeers.length,
        is_sector_fallback: isFallback
      },
      peers: enrichedPeers
    });
  } catch (err) {
    console.error('Discover peers error:', err);
    return res.status(500).json({ error: 'Failed to discover peers: ' + err.message });
  }
};

export const handleExplainSimilarity = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.target_company || !payload.peer_company) {
      return res.status(400).json({ error: 'Missing required target or peer company payload' });
    }
    const explanation = await explainSimilarity(payload);
    return res.json(explanation);
  } catch (err) {
    console.error('Explain similarity error:', err);
    return res.status(500).json({ error: 'Failed to generate explanation' });
  }
};

export const handleExplainScore = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.company_name || payload.final_score === undefined) {
      return res.status(400).json({ error: 'Missing required company score payload' });
    }
    const explanation = await explainCompanyScore(payload);
    return res.json(explanation);
  } catch (err) {
    console.error('Explain score error:', err);
    return res.status(500).json({ error: 'Failed to generate score explanation' });
  }
};
