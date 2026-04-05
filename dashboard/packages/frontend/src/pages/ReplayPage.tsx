import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
import { EventFeed } from '../components/events/EventFeed';

export function ReplayPage() {
  const events = useDashboardStore(s => s.events);

  // Simple timeline: group events by minute bucket
  const buckets: Record<string, number> = {};
  for (const event of events) {
    const minute = event.timestamp.slice(0, 16); // "2026-04-05T10:00"
    buckets[minute] = (buckets[minute] ?? 0) + 1;
  }
  const bucketEntries = Object.entries(buckets).sort();

  return (
    <PageShell title="History & Replay" subtitle={`${events.length} events in session`}>
      {events.length === 0 ? (
        <div className="text-white/20 text-xs font-mono text-center py-12">
          No events recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {/* Activity timeline */}
          <div className="col-span-1">
            <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Activity by Minute</div>
            <div className="bg-surface-secondary border border-surface-border rounded-lg p-3 space-y-1 max-h-96 overflow-y-auto">
              {bucketEntries.map(([minute, count]) => (
                <div key={minute} className="flex items-center gap-2">
                  <span className="text-white/25 text-xs font-mono w-36 flex-shrink-0">{minute.slice(11)}</span>
                  <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/50 rounded-full"
                      style={{ width: `${Math.min(100, (count / 20) * 100)}%` }}
                    />
                  </div>
                  <span className="text-white/30 text-xs font-mono w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full event log */}
          <div className="col-span-2">
            <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Full Event Log</div>
            <div style={{ height: 400 }}>
              <EventFeed />
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
