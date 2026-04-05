// ============================================================
// TASK TYPES
// A task is a unit of work assigned to an agent.
// ============================================================

export type TaskStatus =
  | 'open'
  | 'in-progress'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'deferred';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

/** A dependency link between two tasks */
export interface TaskDependency {
  taskId: string;                           // the task this one depends on
  type: 'blocks' | 'relates-to' | 'duplicates';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId: string | null;
  workflowId: string | null;      // if this task belongs to a workflow
  stageId: string | null;         // if this task belongs to a workflow stage
  parentTaskId: string | null;    // for subtasks
  dependencies: TaskDependency[];
  createdAt: string;              // ISO 8601
  startedAt: string | null;       // ISO 8601
  completedAt: string | null;     // ISO 8601
  durationMs: number | null;
  estimatedDurationMs: number | null;
  blockedReason: string | null;   // populated when status === 'blocked'
  output: string | null;          // result summary when completed
  tags: string[];
  sessionId: string;
}
