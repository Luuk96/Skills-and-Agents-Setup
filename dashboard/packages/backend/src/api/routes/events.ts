// ============================================================
// EVENTS API ROUTES
// GET /api/events         — query event history
// POST /api/events        — ingest a new event (used by SDK's HttpEmitter)
// ============================================================

import { Router, Request, Response } from 'express';
import type { DashboardEvent } from '@dashboard/core';
import { getRecentEvents, getEventsBySession } from '../../persistence/EventRepository';
import { ingestEvent } from '../../ingestion/IngestionPipeline';

const router = Router();

/** GET /api/events — returns recent events, optionally filtered */
router.get('/', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string ?? '100', 10);
    const sessionId = req.query.sessionId as string | undefined;

    const events = sessionId
      ? getEventsBySession(sessionId).slice(-limit)
      : getRecentEvents(limit);

    res.json({ events: events.map(e => e.event), total: events.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/** POST /api/events — accept a new event from an agent (HttpEmitter calls this) */
router.post('/', async (req: Request, res: Response) => {
  try {
    const event = req.body as DashboardEvent;

    // Basic validation — make sure it has the required fields
    if (!event.id || !event.type || !event.agentId || !event.sessionId) {
      res.status(400).json({ error: 'Missing required fields: id, type, agentId, sessionId' });
      return;
    }

    const seq = await ingestEvent(event);
    res.status(201).json({ ok: true, seq });
  } catch (err) {
    console.error('[Events API] Ingest failed:', err);
    res.status(500).json({ error: 'Failed to ingest event' });
  }
});

export default router;
