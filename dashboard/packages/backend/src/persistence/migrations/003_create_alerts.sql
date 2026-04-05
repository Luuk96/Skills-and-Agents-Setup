-- Alerts table: persists fired alerts so they survive restarts.
CREATE TABLE IF NOT EXISTS alerts (
  id              TEXT PRIMARY KEY,
  severity        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  agent_id        TEXT,
  workflow_id     TEXT,
  task_id         TEXT,
  triggered_at    TEXT NOT NULL,
  acknowledged_at TEXT,
  resolved_at     TEXT,
  rule_id         TEXT NOT NULL,
  session_id      TEXT NOT NULL,
  context_json    TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_alerts_session  ON alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status   ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
