// Live WebSocket connection indicator — green pulse = connected, red = disconnected
import React from 'react';
import { useDashboardStore } from '../../store/dashboardStore';

export function ConnectionDot() {
  const connected = useDashboardStore(s => s.connected);
  return (
    <div className="flex items-center gap-2">
      <span className={`relative flex h-2 w-2`}>
        {connected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-accent-green' : 'bg-accent-red'}`} />
      </span>
      <span className="text-xs text-white/40 font-mono">
        {connected ? 'LIVE' : 'DISCONNECTED'}
      </span>
    </div>
  );
}
