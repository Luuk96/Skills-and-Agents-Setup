// ============================================================
// WEBSOCKET SERVER
// Manages all WebSocket client connections.
// When new state arrives, it broadcasts to all connected clients.
// ============================================================

import { WebSocketServer as WSSServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { ProjectStateSnapshot } from '@dashboard/core';
import { config } from '../config';

// Track all currently connected clients
const clients = new Set<WebSocket>();

/**
 * Attaches the WebSocket server to the existing HTTP server.
 * Clients connect to ws://localhost:3001/ws
 */
export function createWebSocketServer(httpServer: Server): WSSServer {
  const wss = new WSSServer({ server: httpServer, path: config.wsPath });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.log(`[WebSocket] Client connected. Total: ${clients.size}`);

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WebSocket] Client disconnected. Total: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Client error:', err.message);
      clients.delete(ws);
    });
  });

  return wss;
}

/** Send the full state snapshot to all connected clients */
export function broadcastState(snapshot: ProjectStateSnapshot): void {
  if (clients.size === 0) return;

  const message = JSON.stringify({
    type: 'state_snapshot',
    payload: snapshot,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

/** Send a single new event to all connected clients (real-time feed) */
export function broadcastEvent(event: unknown): void {
  if (clients.size === 0) return;

  const message = JSON.stringify({
    type: 'new_event',
    payload: event,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

/** Send a new alert to all connected clients */
export function broadcastAlert(alert: unknown): void {
  if (clients.size === 0) return;

  const message = JSON.stringify({
    type: 'new_alert',
    payload: alert,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export function getConnectedClientCount(): number {
  return clients.size;
}
