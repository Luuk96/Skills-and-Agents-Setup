// ============================================================
// DASHBOARD STORE (Zustand)
// Single source of truth for the frontend.
// All WebSocket messages update this store.
// Components read from here via hooks.
// ============================================================

import { create } from 'zustand';
import type { ProjectStateSnapshot, DashboardEvent, Alert } from '@dashboard/core';

interface DashboardStore {
  // Connection state
  connected: boolean;
  setConnected: (v: boolean) => void;

  // The full live state from the backend
  snapshot: ProjectStateSnapshot | null;
  setSnapshot: (s: ProjectStateSnapshot) => void;

  // Event stream (appended as they arrive)
  events: DashboardEvent[];
  appendEvent: (e: DashboardEvent) => void;

  // Alerts (appended as they fire)
  alerts: Alert[];
  appendAlert: (a: Alert) => void;
  acknowledgeAlert: (id: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),

  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),

  events: [],
  appendEvent: (event) =>
    set((state) => ({
      // Keep last 1000 events in memory for the live feed
      events: [...state.events, event].slice(-1000),
    })),

  alerts: [],
  appendAlert: (alert) =>
    set((state) => ({
      alerts: [...state.alerts, alert],
    })),
  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, status: 'acknowledged' as const } : a
      ),
    })),
}));
