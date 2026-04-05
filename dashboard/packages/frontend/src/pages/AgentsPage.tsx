import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
import { AgentCard } from '../components/agents/AgentCard';

export function AgentsPage() {
  const snapshot = useDashboardStore(s => s.snapshot);
  const agents = snapshot?.agents ?? [];

  const byStatus = {
    running: agents.filter(a => a.status === 'running'),
    waiting: agents.filter(a => a.status === 'waiting'),
    blocked: agents.filter(a => a.status === 'blocked'),
    error: agents.filter(a => a.status === 'error'),
    idle: agents.filter(a => a.status === 'idle'),
    offline: agents.filter(a => a.status === 'offline'),
  };

  return (
    <PageShell
      title="Agents"
      subtitle={`${agents.length} total registered`}
    >
      {agents.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-xs font-mono">
          No agents registered. Start a workflow to see agents here.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byStatus).map(([status, group]) => {
            if (group.length === 0) return null;
            return (
              <div key={status}>
                <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
                  {status} ({group.length})
                </div>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                  {group.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
