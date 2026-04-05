// ============================================================
// HANDOFF TYPES
// A handoff is a structured transfer of responsibility between two agents.
// ============================================================

export type HandoffStatus = 'in-transit' | 'received' | 'completed' | 'rejected';

export interface Handoff {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string | null;    // null until the receiving agent emits handoff.received
  toAgentName: string;         // the role name, known at initiation
  workflowId: string | null;
  stageId: string | null;
  status: HandoffStatus;
  // Context passed between agents
  goal: string;
  currentState: string;
  task: string;
  filesToRead: string[];
  expectedOutput: string;
  constraints: string;
  // Timestamps
  initiatedAt: string;         // ISO 8601
  receivedAt: string | null;   // ISO 8601
  completedAt: string | null;  // ISO 8601
  sessionId: string;
}
