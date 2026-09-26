import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadDatasets } from './dataLoader.js';
import peerRoutes from './routes/peerRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', peerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Dynamic Peer Discovery Engine' });
});

// Standalone FLUX single-screen studio hero
app.get('/flux', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../flux_hero.html'));
});

// Serve frontend build if available
const frontendDist = path.resolve(__dirname, '../frontend1/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start server after datasets are loaded
loadDatasets()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`Dynamic Peer Discovery API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
    });
  })
  .catch((err) => {
    console.error('Fatal: Failed to load datasets on startup:', err);
    process.exit(1);
  });
