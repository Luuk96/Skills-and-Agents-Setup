-- Snapshots table: periodic serialized state to speed up startup.
-- Instead of replaying ALL events from the beginning, we load the latest
-- snapshot and only replay events that happened after it.
CREATE TABLE IF NOT EXISTS snapshots (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id   TEXT NOT NULL,
  -- The sequenceNumber of the last event included in this snapshot
  last_seq     INTEGER NOT NULL,
  created_at   TEXT NOT NULL,
  -- Full ProjectStateSnapshot serialized as JSON
  state_json   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_session ON snapshots(session_id);
