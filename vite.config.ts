import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { defineConfig } from 'vite';
import { createApiRouter } from './src/server/api';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'wastexchange-api-server',
        configureServer(server) {
          const app = express();
          app.use(express.json({ limit: '50mb' }));
          app.use(express.urlencoded({ extended: true, limit: '50mb' }));
          const apiRouter = createApiRouter();
          app.use(apiRouter);
          server.middlewares.use('/api', app);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
