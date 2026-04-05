// ============================================================
// EVENT TYPES
// Every piece of activity in the ecosystem is an event.
// Events are the single source of truth — state is derived from them.
// ============================================================

import type { AgentCapability, AgentStatus } from './agent';
import type { TaskDependency, TaskPriority } from './task';

/** All possible event type strings — exhaustive, never use raw strings */
export type EventType =
  // Session lifecycle
  | 'session.started'
  | 'session.ended'
  // Agent lifecycle
  | 'agent.started'
  | 'agent.heartbeat'
  | 'agent.idle'
  | 'agent.stopped'
  | 'agent.error'
  // Workflow lifecycle
  | 'workflow.started'
  | 'workflow.stage.started'
  | 'workflow.stage.completed'
  | 'workflow.stage.failed'
  | 'workflow.stage.skipped'
  | 'workflow.completed'
  | 'workflow.failed'
  // Task lifecycle
  | 'task.created'
  | 'task.started'
  | 'task.blocked'
  | 'task.completed'
  | 'task.cancelled'
  // Agent interactions
  | 'handoff.initiated'
  | 'handoff.received'
  | 'handoff.completed'
  // Skill usage
  | 'skill.invoked'
  | 'skill.completed'
  | 'skill.failed'
  // Diagnostics
  | 'diagnostic.log'
  | 'diagnostic.metric';

// ---- Payload interfaces (one per event type) ----

export interface SessionStartedPayload {
  projectPath: string;
  description: string | null;
  tags: string[];
}

export interface SessionEndedPayload {
  reason: 'completed' | 'cancelled' | 'error';
  summary: string;
  totalDurationMs: number;
}

export interface AgentStartedPayload {
  name: string;
  type: string;
  capabilities: AgentCapability[];
  parentAgentId: string | null;
  metadata: Record<string, unknown>;
}

export interface AgentHeartbeatPayload {
  status: AgentStatus;
  currentTaskId: string | null;
  currentStageId: string | null;
  memoryUsageMb: number | null;
}

export interface AgentIdlePayload {
  previousTaskId: string | null;
}

export interface AgentStoppedPayload {
  reason: 'completed' | 'cancelled' | 'error' | 'timeout';
  summary: string;
}

export interface AgentErrorPayload {
  errorCode: string;
  message: string;
  stack: string | null;
  recoverable: boolean;
}

export interface WorkflowStartedPayload {
  name: string;
  description: string;
  stages: Array<{
    id: string;
    name: string;
    order: number;
    dependsOnStageIds: string[];
  }>;
  projectContext: string | null;
}

export interface WorkflowStageStartedPayload {
  stageId: string;
  stageName: string;
  assignedAgentId: string;
}

export interface WorkflowStageCompletedPayload {
  stageId: string;
  stageName: string;
  durationMs: number;
  outputSummary: string;
  nextStageId: string | null;
  handoffData: unknown;
}

export interface WorkflowStageFailedPayload {
  stageId: string;
  stageName: string;
  errorMessage: string;
  retryable: boolean;
}

export interface WorkflowStageSkippedPayload {
  stageId: string;
  stageName: string;
  reason: string;
}

export interface WorkflowCompletedPayload {
  totalDurationMs: number;
  stageCount: number;
  summary: string;
}

export interface WorkflowFailedPayload {
  failedAtStageId: string;
  errorMessage: string;
}

export interface TaskCreatedPayload {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedAgentId: string | null;
  estimatedDurationMs: number | null;
  dependencies: TaskDependency[];
  tags: string[];
}

export interface TaskStartedPayload {
  assignedAgentId: string;
}

export interface TaskBlockedPayload {
  reason: string;
  blockedByAgentId: string | null;
  blockedByTaskId: string | null;
}

export interface TaskCompletedPayload {
  durationMs: number;
  outputSummary: string;
}

export interface TaskCancelledPayload {
  reason: string;
}

export interface HandoffInitiatedPayload {
  fromAgentId: string;
  toAgentId: string | null;    // null if receiver not yet spawned
  toAgentName: string;         // the role name, e.g. "planner"
  goal: string;
  currentState: string;
  task: string;
  filesToRead: string[];
  expectedOutput: string;
  constraints: string;
}

export interface HandoffReceivedPayload {
  fromAgentId: string;
  handoffId: string;
}

export interface HandoffCompletedPayload {
  handoffId: string;
  outputSummary: string;
}

export interface SkillInvokedPayload {
  skillId: string;
  skillName: string;
  inputSummary: string | null;
}

export interface SkillCompletedPayload {
  skillId: string;
  durationMs: number;
  outcome: 'success' | 'failure' | 'partial';
  outputSummary: string | null;
  errorMessage: string | null;
}

export interface SkillFailedPayload {
  skillId: string;
  errorMessage: string;
  durationMs: number;
}

export interface DiagnosticLogPayload {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, unknown>;
}

export interface DiagnosticMetricPayload {
  metricName: string;
  value: number;
  unit: string;                   // e.g. "ms", "bytes", "count"
  tags: Record<string, string>;
}

/** Union of all payload shapes */
export type EventPayload =
  | SessionStartedPayload
  | SessionEndedPayload
  | AgentStartedPayload
  | AgentHeartbeatPayload
  | AgentIdlePayload
  | AgentStoppedPayload
  | AgentErrorPayload
  | WorkflowStartedPayload
  | WorkflowStageStartedPayload
  | WorkflowStageCompletedPayload
  | WorkflowStageFailedPayload
  | WorkflowStageSkippedPayload
  | WorkflowCompletedPayload
  | WorkflowFailedPayload
  | TaskCreatedPayload
  | TaskStartedPayload
  | TaskBlockedPayload
  | TaskCompletedPayload
  | TaskCancelledPayload
  | HandoffInitiatedPayload
  | HandoffReceivedPayload
  | HandoffCompletedPayload
  | SkillInvokedPayload
  | SkillCompletedPayload
  | SkillFailedPayload
  | DiagnosticLogPayload
  | DiagnosticMetricPayload;

/**
 * The shape of every event emitted by every agent.
 * `receivedAt` and `sequenceNumber` are added by the backend — agents never set them.
 */
export interface DashboardEvent {
  id: string;                    // nanoid, set by emitter
  type: EventType;
  agentId: string;               // who emitted this
  sessionId: string;
  workflowId: string | null;
  taskId: string | null;
  timestamp: string;             // ISO 8601, set by emitter
  receivedAt?: string;           // ISO 8601, added by backend on ingestion
  sequenceNumber?: number;       // monotonic integer per session, added by backend
  schemaVersion: string;         // e.g. "1.0"
  payload: EventPayload;
}
