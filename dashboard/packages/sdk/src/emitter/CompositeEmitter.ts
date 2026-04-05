// ============================================================
// COMPOSITE EMITTER
// Tries HTTP first. If that fails, falls back to writing a file.
// This means events are never lost — even if the backend is down.
// ============================================================

import type { DashboardEvent } from '@dashboard/core';
import { HttpEmitter } from './HttpEmitter';
import { FileEmitter } from './FileEmitter';

export class CompositeEmitter {
  private readonly http: HttpEmitter;
  private readonly file: FileEmitter;

  constructor(backendUrl: string, eventsDir: string) {
    this.http = new HttpEmitter(backendUrl);
    this.file = new FileEmitter(eventsDir);
  }

  async emit(event: DashboardEvent): Promise<void> {
    try {
      // Try HTTP first (real-time, preferred)
      await this.http.emit(event);
    } catch {
      // HTTP failed — fall back to file (will be picked up by FileWatcher)
      this.file.emit(event);
    }
  }
}
