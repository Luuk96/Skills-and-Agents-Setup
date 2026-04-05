// ============================================================
// WEBSOCKET HOOK
// Manages the WebSocket connection lifecycle.
// Receives state_snapshot, new_event, and new_alert messages.
// Updates the Zustand store on each message.
// ============================================================

import { useEffect, useRef } from 'react';
import type { ProjectStateSnapshot, DashboardEvent, Alert } from '@dashboard/core';
import { useDashboardStore } from '../store/dashboardStore';

const WS_URL = `ws://${window.location.hostname}:3001/ws`;
const RECONNECT_DELAY_MS = 3000;

/** WebSocket message types we receive from the backend */
type WsMessage =
  | { type: 'state_snapshot'; payload: ProjectStateSnapshot }
  | { type: 'new_event'; payload: DashboardEvent }
  | { type: 'new_alert'; payload: Alert };

export function useWebSocket(): void {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setConnected, setSnapshot, appendEvent, appendAlert } = useDashboardStore();

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsMessage;

          switch (msg.type) {
            case 'state_snapshot':
              // Full state replacement — backend sends this after every change
              setSnapshot(msg.payload);
              break;
            case 'new_event':
              // Append to the live event feed
              appendEvent(msg.payload);
              break;
            case 'new_alert':
              // Add a new alert
              appendAlert(msg.payload);
              break;
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected. Reconnecting in 3s...');
        setConnected(false);
        wsRef.current = null;
        // Auto-reconnect
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
        ws.close();
      };
    }

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []); // Only run once on mount
}
