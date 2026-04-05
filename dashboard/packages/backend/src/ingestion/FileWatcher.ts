// ============================================================
// FILE WATCHER
// Watches the events/ folder for new .ndjson files.
// When agents write events to files (fallback mode), this picks them up.
// Uses chokidar — a reliable cross-platform file watcher.
// ============================================================

import chokidar, { FSWatcher } from 'chokidar';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { createInterface } from 'readline';
import type { DashboardEvent } from '@dashboard/core';
import { ingestBatch } from './IngestionPipeline.js';
import { config } from '../config.js';

// Track which files we've already fully read to avoid reprocessing
const processedFiles = new Set<string>();

/**
 * Starts watching the events directory for new NDJSON event files.
 * Each line in an NDJSON file is one event JSON object.
 */
export function startFileWatcher(): FSWatcher {
  // Make sure the directory exists
  if (!existsSync(config.eventsDir)) {
    mkdirSync(config.eventsDir, { recursive: true });
  }

  console.log(`[FileWatcher] Watching: ${config.eventsDir}`);

  const watcher = chokidar.watch(`${config.eventsDir}/*.ndjson`, {
    persistent: true,
    ignoreInitial: false, // process existing files on startup
    awaitWriteFinish: {
      stabilityThreshold: 500, // wait 500ms after last write before reading
      pollInterval: 100,
    },
  });

  watcher.on('add', (filePath) => {
    console.log(`[FileWatcher] New file: ${filePath}`);
    processNdjsonFile(filePath);
  });

  watcher.on('change', (filePath) => {
    // Re-process changed files (agents may append new lines)
    processNdjsonFile(filePath);
  });

  watcher.on('error', (err) => {
    console.error('[FileWatcher] Error:', err);
  });

  return watcher;
}

/** Read an NDJSON file line by line and ingest all valid events */
async function processNdjsonFile(filePath: string): Promise<void> {
  const events: DashboardEvent[] = [];

  try {
    const rl = createInterface({
      input: createReadStream(filePath, 'utf8'),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue; // skip empty lines

      try {
        const event = JSON.parse(trimmed) as DashboardEvent;
        if (event.id && event.type && event.agentId) {
          events.push(event);
        }
      } catch {
        console.warn(`[FileWatcher] Skipping unparseable line in ${filePath}`);
      }
    }

    if (events.length > 0) {
      console.log(`[FileWatcher] Ingesting ${events.length} events from ${filePath}`);
      await ingestBatch(events);
    }
  } catch (err) {
    console.error(`[FileWatcher] Failed to process ${filePath}:`, err);
  }
}
