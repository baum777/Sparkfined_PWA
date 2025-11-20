import React from 'react';

interface AnalysisHeaderActionsProps {
  activeTab: string;
  isMarketLoading: boolean;
  marketError?: string | null;
}

export function AnalysisHeaderActions({ activeTab, isMarketLoading, marketError }: AnalysisHeaderActionsProps) {
  return (
    <div className="flex flex-col items-end gap-2 text-right text-sm text-text-secondary sm:flex-row sm:items-center sm:gap-3">
      <div className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-primary">
        {activeTab} view
      </div>
      {isMarketLoading ? (
        <span className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Fetching snapshot…</span>
      ) : marketError ? (
        <span className="text-xs text-warn">{marketError}</span>
      ) : null}
    </div>
  );
}
