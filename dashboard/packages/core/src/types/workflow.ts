// ============================================================
// WORKFLOW TYPES
// Maps directly to Luuk's workflow .md playbooks.
// ============================================================

/** Whether a full workflow run is active, done, or failed */
export type WorkflowStatus =
  | 'pending'    // defined but not yet started
  | 'running'    // currently active
  | 'completed'  // finished successfully
  | 'failed'     // ended with an error
  | 'cancelled'; // manually stopped

/** The state of one stage inside a workflow */
export type StageStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'skipped'
  | 'failed';

/** One step in a workflow (e.g. "Phase 1 — Explore", "Phase 2 — Plan") */
export interface WorkflowStage {
  id: string;
  workflowId: string;
  name: string;                   // e.g. "Phase 1 — Explore"
  description: string;
  order: number;                  // 0-based position in the workflow
  status: StageStatus;
  assignedAgentId: string | null;
  startedAt: string | null;       // ISO 8601
  completedAt: string | null;     // ISO 8601
  durationMs: number | null;
  dependsOnStageIds: string[];    // stages that must complete first
  output: unknown | null;         // whatever the stage produced
}

/** A record of one stage handing control to the next */
export interface StageTransition {
  id: string;
  workflowId: string;
  fromStageId: string;
  toStageId: string;
  triggeredByAgentId: string;
  transitionedAt: string;         // ISO 8601
  handoffData: unknown;           // data passed between stages
}

/** A full workflow run — contains all stages and transitions */
export interface Workflow {
  id: string;
  name: string;                   // e.g. "sprint", "new-project", "debug"
  description: string;
  status: WorkflowStatus;
  stages: WorkflowStage[];
  transitions: StageTransition[];
  currentStageId: string | null;
  startedAt: string | null;       // ISO 8601
  completedAt: string | null;     // ISO 8601
  durationMs: number | null;
  initiatedByAgentId: string;
  sessionId: string;
  projectContext: string | null;  // which project folder this workflow serves
  metadata: Record<string, unknown>;
}
