// ============================================================
// AGENT TYPES
// Every agent in the ecosystem must match these shapes exactly.
// ============================================================

/** What the agent is capable of doing (used for filtering and routing) */
export interface AgentCapability {
  name: string;    // e.g. "code-generation", "planning", "orchestration"
  version: string; // e.g. "1.0.0"
}

/**
 * The status an agent can be in at any moment.
 * - idle:    registered but not actively working
 * - running: actively executing a task
 * - waiting: waiting for another agent or external input
 * - blocked: stuck, needs human intervention
 * - error:   encountered a non-recoverable error
 * - offline: no heartbeat received within the timeout window
 */
export type AgentStatus =
  | 'idle'
  | 'running'
  | 'waiting'
  | 'blocked'
  | 'error'
  | 'offline';

/** A live agent instance registered in the dashboard */
export interface Agent {
  id: string;                        // nanoid, unique per agent run
  name: string;                      // human label, e.g. "orchestrator", "planner"
  type: string;                      // agent template, e.g. "claude-code-agent"
  status: AgentStatus;
  currentTaskId: string | null;      // null when idle
  currentWorkflowId: string | null;  // null when not in a workflow
  currentStageId: string | null;     // null when not in a workflow stage
  capabilities: AgentCapability[];
  metadata: Record<string, unknown>; // anything extra the agent wants to report
  startedAt: string;                 // ISO 8601
  lastSeenAt: string;                // ISO 8601 — updated on every heartbeat
  endedAt: string | null;            // ISO 8601, or null if still running
  errorMessage: string | null;       // populated when status === 'error'
  parentAgentId: string | null;      // set when spawned by an orchestrator
  sessionId: string;                 // groups agents active in the same session
}
