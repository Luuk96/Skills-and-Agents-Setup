// ============================================================
// ID GENERATION
// Generates short unique IDs for events, agents, tasks, etc.
// Uses crypto.randomUUID() (built into Node 19+) and shortens it.
// ============================================================

import { randomUUID } from 'crypto';

/**
 * Returns a short unique ID string.
 * Example output: "ev_k8x2mq9f"
 *
 * @param prefix - optional prefix like "ev", "agt", "wf", "tsk"
 */
export function generateId(prefix?: string): string {
  // Take the first 10 characters of a UUID (without dashes) for a compact ID
  const short = randomUUID().replace(/-/g, '').slice(0, 10);
  return prefix ? `${prefix}_${short}` : short;
}
