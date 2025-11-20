import React from 'react';

interface WatchlistHeaderActionsProps {
  assetCount: number;
  isLoading: boolean;
  error?: string | null;
}

export function WatchlistHeaderActions({ assetCount, isLoading, error }: WatchlistHeaderActionsProps) {
  return (
    <div className="flex flex-col items-end gap-2 text-right text-sm text-text-secondary sm:flex-row sm:items-center sm:gap-3">
      <div className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-primary">
        {assetCount} assets
      </div>
      {isLoading ? (
        <span className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Refreshing prices…</span>
      ) : error ? (
        <span className="text-xs text-warn">Price data unavailable, showing last known values.</span>
      ) : null}
    </div>
  );
}
