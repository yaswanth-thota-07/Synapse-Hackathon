import { parseNumeric, formatFeatureValue } from '../similarity/similarityEngine.js';

export const SCORING_CATEGORIES = {
  profitability: {
    name: 'Profitability',
    weight: 25,
    metrics: [
      { key: 'profit_margin', label: 'Profit Margin', weight: 0.40, higherIsBetter: true },
      { key: 'ROE', label: 'Return on Equity (ROE)', weight: 0.40, higherIsBetter: true },
      { key: 'ROA', label: 'Return on Assets (ROA)', weight: 0.20, higherIsBetter: true }
    ]
  },
  growth: {
    name: 'Growth',
    weight: 20,
    metrics: [
      { key: 'revenue_growth', label: 'Revenue Growth', weight: 0.40, higherIsBetter: true },
      { key: 'return_1y', label: '1-Year Return', weight: 0.30, higherIsBetter: true },
      { key: 'return_3y', label: '3-Year Return', weight: 0.30, higherIsBetter: true }
    ]
  },
  financial_health: {
    name: 'Financial Health',
    weight: 20,
    metrics: [
      { key: 'debt_equity', label: 'Debt to Equity', weight: 1.0, higherIsBetter: false }
    ]
  },
  valuation: {
    name: 'Valuation',
    weight: 15,
    metrics: [
      { key: 'PE', label: 'P/E Ratio', weight: 0.50, isValuation: true },
      { key: 'PB', label: 'P/B Ratio', weight: 0.50, isValuation: true }
    ]
  },
  market_performance: {
    name: 'Market Performance',
    weight: 15,
    metrics: [
      { key: 'return_1y', label: '1-Year Price Return', weight: 0.50, higherIsBetter: true },
      { key: 'return_3y', label: '3-Year Price Return', weight: 0.50, higherIsBetter: true }
    ]
  },
  risk: {
    name: 'Risk',
    weight: 5,
    metrics: [
      { key: 'volatility', label: 'Annualized Volatility', weight: 0.50, higherIsBetter: false },
      { key: 'beta', label: 'Beta', weight: 0.50, higherIsBetter: false }
    ]
  }
};

/**
 * Precompute distribution percentiles from the dataset for robust, outlier-proof scoring
 */
const getMetricDistributions = (dataset) => {
  const dist = {};
  const allKeys = ['profit_margin', 'ROE', 'ROA', 'revenue_growth', 'debt_equity', 'PE', 'PB', 'return_1y', 'return_3y', 'volatility', 'beta'];

  for (const k of allKeys) {
    const vals = [];
    for (const row of dataset) {
      const v = parseNumeric(row[k]);
      if (v !== null) vals.push(v);
    }
    vals.sort((a, b) => a - b);
    dist[k] = vals;
  }
  return dist;
};

/**
 * Percentile ranking score (0 to 100)
 */
const getPercentileScore = (val, sortedDist, higherIsBetter = true) => {
  if (val === null || !sortedDist || sortedDist.length === 0) return null;
  const count = sortedDist.filter(x => higherIsBetter ? x < val : x > val).length;
  return Math.min(100, Math.max(0, (count / sortedDist.length) * 100));
};

/**
 * Valuation scoring: rewards balanced/reasonable multiples, penalizes losses or extreme bubbles
 */
const scoreValuationMetric = (key, val) => {
  if (val === null || isNaN(val)) return null;
  if (val <= 0) return 25.0; // Loss-making or negative book value

  if (key === 'PE') {
    if (val < 10) return 80.0;
    if (val <= 28) return 95.0; // Sweet spot for quality Indian equities
    if (val <= 50) return 75.0;
    if (val <= 80) return 55.0;
    return 35.0;
  }

  if (key === 'PB') {
    if (val < 1.5) return 80.0;
    if (val <= 6.0) return 92.0;
    if (val <= 12.0) return 70.0;
    if (val <= 20.0) return 50.0;
    return 35.0;
  }

  return 60.0;
};

/**
 * Calculate the Company Strength Score (0 to 100)
 */
export const calculateCompanyScore = (company, dataset) => {
  if (!company) return null;

  const distributions = getMetricDistributions(dataset);
  const categoryResults = [];
  let totalModelScore = 0;

  for (const [catKey, catDef] of Object.entries(SCORING_CATEGORIES)) {
    const metricScores = [];
    let validCategoryWeightSum = 0;

    for (const metric of catDef.metrics) {
      const rawVal = parseNumeric(company[metric.key]);
      let score = null;

      if (rawVal !== null) {
        if (metric.isValuation) {
          score = scoreValuationMetric(metric.key, rawVal);
        } else {
          score = getPercentileScore(rawVal, distributions[metric.key], metric.higherIsBetter);
        }
      }

      if (score !== null) {
        validCategoryWeightSum += metric.weight;
        metricScores.push({
          key: metric.key,
          label: metric.label,
          raw_value: rawVal,
          formatted_value: formatFeatureValue(metric.key, rawVal),
          metric_weight: metric.weight,
          metric_score: Math.round(score * 10) / 10
        });
      } else {
        metricScores.push({
          key: metric.key,
          label: metric.label,
          raw_value: null,
          formatted_value: 'N/A',
          metric_weight: metric.weight,
          metric_score: null
        });
      }
    }

    // Category Score calculation
    let categoryScoreOutOfCategoryWeight = 0;
    if (validCategoryWeightSum > 0) {
      const normalizedScore100 = metricScores
        .filter(m => m.metric_score !== null)
        .reduce((sum, m) => sum + (m.metric_score * (m.metric_weight / validCategoryWeightSum)), 0);

      categoryScoreOutOfCategoryWeight = (normalizedScore100 / 100) * catDef.weight;
    } else {
      // If entire category is NA (e.g., debt_equity in a bank), assign neutral baseline
      categoryScoreOutOfCategoryWeight = (catDef.weight * 0.70);
    }

    categoryScoreOutOfCategoryWeight = Math.round(categoryScoreOutOfCategoryWeight * 10) / 10;
    totalModelScore += categoryScoreOutOfCategoryWeight;

    categoryResults.push({
      category_id: catKey,
      category_name: catDef.name,
      category_weight: catDef.weight,
      category_score: categoryScoreOutOfCategoryWeight,
      metrics: metricScores
    });
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(totalModelScore)));

  return {
    company_name: company.company_name,
    ticker: company.ticker,
    final_score: finalScore,
    max_score: 100,
    score_display: `${finalScore}/100`,
    score_name: 'Company Strength Score',
    categories: categoryResults
  };
};
