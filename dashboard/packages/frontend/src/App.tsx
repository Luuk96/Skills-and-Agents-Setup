// ============================================================
// APP ROOT
// Sets up the router and layout shell.
// Boots the WebSocket connection on mount.
// ============================================================

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { useWebSocket } from './ws/useWebSocket';
import { useDashboardStore } from './store/dashboardStore';

// Pages
import { OverviewPage }     from './pages/OverviewPage';
import { AgentsPage }       from './pages/AgentsPage';
import { WorkflowsPage }    from './pages/WorkflowsPage';
import { TasksPage }        from './pages/TasksPage';
import { SkillsPage }       from './pages/SkillsPage';
import { EventStreamPage }  from './pages/EventStreamPage';
import { AlertsPage }       from './pages/AlertsPage';
import { ProjectPage }      from './pages/ProjectPage';
import { ReplayPage }       from './pages/ReplayPage';

/** Inner component — hooks can only be called inside the router context */
function DashboardApp() {
  // Connect to WebSocket on mount — updates the Zustand store automatically
  useWebSocket();

  // Load initial state from REST on first load (before WS sends first snapshot)
  useEffect(() => {
    fetch('/api/state')
      .then(r => r.json())
      .then(snapshot => {
        useDashboardStore.getState().setSnapshot(snapshot);
      })
      .catch(() => {
        // Backend not running yet — WS will deliver state once it connects
      });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/"          element={<OverviewPage />} />
            <Route path="/agents"    element={<AgentsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/tasks"     element={<TasksPage />} />
            <Route path="/skills"    element={<SkillsPage />} />
            <Route path="/events"    element={<EventStreamPage />} />
            <Route path="/alerts"    element={<AlertsPage />} />
            <Route path="/project"   element={<ProjectPage />} />
            <Route path="/replay"    element={<ReplayPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DashboardApp />
    </BrowserRouter>
  );
}
