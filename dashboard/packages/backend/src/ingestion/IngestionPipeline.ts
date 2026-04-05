// ============================================================
// INGESTION PIPELINE
// This is the central route for every incoming event:
//   1. Validate the event shape
//   2. Add backend-side fields (receivedAt, sequenceNumber)
//   3. Persist to SQLite
//   4. Apply to in-memory state (projection)
//   5. Broadcast updated state to WebSocket clients
// ============================================================

import type { DashboardEvent } from '@dashboard/core';
import { insertEvent } from '../persistence/EventRepository.js';
import { StateProjector } from '../projection/StateProjector.js';
import { toSnapshot } from '../projection/LiveState.js';
import { broadcastState, broadcastEvent } from '../broadcast/WebSocketServer.js';

// The single shared projector instance — all events flow through here
export const projector = new StateProjector();

/**
 * Ingest one event through the full pipeline.
 * Returns the assigned sequence number.
 */
export async function ingestEvent(rawEvent: DashboardEvent): Promise<number> {
  // 1. Stamp backend-side metadata
  const now = new Date().toISOString();
  const event: DashboardEvent = {
    ...rawEvent,
    receivedAt: now,
  };

  // 2. Persist to database (synchronous, returns seq number)
  const seq = insertEvent(event);
  const eventWithSeq = { ...event, sequenceNumber: seq };

  // 3. Apply to in-memory state
  projector.applyEvents([eventWithSeq]);

  // 4. Broadcast to all WebSocket clients
  const snapshot = toSnapshot(projector.getState());
  broadcastState(snapshot);
  broadcastEvent(eventWithSeq);

  return seq;
}

/**
 * Ingest multiple events in one batch (e.g. from file watcher).
 * More efficient than calling ingestEvent() in a loop.
 */
export async function ingestBatch(rawEvents: DashboardEvent[]): Promise<void> {
  if (rawEvents.length === 0) return;

  const now = new Date().toISOString();
  const stamped = rawEvents.map(e => ({ ...e, receivedAt: now }));

  // Persist all events
  for (const event of stamped) {
    insertEvent(event);
  }

  // Apply entire batch to state at once
  projector.applyEvents(stamped);

  // Broadcast updated state once after the batch
  const snapshot = toSnapshot(projector.getState());
  broadcastState(snapshot);
}
