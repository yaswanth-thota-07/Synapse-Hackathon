import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getGeminiApiKey = () => {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key || key.includes('YOUR_GEMINI_API_KEY') || key.trim() === '') {
    return null;
  }
  return key.trim();
};

// In-memory backend response cache to avoid duplicate API calls
const backendAiCache = new Map();

/**
 * Call Gemini API using axios (gemini-2.5-flash supported)
 */
const callGeminiApi = async (prompt) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const models = ['gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000
          }
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 9000 }
      );

      const candidates = response.data?.candidates;
      if (candidates && candidates.length > 0) {
        const text = candidates[0].content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    } catch (error) {
      console.error(`[GeminiService] Error calling ${model}:`, error?.response?.data?.error?.message || error.message);
    }
  }

  return null;
};

/**
 * 3-4 Bullet Points Similarity Fallback
 */
const generateDeterministicSimilarityExplanation = (targetName, peerName, similarityScore, methodology, breakdown, rank) => {
  const topAligned = (methodology || [])
    .filter(m => m.alignment === 'Strongly Aligned' || (m.cosine_contribution || 0) > 0)
    .slice(0, 2);
  const divergent = (methodology || [])
    .filter(m => m.alignment === 'Divergent' || (m.cosine_contribution || 0) < 0)
    .slice(0, 1);

  const topNames = topAligned.map(m => m.label).join(' and ') || 'profit margins and capital structure';
  const divName = divergent[0]?.label || 'market valuation and beta';

  return `• **Strong Operational Alignment**: **${peerName}** achieves **${similarityScore}%** similarity against **${targetName}** (Rank #${rank || '1'} Peer), driven by close parity in ${topNames}.
• **Multi-Dimensional Balance**: Shows **${breakdown?.financial_similarity || similarityScore}%** fundamental synchronization alongside **${breakdown?.market_similarity || similarityScore}%** market behavior correlation.
• **Primary Divergence**: Variance in ${divName} accounts for the remaining divergence from an identical operational profile.
• **Peer Group Suitability**: High multidimensional cosine alignment confirms both firms operate with comparable unit economics, risk exposure, and industry dynamics.`;
};

/**
 * 3-4 Bullet Points Company Score Fallback
 */
const generateDeterministicScoreExplanation = (companyName, finalScore, categories) => {
  const sortedCats = [...(categories || [])].sort((a, b) => (b.category_score / b.category_weight) - (a.category_score / a.category_weight));
  const top = sortedCats[0] || { category_name: 'Profitability', category_score: 20, category_weight: 25 };
  const lowest = sortedCats[sortedCats.length - 1] || { category_name: 'Valuation', category_score: 8, category_weight: 15 };
  const topPct = Math.round((top.category_score / top.category_weight) * 100);
  const lowPct = Math.round((lowest.category_score / lowest.category_weight) * 100);

  return `• **Overall Fundamental Profile**: **${companyName}** scores **${finalScore}/100** on our independent 6-pillar financial health model.
• **Primary Strength Driver**: **${top.category_name}** leads performance at **${top.category_score}/${top.category_weight} pts** (${topPct}% attainment), reflecting upper-percentile standing against market peers.
• **Constraining Factors**: **${lowest.category_name}** represents the main headwind at **${lowest.category_score}/${lowest.category_weight} pts** (${lowPct}% attainment).
• **Analyst Assessment**: Demonstrates a balanced operational structure with sustainable balance sheet health relative to the broader universe.`;
};

/**
 * 1. Explain Similarity (Strictly 3-4 points, no tables)
 */
export const explainSimilarity = async (payload) => {
  const { target_company, peer_company, similarity_score, rank, methodology, breakdown } = payload;
  const targetName = target_company?.company_name || 'Target Company';
  const peerName = peer_company?.company_name || 'Peer Company';
  const cacheKey = `sim_${target_company?.ticker}_${peer_company?.ticker}`;

  if (backendAiCache.has(cacheKey)) {
    return { source: 'cache', explanation: backendAiCache.get(cacheKey) };
  }

  const prompt = `You are a senior quantitative equity analyst.
Explain strictly in 3 to 4 concise, impactful bullet points WHY "${targetName}" and "${peerName}" have a similarity score of ${similarity_score}% (Rank #${rank || 1}).

STRICT RULES:
1. Provide EXACTLY 3 to 4 bullet points.
2. DO NOT use markdown tables or pipe (|) characters.
3. DO NOT use header hashes (# or ##).
4. DO NOT include any introductory or concluding pleasantries. Start immediately with the first bullet point.
5. In the 3-4 points, explain:
   - Primary operational & financial similarities (e.g. margins, capital efficiency).
   - Key divergence (where valuation, growth, or volatility differ).
   - Overall suitability as a comparative peer.

DATA:
- Target: ${targetName}
- Peer: ${peerName}
- Similarity: ${similarity_score}%
- Financial Similarity: ${breakdown?.financial_similarity || similarity_score}%
- Market Similarity: ${breakdown?.market_similarity || similarity_score}%
- Key Contributing Factors:
${(methodology || []).slice(0, 6).map(m => `  * ${m.label}: Target=${m.target_val_formatted}, Peer=${m.peer_val_formatted} (${m.alignment})`).join('\n')}
`;

  const aiText = await callGeminiApi(prompt);
  if (aiText) {
    const cleanedText = aiText
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\|.*\|/g, '') // remove any stray table pipes if any
      .trim();
    backendAiCache.set(cacheKey, cleanedText);
    return { source: 'gemini', explanation: cleanedText };
  }

  const fallback = generateDeterministicSimilarityExplanation(targetName, peerName, similarity_score, methodology, breakdown, rank);
  backendAiCache.set(cacheKey, fallback);
  return {
    source: 'deterministic_fallback',
    explanation: fallback
  };
};

/**
 * 2. Explain Company Strength Score (Strictly 3-4 points, no tables)
 */
export const explainCompanyScore = async (payload) => {
  const { company_name, final_score, categories } = payload;
  const cacheKey = `score_${payload.ticker || company_name}`;

  if (backendAiCache.has(cacheKey)) {
    return { source: 'cache', explanation: backendAiCache.get(cacheKey) };
  }

  const prompt = `You are a senior equity analyst.
Explain strictly in 3 to 4 concise, impactful bullet points WHY "${company_name}" received an overall Company Strength Score of ${final_score}/100.

STRICT RULES:
1. Provide EXACTLY 3 to 4 bullet points.
2. DO NOT use markdown tables or pipe (|) characters.
3. DO NOT use header hashes (# or ##).
4. DO NOT include any introductory or concluding pleasantries. Start immediately with the first bullet point.
5. In the 3-4 points, explain:
   - Strongest financial health pillars driving the score.
   - Constraining pillars or balance sheet headwinds.
   - Core fundamental assessment for equity research analysts.

DATA:
- Company: ${company_name}
- Total Score: ${final_score}/100
- Pillar Performance:
${(categories || []).map(c => `  * ${c.category_name} (${c.category_weight}% weight): ${c.category_score}/${c.category_weight} pts (${Math.round((c.category_score / c.category_weight) * 100)}% attainment)`).join('\n')}
`;

  const aiText = await callGeminiApi(prompt);
  if (aiText) {
    const cleanedText = aiText
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\|.*\|/g, '')
      .trim();
    backendAiCache.set(cacheKey, cleanedText);
    return { source: 'gemini', explanation: cleanedText };
  }

  const fallback = generateDeterministicScoreExplanation(company_name, final_score, categories);
  backendAiCache.set(cacheKey, fallback);
  return {
    source: 'deterministic_fallback',
    explanation: fallback
  };
};
