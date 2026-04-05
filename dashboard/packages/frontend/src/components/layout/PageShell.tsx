// Wraps every page with a consistent title + scrollable content area
import React from 'react';

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border flex-shrink-0">
        <div>
          <h1 className="text-sm font-mono font-semibold text-white tracking-wide uppercase">{title}</h1>
          {subtitle && <p className="text-xs text-white/40 font-mono mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5">
        {children}
      </div>
    </div>
  );
}
