// ============================================================
// PROJECT STATE TYPES
// ProjectState is the in-memory "current world" — rebuilt from events.
// ProjectStateSnapshot is the JSON-serialisable form sent to the frontend.
// ============================================================

import type { Agent } from './agent';
import type { Workflow } from './workflow';
import type { Task } from './task';
import type { Skill, SkillInvocation } from './skill';
import type { Handoff } from './handoff';
import type { Alert } from './alert';
import type { DashboardEvent } from './event';

/** System health roll-up */
export type SystemHealth = 'healthy' | 'degraded' | 'critical';

/** Aggregated live statistics */
export interface SystemStats {
  totalAgentsActive: number;
  totalWorkflowsRunning: number;
  totalTasksOpen: number;
  totalTasksCompleted: number;
  totalHandoffsToday: number;
  totalEventsThisSession: number;
  alertCountBySeverity: {
    critical: number;
    warning: number;
    info: number;
  };
}

/**
 * The full in-memory live state.
 * Uses Map<id, entity> for O(1) lookups.
 * This is what the StateProjector maintains on the backend.
 */
export interface ProjectState {
  agents: Map<string, Agent>;
  workflows: Map<string, Workflow>;
  tasks: Map<string, Task>;
  handoffs: Map<string, Handoff>;
  skills: Map<string, Skill>;
  skillInvocations: SkillInvocation[];  // rolling window of last 200
  alerts: Alert[];                       // active + recent resolved
  recentEvents: DashboardEvent[];        // rolling window of last 500
  stats: SystemStats;
  currentSessionId: string | null;
  sessionStartedAt: string | null;
  lastEventAt: string | null;
  systemHealth: SystemHealth;
}

/**
 * JSON-serialisable snapshot of ProjectState.
 * Maps are converted to arrays for transport over WebSocket / REST.
 */
export interface ProjectStateSnapshot {
  agents: Agent[];
  workflows: Workflow[];
  tasks: Task[];
  handoffs: Handoff[];
  skills: Skill[];
  skillInvocations: SkillInvocation[];
  alerts: Alert[];
  recentEvents: DashboardEvent[];
  stats: SystemStats;
  currentSessionId: string | null;
  sessionStartedAt: string | null;
  lastEventAt: string | null;
  systemHealth: SystemHealth;
  snapshotAt: string; // ISO 8601, when this snapshot was generated
}
