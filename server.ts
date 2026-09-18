import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createApiRouter } from './src/server/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Mount API router
app.use('/api', createApiRouter());

// Serve static frontend assets from dist in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WasteXchange production server running on http://0.0.0.0:${PORT}`);
});
