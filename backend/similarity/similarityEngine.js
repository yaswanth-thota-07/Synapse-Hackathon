// Feature weights as defined in specifications (Configurable)
export const FEATURE_CONFIG = {
  revenue_growth: { label: 'Revenue Growth', weight: 0.10, isPercentage: true, group: 'financial' },
  profit_margin:  { label: 'Profit Margin',  weight: 0.10, isPercentage: true, group: 'financial' },
  ROE:            { label: 'ROE',            weight: 0.10, isPercentage: true, group: 'financial' },
  ROA:            { label: 'ROA',            weight: 0.05, isPercentage: true, group: 'financial' },
  debt_equity:    { label: 'Debt/Equity',    weight: 0.05, isPercentage: false, group: 'financial' },
  PE:             { label: 'P/E',            weight: 0.05, isPercentage: false, group: 'financial' },
  PB:             { label: 'P/B',            weight: 0.05, isPercentage: false, group: 'financial' },
  market_cap:     { label: 'Market Cap',     weight: 0.05, isCurrency: true,   group: 'financial' },
  return_1y:      { label: 'Return 1Y',      weight: 0.15, isPercentage: true, group: 'market' },
  return_3y:      { label: 'Return 3Y',      weight: 0.10, isPercentage: true, group: 'market' },
  volatility:     { label: 'Volatility',     weight: 0.05, isPercentage: true, group: 'market' },
  beta:           { label: 'Beta',           weight: 0.05, isPercentage: false, group: 'market' }
};

export const FEATURE_KEYS = Object.keys(FEATURE_CONFIG);

/**
 * Safely parse numeric value without converting NA to 0
 */
export const parseNumeric = (val) => {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (s === '' || s.toUpperCase() === 'NA' || s.toUpperCase() === 'NONE' || s.toUpperCase() === 'NAN') {
    return null;
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};

/**
 * Format numeric value for display
 */
export const formatFeatureValue = (key, val) => {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  const cfg = FEATURE_CONFIG[key];
  if (!cfg) return String(val);

  if (cfg.isPercentage) {
    return `${(val * 100).toFixed(2)}%`;
  }
  if (cfg.isCurrency) {
    // Format Indian market cap in Lakh Cr / Crore
    if (val >= 1e12) {
      return `₹${(val / 1e12).toFixed(2)}T`;
    } else if (val >= 1e9) {
      return `₹${(val / 1e9).toFixed(2)}B`;
    } else if (val >= 1e7) {
      return `₹${(val / 1e7).toFixed(2)}Cr`;
    }
    return `₹${val.toLocaleString()}`;
  }
  return Number(val).toFixed(2);
};

/**
 * Compute Mean and Standard Deviation across a sample
 */
const computeStats = (universe) => {
  const stats = {};

  for (const key of FEATURE_KEYS) {
    const vals = [];
    for (const comp of universe) {
      let v = parseNumeric(comp[key]);
      if (v !== null) {
        if (key === 'market_cap') {
          v = Math.log1p(Math.max(0, v));
        }
        vals.push(v);
      }
    }

    if (vals.length === 0) {
      stats[key] = { mean: 0, std: 1 };
    } else {
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (vals.length > 1 ? vals.length - 1 : 1);
      const std = Math.sqrt(variance) || 1;
      stats[key] = { mean, std: std > 1e-6 ? std : 1 };
    }
  }

  return stats;
};

/**
 * Calculate Cosine Similarity on a subset of features
 */
const calculateGroupCosine = (targetComp, peerComp, stats, featureKeys) => {
  let dot = 0;
  let normT = 0;
  let normP = 0;
  let validWeightSum = 0;

  for (const key of featureKeys) {
    const rawT = parseNumeric(targetComp[key]);
    const rawP = parseNumeric(peerComp[key]);

    if (rawT !== null && rawP !== null) {
      const w = FEATURE_CONFIG[key].weight;
      validWeightSum += w;
    }
  }

  if (validWeightSum === 0) return 50.0;

  for (const key of featureKeys) {
    let tVal = parseNumeric(targetComp[key]);
    let pVal = parseNumeric(peerComp[key]);

    if (tVal !== null && pVal !== null) {
      if (key === 'market_cap') {
        tVal = Math.log1p(Math.max(0, tVal));
        pVal = Math.log1p(Math.max(0, pVal));
      }

      const { mean, std } = stats[key];
      const zT = (tVal - mean) / std;
      const zP = (pVal - mean) / std;

      const normWeight = FEATURE_CONFIG[key].weight / validWeightSum;
      const u = Math.sqrt(normWeight) * zT;
      const v = Math.sqrt(normWeight) * zP;

      dot += u * v;
      normT += u * u;
      normP += v * v;
    }
  }

  if (normT > 0 && normP > 0) {
    const cosine = dot / (Math.sqrt(normT) * Math.sqrt(normP));
    // Cosine bounded in [-1, 1], map linearly to [0, 100]%
    const simPct = ((cosine + 1) / 2) * 100;
    return Math.max(0, Math.min(100, Math.round(simPct * 10) / 10));
  }

  return 50.0;
};

/**
 * Calculate peer similarity for all peers in the universe against target company
 */
export const calculatePeerSimilarities = (targetCompany, peerUniverse) => {
  if (!targetCompany || !peerUniverse || peerUniverse.length === 0) {
    return [];
  }

  // Combined universe for standardization (peer universe + target company)
  const fullSample = [targetCompany, ...peerUniverse];
  const stats = computeStats(fullSample);

  const financialKeys = FEATURE_KEYS.filter(k => FEATURE_CONFIG[k].group === 'financial');
  const marketKeys = FEATURE_KEYS.filter(k => FEATURE_CONFIG[k].group === 'market');

  const scoredPeers = [];

  for (const peer of peerUniverse) {
    // 1. Missing data check: count how many features are available
    let availableCount = 0;
    for (const key of FEATURE_KEYS) {
      if (parseNumeric(peer[key]) !== null) availableCount++;
    }

    // Exclude if > 50% missing required features
    if (availableCount < (FEATURE_KEYS.length * 0.45)) {
      continue;
    }

    // 2. Identify mutually valid features
    const mutuallyValidKeys = [];
    let validWeightSum = 0;

    for (const key of FEATURE_KEYS) {
      const rawT = parseNumeric(targetCompany[key]);
      const rawP = parseNumeric(peer[key]);
      if (rawT !== null && rawP !== null) {
        mutuallyValidKeys.push(key);
        validWeightSum += FEATURE_CONFIG[key].weight;
      }
    }

    if (mutuallyValidKeys.length < 4 || validWeightSum === 0) {
      continue;
    }

    // 3. Compute weighted cosine vectors and dot product
    let dot = 0;
    let normT = 0;
    let normP = 0;
    const featureContributions = [];

    for (const key of mutuallyValidKeys) {
      let tVal = parseNumeric(targetCompany[key]);
      let pVal = parseNumeric(peer[key]);

      if (key === 'market_cap') {
        tVal = Math.log1p(Math.max(0, tVal));
        pVal = Math.log1p(Math.max(0, pVal));
      }

      const { mean, std } = stats[key];
      const zT = (tVal - mean) / std;
      const zP = (pVal - mean) / std;

      const normWeight = FEATURE_CONFIG[key].weight / validWeightSum;
      const u = Math.sqrt(normWeight) * zT;
      const v = Math.sqrt(normWeight) * zP;

      const prod = u * v;
      dot += prod;
      normT += u * u;
      normP += v * v;

      // Distance in standardized space
      const zDiff = Math.abs(zT - zP);

      featureContributions.push({
        key,
        label: FEATURE_CONFIG[key].label,
        group: FEATURE_CONFIG[key].group,
        base_weight_pct: Math.round(FEATURE_CONFIG[key].weight * 100),
        effective_weight_pct: Math.round(normWeight * 1000) / 10,
        target_val_raw: parseNumeric(targetCompany[key]),
        peer_val_raw: parseNumeric(peer[key]),
        target_val_formatted: formatFeatureValue(key, parseNumeric(targetCompany[key])),
        peer_val_formatted: formatFeatureValue(key, parseNumeric(peer[key])),
        z_target: Math.round(zT * 100) / 100,
        z_peer: Math.round(zP * 100) / 100,
        z_diff: Math.round(zDiff * 100) / 100,
        raw_product: prod
      });
    }

    // 4. Overall Similarity Score
    let overallSimilarity = 50.0;
    const denominator = Math.sqrt(normT) * Math.sqrt(normP);

    if (denominator > 0) {
      const cosine = dot / denominator;
      const simPct = ((cosine + 1) / 2) * 100;
      overallSimilarity = Math.max(0, Math.min(100, Math.round(simPct * 10) / 10));

      // Calculate final contribution share for each feature
      for (const item of featureContributions) {
        const itemCosineContrib = item.raw_product / denominator;
        item.cosine_contribution = Math.round(itemCosineContrib * 1000) / 1000;
        
        // Alignment rating
        if (item.z_diff <= 0.4) {
          item.alignment = 'Strong Alignment';
        } else if (item.z_diff <= 1.0) {
          item.alignment = 'Moderate Alignment';
        } else {
          item.alignment = 'Divergent';
        }
      }
    }

    // 5. Sub-breakdown calculations
    const financialSimilarity = calculateGroupCosine(targetCompany, peer, stats, financialKeys);
    const marketSimilarity = calculateGroupCosine(targetCompany, peer, stats, marketKeys);
    const businessSimilarity = 100.0; // Same industry match

    // Add any features that were NA in either target or peer to the complete methodology table
    const allFeatureMethodology = FEATURE_KEYS.map(key => {
      const existing = featureContributions.find(f => f.key === key);
      if (existing) return existing;

      return {
        key,
        label: FEATURE_CONFIG[key].label,
        group: FEATURE_CONFIG[key].group,
        base_weight_pct: Math.round(FEATURE_CONFIG[key].weight * 100),
        effective_weight_pct: 0,
        target_val_raw: parseNumeric(targetCompany[key]),
        peer_val_raw: parseNumeric(peer[key]),
        target_val_formatted: formatFeatureValue(key, parseNumeric(targetCompany[key])),
        peer_val_formatted: formatFeatureValue(key, parseNumeric(peer[key])),
        z_target: null,
        z_peer: null,
        z_diff: null,
        cosine_contribution: 0,
        alignment: 'Missing Data (N/A)'
      };
    });

    scoredPeers.push({
      company_name: peer.company_name,
      ticker: peer.ticker,
      sector: peer.sector,
      industry: peer.industry,
      business_description: peer.business_description,
      raw_metrics: peer,
      similarity_score: overallSimilarity,
      similarity_breakdown: {
        overall: overallSimilarity,
        business_similarity: businessSimilarity,
        financial_similarity: financialSimilarity,
        market_similarity: marketSimilarity
      },
      methodology: allFeatureMethodology
    });
  }

  // Sort descending by Similarity Score strictly as required
  scoredPeers.sort((a, b) => b.similarity_score - a.similarity_score);

  return scoredPeers;
};
