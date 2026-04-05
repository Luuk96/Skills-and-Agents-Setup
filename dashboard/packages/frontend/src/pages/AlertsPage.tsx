import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { PageShell } from '../components/layout/PageShell';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { Alert } from '@dashboard/core';

function severityIcon(severity: string) {
  switch (severity) {
    case 'critical': return <AlertTriangle size={14} className="text-accent-red" />;
    case 'warning': return <AlertTriangle size={14} className="text-accent-yellow" />;
    default: return <Info size={14} className="text-accent-cyan" />;
  }
}

function severityBg(severity: string) {
  switch (severity) {
    case 'critical': return 'border-accent-red/40 bg-accent-red/5';
    case 'warning': return 'border-accent-yellow/40 bg-accent-yellow/5';
    default: return 'border-accent-cyan/30 bg-accent-cyan/5';
  }
}

function AlertItem({ alert, onAck }: { alert: Alert; onAck: () => void }) {
  const time = new Date(alert.triggeredAt).toLocaleTimeString();
  return (
    <div className={`border rounded-lg p-4 ${severityBg(alert.severity)} ${alert.status === 'acknowledged' ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {severityIcon(alert.severity)}
          <div>
            <div className="text-xs font-mono font-semibold text-white">{alert.title}</div>
            <div className="text-xs font-mono text-white/60 mt-0.5">{alert.message}</div>
            <div className="text-xs font-mono text-white/25 mt-1">{time} · rule: {alert.ruleId}</div>
          </div>
        </div>
        {alert.status === 'active' && (
          <button
            onClick={onAck}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded border border-surface-border text-white/40 hover:text-white hover:border-white/30 text-xs font-mono transition-colors"
          >
            <CheckCircle size={10} />
            ack
          </button>
        )}
        {alert.status === 'acknowledged' && (
          <span className="text-xs font-mono text-white/25">acknowledged</span>
        )}
      </div>
    </div>
  );
}

export function AlertsPage() {
  const { alerts, acknowledgeAlert, snapshot } = useDashboardStore(s => ({
    alerts: s.alerts,
    acknowledgeAlert: s.acknowledgeAlert,
    snapshot: s.snapshot,
  }));

  // Merge store alerts with snapshot alerts
  const snapshotAlerts = snapshot?.alerts ?? [];
  const allAlerts = alerts.length > 0 ? alerts : snapshotAlerts;

  const active = allAlerts.filter(a => a.status === 'active');
  const acknowledged = allAlerts.filter(a => a.status === 'acknowledged');

  return (
    <PageShell
      title="Alerts & Diagnostics"
      subtitle={`${active.length} active alerts`}
    >
      {allAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <CheckCircle size={24} className="text-accent-green" />
          <span className="text-white/30 text-xs font-mono">No alerts. System is healthy.</span>
        </div>
      ) : (
        <div className="space-y-5">
          {active.length > 0 && (
            <div>
              <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
                Active ({active.length})
              </div>
              <div className="space-y-2">
                {active.map(a => (
                  <AlertItem key={a.id} alert={a} onAck={() => acknowledgeAlert(a.id)} />
                ))}
              </div>
            </div>
          )}
          {acknowledged.length > 0 && (
            <div>
              <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
                Acknowledged ({acknowledged.length})
              </div>
              <div className="space-y-2">
                {acknowledged.map(a => (
                  <AlertItem key={a.id} alert={a} onAck={() => {}} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
