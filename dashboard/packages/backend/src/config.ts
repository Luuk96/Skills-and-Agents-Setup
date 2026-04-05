// ============================================================
// CONFIGURATION
// All environment variables and paths live here.
// Change these to adjust ports, paths, etc.
// ============================================================

import { resolve } from 'path';

// The folder this backend lives in
const BACKEND_ROOT = resolve(__dirname, '..', '..', '..', '..');

export const config = {
  // HTTP server port
  port: parseInt(process.env.PORT ?? '3001', 10),

  // WebSocket port (on the same server, different upgrade path)
  wsPath: '/ws',

  // Where agents drop event files
  eventsDir: process.env.EVENTS_DIR ?? resolve(BACKEND_ROOT, 'events'),

  // SQLite database file location
  dbPath: process.env.DB_PATH ?? resolve(BACKEND_ROOT, 'data', 'dashboard.db'),

  // How many recent events to keep in memory (rolling window)
  recentEventsLimit: 500,

  // How many skill invocations to keep in memory
  recentInvocationsLimit: 200,

  // Heartbeat timeout: agents marked offline if no heartbeat in this window
  agentOfflineThresholdMs: 60_000, // 60 seconds

  // Alert rules cooldown defaults
  defaultAlertCooldownMs: 30_000,

  // CORS — allow frontend dev server
  corsOrigins: ['http://localhost:5173', 'http://localhost:3000'],
};
