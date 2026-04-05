// ============================================================
// EVENT FEED
// Virtualized, filterable, live-updating event stream.
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import type { DashboardEvent } from '@dashboard/core';
import { useDashboardStore } from '../../store/dashboardStore';

// Color each event type group differently
function eventColor(type: string): string {
  if (type.startsWith('agent.')) return 'text-accent-green';
  if (type.startsWith('workflow.')) return 'text-accent-purple';
  if (type.startsWith('task.')) return 'text-accent';
  if (type.startsWith('skill.')) return 'text-accent-cyan';
  if (type.startsWith('handoff.')) return 'text-accent-yellow';
  if (type.startsWith('diagnostic.')) return 'text-white/40';
  if (type.startsWith('session.')) return 'text-white/60';
  return 'text-white/50';
}

interface EventRowProps {
  event: DashboardEvent;
  isSelected: boolean;
  onClick: () => void;
}

function EventRow({ event, isSelected, onClick }: EventRowProps) {
  const time = new Date(event.timestamp).toLocaleTimeString();
  return (
    <div
      onClick={onClick}
      className={`px-3 py-1.5 border-b border-surface-border cursor-pointer transition-colors flex gap-3 items-start ${
        isSelected ? 'bg-accent/10' : 'hover:bg-white/5'
      }`}
    >
      <span className="text-white/25 text-xs font-mono flex-shrink-0 w-20">{time}</span>
      <span className={`text-xs font-mono flex-shrink-0 w-44 ${eventColor(event.type)}`}>{event.type}</span>
      <span className="text-white/50 text-xs font-mono flex-shrink-0 w-28 truncate">{event.agentId}</span>
      {event.workflowId && (
        <span className="text-accent-purple/60 text-xs font-mono truncate">{event.workflowId}</span>
      )}
    </div>
  );
}

interface DetailDrawerProps {
  event: DashboardEvent;
  onClose: () => void;
}

function DetailDrawer({ event, onClose }: DetailDrawerProps) {
  return (
    <div className="border-t border-surface-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-mono font-semibold ${eventColor(event.type)}`}>{event.type}</span>
        <button onClick={onClose} className="text-white/40 hover:text-white text-xs font-mono">✕ close</button>
      </div>
      <pre className="text-xs font-mono text-white/70 overflow-x-auto whitespace-pre-wrap break-all bg-surface-secondary rounded p-3 border border-surface-border max-h-64 overflow-y-auto">
        {JSON.stringify(event, null, 2)}
      </pre>
    </div>
  );
}

export function EventFeed() {
  const events = useDashboardStore(s => s.events);
  const [filter, setFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<DashboardEvent | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  const filtered = filter
    ? events.filter(e =>
        e.type.includes(filter) ||
        e.agentId.includes(filter) ||
        (e.workflowId ?? '').includes(filter) ||
        (e.taskId ?? '').includes(filter)
      )
    : events;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Filter by type, agent, workflow..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 bg-surface-secondary border border-surface-border rounded px-3 py-1.5 text-xs font-mono text-white placeholder:text-white/25 outline-none focus:border-accent/50"
        />
        <label className="flex items-center gap-2 text-xs font-mono text-white/40 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
            className="accent-accent-green"
          />
          auto-scroll
        </label>
        <span className="text-xs font-mono text-white/25">{filtered.length} events</span>
      </div>

      {/* Column headers */}
      <div className="flex gap-3 px-3 py-1 border-b border-surface-border text-white/20 text-xs font-mono flex-shrink-0">
        <span className="w-20">TIME</span>
        <span className="w-44">TYPE</span>
        <span className="w-28">AGENT</span>
        <span>WORKFLOW / TASK</span>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-white/20 text-xs font-mono">
            No events yet. Start a workflow to see activity here.
          </div>
        ) : (
          <>
            {filtered.map(event => (
              <EventRow
                key={event.id}
                event={event}
                isSelected={selectedEvent?.id === event.id}
                onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Detail drawer */}
      {selectedEvent && (
        <DetailDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
