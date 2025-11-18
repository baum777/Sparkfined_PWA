import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import DashboardKpiStrip from '@/components/dashboard/DashboardKpiStrip';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardMainGrid from '@/components/dashboard/DashboardMainGrid';

const kpiItems = [
  { label: 'Net P&L', value: '+12.4%', trend: 'up' as const },
  { label: 'Win Rate', value: '63%', trend: 'flat' as const },
  { label: 'Alerts Armed', value: '5', trend: 'up' as const },
  { label: 'Journal Streak', value: '9 days', trend: 'up' as const },
];

export default function DashboardPageV2() {
  return (
    <DashboardShell
      title="Dashboard"
      actions={<DashboardQuickActions />}
      kpiStrip={<DashboardKpiStrip items={kpiItems} />}
    >
      <DashboardMainGrid
        primary={
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Primary panel</h2>
            <p className="text-sm text-zinc-400">
              Placeholder for future widgets such as charts, advanced insight, or AI copilots.
            </p>
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
              Primary panel (e.g. chart / advanced insight)
            </div>
          </div>
        }
        secondary={
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-white">Secondary panel</h3>
            <p className="text-sm text-zinc-400">
              Secondary surface for journal summaries, watchlists, or quick AI prompts.
            </p>
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-zinc-500">
              Secondary panel (e.g. journal summary / watchlist)
            </div>
          </div>
        }
      />
    </DashboardShell>
  );
}
