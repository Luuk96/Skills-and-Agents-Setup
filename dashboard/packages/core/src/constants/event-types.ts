// ============================================================
// EVENT TYPE CONSTANTS
// Use these instead of raw strings to avoid typos.
// ============================================================

export const EVENT_TYPES = {
  // Session
  SESSION_STARTED: 'session.started',
  SESSION_ENDED: 'session.ended',
  // Agent
  AGENT_STARTED: 'agent.started',
  AGENT_HEARTBEAT: 'agent.heartbeat',
  AGENT_IDLE: 'agent.idle',
  AGENT_STOPPED: 'agent.stopped',
  AGENT_ERROR: 'agent.error',
  // Workflow
  WORKFLOW_STARTED: 'workflow.started',
  WORKFLOW_STAGE_STARTED: 'workflow.stage.started',
  WORKFLOW_STAGE_COMPLETED: 'workflow.stage.completed',
  WORKFLOW_STAGE_FAILED: 'workflow.stage.failed',
  WORKFLOW_STAGE_SKIPPED: 'workflow.stage.skipped',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
  // Task
  TASK_CREATED: 'task.created',
  TASK_STARTED: 'task.started',
  TASK_BLOCKED: 'task.blocked',
  TASK_COMPLETED: 'task.completed',
  TASK_CANCELLED: 'task.cancelled',
  // Handoff
  HANDOFF_INITIATED: 'handoff.initiated',
  HANDOFF_RECEIVED: 'handoff.received',
  HANDOFF_COMPLETED: 'handoff.completed',
  // Skill
  SKILL_INVOKED: 'skill.invoked',
  SKILL_COMPLETED: 'skill.completed',
  SKILL_FAILED: 'skill.failed',
  // Diagnostics
  DIAGNOSTIC_LOG: 'diagnostic.log',
  DIAGNOSTIC_METRIC: 'diagnostic.metric',
} as const;
