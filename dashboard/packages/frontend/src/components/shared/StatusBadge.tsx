// ============================================================
// STATUS BADGE
// Reusable colored badge for status values (agent status, task status, etc.)
// ============================================================

import React from 'react';

type Status =
  | 'idle' | 'running' | 'waiting' | 'blocked' | 'error' | 'offline'    // agent
  | 'open' | 'in-progress' | 'completed' | 'cancelled' | 'deferred'     // task
  | 'pending' | 'active' | 'skipped' | 'failed'                          // stage
  | 'healthy' | 'degraded' | 'critical';                                  // system

// Color map for each status
const STATUS_COLORS: Record<string, string> = {
  // Green = good
  running: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
  active: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
  completed: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
  healthy: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
  // Blue = neutral active
  'in-progress': 'bg-accent/20 text-accent border border-accent/30',
  open: 'bg-accent/20 text-accent border border-accent/30',
  // Yellow = warning
  waiting: 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30',
  blocked: 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30',
  degraded: 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30',
  deferred: 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30',
  // Red = error
  error: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
  failed: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
  critical: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
  // Gray = inactive
  idle: 'bg-white/10 text-white/50 border border-white/10',
  offline: 'bg-white/10 text-white/50 border border-white/10',
  pending: 'bg-white/10 text-white/50 border border-white/10',
  cancelled: 'bg-white/10 text-white/40 border border-white/10',
  skipped: 'bg-white/10 text-white/40 border border-white/10',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-white/10 text-white/50';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider ${colorClass} ${className}`}>
      {status}
    </span>
  );
}
