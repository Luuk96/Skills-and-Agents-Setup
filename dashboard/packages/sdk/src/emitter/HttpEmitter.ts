// ============================================================
// HTTP EMITTER
// Sends events to the backend via HTTP POST.
// This is the preferred method when the backend is running.
// ============================================================

import type { DashboardEvent } from '@dashboard/core';

export class HttpEmitter {
  private readonly endpoint: string;

  constructor(backendUrl: string = 'http://localhost:3001') {
    // The ingestion endpoint on the backend
    this.endpoint = `${backendUrl}/api/events`;
  }

  /**
   * Posts a single event to the backend.
   * Throws if the backend is unreachable (caller should handle this).
   */
  async emit(event: DashboardEvent): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP emitter: backend returned ${response.status} for event ${event.id}`
      );
    }
  }
}
