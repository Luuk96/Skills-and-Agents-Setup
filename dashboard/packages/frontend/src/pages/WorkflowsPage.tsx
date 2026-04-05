import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
import { StatusBadge } from '../components/shared/StatusBadge';
import { WorkflowGraph } from '../components/workflow/WorkflowGraph';

export function WorkflowsPage() {
  const snapshot = useDashboardStore(s => s.snapshot);
  const workflows = snapshot?.workflows ?? [];

  return (
    <PageShell title="Workflows" subtitle={`${workflows.length} total`}>
      {workflows.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-xs font-mono">
          No workflows recorded yet.
        </div>
      ) : (
        <div className="space-y-5">
          {workflows.map(wf => {
            const completedStages = wf.stages.filter(s => s.status === 'completed').length;
            const totalStages = wf.stages.length;
            const pct = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

            return (
              <div key={wf.id} className="bg-surface-secondary border border-surface-border rounded-lg p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-mono font-semibold text-white">{wf.name}</div>
                    <div className="text-xs font-mono text-white/30 mt-0.5">{wf.description}</div>
                    {wf.projectContext && (
                      <div className="text-xs font-mono text-white/20 mt-0.5 truncate">{wf.projectContext}</div>
                    )}
                  </div>
                  <StatusBadge status={wf.status} />
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-mono text-white/30 mb-1">
                    <span>Progress</span>
                    <span>{completedStages}/{totalStages} stages — {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-green rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Graph */}
                <WorkflowGraph workflow={wf} />

                {/* Stage list */}
                <div className="mt-4 space-y-1">
                  {wf.stages.map(stage => (
                    <div key={stage.id} className="flex items-center gap-3 px-3 py-1.5 rounded bg-surface">
                      <StatusBadge status={stage.status} />
                      <span className="text-xs font-mono text-white/70 flex-1">{stage.name}</span>
                      {stage.assignedAgentId && (
                        <span className="text-xs font-mono text-white/30">{stage.assignedAgentId}</span>
                      )}
                      {stage.durationMs && (
                        <span className="text-xs font-mono text-white/20">
                          {(stage.durationMs / 1000).toFixed(0)}s
                        </span>
                      )}
                    </div>
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
