// ============================================================
// DATABASE
// Sets up the SQLite database and runs migrations.
// Uses better-sqlite3 which is synchronous — simple and fast.
// ============================================================

import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { config } from '../config.js';

let db: Database.Database | null = null;

/** Returns the single shared database connection (creates it if needed) */
export function getDatabase(): Database.Database {
  if (db) return db;

  // Make sure the data/ directory exists
  const dbDir = dirname(config.dbPath);
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(config.dbPath);

  // WAL mode = much better write performance + allows concurrent reads
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run all migrations in order
  runMigrations(db);

  return db;
}

/** Runs all SQL migration files in the migrations/ folder */
function runMigrations(database: Database.Database): void {
  const migrationsDir = join(__dirname, 'migrations');
  const files = [
    '001_create_events.sql',
    '002_create_snapshots.sql',
    '003_create_alerts.sql',
  ];

  database.transaction(() => {
    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      database.exec(sql);
    }
  })();

  console.log('[Database] Migrations complete.');
}

/** Closes the database connection cleanly on shutdown */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
