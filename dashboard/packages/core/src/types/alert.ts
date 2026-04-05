// ============================================================
// ALERT TYPES
// Alerts fire when the AlertEngine detects a problem condition.
// ============================================================

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  agentId: string | null;      // which agent triggered this alert
  workflowId: string | null;
  taskId: string | null;
  triggeredAt: string;         // ISO 8601
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  ruleId: string;              // which AlertRule fired
  context: Record<string, unknown>;
  sessionId: string;
}

/** A rule the AlertEngine evaluates after every state change */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  enabled: boolean;
  conditionDescription: string; // human-readable description of when this fires
  cooldownMs: number;           // minimum ms between firings of the same rule
}
