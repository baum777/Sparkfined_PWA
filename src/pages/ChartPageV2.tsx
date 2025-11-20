import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ChartHeaderActions from '@/components/chart/ChartHeaderActions';

export default function ChartPageV2() {
  return (
    <DashboardShell
      title="Chart"
      description="Trade-ready chart workspace with indicators, replay, drawings and exports."
      actions={<ChartHeaderActions />}
    >
      <div className="rounded-3xl border border-border-subtle bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Chart workspace migration</h2>
            <p className="mt-2 text-sm text-text-secondary">
              The V1 chart implementation has been archived. This V2 shell keeps the route active while the new chart
              experience is finalized.
            </p>
          </div>
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Migration in progress
          </div>
        </div>
        <div className="mt-6 grid gap-4 rounded-2xl bg-surface-subtle p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">What changed?</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
              <li>Legacy ChartPage removed from the active bundle.</li>
              <li>Archived V1 chart sections under `docs/archive/v1-migration-backup/`.</li>
              <li>Route remains available for upcoming V2 modules.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Next steps</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
              <li>Rewire to the V2 chart components once ready.</li>
              <li>Keep route-level smoke tests green during migration.</li>
              <li>Remove this notice after the new chart ships.</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
