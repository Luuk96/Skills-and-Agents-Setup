-- Events table: the immutable append-only log of everything that happened.
-- We never UPDATE or DELETE rows here. This is the source of truth.
CREATE TABLE IF NOT EXISTS events (
  -- Backend-assigned row ID (monotonic, used as sequenceNumber)
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Agent-assigned event ID (nanoid)
  id          TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL,
  agent_id    TEXT NOT NULL,
  session_id  TEXT NOT NULL,
  workflow_id TEXT,
  task_id     TEXT,
  -- ISO 8601 timestamp set by the emitter
  timestamp   TEXT NOT NULL,
  -- ISO 8601 timestamp set by the backend when the event arrived
  received_at TEXT NOT NULL,
  schema_ver  TEXT NOT NULL DEFAULT '1.0',
  -- Full event JSON stored for replay and debugging
  raw_json    TEXT NOT NULL
);

-- Indexes for the most common query patterns
CREATE INDEX IF NOT EXISTS idx_events_session   ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_agent     ON events(agent_id);
CREATE INDEX IF NOT EXISTS idx_events_type      ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_workflow  ON events(workflow_id);
CREATE INDEX IF NOT EXISTS idx_events_task      ON events(task_id);
