import React from 'react';
import { PageShell } from '../components/layout/PageShell';
import { EventFeed } from '../components/events/EventFeed';

export function EventStreamPage() {
  return (
    <PageShell title="Live Event Stream" subtitle="Real-time event log from all agents">
      <div style={{ height: 'calc(100vh - 160px)' }}>
        <EventFeed />
      </div>
    </PageShell>
  );
}
