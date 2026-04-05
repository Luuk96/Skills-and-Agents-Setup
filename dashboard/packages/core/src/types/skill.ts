// ============================================================
// SKILL TYPES
// A skill maps to a /command in .claude/commands/
// ============================================================

/** A skill available in the system */
export interface Skill {
  id: string;         // e.g. "sprint", "debug", "review"
  name: string;       // human label
  description: string;
  category: string;   // e.g. "workflow", "utility", "agent"
  version: string;
}

/** One invocation of a skill during a session */
export interface SkillInvocation {
  id: string;
  skillId: string;
  invokedByAgentId: string;
  workflowId: string | null;
  taskId: string | null;
  startedAt: string;           // ISO 8601
  completedAt: string | null;  // ISO 8601
  durationMs: number | null;
  outcome: 'success' | 'failure' | 'partial' | 'in-progress';
  errorMessage: string | null;
  inputSummary: string | null;  // sanitized summary of inputs
  outputSummary: string | null; // sanitized summary of outputs
  sessionId: string;
}

/** Aggregated stats for a skill — recomputed on each state update */
export interface SkillUsageStat {
  skillId: string;
  skillName: string;
  totalInvocations: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number | null;
  lastInvokedAt: string | null; // ISO 8601
}
