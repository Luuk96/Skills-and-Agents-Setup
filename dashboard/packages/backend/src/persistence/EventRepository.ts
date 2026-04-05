// ============================================================
// EVENT REPOSITORY
// All database reads and writes for events go through here.
// ============================================================

import type { DashboardEvent } from '@dashboard/core';
import { getDatabase } from './Database';

export interface StoredEvent {
  seq: number;
  id: string;
  type: string;
  agentId: string;
  sessionId: string;
  workflowId: string | null;
  taskId: string | null;
  timestamp: string;
  receivedAt: string;
  event: DashboardEvent; // fully parsed
}

/** Insert one event into the database. Returns the assigned sequence number. */
export function insertEvent(event: DashboardEvent): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO events (id, type, agent_id, session_id, workflow_id, task_id, timestamp, received_at, schema_ver, raw_json)
    VALUES (@id, @type, @agentId, @sessionId, @workflowId, @taskId, @timestamp, @receivedAt, @schemaVer, @rawJson)
  `);

  const result = stmt.run({
    id: event.id,
    type: event.type,
    agentId: event.agentId,
    sessionId: event.sessionId,
    workflowId: event.workflowId ?? null,
    taskId: event.taskId ?? null,
    timestamp: event.timestamp,
    receivedAt: event.receivedAt ?? new Date().toISOString(),
    schemaVer: event.schemaVersion,
    rawJson: JSON.stringify(event),
  });

  return result.lastInsertRowid as number;
}

/** Get events for a session, ordered by sequence number */
export function getEventsBySession(sessionId: string, afterSeq = 0): StoredEvent[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT seq, id, type, agent_id, session_id, workflow_id, task_id, timestamp, received_at, raw_json
    FROM events
    WHERE session_id = ? AND seq > ?
    ORDER BY seq ASC
  `).all(sessionId, afterSeq) as any[];

  return rows.map(rowToStoredEvent);
}

/** Get the last N events for any session (used for initial dashboard load) */
export function getRecentEvents(limit = 500): StoredEvent[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT seq, id, type, agent_id, session_id, workflow_id, task_id, timestamp, received_at, raw_json
    FROM events
    ORDER BY seq DESC
    LIMIT ?
  `).all(limit) as any[];

  return rows.reverse().map(rowToStoredEvent);
}

/** Get events filtered by type */
export function getEventsByType(type: string, limit = 100): StoredEvent[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT seq, id, type, agent_id, session_id, workflow_id, task_id, timestamp, received_at, raw_json
    FROM events
    WHERE type = ?
    ORDER BY seq DESC
    LIMIT ?
  `).all(type, limit) as any[];

  return rows.reverse().map(rowToStoredEvent);
}

function rowToStoredEvent(row: any): StoredEvent {
  return {
    seq: row.seq,
    id: row.id,
    type: row.type,
    agentId: row.agent_id,
    sessionId: row.session_id,
    workflowId: row.workflow_id ?? null,
    taskId: row.task_id ?? null,
    timestamp: row.timestamp,
    receivedAt: row.received_at,
    event: JSON.parse(row.raw_json) as DashboardEvent,
  };
}
