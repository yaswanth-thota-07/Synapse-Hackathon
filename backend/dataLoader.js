import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Datasets are located in the parent directory (root)
const PEER_DATASET_PATH = path.resolve(__dirname, '..', 'peer_group_dataset.csv');
const TICKERS_PATH = path.resolve(__dirname, '..', 'tickers.csv');

let peerDataset = [];
let tickersList = [];
let isLoaded = false;

export const loadDatasets = () => {
  return new Promise((resolve, reject) => {
    if (isLoaded) return resolve({ peerDataset, tickersList });

    const peers = [];
    const tickers = [];

    fs.createReadStream(PEER_DATASET_PATH)
      .pipe(csv())
      .on('data', (row) => peers.push(row))
      .on('end', () => {
        peerDataset = peers;

        fs.createReadStream(TICKERS_PATH)
          .pipe(csv())
          .on('data', (row) => tickers.push(row))
          .on('end', () => {
            tickersList = tickers;
            isLoaded = true;
            console.log(`[DataLoader] Loaded ${peerDataset.length} companies from peer_group_dataset.csv`);
            console.log(`[DataLoader] Loaded ${tickersList.length} companies from tickers.csv`);
            resolve({ peerDataset, tickersList });
          })
          .on('error', (err) => reject(err));
      })
      .on('error', (err) => reject(err));
  });
};

export const getAllCompanies = () => {
  return peerDataset.map(c => ({
    company_name: c.company_name,
    ticker: c.ticker,
    sector: c.sector,
    industry: c.industry
  }));
};

export const getUniqueSectors = () => {
  const customOrder = [
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
  return customOrder;
};

export const searchCompanies = (query, sector) => {
  const q = (query || '').trim().toLowerCase();
  const s = (sector || '').trim().toLowerCase();

  return peerDataset
    .filter(c => {
      // Optional sector filtering
      if (s && s !== 'all') {
        const compSector = (c.sector || '').toLowerCase();
        const compIndustry = (c.industry || '').toLowerCase();
        const matchesSector = 
          compSector === s ||
          compSector.includes(s) ||
          (s === 'energy' && compSector.includes('energy')) ||
          compIndustry.includes(s);
        if (!matchesSector) return false;
      }

      if (!q) return true;
      const name = (c.company_name || '').toLowerCase();
      const ticker = (c.ticker || '').toLowerCase();
      const tickerClean = ticker.replace('.ns', '');
      return name.includes(q) || ticker.includes(q) || tickerClean.startsWith(q);
    })
    .slice(0, 15)
    .map(c => ({
      company_name: c.company_name,
      ticker: c.ticker,
      sector: c.sector,
      industry: c.industry,
      market_cap: c.market_cap
    }));
};

export const getCompanyByTickerOrName = (identifier) => {
  if (!identifier) return null;
  const q = identifier.trim().toLowerCase();

  return peerDataset.find(c => {
    const ticker = (c.ticker || '').toLowerCase();
    const tickerClean = ticker.replace('.ns', '');
    const name = (c.company_name || '').toLowerCase();
    return ticker === q || tickerClean === q || name === q;
  }) || null;
};

export const getPeerUniverse = (targetCompany) => {
  if (!targetCompany) return { universe: [], isFallback: false };

  const targetIndustry = (targetCompany.industry || '').trim();
  const targetSector = (targetCompany.sector || '').trim();
  const targetTicker = targetCompany.ticker;

  // Filter 1: Same industry (excluding target itself and delisted/empty entries)
  let peers = peerDataset.filter(c => 
    c.ticker !== targetTicker &&
    c.industry &&
    c.industry !== 'NA' &&
    c.industry.trim().toLowerCase() === targetIndustry.toLowerCase() &&
    c.market_cap !== 'NA'
  );

  let isFallback = false;

  // If fewer than 5 peers in the exact industry, safely fallback to the sector
  if (peers.length < 5 && targetSector && targetSector !== 'NA') {
    const sectorPeers = peerDataset.filter(c => 
      c.ticker !== targetTicker &&
      c.sector &&
      c.sector !== 'NA' &&
      c.sector.trim().toLowerCase() === targetSector.toLowerCase() &&
      c.market_cap !== 'NA'
    );
    if (sectorPeers.length > peers.length) {
      peers = sectorPeers;
      isFallback = true;
    }
  }

  return { universe: peers, isFallback };
};
