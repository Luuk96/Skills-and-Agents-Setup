// ============================================================
// TOP BAR
// Shows system health, connection status, and current time.
// ============================================================

import React, { useEffect, useState } from 'react';
import { ConnectionDot } from '../shared/ConnectionDot';
import { StatusBadge } from '../shared/StatusBadge';
import { useDashboardStore } from '../../store/dashboardStore';

export function TopBar() {
  const snapshot = useDashboardStore(s => s.snapshot);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-10 bg-surface-secondary border-b border-surface-border flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: health + stats */}
      <div className="flex items-center gap-4">
        {snapshot && (
          <>
            <StatusBadge status={snapshot.systemHealth} />
            <span className="text-white/30 text-xs font-mono">
              {snapshot.stats.totalAgentsActive} active agents
            </span>
            <span className="text-white/30 text-xs font-mono">
              {snapshot.stats.totalWorkflowsRunning} workflows
            </span>
            <span className="text-white/30 text-xs font-mono">
              {snapshot.stats.totalTasksOpen} open tasks
            </span>
            {snapshot.stats.alertCountBySeverity.critical > 0 && (
              <span className="text-accent-red text-xs font-mono animate-pulse">
                ⚠ {snapshot.stats.alertCountBySeverity.critical} critical alert(s)
              </span>
            )}
          </>
        )}
      </div>

      {/* Right: connection + clock */}
      <div className="flex items-center gap-4">
        <span className="text-white/30 text-xs font-mono">{time}</span>
        <ConnectionDot />
      </div>
    </header>
  );
}
