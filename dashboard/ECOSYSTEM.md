# ECOSYSTEM.md — Agent Dashboard Instrumentation Contract

This document defines the exact protocol every agent, workflow, and skill must follow
to report activity to the dashboard. Read this before adding instrumentation to any agent.

---

## Overview

The dashboard works by receiving **events**. Every event is a JSON object.
Agents emit events. The backend receives them, persists them, and the frontend displays them live.

There are two ways to emit:
1. **HTTP** — POST to `http://localhost:3001/api/events` (preferred, real-time)
2. **File** — Write a line to `dashboard/events/events-YYYY-MM-DD.ndjson` (fallback, picked up by file watcher)

The **SDK** (`@dashboard/sdk`) handles both automatically. Use it instead of building raw JSON.

---

## Quick Start: Using the SDK

```typescript
import { DashboardSDK } from '@dashboard/sdk';

// Create one instance per agent run
const sdk = new DashboardSDK({
  agentId: 'agt_orchestrator',       // unique per run, e.g. use generateId('agt')
  sessionId: 'ses_20260405',         // shared across all agents in one session
  backendUrl: 'http://localhost:3001',
  eventsDir: './dashboard/events',   // fallback file path
});
```

---

## Step-by-Step: What Every Agent Must Do

### 1. Register itself when it starts

```typescript
await sdk.agentStarted({
  name: 'orchestrator',              // human label — shows in the dashboard
  type: 'claude-code-agent',         // agent class/template name
  capabilities: [
    { name: 'orchestration', version: '1.0' },
    { name: 'planning', version: '1.0' },
  ],
  parentAgentId: null,               // set to parent's agentId if spawned by another agent
  metadata: { model: 'claude-sonnet-4-6' },
});
```

### 2. Start a session (once per session, usually the orchestrator)

```typescript
await sdk.sessionStarted({
  projectPath: '/Users/luuklindenkamp/claude-projects/my-app',
  description: 'Sprint: build user authentication',
  tags: ['sprint', 'auth'],
});
```

### 3. Start a workflow

```typescript
const workflowId = generateId('wf');
sdk.setWorkflow(workflowId);

await sdk.workflowStarted({
  workflowId,
  name: 'sprint',
  description: 'Build user authentication feature',
  stages: [
    { id: 'stg_explore', name: 'Phase 1 — Explore', order: 0, dependsOnStageIds: [] },
    { id: 'stg_plan',    name: 'Phase 2 — Plan',    order: 1, dependsOnStageIds: ['stg_explore'] },
    { id: 'stg_build',   name: 'Phase 4 — Build',   order: 2, dependsOnStageIds: ['stg_plan'] },
  ],
  projectContext: '/Users/luuklindenkamp/claude-projects/my-app',
});
```

### 4. Announce each stage

```typescript
await sdk.stageStarted({
  stageId: 'stg_explore',
  stageName: 'Phase 1 — Explore',
  assignedAgentId: 'agt_analyst',
});

// ... work happens ...

await sdk.stageCompleted({
  stageId: 'stg_explore',
  stageName: 'Phase 1 — Explore',
  durationMs: 95_000,
  outputSummary: 'Found 4 relevant files. No existing auth logic.',
  nextStageId: 'stg_plan',
  handoffData: { existingFiles: ['src/App.tsx'] },
});
```

### 5. Create and update tasks

```typescript
const taskId = generateId('tsk');

await sdk.taskCreated({
  taskId,
  title: 'Build LoginScreen component',
  description: 'Create src/screens/LoginScreen.tsx with email/password form',
  priority: 'high',
  assignedAgentId: 'agt_builder',
  estimatedDurationMs: 120_000,
  tags: ['build', 'auth'],
});

sdk.setTask(taskId);
await sdk.taskStarted({ taskId, assignedAgentId: 'agt_builder' });

// If the task gets stuck:
await sdk.taskBlocked({
  taskId,
  reason: 'Missing API endpoint: /auth/login not yet defined',
});

// When done:
await sdk.taskCompleted({
  taskId,
  durationMs: 118_000,
  outputSummary: 'LoginScreen.tsx created with full form and validation',
});
```

### 6. Announce handoffs between agents

```typescript
// The agent handing off (e.g. orchestrator → builder):
const handoffId = await sdk.handoffInitiated({
  toAgentName: 'builder',
  goal: 'Implement authentication module',
  currentState: 'Sprint plan complete. Files identified.',
  task: 'Build LoginScreen.tsx and auth.service.ts',
  filesToRead: ['CLAUDE.md', 'src/App.tsx'],
  expectedOutput: 'Working auth flow',
  constraints: 'Use Expo + React Native only. No new libraries.',
});

// The receiving agent (builder):
await sdk.handoffReceived({
  fromAgentId: 'agt_orchestrator',
  handoffId,
});
```

### 7. Report skill usage

```typescript
await sdk.skillInvoked({
  skillId: 'sprint',
  skillName: '/sprint',
  inputSummary: 'Building auth feature',
});

// ... skill runs ...

await sdk.skillCompleted({
  skillId: 'sprint',
  durationMs: 2_300,
  outcome: 'success',
  outputSummary: 'Sprint plan created with 7 tasks',
});
```

### 8. Send heartbeats periodically (every ~30s)

```typescript
await sdk.heartbeat({
  status: 'running',
  currentTaskId: taskId,
  currentStageId: 'stg_build',
  memoryUsageMb: 210,
});
```

### 9. Report errors

```typescript
await sdk.agentError({
  errorCode: 'TOOL_FAILED',
  message: 'File write failed: permission denied',
  stack: null,
  recoverable: true,
});
```

### 10. Stop the agent when done

```typescript
await sdk.agentStopped({
  reason: 'completed',
  summary: 'Built auth module as requested',
});
```

---

## Full Event Schema Reference

All events share this base shape:

```json
{
  "id": "ev_abc123",
  "type": "event.type.here",
  "agentId": "agt_orchestrator",
  "sessionId": "ses_20260405",
  "workflowId": "wf_sprint_001",
  "taskId": "tsk_explore_001",
  "timestamp": "2026-04-05T10:00:00.000Z",
  "schemaVersion": "1.0",
  "payload": { ... }
}
```

Fields `receivedAt` and `sequenceNumber` are added by the backend — never set them in agents.

### All Event Types

| Type | When to emit |
|------|-------------|
| `session.started` | Once per session, by the orchestrator |
| `session.ended` | When the session finishes |
| `agent.started` | When an agent initializes |
| `agent.heartbeat` | Every ~30 seconds while running |
| `agent.idle` | When an agent finishes a task and is waiting |
| `agent.stopped` | When an agent shuts down |
| `agent.error` | When an agent encounters an error |
| `workflow.started` | When a workflow begins, with all stage definitions |
| `workflow.stage.started` | When a stage becomes active |
| `workflow.stage.completed` | When a stage finishes successfully |
| `workflow.stage.failed` | When a stage fails |
| `workflow.stage.skipped` | When a stage is deliberately skipped |
| `workflow.completed` | When the entire workflow finishes |
| `workflow.failed` | When the workflow ends in failure |
| `task.created` | When a new task is defined |
| `task.started` | When work begins on a task |
| `task.blocked` | When a task gets stuck |
| `task.completed` | When a task finishes |
| `task.cancelled` | When a task is abandoned |
| `handoff.initiated` | When one agent passes control to another |
| `handoff.received` | When the receiving agent acknowledges the handoff |
| `handoff.completed` | When the handoff work is done |
| `skill.invoked` | When a /command is called |
| `skill.completed` | When the /command finishes |
| `skill.failed` | When the /command fails |
| `diagnostic.log` | For debug/info/warn/error log lines |
| `diagnostic.metric` | For performance measurements |

---

## Naming Conventions

- Agent IDs: `agt_<name>_<shortid>` — e.g. `agt_orchestrator_k8x2`
- Session IDs: `ses_YYYYMMDD_<shortid>` — e.g. `ses_20260405_9f3k`
- Workflow IDs: `wf_<name>_<shortid>` — e.g. `wf_sprint_m4p1`
- Stage IDs: `stg_<name>` — e.g. `stg_explore`, `stg_plan`, `stg_build`
- Task IDs: `tsk_<shortid>` — e.g. `tsk_k9x2`
- Handoff IDs: `ho_<shortid>` — e.g. `ho_3f9m`
- Skill IDs: match the /command name — e.g. `sprint`, `debug`, `review`

---

## What the Dashboard Shows Per Section

| Section | What it displays |
|---------|-----------------|
| Overview | Health, stats, active agents, running workflows, recent events |
| Agents | All agents grouped by status, current task, error messages |
| Workflows | Stage graphs, progress bars, stage durations |
| Tasks | All tasks filterable by status, blocked reasons, click to expand |
| Skills | Invocation counts, success rates, avg duration per skill |
| Events | Live scrolling feed, filterable, click for full JSON |
| Alerts | Fired alert rules, acknowledge button, severity color coding |
| Project | Overall progress, workflow summary, session statistics |
| Replay | Timeline of activity by minute, full event log |

---

## Running the Dashboard

```bash
# From the dashboard/ folder:

# 1. Install dependencies
npm install

# 2. Build core types (required first)
npm run build -w packages/core
npm run build -w packages/sdk

# 3. Start the backend
npm run dev -w packages/backend

# 4. Start the frontend (in a new terminal)
npm run dev -w packages/frontend

# 5. Open the dashboard
# http://localhost:5173

# 6. Run the mock generator to see it with data
npm run mock -w packages/backend
```

---

## Architecture at a Glance

```
agents / workflows / skills
         │
         ▼ (HTTP POST or file write)
   [IngestionPipeline]
         │
    ┌────┴────┐
    │         │
[SQLite]  [StateProjector]   ← replays events → in-memory state
             │
         [WebSocket]
             │
         [Frontend]          ← React + Zustand store
```

Events flow in one direction only: emitter → backend → frontend.
State is always rebuilt from events. Events are never mutated.

---

## Acceptance Criteria

The dashboard is working correctly when:

1. Backend starts with no errors on `npm run dev`
2. Frontend loads at `http://localhost:5173` with a sidebar
3. Running the mock generator populates all 9 pages with data
4. The connection indicator in the top bar shows LIVE (green)
5. New events appear in the Events page in real time
6. The blocked task in the mock triggers a warning alert
7. Workflow stages show correct colors (completed=blue, active=green, failed=red)
8. Agents grouped by status on the Agents page
9. Skill usage shows counts and success rates on the Skills page
10. Stopping the backend shows DISCONNECTED and auto-reconnects when restarted
