// ============================================================
// EVENT BUILDER
// Constructs a validated DashboardEvent object.
// Agents call this instead of building the object manually.
// ============================================================

import type { DashboardEvent, EventType, EventPayload } from '@dashboard/core';
import { generateId } from './generateId.js';

interface BuildEventOptions {
  type: EventType;
  agentId: string;
  sessionId: string;
  payload: EventPayload;
  workflowId?: string | null;
  taskId?: string | null;
}

/**
 * Creates a complete, valid DashboardEvent ready to be emitted.
 * Sets id, timestamp, and schemaVersion automatically.
 */
export function buildEvent(opts: BuildEventOptions): DashboardEvent {
  return {
    id: generateId('ev'),
    type: opts.type,
    agentId: opts.agentId,
    sessionId: opts.sessionId,
    workflowId: opts.workflowId ?? null,
    taskId: opts.taskId ?? null,
    timestamp: new Date().toISOString(),
    schemaVersion: '1.0',
    payload: opts.payload,
  };
}
