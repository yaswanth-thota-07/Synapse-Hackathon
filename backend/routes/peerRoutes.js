import express from 'express';
import {
  handleSearchCompanies,
  handleDiscoverPeers,
  handleExplainSimilarity,
  handleExplainScore,
  handleGetSectors
} from '../controllers/peerController.js';

const router = express.Router();

router.get('/sectors', handleGetSectors);
router.get('/companies/search', handleSearchCompanies);
router.get('/peers/discover', handleDiscoverPeers);
router.post('/ai/explain-similarity', handleExplainSimilarity);
router.post('/ai/explain-score', handleExplainScore);

export default router;
