import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
import { StatusBadge } from '../components/shared/StatusBadge';

export function ProjectPage() {
  const snapshot = useDashboardStore(s => s.snapshot);

  if (!snapshot) {
    return (
      <PageShell title="Project State">
        <div className="text-white/20 text-xs font-mono text-center py-12">No data yet.</div>
      </PageShell>
    );
  }

  const { stats, workflows, tasks, agents } = snapshot;
  const allTasks = tasks;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const totalTasks = allTasks.length;
  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <PageShell title="Project State" subtitle={snapshot.currentSessionId ?? 'No active session'}>
      {/* Overall progress */}
      <div className="bg-surface-secondary border border-surface-border rounded-lg p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-mono text-white/40 uppercase tracking-wider">Overall Progress</div>
          <div className="text-lg font-mono font-bold text-white">{overallPct}%</div>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-green rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs font-mono text-white/30">
          <span>{completedTasks} completed</span>
          <span>{stats.totalTasksOpen} open</span>
          <span>{tasks.filter(t => t.status === 'blocked').length} blocked</span>
        </div>
      </div>

      {/* Active workflows summary */}
      <div className="mb-5">
        <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Workflows</div>
        <div className="space-y-2">
          {workflows.map(wf => {
            const done = wf.stages.filter(s => s.status === 'completed').length;
            const total = wf.stages.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={wf.id} className="flex items-center gap-3 bg-surface-secondary border border-surface-border rounded p-3">
                <div className="flex-1">
                  <div className="text-xs font-mono text-white">{wf.name}</div>
                  <div className="text-xs font-mono text-white/25 truncate">{wf.description}</div>
                </div>
                <div className="w-24">
                  <div className="h-1 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-accent-purple rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-right text-xs font-mono text-white/25 mt-0.5">{pct}%</div>
                </div>
                <StatusBadge status={wf.status} />
              </div>
            );
          })}
        </div>
      </div>

      {/* System summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Agents', value: agents.length, color: 'text-accent-green' },
          { label: 'Workflows', value: workflows.length, color: 'text-accent-purple' },
          { label: 'Total Tasks', value: totalTasks, color: 'text-accent' },
          { label: 'Handoffs', value: stats.totalHandoffsToday, color: 'text-accent-yellow' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-secondary border border-surface-border rounded-lg p-4 text-center">
            <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
            <div className="text-white/30 text-xs font-mono mt-1">{label}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
