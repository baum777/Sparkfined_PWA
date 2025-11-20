import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ChartHeaderActions from '@/components/chart/ChartHeaderActions';
import LegacyChartPage from './ChartPage';

export default function ChartPageV2() {
  return (
    <DashboardShell
      title="Chart"
      description="Trade-ready chart workspace with indicators, replay, drawings and exports."
      actions={<ChartHeaderActions />}
    >
      <div className="rounded-3xl border border-white/5 bg-black/30 p-4 sm:p-6">
        <LegacyChartPage />
      </div>
    </DashboardShell>
  );
}
