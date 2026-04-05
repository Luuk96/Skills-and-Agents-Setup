import React, { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
import { StatusBadge } from '../components/shared/StatusBadge';
import type { Task } from '@dashboard/core';

function priorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'text-accent-red';
    case 'high': return 'text-accent-yellow';
    case 'medium': return 'text-accent';
    default: return 'text-white/40';
  }
}

function TaskRow({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const age = Math.floor((Date.now() - new Date(task.createdAt).getTime()) / 1000 / 60);

  return (
    <>
      <tr
        onClick={() => setExpanded(e => !e)}
        className="border-b border-surface-border hover:bg-white/5 cursor-pointer transition-colors"
      >
        <td className="px-3 py-2">
          <div className="text-xs font-mono text-white/70 max-w-xs truncate">{task.title}</div>
        </td>
        <td className="px-3 py-2"><StatusBadge status={task.status} /></td>
        <td className={`px-3 py-2 text-xs font-mono ${priorityColor(task.priority)}`}>{task.priority}</td>
        <td className="px-3 py-2 text-xs font-mono text-white/40">{task.assignedAgentId ?? '—'}</td>
        <td className="px-3 py-2 text-xs font-mono text-white/25">{age}m ago</td>
      </tr>
      {expanded && (
        <tr className="border-b border-surface-border">
          <td colSpan={5} className="px-3 py-3 bg-surface">
            <div className="text-xs font-mono text-white/50 space-y-1">
              <div><span className="text-white/25">ID:</span> {task.id}</div>
              <div><span className="text-white/25">Description:</span> {task.description}</div>
              {task.blockedReason && (
                <div className="text-accent-yellow"><span className="text-white/25">Blocked reason:</span> {task.blockedReason}</div>
              )}
              {task.output && (
                <div><span className="text-white/25">Output:</span> {task.output}</div>
              )}
              {task.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {task.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-surface-border rounded text-white/40 text-xs">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function TasksPage() {
  const snapshot = useDashboardStore(s => s.snapshot);
  const [statusFilter, setStatusFilter] = useState('all');
  const tasks = snapshot?.tasks ?? [];

  const filtered = statusFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === statusFilter);

  const statuses = ['all', 'open', 'in-progress', 'blocked', 'completed', 'cancelled'];

  return (
    <PageShell title="Tasks" subtitle={`${tasks.length} total tasks`}>
      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              statusFilter === s
                ? 'bg-accent text-white'
                : 'bg-surface-secondary border border-surface-border text-white/40 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-white/20 text-xs font-mono">
          No tasks found.
        </div>
      ) : (
        <div className="bg-surface-secondary border border-surface-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border text-white/25 text-xs font-mono">
                <th className="px-3 py-2 text-left">TITLE</th>
                <th className="px-3 py-2 text-left">STATUS</th>
                <th className="px-3 py-2 text-left">PRIORITY</th>
                <th className="px-3 py-2 text-left">AGENT</th>
                <th className="px-3 py-2 text-left">AGE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => <TaskRow key={task.id} task={task} />)}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
