// ============================================================
// LIVE STATE
// The in-memory current state of the entire ecosystem.
// This is rebuilt by replaying events through the StateProjector.
// ============================================================

import type {
  ProjectState,
  ProjectStateSnapshot,
  SystemStats,
} from '@dashboard/core';
import { config } from '../config';

/** Creates the initial empty state */
export function createEmptyState(): ProjectState {
  return {
    agents: new Map(),
    workflows: new Map(),
    tasks: new Map(),
    handoffs: new Map(),
    skills: new Map(),
    skillInvocations: [],
    alerts: [],
    recentEvents: [],
    stats: createEmptyStats(),
    currentSessionId: null,
    sessionStartedAt: null,
    lastEventAt: null,
    systemHealth: 'healthy',
  };
}

function createEmptyStats(): SystemStats {
  return {
    totalAgentsActive: 0,
    totalWorkflowsRunning: 0,
    totalTasksOpen: 0,
    totalTasksCompleted: 0,
    totalHandoffsToday: 0,
    totalEventsThisSession: 0,
    alertCountBySeverity: { critical: 0, warning: 0, info: 0 },
  };
}

/** Recomputes the stats from current state (called after each event batch) */
export function recomputeStats(state: ProjectState): SystemStats {
  const agents = Array.from(state.agents.values());
  const workflows = Array.from(state.workflows.values());
  const tasks = Array.from(state.tasks.values());
  const handoffs = Array.from(state.handoffs.values());

  const today = new Date().toISOString().slice(0, 10);

  const activeAlerts = state.alerts.filter(a => a.status === 'active');

  return {
    totalAgentsActive: agents.filter(a => a.status === 'running' || a.status === 'waiting').length,
    totalWorkflowsRunning: workflows.filter(w => w.status === 'running').length,
    totalTasksOpen: tasks.filter(t => t.status === 'open' || t.status === 'in-progress').length,
    totalTasksCompleted: tasks.filter(t => t.status === 'completed').length,
    totalHandoffsToday: handoffs.filter(h => h.initiatedAt.startsWith(today)).length,
    totalEventsThisSession: state.recentEvents.length,
    alertCountBySeverity: {
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
      warning: activeAlerts.filter(a => a.severity === 'warning').length,
      info: activeAlerts.filter(a => a.severity === 'info').length,
    },
  };
}

/** Determines overall system health from current stats */
export function computeSystemHealth(
  state: ProjectState
): ProjectState['systemHealth'] {
  const stats = state.stats;
  if (stats.alertCountBySeverity.critical > 0) return 'critical';
  if (stats.alertCountBySeverity.warning > 2) return 'degraded';
  const blockedAgents = Array.from(state.agents.values()).filter(a => a.status === 'blocked' || a.status === 'error');
  if (blockedAgents.length > 0) return 'degraded';
  return 'healthy';
}

/** Converts the internal Map-based state to a JSON-serialisable snapshot */
export function toSnapshot(state: ProjectState): ProjectStateSnapshot {
  return {
    agents: Array.from(state.agents.values()),
    workflows: Array.from(state.workflows.values()),
    tasks: Array.from(state.tasks.values()),
    handoffs: Array.from(state.handoffs.values()),
    skills: Array.from(state.skills.values()),
    skillInvocations: state.skillInvocations.slice(-config.recentInvocationsLimit),
    alerts: state.alerts,
    recentEvents: state.recentEvents.slice(-config.recentEventsLimit),
    stats: state.stats,
    currentSessionId: state.currentSessionId,
    sessionStartedAt: state.sessionStartedAt,
    lastEventAt: state.lastEventAt,
    systemHealth: state.systemHealth,
    snapshotAt: new Date().toISOString(),
  };
}
