import { loadDatasets, getCompanyByTickerOrName, getPeerUniverse } from './dataLoader.js';
import { calculatePeerSimilarities } from './similarity/similarityEngine.js';
import { calculateCompanyScore } from './scoring/companyScore.js';

async function test() {
  await loadDatasets();
  const tcs = getCompanyByTickerOrName('TCS');
  console.log('Target Company:', tcs.company_name, '| Sector:', tcs.sector, '| Industry:', tcs.industry);

  const { universe, isFallback } = getPeerUniverse(tcs);
  console.log(`Discovered Peer Universe: ${universe.length} companies (isSectorFallback: ${isFallback})`);

  const simPeers = calculatePeerSimilarities(tcs, universe);
  console.log('\nTop 5 Discovered Peers (Ranked by Similarity):');
  simPeers.slice(0, 5).forEach((p, idx) => {
    const score = calculateCompanyScore(p.raw_metrics, universe);
    console.log(`Rank #${idx + 1}: ${p.company_name} (${p.ticker}) | Similarity: ${p.similarity_score}% | Model Score: ${score.score_display}`);
  });

  const tcsScore = calculateCompanyScore(tcs, universe);
  console.log(`\nTarget Company Model Score (${tcs.company_name}): ${tcsScore.score_display}`);
  tcsScore.categories.forEach(c => {
    console.log(` - ${c.category_name} (${c.category_weight}%): ${c.category_score}/${c.category_weight}`);
  });
}

test();
