// ============================================================
// AGENTS PAGE
// Clean table view of all registered agents.
// One row per agent — no text overlap, clear status at a glance.
// ============================================================

import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
// Agent type — inlined to avoid @dashboard/core module resolution issue at typecheck time
interface AgentCapability { name: string; version: string; }
interface Agent {
  id: string; name: string; type: string;
  status: 'idle' | 'running' | 'waiting' | 'blocked' | 'error' | 'offline';
  currentTaskId: string | null; currentWorkflowId: string | null; currentStageId: string | null;
  capabilities: AgentCapability[];
  lastSeenAt: string; startedAt: string; errorMessage: string | null; parentAgentId: string | null;
  sessionId: string;
}
import { Clock, AlertCircle } from 'lucide-react';

// ---- Status dot + label ----
const STATUS_CFG: Record<string, { color: string; label: string; pulse: boolean }> = {
  running:  { color: '#22c55e',   label: 'running',  pulse: true  },
  waiting:  { color: '#eab308',   label: 'waiting',  pulse: true  },
  blocked:  { color: '#ef4444',   label: 'blocked',  pulse: false },
  error:    { color: '#ef4444',   label: 'error',    pulse: false },
  idle:     { color: '#ffffff30', label: 'idle',     pulse: false },
  offline:  { color: '#ffffff15', label: 'offline',  pulse: false },
};

function StatusCell({ status }: { status: Agent['status'] }) {
  const cfg = STATUS_CFG[status] ?? { color: '#ffffff30', label: status, pulse: false };

  return (
    <div className="flex items-center gap-2">
      {/* Status dot */}
      <div className="relative w-2 h-2 flex-shrink-0">
        {cfg.pulse && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-60"
            style={{ background: cfg.color }}
          />
        )}
        <div className="absolute inset-0 rounded-full" style={{ background: cfg.color }} />
      </div>
      <span className="font-mono text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

// ---- Role lookup — maps agent name to its purpose ----
const AGENT_ROLES: Record<string, { purpose: string; color: string }> = {
  orchestrator: { purpose: 'coordinate',  color: '#3b82f6' },
  planner:      { purpose: 'plan',        color: '#a855f7' },
  architect:    { purpose: 'design',      color: '#06b6d4' },
  builder:      { purpose: 'implement',   color: '#22c55e' },
  verifier:     { purpose: 'verify',      color: '#eab308' },
  reviewer:     { purpose: 'review',      color: '#f97316' },
  analyst:      { purpose: 'analyse',     color: '#06b6d4' },
  debugger:     { purpose: 'debug',       color: '#ef4444' },
};

function RoleCell({ name }: { name: string }) {
  const role = AGENT_ROLES[name.toLowerCase()];
  if (!role) return <span className="font-mono text-white/25 text-xs">—</span>;
  return (
    <span
      className="font-mono text-xs px-2 py-0.5 rounded"
      style={{
        color: role.color,
        background: `${role.color}15`,
        border: `1px solid ${role.color}30`,
      }}
    >
      {role.purpose}
    </span>
  );
}

// ---- Capabilities pills ----
function CapabilitiesCell({ capabilities }: { capabilities: Agent['capabilities'] }) {
  if (capabilities.length === 0) return <span className="font-mono text-white/20 text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {capabilities.map((cap: AgentCapability) => (
        <span
          key={cap.name}
          className="font-mono text-xs px-1.5 py-0.5 rounded"
          style={{ color: '#06b6d480', background: '#06b6d410', border: '1px solid #06b6d425', fontSize: 10 }}
        >
          {cap.name}
        </span>
      ))}
    </div>
  );
}

// ---- Task / stage cell ----
function TaskCell({ agent }: { agent: Agent }) {
  if (!agent.currentTaskId && !agent.currentStageId) {
    return <span className="font-mono text-white/20 text-xs">—</span>;
  }
  return (
    <div className="space-y-0.5">
      {agent.currentTaskId && (
        <div className="font-mono text-white/50 text-xs truncate max-w-[160px]">
          {agent.currentTaskId}
        </div>
      )}
      {agent.currentStageId && (
        <div className="font-mono text-xs truncate max-w-[160px]" style={{ color: '#a855f770', fontSize: 10 }}>
          {agent.currentStageId}
        </div>
      )}
    </div>
  );
}

// ---- Last seen ----
function LastSeenCell({ lastSeenAt }: { lastSeenAt: string }) {
  const secondsAgo = Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 1000);
  const label = secondsAgo < 60
    ? `${secondsAgo}s ago`
    : `${Math.floor(secondsAgo / 60)}m ago`;
  return (
    <div className="flex items-center gap-1 text-white/25 font-mono text-xs">
      <Clock size={10} />
      <span>{label}</span>
    </div>
  );
}

// ---- Single agent row ----
function AgentRow({ agent }: { agent: Agent }) {
  const hasError = agent.status === 'error' || agent.status === 'blocked';

  return (
    <tr className={`border-b border-surface-border last:border-0 transition-colors ${hasError ? 'bg-accent-red/5' : 'hover:bg-white/[0.02]'}`}>
      {/* Name + type */}
      <td className="px-4 py-3">
        <div className="font-mono font-semibold text-white text-xs">{agent.name}</div>
        <div className="font-mono text-white/25 text-xs mt-0.5">{agent.type}</div>
      </td>

      {/* Role / purpose */}
      <td className="px-4 py-3">
        <RoleCell name={agent.name} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusCell status={agent.status} />
      </td>

      {/* Capabilities */}
      <td className="px-4 py-3">
        <CapabilitiesCell capabilities={agent.capabilities} />
      </td>

      {/* Current task / stage */}
      <td className="px-4 py-3">
        <TaskCell agent={agent} />
      </td>

      {/* Last seen */}
      <td className="px-4 py-3">
        <LastSeenCell lastSeenAt={agent.lastSeenAt} />
      </td>

      {/* Error (only shown if there is one) */}
      <td className="px-4 py-3">
        {agent.errorMessage ? (
          <div className="flex items-start gap-1.5">
            <AlertCircle size={11} className="text-accent-red flex-shrink-0 mt-0.5" />
            <span className="font-mono text-accent-red text-xs leading-relaxed max-w-[200px]">
              {agent.errorMessage}
            </span>
          </div>
        ) : (
          <span className="text-white/15 text-xs font-mono">—</span>
        )}
      </td>
    </tr>
  );
}

// ---- Status summary bar ----
function StatusSummary({ agents }: { agents: Agent[] }) {
  const counts = {
    running: agents.filter(a => a.status === 'running').length,
    waiting: agents.filter(a => a.status === 'waiting').length,
    blocked: agents.filter(a => a.status === 'blocked').length,
    error:   agents.filter(a => a.status === 'error').length,
    idle:    agents.filter(a => a.status === 'idle').length,
    offline: agents.filter(a => a.status === 'offline').length,
  };

  const items = [
    { label: 'running', count: counts.running, color: '#22c55e' },
    { label: 'waiting', count: counts.waiting, color: '#eab308' },
    { label: 'blocked', count: counts.blocked, color: '#ef4444' },
    { label: 'error',   count: counts.error,   color: '#ef4444' },
    { label: 'idle',    count: counts.idle,    color: '#ffffff30' },
    { label: 'offline', count: counts.offline, color: '#ffffff15' },
  ].filter(i => i.count > 0);

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-4 flex-wrap mb-5">
      {items.map(({ label, count, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="font-mono text-xs" style={{ color }}>
            {count} {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---- Main page ----
export function AgentsPage() {
  const snapshot = useDashboardStore(s => s.snapshot);
  const agents = snapshot?.agents ?? [];

  // Sort: running first, then waiting, blocked, error, idle, offline
  const ORDER = ['running', 'waiting', 'blocked', 'error', 'idle', 'offline'];
  const sorted = [...agents].sort(
    (a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)
  );

  return (
    <PageShell
      title="Agents"
      subtitle={`${agents.length} registered`}
    >
      {agents.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-xs font-mono">
          No agents registered. Start a workflow to see agents here.
        </div>
      ) : (
        <>
          <StatusSummary agents={agents} />

          <div className="bg-surface-secondary border border-surface-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Agent', 'Role', 'Status', 'Capabilities', 'Current Task', 'Last Seen', 'Error'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-white/25 text-xs font-mono uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(agent => (
                  <AgentRow key={agent.id} agent={agent} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
