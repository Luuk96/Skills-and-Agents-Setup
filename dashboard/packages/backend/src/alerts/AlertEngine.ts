// ============================================================
// ALERT ENGINE
// Evaluates rules against the live state after each event batch.
// When a rule fires, it creates an Alert and broadcasts it.
// ============================================================

import type { Alert, AlertRule, ProjectState } from '@dashboard/core';
import { broadcastAlert } from '../broadcast/WebSocketServer';

// Track when each rule last fired (for cooldown enforcement)
const lastFiredAt: Map<string, number> = new Map();

/** Built-in alert rules — add new rules here */
const ALERT_RULES: Array<AlertRule & {
  check: (state: ProjectState) => string | null; // returns message if should fire, null if not
}> = [
  {
    id: 'agent-blocked',
    name: 'Agent Blocked',
    description: 'Fires when any agent has been in "blocked" status',
    severity: 'warning',
    enabled: true,
    conditionDescription: 'Any agent.status === "blocked"',
    cooldownMs: 30_000,
    check: (state) => {
      const blocked = Array.from(state.agents.values()).filter(a => a.status === 'blocked');
      if (blocked.length > 0) {
        return `${blocked.length} agent(s) are blocked: ${blocked.map(a => a.name).join(', ')}`;
      }
      return null;
    },
  },
  {
    id: 'agent-error',
    name: 'Agent Error',
    description: 'Fires when any agent is in error state',
    severity: 'critical',
    enabled: true,
    conditionDescription: 'Any agent.status === "error"',
    cooldownMs: 10_000,
    check: (state) => {
      const errored = Array.from(state.agents.values()).filter(a => a.status === 'error');
      if (errored.length > 0) {
        return `${errored.length} agent(s) in error: ${errored.map(a => `${a.name} — ${a.errorMessage}`).join('; ')}`;
      }
      return null;
    },
  },
  {
    id: 'workflow-failed',
    name: 'Workflow Failed',
    description: 'Fires when a workflow enters failed status',
    severity: 'critical',
    enabled: true,
    conditionDescription: 'Any workflow.status === "failed"',
    cooldownMs: 10_000,
    check: (state) => {
      const failed = Array.from(state.workflows.values()).filter(w => w.status === 'failed');
      if (failed.length > 0) {
        return `Workflow(s) failed: ${failed.map(w => w.name).join(', ')}`;
      }
      return null;
    },
  },
  {
    id: 'many-blocked-tasks',
    name: 'Multiple Blocked Tasks',
    description: 'Fires when more than 2 tasks are blocked simultaneously',
    severity: 'warning',
    enabled: true,
    conditionDescription: 'Count of tasks with status === "blocked" > 2',
    cooldownMs: 60_000,
    check: (state) => {
      const blocked = Array.from(state.tasks.values()).filter(t => t.status === 'blocked');
      if (blocked.length > 2) {
        return `${blocked.length} tasks are currently blocked`;
      }
      return null;
    },
  },
  {
    id: 'skill-failure-spike',
    name: 'Skill Failure Spike',
    description: 'Fires when skill failures exceed 3 in recent invocations',
    severity: 'warning',
    enabled: true,
    conditionDescription: 'Recent skill failures > 3',
    cooldownMs: 60_000,
    check: (state) => {
      const recent = state.skillInvocations.slice(-20);
      const failures = recent.filter(i => i.outcome === 'failure').length;
      if (failures > 3) {
        return `${failures} skill failures in recent activity`;
      }
      return null;
    },
  },
];

/** Evaluate all rules against the current state, fire any that match */
export function evaluateAlerts(state: ProjectState): void {
  const now = Date.now();

  for (const rule of ALERT_RULES) {
    if (!rule.enabled) continue;

    // Check cooldown
    const lastFired = lastFiredAt.get(rule.id) ?? 0;
    if (now - lastFired < rule.cooldownMs) continue;

    const message = rule.check(state);
    if (!message) continue;

    // Rule fired — create and record the alert
    lastFiredAt.set(rule.id, now);

    const alert: Alert = {
      id: `alert_${Date.now()}_${rule.id}`,
      severity: rule.severity,
      status: 'active',
      title: rule.name,
      message,
      agentId: null,
      workflowId: null,
      taskId: null,
      triggeredAt: new Date().toISOString(),
      acknowledgedAt: null,
      resolvedAt: null,
      ruleId: rule.id,
      context: {},
      sessionId: state.currentSessionId ?? 'unknown',
    };

    // Add to state
    state.alerts.push(alert);

    // Broadcast to dashboard clients immediately
    broadcastAlert(alert);

    console.log(`[AlertEngine] 🚨 ${rule.severity.toUpperCase()} — ${rule.name}: ${message}`);
  }
}

/** Returns the list of all configured rules (for the frontend alerts config view) */
export function getAlertRules(): AlertRule[] {
  return ALERT_RULES.map(({ check: _, ...rule }) => rule);
}
