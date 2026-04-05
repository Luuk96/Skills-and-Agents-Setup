// ============================================================
// EXPRESS SERVER
// Sets up all routes, middleware, and the WebSocket upgrade path.
// ============================================================

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config.js';
import eventsRouter from './api/routes/events.js';
import stateRouter from './api/routes/state.js';
import { createWebSocketServer } from './broadcast/WebSocketServer.js';

export function createApp() {
  const app = express();

  // ---- Middleware ----

  // Parse incoming JSON bodies
  app.use(express.json({ limit: '1mb' }));

  // Allow requests from the frontend dev server
  app.use(cors({ origin: config.corsOrigins }));

  // Simple request logger
  app.use((req, _res, next) => {
    if (req.method !== 'GET') {
      console.log(`[HTTP] ${req.method} ${req.path}`);
    }
    next();
  });

  // ---- Routes ----

  app.use('/api/events', eventsRouter);
  app.use('/api/state', stateRouter);

  // Legacy aliases for convenience
  app.use('/api/agents', (_req, res) => res.redirect('/api/state/agents'));
  app.use('/api/workflows', (_req, res) => res.redirect('/api/state/workflows'));
  app.use('/api/tasks', (_req, res) => res.redirect('/api/state/tasks'));
  app.use('/api/skills', (_req, res) => res.redirect('/api/state/skills'));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

/** Boots the HTTP server and attaches the WebSocket server */
export function startServer() {
  const app = createApp();
  const httpServer = createServer(app);

  // Attach WebSocket server to the same HTTP server
  createWebSocketServer(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`[Server] Dashboard backend running at http://localhost:${config.port}`);
    console.log(`[Server] WebSocket available at ws://localhost:${config.port}${config.wsPath}`);
    console.log(`[Server] State snapshot: http://localhost:${config.port}/api/state`);
  });

  return httpServer;
}
