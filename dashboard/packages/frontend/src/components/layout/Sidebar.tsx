// ============================================================
// SIDEBAR NAVIGATION
// Links to all dashboard pages with active state highlighting.
// ============================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Bot, GitBranch, CheckSquare,
  Zap, Activity, AlertTriangle, FolderOpen, History, Network,
} from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const NAV_ITEMS = [
  { to: '/',          icon: LayoutDashboard, label: 'Overview'    },
  { to: '/network',   icon: Network,         label: 'Network'     },
  { to: '/agents',    icon: Bot,             label: 'Agents'      },
  { to: '/workflows', icon: GitBranch,       label: 'Workflows'   },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks'       },
  { to: '/skills',    icon: Zap,             label: 'Skills'      },
  { to: '/events',    icon: Activity,        label: 'Events'      },
  { to: '/alerts',    icon: AlertTriangle,   label: 'Alerts'      },
  { to: '/project',   icon: FolderOpen,      label: 'Project'     },
  { to: '/replay',    icon: History,         label: 'Replay'      },
];

export function Sidebar() {
  const snapshot = useDashboardStore(s => s.snapshot);
  const alerts = useDashboardStore(s => s.alerts);
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;

  return (
    <aside className="w-48 flex-shrink-0 bg-surface-secondary border-r border-surface-border flex flex-col">
      {/* Logo / title */}
      <div className="px-4 py-4 border-b border-surface-border">
        <div className="text-accent font-mono font-semibold text-sm tracking-wider">AGENT DASHBOARD</div>
        <div className="text-white/30 text-xs mt-0.5 font-mono">v1.0.0</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-xs font-mono transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent border-r-2 border-accent'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={14} />
            <span>{label}</span>
            {/* Alert badge on the Alerts link */}
            {label === 'Alerts' && criticalCount > 0 && (
              <span className="ml-auto bg-accent-red text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {criticalCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Session info at bottom */}
      {snapshot?.currentSessionId && (
        <div className="px-4 py-3 border-t border-surface-border">
          <div className="text-white/30 text-xs font-mono">SESSION</div>
          <div className="text-white/50 text-xs font-mono truncate mt-0.5">
            {snapshot.currentSessionId}
          </div>
        </div>
      )}
    </aside>
  );
}
