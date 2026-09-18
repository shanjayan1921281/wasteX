import type { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import dotenv from 'dotenv';
import { createApiRouter } from '../src/server/api.ts';

dotenv.config();

const app = express();

// Standard middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set permissive CORS headers for Vercel Serverless Function deployment
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'vercel-serverless',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'vercel-serverless',
    timestamp: new Date().toISOString()
  });
});

// Mount the API router on both '/api' and '/' to ensure proper route resolution on Vercel
const apiRouter = createApiRouter();
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Export standard Vercel serverless function handler
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return (app as any)(req, res);
}
