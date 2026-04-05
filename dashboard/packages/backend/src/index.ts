// ============================================================
// BACKEND ENTRY POINT
// Boots the database, file watcher, and HTTP+WebSocket server.
// ============================================================

import { getDatabase } from './persistence/Database';
import { startFileWatcher } from './ingestion/FileWatcher';
import { startServer } from './server';

async function main() {
  console.log('[Dashboard Backend] Starting up...');

  // 1. Initialize the database (creates tables if they don't exist)
  getDatabase();

  // 2. Start watching the events/ folder for file-based event emission
  startFileWatcher();

  // 3. Start the HTTP + WebSocket server
  startServer();

  // 4. Graceful shutdown on Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n[Dashboard Backend] Shutting down...');
    process.exit(0);
  });
}

main().catch(err => {
  console.error('[Dashboard Backend] Fatal startup error:', err);
  process.exit(1);
});
