// ============================================================
// DASHBOARD SDK — MAIN CLASS
// This is the only thing an agent needs to import.
// It wraps all emit calls so agents never touch raw event structs.
//
// USAGE:
//   const sdk = new DashboardSDK({ agentId: 'agt_001', sessionId: 'ses_001' });
//   await sdk.agentStarted({ name: 'orchestrator', type: 'claude-code-agent', ... });
//   await sdk.taskStarted({ taskId: 'tsk_001' });
//   await sdk.handoffInitiated({ ... });
// ============================================================

import type {
  AgentCapability,
  TaskPriority,
  TaskDependency,
} from '@dashboard/core';
import { CompositeEmitter } from './emitter/CompositeEmitter';
import { buildEvent } from './helpers/buildEvent';
import { generateId } from './helpers/generateId';

/** Configuration passed when creating an SDK instance */
export interface SDKConfig {
  agentId: string;
  sessionId: string;
  workflowId?: string;
  taskId?: string;
  backendUrl?: string;  // defaults to http://localhost:3001
  eventsDir?: string;   // defaults to ./events (relative to CWD)
}

export class DashboardSDK {
  private readonly agentId: string;
  private readonly sessionId: string;
  private workflowId: string | null;
  private taskId: string | null;
  private readonly emitter: CompositeEmitter;

  constructor(config: SDKConfig) {
    this.agentId = config.agentId;
    this.sessionId = config.sessionId;
    this.workflowId = config.workflowId ?? null;
    this.taskId = config.taskId ?? null;
    this.emitter = new CompositeEmitter(
      config.backendUrl ?? 'http://localhost:3001',
      config.eventsDir ?? './events'
    );
  }

  // ---- Context setters (call these when context changes) ----

  setWorkflow(workflowId: string | null): void {
    this.workflowId = workflowId;
  }

  setTask(taskId: string | null): void {
    this.taskId = taskId;
  }

  // ---- Session ----

  async sessionStarted(opts: {
    projectPath: string;
    description?: string;
    tags?: string[];
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'session.started',
      agentId: this.agentId,
      sessionId: this.sessionId,
      payload: {
        projectPath: opts.projectPath,
        description: opts.description ?? null,
        tags: opts.tags ?? [],
      },
    }));
  }

  async sessionEnded(opts: {
    reason: 'completed' | 'cancelled' | 'error';
    summary: string;
    totalDurationMs: number;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'session.ended',
      agentId: this.agentId,
      sessionId: this.sessionId,
      payload: opts,
    }));
  }

  // ---- Agent lifecycle ----

  async agentStarted(opts: {
    name: string;
    type: string;
    capabilities?: AgentCapability[];
    parentAgentId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'agent.started',
      agentId: this.agentId,
      sessionId: this.sessionId,
      payload: {
        name: opts.name,
        type: opts.type,
        capabilities: opts.capabilities ?? [],
        parentAgentId: opts.parentAgentId ?? null,
        metadata: opts.metadata ?? {},
      },
    }));
  }

  async heartbeat(opts: {
    status: 'idle' | 'running' | 'waiting' | 'blocked';
    currentTaskId?: string | null;
    currentStageId?: string | null;
    memoryUsageMb?: number | null;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'agent.heartbeat',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: this.taskId,
      payload: {
        status: opts.status,
        currentTaskId: opts.currentTaskId ?? this.taskId,
        currentStageId: opts.currentStageId ?? null,
        memoryUsageMb: opts.memoryUsageMb ?? null,
      },
    }));
  }

  async agentStopped(opts: {
    reason: 'completed' | 'cancelled' | 'error' | 'timeout';
    summary: string;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'agent.stopped',
      agentId: this.agentId,
      sessionId: this.sessionId,
      payload: opts,
    }));
  }

  async agentError(opts: {
    errorCode: string;
    message: string;
    stack?: string | null;
    recoverable?: boolean;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'agent.error',
      agentId: this.agentId,
      sessionId: this.sessionId,
      payload: {
        errorCode: opts.errorCode,
        message: opts.message,
        stack: opts.stack ?? null,
        recoverable: opts.recoverable ?? false,
      },
    }));
  }

  // ---- Workflow ----

  async workflowStarted(opts: {
    workflowId: string;
    name: string;
    description: string;
    stages: Array<{ id: string; name: string; order: number; dependsOnStageIds: string[] }>;
    projectContext?: string | null;
  }): Promise<void> {
    this.workflowId = opts.workflowId;
    await this.emitter.emit(buildEvent({
      type: 'workflow.started',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: opts.workflowId,
      payload: {
        name: opts.name,
        description: opts.description,
        stages: opts.stages,
        projectContext: opts.projectContext ?? null,
      },
    }));
  }

  async stageStarted(opts: {
    stageId: string;
    stageName: string;
    assignedAgentId: string;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'workflow.stage.started',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      payload: opts,
    }));
  }

  async stageCompleted(opts: {
    stageId: string;
    stageName: string;
    durationMs: number;
    outputSummary: string;
    nextStageId?: string | null;
    handoffData?: unknown;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'workflow.stage.completed',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      payload: {
        stageId: opts.stageId,
        stageName: opts.stageName,
        durationMs: opts.durationMs,
        outputSummary: opts.outputSummary,
        nextStageId: opts.nextStageId ?? null,
        handoffData: opts.handoffData ?? null,
      },
    }));
  }

  async workflowCompleted(opts: {
    totalDurationMs: number;
    stageCount: number;
    summary: string;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'workflow.completed',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      payload: opts,
    }));
    this.workflowId = null;
  }

  // ---- Tasks ----

  async taskCreated(opts: {
    taskId: string;
    title: string;
    description: string;
    priority?: TaskPriority;
    assignedAgentId?: string | null;
    estimatedDurationMs?: number | null;
    dependencies?: TaskDependency[];
    tags?: string[];
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'task.created',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: opts.taskId,
      payload: {
        title: opts.title,
        description: opts.description,
        priority: opts.priority ?? 'medium',
        assignedAgentId: opts.assignedAgentId ?? null,
        estimatedDurationMs: opts.estimatedDurationMs ?? null,
        dependencies: opts.dependencies ?? [],
        tags: opts.tags ?? [],
      },
    }));
  }

  async taskStarted(opts: { taskId: string; assignedAgentId: string }): Promise<void> {
    this.taskId = opts.taskId;
    await this.emitter.emit(buildEvent({
      type: 'task.started',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: opts.taskId,
      payload: { assignedAgentId: opts.assignedAgentId },
    }));
  }

  async taskBlocked(opts: {
    taskId: string;
    reason: string;
    blockedByAgentId?: string | null;
    blockedByTaskId?: string | null;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'task.blocked',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: opts.taskId,
      payload: {
        reason: opts.reason,
        blockedByAgentId: opts.blockedByAgentId ?? null,
        blockedByTaskId: opts.blockedByTaskId ?? null,
      },
    }));
  }

  async taskCompleted(opts: {
    taskId: string;
    durationMs: number;
    outputSummary: string;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'task.completed',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: opts.taskId,
      payload: {
        durationMs: opts.durationMs,
        outputSummary: opts.outputSummary,
      },
    }));
    if (this.taskId === opts.taskId) this.taskId = null;
  }

  // ---- Handoffs ----

  async handoffInitiated(opts: {
    handoffId?: string;
    toAgentId?: string | null;
    toAgentName: string;
    goal: string;
    currentState: string;
    task: string;
    filesToRead?: string[];
    expectedOutput: string;
    constraints?: string;
  }): Promise<string> {
    const handoffId = opts.handoffId ?? generateId('ho');
    await this.emitter.emit(buildEvent({
      type: 'handoff.initiated',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: this.taskId,
      payload: {
        fromAgentId: this.agentId,
        toAgentId: opts.toAgentId ?? null,
        toAgentName: opts.toAgentName,
        goal: opts.goal,
        currentState: opts.currentState,
        task: opts.task,
        filesToRead: opts.filesToRead ?? [],
        expectedOutput: opts.expectedOutput,
        constraints: opts.constraints ?? '',
      },
    }));
    return handoffId;
  }

  async handoffReceived(opts: {
    fromAgentId: string;
    handoffId: string;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'handoff.received',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      payload: opts,
    }));
  }

  // ---- Skills ----

  async skillInvoked(opts: {
    invocationId?: string;
    skillId: string;
    skillName: string;
    inputSummary?: string | null;
  }): Promise<string> {
    const invocationId = opts.invocationId ?? generateId('ski');
    await this.emitter.emit(buildEvent({
      type: 'skill.invoked',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: this.taskId,
      payload: {
        skillId: opts.skillId,
        skillName: opts.skillName,
        inputSummary: opts.inputSummary ?? null,
      },
    }));
    return invocationId;
  }

  async skillCompleted(opts: {
    skillId: string;
    durationMs: number;
    outcome: 'success' | 'failure' | 'partial';
    outputSummary?: string | null;
    errorMessage?: string | null;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'skill.completed',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: this.taskId,
      payload: {
        skillId: opts.skillId,
        durationMs: opts.durationMs,
        outcome: opts.outcome,
        outputSummary: opts.outputSummary ?? null,
        errorMessage: opts.errorMessage ?? null,
      },
    }));
  }

  // ---- Diagnostics ----

  async log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context: Record<string, unknown> = {}
  ): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'diagnostic.log',
      agentId: this.agentId,
      sessionId: this.sessionId,
      workflowId: this.workflowId,
      taskId: this.taskId,
      payload: { level, message, context },
    }));
  }

  async metric(opts: {
    metricName: string;
    value: number;
    unit: string;
    tags?: Record<string, string>;
  }): Promise<void> {
    await this.emitter.emit(buildEvent({
      type: 'diagnostic.metric',
      agentId: this.agentId,
      sessionId: this.sessionId,
      payload: {
        metricName: opts.metricName,
        value: opts.value,
        unit: opts.unit,
        tags: opts.tags ?? {},
      },
    }));
  }
}
