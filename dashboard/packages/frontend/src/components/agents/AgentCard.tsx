// ============================================================
// AGENT CARD
// Displays the live state of a single agent.
// ============================================================

import React from 'react';
import type { Agent } from '@dashboard/core';
import { StatusBadge } from '../shared/StatusBadge';
import { Bot, Clock, AlertCircle } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const lastSeen = new Date(agent.lastSeenAt);
  const secondsAgo = Math.floor((Date.now() - lastSeen.getTime()) / 1000);
  const lastSeenLabel = secondsAgo < 60
    ? `${secondsAgo}s ago`
    : `${Math.floor(secondsAgo / 60)}m ago`;

  return (
    <div className={`
      bg-surface-secondary border rounded-lg p-4 transition-all
      ${agent.status === 'error' || agent.status === 'blocked'
        ? 'border-accent-red/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
        : agent.status === 'running'
        ? 'border-accent-green/30'
        : 'border-surface-border'
      }
    `}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${agent.status === 'running' ? 'bg-accent-green/10' : 'bg-white/5'}`}>
            <Bot size={14} className={agent.status === 'running' ? 'text-accent-green' : 'text-white/40'} />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-white">{agent.name}</div>
            <div className="text-xs font-mono text-white/30">{agent.type}</div>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Current task */}
      {agent.currentTaskId && (
        <div className="mb-2 px-2 py-1.5 bg-surface rounded border border-surface-border">
          <div className="text-xs text-white/30 font-mono mb-0.5">CURRENT TASK</div>
          <div className="text-xs text-white/70 font-mono truncate">{agent.currentTaskId}</div>
        </div>
      )}

      {/* Workflow / stage */}
      {agent.currentWorkflowId && (
        <div className="mb-2 px-2 py-1.5 bg-surface rounded border border-surface-border">
          <div className="text-xs text-white/30 font-mono mb-0.5">WORKFLOW / STAGE</div>
          <div className="text-xs text-accent-purple/80 font-mono truncate">{agent.currentWorkflowId}</div>
          {agent.currentStageId && (
            <div className="text-xs text-white/40 font-mono truncate">{agent.currentStageId}</div>
          )}
        </div>
      )}

      {/* Error message */}
      {agent.errorMessage && (
        <div className="mb-2 px-2 py-1.5 bg-accent-red/10 rounded border border-accent-red/20 flex gap-2">
          <AlertCircle size={12} className="text-accent-red flex-shrink-0 mt-0.5" />
          <div className="text-xs text-accent-red font-mono">{agent.errorMessage}</div>
        </div>
      )}

      {/* Footer: last seen */}
      <div className="flex items-center gap-1 text-white/25 text-xs font-mono">
        <Clock size={10} />
        <span>{lastSeenLabel}</span>
        {agent.parentAgentId && (
          <span className="ml-auto text-white/20">child of {agent.parentAgentId}</span>
        )}
      </div>
    </div>
  );
}
