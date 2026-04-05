import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';

export function SkillsPage() {
  const snapshot = useDashboardStore(s => s.snapshot);
  const skills = snapshot?.skills ?? [];
  const invocations = snapshot?.skillInvocations ?? [];

  // Build stats per skill
  const stats = skills.map(skill => {
    const skillInvocations = invocations.filter(i => i.skillId === skill.id);
    const successes = skillInvocations.filter(i => i.outcome === 'success').length;
    const failures = skillInvocations.filter(i => i.outcome === 'failure').length;
    const inProgress = skillInvocations.filter(i => i.outcome === 'in-progress').length;
    const completed = skillInvocations.filter(i => i.durationMs !== null);
    const avgMs = completed.length > 0
      ? completed.reduce((s, i) => s + (i.durationMs ?? 0), 0) / completed.length
      : null;
    return { skill, total: skillInvocations.length, successes, failures, inProgress, avgMs };
  });

  return (
    <PageShell title="Skill Usage" subtitle={`${skills.length} skills registered`}>
      {stats.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-xs font-mono">
          No skills used yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {stats.map(({ skill, total, successes, failures, inProgress, avgMs }) => {
            const successRate = total > 0 ? Math.round((successes / total) * 100) : 0;
            return (
              <div key={skill.id} className="bg-surface-secondary border border-surface-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-mono font-semibold text-accent-cyan">/{skill.id}</div>
                    <div className="text-xs font-mono text-white/30">{skill.category}</div>
                  </div>
                  {inProgress > 0 && (
                    <span className="text-xs font-mono text-accent-yellow animate-pulse">
                      {inProgress} active
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <div className="text-lg font-mono font-bold text-white">{total}</div>
                    <div className="text-xs font-mono text-white/25">calls</div>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-accent-green">{successes}</div>
                    <div className="text-xs font-mono text-white/25">success</div>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-accent-red">{failures}</div>
                    <div className="text-xs font-mono text-white/25">failed</div>
                  </div>
                </div>
                {/* Success rate bar */}
                <div className="mb-2">
                  <div className="h-1 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-green rounded-full"
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                  <div className="text-right text-xs font-mono text-white/25 mt-0.5">{successRate}% success</div>
                </div>
                {avgMs !== null && (
                  <div className="text-xs font-mono text-white/25">
                    avg {(avgMs / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recent invocations */}
      {invocations.length > 0 && (
        <div className="mt-6">
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">Recent Invocations</div>
          <div className="bg-surface-secondary border border-surface-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border text-white/25 text-xs font-mono">
                  <th className="px-3 py-2 text-left">SKILL</th>
                  <th className="px-3 py-2 text-left">AGENT</th>
                  <th className="px-3 py-2 text-left">OUTCOME</th>
                  <th className="px-3 py-2 text-left">DURATION</th>
                </tr>
              </thead>
              <tbody>
                {[...invocations].reverse().slice(0, 20).map(inv => (
                  <tr key={inv.id} className="border-b border-surface-border">
                    <td className="px-3 py-2 text-xs font-mono text-accent-cyan">/{inv.skillId}</td>
                    <td className="px-3 py-2 text-xs font-mono text-white/50">{inv.invokedByAgentId}</td>
                    <td className="px-3 py-2 text-xs font-mono">
                      <span className={
                        inv.outcome === 'success' ? 'text-accent-green' :
                        inv.outcome === 'failure' ? 'text-accent-red' :
                        inv.outcome === 'in-progress' ? 'text-accent-yellow animate-pulse' :
                        'text-white/40'
                      }>
                        {inv.outcome}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs font-mono text-white/30">
                      {inv.durationMs ? `${(inv.durationMs / 1000).toFixed(1)}s` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
}
