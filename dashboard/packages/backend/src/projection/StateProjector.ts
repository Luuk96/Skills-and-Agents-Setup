// ============================================================
// STATE PROJECTOR
// Takes a stream of events and builds/updates the live state.
// This is the "brain" — it knows what each event means for state.
// ============================================================

import type {
  DashboardEvent,
  ProjectState,
  Agent,
  Workflow,
  WorkflowStage,
  Task,
  Handoff,
  Skill,
  SkillInvocation,
  // Payload types
  AgentStartedPayload,
  AgentHeartbeatPayload,
  AgentStoppedPayload,
  AgentErrorPayload,
  WorkflowStartedPayload,
  WorkflowStageStartedPayload,
  WorkflowStageCompletedPayload,
  WorkflowStageFailedPayload,
  WorkflowCompletedPayload,
  WorkflowFailedPayload,
  TaskCreatedPayload,
  TaskStartedPayload,
  TaskBlockedPayload,
  TaskCompletedPayload,
  TaskCancelledPayload,
  HandoffInitiatedPayload,
  HandoffReceivedPayload,
  HandoffCompletedPayload,
  SkillInvokedPayload,
  SkillCompletedPayload,
  SessionStartedPayload,
} from '@dashboard/core';
import { createEmptyState, recomputeStats, computeSystemHealth } from './LiveState.js';
import { config } from '../config.js';

export class StateProjector {
  private state: ProjectState;

  constructor() {
    this.state = createEmptyState();
  }

  /** Returns the current live state (read-only reference) */
  getState(): ProjectState {
    return this.state;
  }

  /** Apply a batch of events and update state. Returns true if state changed. */
  applyEvents(events: DashboardEvent[]): boolean {
    if (events.length === 0) return false;

    for (const event of events) {
      this.applyEvent(event);
    }

    // Recompute derived stats after the batch
    this.state.stats = recomputeStats(this.state);
    this.state.systemHealth = computeSystemHealth(this.state);

    return true;
  }

  /** Apply a single event to the state */
  private applyEvent(event: DashboardEvent): void {
    // Always record in recentEvents rolling window
    this.state.recentEvents.push(event);
    if (this.state.recentEvents.length > config.recentEventsLimit) {
      this.state.recentEvents.shift();
    }

    this.state.lastEventAt = event.timestamp;

    // Route to the correct handler based on event type
    switch (event.type) {
      // ---- Session ----
      case 'session.started': {
        const p = event.payload as SessionStartedPayload;
        this.state.currentSessionId = event.sessionId;
        this.state.sessionStartedAt = event.timestamp;
        break;
      }
      case 'session.ended': {
        // Don't clear — keep state visible after session ends
        break;
      }

      // ---- Agent lifecycle ----
      case 'agent.started': {
        const p = event.payload as AgentStartedPayload;
        const agent: Agent = {
          id: event.agentId,
          name: p.name,
          type: p.type,
          status: 'running',
          currentTaskId: null,
          currentWorkflowId: event.workflowId,
          currentStageId: null,
          capabilities: p.capabilities,
          metadata: p.metadata,
          startedAt: event.timestamp,
          lastSeenAt: event.timestamp,
          endedAt: null,
          errorMessage: null,
          parentAgentId: p.parentAgentId,
          sessionId: event.sessionId,
        };
        this.state.agents.set(agent.id, agent);
        break;
      }

      case 'agent.heartbeat': {
        const p = event.payload as AgentHeartbeatPayload;
        const agent = this.state.agents.get(event.agentId);
        if (agent) {
          agent.status = p.status;
          agent.lastSeenAt = event.timestamp;
          agent.currentTaskId = p.currentTaskId;
          agent.currentStageId = p.currentStageId;
          if (event.workflowId) agent.currentWorkflowId = event.workflowId;
        }
        break;
      }

      case 'agent.idle': {
        const agent = this.state.agents.get(event.agentId);
        if (agent) {
          agent.status = 'idle';
          agent.lastSeenAt = event.timestamp;
          agent.currentTaskId = null;
        }
        break;
      }

      case 'agent.stopped': {
        const p = event.payload as AgentStoppedPayload;
        const agent = this.state.agents.get(event.agentId);
        if (agent) {
          agent.status = p.reason === 'error' ? 'error' : 'idle';
          agent.endedAt = event.timestamp;
          agent.lastSeenAt = event.timestamp;
        }
        break;
      }

      case 'agent.error': {
        const p = event.payload as AgentErrorPayload;
        const agent = this.state.agents.get(event.agentId);
        if (agent) {
          agent.status = 'error';
          agent.errorMessage = p.message;
          agent.lastSeenAt = event.timestamp;
        }
        break;
      }

      // ---- Workflow lifecycle ----
      case 'workflow.started': {
        const p = event.payload as WorkflowStartedPayload;
        if (!event.workflowId) break;

        const stages: WorkflowStage[] = p.stages.map(s => ({
          id: s.id,
          workflowId: event.workflowId!,
          name: s.name,
          description: '',
          order: s.order,
          status: 'pending',
          assignedAgentId: null,
          startedAt: null,
          completedAt: null,
          durationMs: null,
          dependsOnStageIds: s.dependsOnStageIds,
          output: null,
        }));

        const workflow: Workflow = {
          id: event.workflowId,
          name: p.name,
          description: p.description,
          status: 'running',
          stages,
          transitions: [],
          currentStageId: stages[0]?.id ?? null,
          startedAt: event.timestamp,
          completedAt: null,
          durationMs: null,
          initiatedByAgentId: event.agentId,
          sessionId: event.sessionId,
          projectContext: p.projectContext,
          metadata: {},
        };
        this.state.workflows.set(workflow.id, workflow);

        // Update agent's current workflow
        const agent = this.state.agents.get(event.agentId);
        if (agent) agent.currentWorkflowId = event.workflowId;
        break;
      }

      case 'workflow.stage.started': {
        const p = event.payload as WorkflowStageStartedPayload;
        if (!event.workflowId) break;
        const wf = this.state.workflows.get(event.workflowId);
        if (!wf) break;
        const stage = wf.stages.find(s => s.id === p.stageId);
        if (stage) {
          stage.status = 'active';
          stage.startedAt = event.timestamp;
          stage.assignedAgentId = p.assignedAgentId;
        }
        wf.currentStageId = p.stageId;
        break;
      }

      case 'workflow.stage.completed': {
        const p = event.payload as WorkflowStageCompletedPayload;
        if (!event.workflowId) break;
        const wf = this.state.workflows.get(event.workflowId);
        if (!wf) break;
        const stage = wf.stages.find(s => s.id === p.stageId);
        if (stage) {
          stage.status = 'completed';
          stage.completedAt = event.timestamp;
          stage.durationMs = p.durationMs;
          stage.output = p.handoffData;
        }
        if (p.nextStageId) wf.currentStageId = p.nextStageId;
        break;
      }

      case 'workflow.stage.failed': {
        const p = event.payload as WorkflowStageFailedPayload;
        if (!event.workflowId) break;
        const wf = this.state.workflows.get(event.workflowId);
        if (!wf) break;
        const stage = wf.stages.find(s => s.id === p.stageId);
        if (stage) {
          stage.status = 'failed';
          stage.completedAt = event.timestamp;
        }
        break;
      }

      case 'workflow.completed': {
        const p = event.payload as WorkflowCompletedPayload;
        if (!event.workflowId) break;
        const wf = this.state.workflows.get(event.workflowId);
        if (wf) {
          wf.status = 'completed';
          wf.completedAt = event.timestamp;
          wf.durationMs = p.totalDurationMs;
          wf.currentStageId = null;
        }
        break;
      }

      case 'workflow.failed': {
        const p = event.payload as WorkflowFailedPayload;
        if (!event.workflowId) break;
        const wf = this.state.workflows.get(event.workflowId);
        if (wf) {
          wf.status = 'failed';
          wf.completedAt = event.timestamp;
        }
        break;
      }

      // ---- Tasks ----
      case 'task.created': {
        const p = event.payload as TaskCreatedPayload;
        if (!event.taskId) break;
        const task: Task = {
          id: event.taskId,
          title: p.title,
          description: p.description,
          status: 'open',
          priority: p.priority,
          assignedAgentId: p.assignedAgentId,
          workflowId: event.workflowId,
          stageId: null,
          parentTaskId: null,
          dependencies: p.dependencies,
          createdAt: event.timestamp,
          startedAt: null,
          completedAt: null,
          durationMs: null,
          estimatedDurationMs: p.estimatedDurationMs,
          blockedReason: null,
          output: null,
          tags: p.tags,
          sessionId: event.sessionId,
        };
        this.state.tasks.set(task.id, task);
        break;
      }

      case 'task.started': {
        const p = event.payload as TaskStartedPayload;
        if (!event.taskId) break;
        const task = this.state.tasks.get(event.taskId);
        if (task) {
          task.status = 'in-progress';
          task.startedAt = event.timestamp;
          task.assignedAgentId = p.assignedAgentId;
        }
        break;
      }

      case 'task.blocked': {
        const p = event.payload as TaskBlockedPayload;
        if (!event.taskId) break;
        const task = this.state.tasks.get(event.taskId);
        if (task) {
          task.status = 'blocked';
          task.blockedReason = p.reason;
        }
        break;
      }

      case 'task.completed': {
        const p = event.payload as TaskCompletedPayload;
        if (!event.taskId) break;
        const task = this.state.tasks.get(event.taskId);
        if (task) {
          task.status = 'completed';
          task.completedAt = event.timestamp;
          task.durationMs = p.durationMs;
          task.output = p.outputSummary;
        }
        break;
      }

      case 'task.cancelled': {
        const p = event.payload as TaskCancelledPayload;
        if (!event.taskId) break;
        const task = this.state.tasks.get(event.taskId);
        if (task) {
          task.status = 'cancelled';
          task.completedAt = event.timestamp;
        }
        break;
      }

      // ---- Handoffs ----
      case 'handoff.initiated': {
        const p = event.payload as HandoffInitiatedPayload;
        const handoffId = event.id; // use the event ID as handoff ID
        const handoff: Handoff = {
          id: handoffId,
          fromAgentId: p.fromAgentId,
          fromAgentName: this.state.agents.get(p.fromAgentId)?.name ?? 'unknown',
          toAgentId: p.toAgentId,
          toAgentName: p.toAgentName,
          workflowId: event.workflowId,
          stageId: null,
          status: 'in-transit',
          goal: p.goal,
          currentState: p.currentState,
          task: p.task,
          filesToRead: p.filesToRead,
          expectedOutput: p.expectedOutput,
          constraints: p.constraints,
          initiatedAt: event.timestamp,
          receivedAt: null,
          completedAt: null,
          sessionId: event.sessionId,
        };
        this.state.handoffs.set(handoffId, handoff);
        break;
      }

      case 'handoff.received': {
        const p = event.payload as HandoffReceivedPayload;
        const handoff = this.state.handoffs.get(p.handoffId);
        if (handoff) {
          handoff.status = 'received';
          handoff.toAgentId = event.agentId;
          handoff.receivedAt = event.timestamp;
        }
        break;
      }

      case 'handoff.completed': {
        const p = event.payload as HandoffCompletedPayload;
        const handoff = this.state.handoffs.get(p.handoffId);
        if (handoff) {
          handoff.status = 'completed';
          handoff.completedAt = event.timestamp;
        }
        break;
      }

      // ---- Skills ----
      case 'skill.invoked': {
        const p = event.payload as SkillInvokedPayload;
        // Ensure the skill is registered
        if (!this.state.skills.has(p.skillId)) {
          const skill: Skill = {
            id: p.skillId,
            name: p.skillName,
            description: '',
            category: 'unknown',
            version: '1.0',
          };
          this.state.skills.set(skill.id, skill);
        }
        // Record the invocation
        const invocation: SkillInvocation = {
          id: event.id,
          skillId: p.skillId,
          invokedByAgentId: event.agentId,
          workflowId: event.workflowId,
          taskId: event.taskId,
          startedAt: event.timestamp,
          completedAt: null,
          durationMs: null,
          outcome: 'in-progress',
          errorMessage: null,
          inputSummary: p.inputSummary,
          outputSummary: null,
          sessionId: event.sessionId,
        };
        this.state.skillInvocations.push(invocation);
        if (this.state.skillInvocations.length > config.recentInvocationsLimit) {
          this.state.skillInvocations.shift();
        }
        break;
      }

      case 'skill.completed': {
        const p = event.payload as SkillCompletedPayload;
        // Find the most recent in-progress invocation for this skill by this agent
        const inv = [...this.state.skillInvocations]
          .reverse()
          .find(i => i.skillId === p.skillId && i.invokedByAgentId === event.agentId && i.outcome === 'in-progress');
        if (inv) {
          inv.outcome = p.outcome;
          inv.completedAt = event.timestamp;
          inv.durationMs = p.durationMs;
          inv.outputSummary = p.outputSummary;
          inv.errorMessage = p.errorMessage;
        }
        break;
      }

      default:
        // Unknown or diagnostic events — already added to recentEvents above
        break;
    }
  }

  /** Reset state completely (for tests or session changes) */
  reset(): void {
    this.state = createEmptyState();
  }
}
