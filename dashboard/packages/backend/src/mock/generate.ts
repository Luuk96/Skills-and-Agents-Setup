// ============================================================
// MOCK DATA GENERATOR
// Sends a realistic sequence of events to the backend.
// Run this with: npm run mock -w packages/backend
// Make sure the backend is running first: npm run dev -w packages/backend
//
// This simulates a full sprint workflow with 3 agents working together.
// ============================================================

const BACKEND_URL = 'http://localhost:3001';
const SESSION_ID = `ses_mock_${Date.now()}`;
const WF_ID = `wf_sprint_mock_${Date.now()}`;

// Agent IDs for our simulated ecosystem
const ORCHESTRATOR_ID = 'agt_orchestrator';
const ANALYST_ID = 'agt_analyst';
const BUILDER_ID = 'agt_builder';

// Task IDs
const TASK_EXPLORE = `tsk_explore_${Date.now()}`;
const TASK_PLAN = `tsk_plan_${Date.now()}`;
const TASK_BUILD = `tsk_build_${Date.now()}`;

let eventSeq = 1;

/** Posts one event to the backend */
async function emit(event: object): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    console.error(`Failed to emit event: ${res.status}`);
  }
}

/** Builds a valid base event */
function makeEvent(
  type: string,
  agentId: string,
  payload: object,
  opts: { workflowId?: string; taskId?: string } = {}
) {
  return {
    id: `ev_mock_${eventSeq++}_${Date.now()}`,
    type,
    agentId,
    sessionId: SESSION_ID,
    workflowId: opts.workflowId ?? null,
    taskId: opts.taskId ?? null,
    timestamp: new Date().toISOString(),
    schemaVersion: '1.0',
    payload,
  };
}

/** Waits N milliseconds between events (so the dashboard updates are visible) */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMockSession() {
  console.log('🎬 Starting mock session...');
  console.log(`Session ID: ${SESSION_ID}`);
  console.log(`Make sure the backend is running at ${BACKEND_URL}\n`);

  // ── 1. Session starts ──────────────────────────────────────
  await emit(makeEvent('session.started', ORCHESTRATOR_ID, {
    projectPath: '/Users/luuklindenkamp/claude-projects/my-app',
    description: 'Sprint: build user authentication feature',
    tags: ['sprint', 'auth', 'mock'],
  }));
  await sleep(500);

  // ── 2. Orchestrator agent starts ──────────────────────────
  await emit(makeEvent('agent.started', ORCHESTRATOR_ID, {
    name: 'orchestrator',
    type: 'claude-code-agent',
    capabilities: [
      { name: 'orchestration', version: '1.0' },
      { name: 'planning', version: '1.0' },
    ],
    parentAgentId: null,
    metadata: { model: 'claude-sonnet-4-6' },
  }));
  await sleep(300);

  // ── 3. Workflow starts ────────────────────────────────────
  await emit(makeEvent('workflow.started', ORCHESTRATOR_ID, {
    name: 'sprint',
    description: 'Build user authentication feature',
    stages: [
      { id: 'stg_explore', name: 'Phase 1 — Explore', order: 0, dependsOnStageIds: [] },
      { id: 'stg_plan',    name: 'Phase 2 — Plan',    order: 1, dependsOnStageIds: ['stg_explore'] },
      { id: 'stg_design',  name: 'Phase 3 — Design',  order: 2, dependsOnStageIds: ['stg_plan'] },
      { id: 'stg_build',   name: 'Phase 4 — Build',   order: 3, dependsOnStageIds: ['stg_design'] },
      { id: 'stg_verify',  name: 'Phase 5 — Verify',  order: 4, dependsOnStageIds: ['stg_build'] },
    ],
    projectContext: '/Users/luuklindenkamp/claude-projects/my-app',
  }, { workflowId: WF_ID }));
  await sleep(500);

  // ── 4. Analyst agent starts ───────────────────────────────
  await emit(makeEvent('agent.started', ANALYST_ID, {
    name: 'analyst',
    type: 'claude-code-agent',
    capabilities: [{ name: 'code-analysis', version: '1.0' }],
    parentAgentId: ORCHESTRATOR_ID,
    metadata: { model: 'claude-sonnet-4-6' },
  }));
  await sleep(300);

  // ── 5. Stage 1: Explore begins ───────────────────────────
  await emit(makeEvent('workflow.stage.started', ORCHESTRATOR_ID, {
    stageId: 'stg_explore',
    stageName: 'Phase 1 — Explore',
    assignedAgentId: ANALYST_ID,
  }, { workflowId: WF_ID }));

  // ── 6. Task: explore created ─────────────────────────────
  await emit(makeEvent('task.created', ORCHESTRATOR_ID, {
    title: 'Explore codebase for authentication context',
    description: 'Read existing files and understand current structure',
    priority: 'high',
    assignedAgentId: ANALYST_ID,
    estimatedDurationMs: 120_000,
    dependencies: [],
    tags: ['explore', 'research'],
  }, { workflowId: WF_ID, taskId: TASK_EXPLORE }));
  await sleep(200);

  await emit(makeEvent('task.started', ANALYST_ID, {
    assignedAgentId: ANALYST_ID,
  }, { workflowId: WF_ID, taskId: TASK_EXPLORE }));
  await sleep(500);

  // ── 7. Skill: Explore agent uses the "start" skill ───────
  await emit(makeEvent('skill.invoked', ANALYST_ID, {
    skillId: 'start',
    skillName: '/start',
    inputSummary: 'Beginning session exploration of auth module',
  }, { workflowId: WF_ID, taskId: TASK_EXPLORE }));
  await sleep(800);

  await emit(makeEvent('skill.completed', ANALYST_ID, {
    skillId: 'start',
    durationMs: 800,
    outcome: 'success',
    outputSummary: 'Session started, 3 relevant files found',
    errorMessage: null,
  }, { workflowId: WF_ID, taskId: TASK_EXPLORE }));
  await sleep(500);

  // ── 8. Heartbeat from analyst ─────────────────────────────
  await emit(makeEvent('agent.heartbeat', ANALYST_ID, {
    status: 'running',
    currentTaskId: TASK_EXPLORE,
    currentStageId: 'stg_explore',
    memoryUsageMb: 128,
  }, { workflowId: WF_ID }));
  await sleep(1000);

  // ── 9. Explore task completes ─────────────────────────────
  await emit(makeEvent('task.completed', ANALYST_ID, {
    durationMs: 95_000,
    outputSummary: 'Found 4 relevant files. No existing auth logic. Need: LoginScreen.tsx, auth.service.ts',
  }, { workflowId: WF_ID, taskId: TASK_EXPLORE }));
  await sleep(300);

  // ── 10. Explore stage completes, hand off to plan ─────────
  await emit(makeEvent('workflow.stage.completed', ANALYST_ID, {
    stageId: 'stg_explore',
    stageName: 'Phase 1 — Explore',
    durationMs: 95_000,
    outputSummary: '4 files reviewed. Auth service and LoginScreen needed.',
    nextStageId: 'stg_plan',
    handoffData: {
      existingFiles: ['src/App.tsx', 'src/navigation.ts'],
      newFilesNeeded: ['src/screens/LoginScreen.tsx', 'src/services/auth.service.ts'],
    },
  }, { workflowId: WF_ID }));
  await sleep(400);

  // ── 11. Handoff from orchestrator to builder agent ────────
  const handoffId = `ho_mock_${Date.now()}`;
  await emit(makeEvent('handoff.initiated', ORCHESTRATOR_ID, {
    fromAgentId: ORCHESTRATOR_ID,
    toAgentId: BUILDER_ID,
    toAgentName: 'builder',
    goal: 'Implement user authentication: LoginScreen + auth service',
    currentState: 'Explore complete. Files identified. Sprint plan ready.',
    task: 'Build LoginScreen.tsx and auth.service.ts with email/password auth',
    filesToRead: ['CLAUDE.md', 'src/App.tsx', 'src/navigation.ts'],
    expectedOutput: 'Working auth flow with login screen and service',
    constraints: 'Use existing React Native + Expo stack. No new auth libraries.',
  }, { workflowId: WF_ID }));
  await sleep(500);

  // ── 12. Builder agent starts ──────────────────────────────
  await emit(makeEvent('agent.started', BUILDER_ID, {
    name: 'builder',
    type: 'claude-code-agent',
    capabilities: [
      { name: 'code-generation', version: '1.0' },
      { name: 'file-editing', version: '1.0' },
    ],
    parentAgentId: ORCHESTRATOR_ID,
    metadata: { model: 'claude-sonnet-4-6' },
  }));
  await sleep(300);

  // Builder receives the handoff
  await emit(makeEvent('handoff.received', BUILDER_ID, {
    fromAgentId: ORCHESTRATOR_ID,
    handoffId,
  }, { workflowId: WF_ID }));
  await sleep(400);

  // ── 13. Stage 4: Build begins ─────────────────────────────
  await emit(makeEvent('workflow.stage.started', ORCHESTRATOR_ID, {
    stageId: 'stg_build',
    stageName: 'Phase 4 — Build',
    assignedAgentId: BUILDER_ID,
  }, { workflowId: WF_ID }));

  // Build task
  await emit(makeEvent('task.created', ORCHESTRATOR_ID, {
    title: 'Build authentication module',
    description: 'Create LoginScreen.tsx and auth.service.ts',
    priority: 'critical',
    assignedAgentId: BUILDER_ID,
    estimatedDurationMs: 300_000,
    dependencies: [{ taskId: TASK_EXPLORE, type: 'blocks' }],
    tags: ['build', 'auth'],
  }, { workflowId: WF_ID, taskId: TASK_BUILD }));

  await emit(makeEvent('task.started', BUILDER_ID, {
    assignedAgentId: BUILDER_ID,
  }, { workflowId: WF_ID, taskId: TASK_BUILD }));
  await sleep(600);

  // ── 14. Builder uses the sprint skill ─────────────────────
  await emit(makeEvent('skill.invoked', BUILDER_ID, {
    skillId: 'sprint',
    skillName: '/sprint',
    inputSummary: 'Building auth feature per sprint plan',
  }, { workflowId: WF_ID, taskId: TASK_BUILD }));
  await sleep(1000);

  // Builder heartbeat — show it working
  await emit(makeEvent('agent.heartbeat', BUILDER_ID, {
    status: 'running',
    currentTaskId: TASK_BUILD,
    currentStageId: 'stg_build',
    memoryUsageMb: 210,
  }, { workflowId: WF_ID }));
  await sleep(800);

  // ── 15. Task gets BLOCKED (demonstrates alert system) ─────
  await emit(makeEvent('task.blocked', BUILDER_ID, {
    reason: 'Missing API endpoint: /auth/login not yet defined in backend',
    blockedByAgentId: null,
    blockedByTaskId: null,
  }, { workflowId: WF_ID, taskId: TASK_BUILD }));
  await sleep(1000);

  // ── 16. Task unblocks and completes ───────────────────────
  await emit(makeEvent('task.started', BUILDER_ID, {
    assignedAgentId: BUILDER_ID,
  }, { workflowId: WF_ID, taskId: TASK_BUILD }));
  await sleep(500);

  await emit(makeEvent('skill.completed', BUILDER_ID, {
    skillId: 'sprint',
    durationMs: 2300,
    outcome: 'success',
    outputSummary: 'LoginScreen.tsx and auth.service.ts created successfully',
    errorMessage: null,
  }, { workflowId: WF_ID, taskId: TASK_BUILD }));

  await emit(makeEvent('task.completed', BUILDER_ID, {
    durationMs: 280_000,
    outputSummary: 'Auth module complete: LoginScreen.tsx, auth.service.ts, and navigation wired up',
  }, { workflowId: WF_ID, taskId: TASK_BUILD }));
  await sleep(400);

  // ── 17. Build stage completes ─────────────────────────────
  await emit(makeEvent('workflow.stage.completed', BUILDER_ID, {
    stageId: 'stg_build',
    stageName: 'Phase 4 — Build',
    durationMs: 280_000,
    outputSummary: 'Auth module built. 2 new files. Navigation updated.',
    nextStageId: 'stg_verify',
    handoffData: {
      createdFiles: ['src/screens/LoginScreen.tsx', 'src/services/auth.service.ts'],
      modifiedFiles: ['src/App.tsx', 'src/navigation.ts'],
    },
  }, { workflowId: WF_ID }));
  await sleep(400);

  // ── 18. Workflow completes ────────────────────────────────
  await emit(makeEvent('workflow.completed', ORCHESTRATOR_ID, {
    totalDurationMs: 480_000,
    stageCount: 5,
    summary: 'Sprint complete. Auth feature implemented and tested.',
  }, { workflowId: WF_ID }));
  await sleep(300);

  // ── 19. Agents stop ───────────────────────────────────────
  await emit(makeEvent('agent.stopped', BUILDER_ID, {
    reason: 'completed',
    summary: 'Built auth module as requested',
  }));
  await emit(makeEvent('agent.stopped', ANALYST_ID, {
    reason: 'completed',
    summary: 'Completed codebase analysis',
  }));
  await emit(makeEvent('agent.stopped', ORCHESTRATOR_ID, {
    reason: 'completed',
    summary: 'Sprint workflow complete',
  }));
  await sleep(300);

  // ── 20. Session ends ──────────────────────────────────────
  await emit(makeEvent('session.ended', ORCHESTRATOR_ID, {
    reason: 'completed',
    summary: 'Sprint session complete. Auth feature shipped.',
    totalDurationMs: 600_000,
  }));

  console.log('\n✅ Mock session complete!');
  console.log(`📊 Open the dashboard to see the results.`);
  console.log(`🔍 State snapshot: ${BACKEND_URL}/api/state`);
}

runMockSession().catch(err => {
  console.error('Mock generator failed:', err);
  process.exit(1);
});
