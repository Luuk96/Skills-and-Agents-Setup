// ============================================================
// NETWORK PAGE
// Full-page view of the agent interaction network graph.
// Shows all agents and every handoff/spawn relationship between them.
// ============================================================

import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
import { AgentNetworkGraph } from '../components/agents/AgentNetworkGraph';

export function NetworkPage() {
  const snapshot = useDashboardStore(s => s.snapshot);

  const handoffStats = snapshot
    ? {
        total: snapshot.handoffs.length,
        inTransit: snapshot.handoffs.filter(h => h.status === 'in-transit').length,
        completed: snapshot.handoffs.filter(h => h.status === 'completed').length,
      }
    : { total: 0, inTransit: 0, completed: 0 };

  return (
    <PageShell
      title="Agent Network"
      subtitle={`${snapshot?.agents.length ?? 0} agents · ${handoffStats.total} handoffs · ${handoffStats.inTransit} in-transit`}
    >
      {!snapshot ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-xs font-mono">
          Waiting for data...
        </div>
      ) : (
        <>
          {/* The main full-height graph */}
          <AgentNetworkGraph snapshot={snapshot} height={520} />

          {/* Handoff table below the graph */}
          {snapshot.handoffs.length > 0 && (
            <div className="mt-5">
              <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
                Handoff Log
              </div>
              <div className="bg-surface-secondary border border-surface-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border text-white/25 text-xs font-mono">
                      <th className="px-3 py-2 text-left">FROM</th>
                      <th className="px-3 py-2 text-left">TO</th>
                      <th className="px-3 py-2 text-left">STATUS</th>
                      <th className="px-3 py-2 text-left">GOAL</th>
                      <th className="px-3 py-2 text-left">INITIATED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.handoffs.map(handoff => (
                      <tr key={handoff.id} className="border-b border-surface-border last:border-0">
                        <td className="px-3 py-2 text-xs font-mono text-accent-green">
                          {handoff.fromAgentName}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-accent-cyan">
                          {handoff.toAgentName}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono">
                          <span className={
                            handoff.status === 'in-transit' ? 'text-accent-yellow animate-pulse' :
                            handoff.status === 'completed' ? 'text-accent-green' :
                            handoff.status === 'received' ? 'text-accent' :
                            'text-white/40'
                          }>
                            {handoff.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-white/50 max-w-xs truncate">
                          {handoff.goal}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-white/25">
                          {new Date(handoff.initiatedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
