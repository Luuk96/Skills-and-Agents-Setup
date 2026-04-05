// ============================================================
// STATE API ROUTES
// GET /api/state — returns the full current live state snapshot
// GET /api/agents — returns just the agents
// GET /api/workflows — returns just the workflows
// GET /api/tasks — returns just the tasks
// ============================================================

import { Router, Request, Response } from 'express';
import { projector } from '../../ingestion/IngestionPipeline.js';
import { toSnapshot } from '../../projection/LiveState.js';

const router = Router();

/** GET /api/state — full snapshot (used for initial frontend load) */
router.get('/', (_req: Request, res: Response) => {
  const snapshot = toSnapshot(projector.getState());
  res.json(snapshot);
});

/** GET /api/agents — just agents */
router.get('/agents', (_req: Request, res: Response) => {
  const state = projector.getState();
  res.json(Array.from(state.agents.values()));
});

/** GET /api/workflows — just workflows */
router.get('/workflows', (_req: Request, res: Response) => {
  const state = projector.getState();
  res.json(Array.from(state.workflows.values()));
});

/** GET /api/tasks — just tasks */
router.get('/tasks', (_req: Request, res: Response) => {
  const state = projector.getState();
  res.json(Array.from(state.tasks.values()));
});

/** GET /api/skills — skill stats */
router.get('/skills', (_req: Request, res: Response) => {
  const state = projector.getState();
  const skills = Array.from(state.skills.values());
  const invocations = state.skillInvocations;

  // Build usage stats per skill
  const stats = skills.map(skill => {
    const skillInvocations = invocations.filter(i => i.skillId === skill.id);
    const successes = skillInvocations.filter(i => i.outcome === 'success').length;
    const failures = skillInvocations.filter(i => i.outcome === 'failure').length;
    const completed = skillInvocations.filter(i => i.durationMs !== null);
    const avgDuration = completed.length > 0
      ? completed.reduce((sum, i) => sum + (i.durationMs ?? 0), 0) / completed.length
      : null;
    const last = skillInvocations.at(-1);

    return {
      skillId: skill.id,
      skillName: skill.name,
      totalInvocations: skillInvocations.length,
      successCount: successes,
      failureCount: failures,
      avgDurationMs: avgDuration,
      lastInvokedAt: last?.startedAt ?? null,
    };
  });

  res.json(stats);
});

export default router;
