// ============================================================
// OVERVIEW PAGE — the main operator dashboard
// Shows: system health, stat cards, active agents, active workflow
// ============================================================

import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
import { StatusBadge } from '../components/shared/StatusBadge';
import { AgentCard } from '../components/agents/AgentCard';
import { WorkflowGraph } from '../components/workflow/WorkflowGraph';

// A single stat number card
function StatCard({ label, value, sub, color = 'text-white' }: {
  label: string; value: number | string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-surface-secondary border border-surface-border rounded-lg px-4 py-3">
      <div className="text-white/30 text-xs font-mono uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
      {sub && <div className="text-white/25 text-xs font-mono mt-1">{sub}</div>}
    </div>
  );
}

export function OverviewPage() {
  const snapshot = useDashboardStore(s => s.snapshot);
  const events = useDashboardStore(s => s.events);

  if (!snapshot) {
    return (
      <PageShell title="Overview" subtitle="Waiting for backend connection...">
        <div className="flex items-center justify-center h-48 text-white/20 text-xs font-mono">
          No data yet. Make sure the backend is running on port 3001.
        </div>
      </PageShell>
    );
  }

  const { stats, agents, workflows, systemHealth } = snapshot;
  const activeWorkflows = workflows.filter(w => w.status === 'running');
  const runningAgents = agents.filter(a => a.status === 'running' || a.status === 'waiting');
  const recentEvents = events.slice(-5).reverse();

  return (
    <PageShell
      title="System Overview"
      subtitle={`Session: ${snapshot.currentSessionId ?? 'none'}`}
      actions={<StatusBadge status={systemHealth} />}
    >
      {/* Stat cards row */}
      <div className="grid grid-cols-3 gap-3 mb-6 xl:grid-cols-6">
        <StatCard label="Active Agents" value={stats.totalAgentsActive} color="text-accent-green" />
        <StatCard label="Workflows" value={stats.totalWorkflowsRunning} color="text-accent-purple" />
        <StatCard label="Open Tasks" value={stats.totalTasksOpen} color="text-accent" />
        <StatCard label="Completed" value={stats.totalTasksCompleted} color="text-white/60" />
        <StatCard
          label="Alerts"
          value={stats.alertCountBySeverity.critical + stats.alertCountBySeverity.warning}
          color={stats.alertCountBySeverity.critical > 0 ? 'text-accent-red' : 'text-accent-yellow'}
          sub={`${stats.alertCountBySeverity.critical} critical`}
        />
        <StatCard label="Events" value={stats.totalEventsThisSession} color="text-white/60" />
      </div>

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
        {/* Active agents panel */}
        <div className="col-span-1">
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Active Agents</div>
          {runningAgents.length === 0 ? (
            <div className="text-white/20 text-xs font-mono py-4 text-center border border-surface-border rounded-lg">
              No agents currently active
            </div>
          ) : (
            <div className="space-y-3">
              {runningAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>

        {/* Active workflows panel */}
        <div className="col-span-1 xl:col-span-2">
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Active Workflows</div>
          {activeWorkflows.length === 0 ? (
            <div className="text-white/20 text-xs font-mono py-4 text-center border border-surface-border rounded-lg">
              No workflows currently running
            </div>
          ) : (
            <div className="space-y-4">
              {activeWorkflows.map(wf => (
                <div key={wf.id} className="bg-surface-secondary border border-surface-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs font-mono font-semibold text-white">{wf.name}</div>
                      <div className="text-xs font-mono text-white/30">{wf.description}</div>
                    </div>
                    <StatusBadge status={wf.status} />
                  </div>
                  <WorkflowGraph workflow={wf} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent events */}
      <div className="mt-5">
        <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Recent Events</div>
        <div className="bg-surface-secondary border border-surface-border rounded-lg overflow-hidden">
          {recentEvents.length === 0 ? (
            <div className="text-white/20 text-xs font-mono p-4 text-center">No events yet</div>
          ) : (
            recentEvents.map(event => (
              <div key={event.id} className="flex gap-3 px-4 py-2 border-b border-surface-border last:border-0">
                <span className="text-white/25 text-xs font-mono w-20 flex-shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-accent-green text-xs font-mono w-40 flex-shrink-0 truncate">
                  {event.type}
                </span>
                <span className="text-white/40 text-xs font-mono truncate">
                  {event.agentId}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
