// ============================================================
// FILE EMITTER
// Writes events as NDJSON lines to a watched folder.
// Used as fallback when the HTTP backend is unavailable.
// The backend's FileWatcher picks these up automatically.
// ============================================================

import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { DashboardEvent } from '@dashboard/core';

export class FileEmitter {
  private readonly eventsDir: string;
  private readonly filePath: string;

  constructor(eventsDir: string) {
    this.eventsDir = eventsDir;
    // All events go into a single NDJSON file named by session date
    const today = new Date().toISOString().slice(0, 10); // "2026-04-05"
    this.filePath = join(eventsDir, `events-${today}.ndjson`);

    // Make sure the folder exists (safe to call if it already exists)
    mkdirSync(eventsDir, { recursive: true });
  }

  /**
   * Appends one event as a JSON line to the events file.
   * NDJSON = one JSON object per line (easy to stream and parse).
   */
  emit(event: DashboardEvent): void {
    const line = JSON.stringify(event) + '\n';
    appendFileSync(this.filePath, line, 'utf8');
  }
}
