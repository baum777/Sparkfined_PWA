import React from 'react';
import type { WatchlistRow, WatchlistTrendSnapshot } from '@/store/watchlistStore';

interface WatchlistDetailPanelProps {
  row?: WatchlistRow;
  trend?: WatchlistTrendSnapshot;
  onOpenChart?: (row?: WatchlistRow) => void;
  onOpenReplay?: (row?: WatchlistRow) => void;
  onCreateAlert?: (row?: WatchlistRow) => void;
  onAddJournal?: (row?: WatchlistRow) => void;
  onOpenPlaybook?: (row?: WatchlistRow) => void;
}

export default function WatchlistDetailPanel({
  row,
  trend,
  onOpenChart,
  onOpenReplay,
  onCreateAlert,
  onAddJournal,
  onOpenPlaybook,
}: WatchlistDetailPanelProps) {
  if (!row) {
    return (
      <div
        className="card-bordered flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-dashed px-6 py-10 text-center"
        data-testid="watchlist-detail-empty"
      >
        <p className="text-sm text-text-secondary">Select an asset on the left to see more context here.</p>
      </div>
    );
  }

  return (
    <div
      className="card-glass space-y-6 rounded-2xl p-6 text-text-secondary"
      data-testid="watchlist-detail-panel"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-text-primary" data-testid="watchlist-detail-symbol">
          {row.symbol}
        </h2>
        <p className="text-sm text-text-secondary">{row.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Price</p>
          <p className="mt-1 text-lg font-semibold text-amber-200">{row.price}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">24h change</p>
          <p className={`mt-1 text-lg font-semibold ${getChangeAccent(row.change24h)}`}>
            {row.change24h}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-text-tertiary">Session</p>
        <span className="inline-flex items-center rounded-full border border-border-moderate bg-surface-skeleton px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-primary">
          {row.session}
        </span>
      </div>

      <div className="space-y-4 border-t border-border-subtle pt-6">
        <div className="card-bordered rounded-xl p-4">
          <div className="flex flex-col gap-3 text-sm text-text-secondary">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Next actions</p>
              <span className="text-[11px] text-text-secondary">Keep flow near the selected asset.</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onOpenChart?.(row)}
                className="btn btn-primary btn-sm justify-between"
                data-testid="button-open-chart"
              >
                Open chart
                <span aria-hidden>↗</span>
              </button>
              <button
                type="button"
                onClick={() => onCreateAlert?.(row)}
                className="btn btn-ghost btn-sm justify-between border border-border"
                data-testid="button-create-alert"
              >
                Create alert
                <span aria-hidden>•</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenReplay?.(row)}
                className="btn btn-outline btn-sm justify-between"
                data-testid="button-open-replay-from-watchlist"
              >
                Open replay
                <span aria-hidden>⏯</span>
              </button>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onAddJournal?.(row)}
                  className="btn btn-ghost btn-sm"
                  data-testid="button-add-to-journal"
                >
                  Add to journal
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPlaybook?.(row)}
                  className="btn btn-ghost btn-sm"
                  data-testid="button-open-playbook"
                >
                  Link playbook
                </button>
              </div>
            </div>
          </div>
        </div>
        <SocialTrendCard trend={trend} />
      </div>
    </div>
  );
}

function getChangeAccent(change: string) {
  const trimmed = change.trim();

  if (trimmed.startsWith('-')) {
    return 'text-rose-300';
  }

  if (trimmed.startsWith('+')) {
    return 'text-emerald-300';
  }

  return 'text-zinc-200';
}

function SocialTrendCard({ trend }: { trend?: WatchlistTrendSnapshot }) {
  if (!trend) {
    return (
      <div className="rounded-xl border border-border-moderate bg-surface-gradient p-4 text-xs text-text-secondary">
        No recent social trend signals yet. When Grok spots movement, you’ll see it here.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-sentiment-bull-border bg-sentiment-bull-bg p-4 text-text-secondary">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sentiment-bull">Social trend</p>
          <p className="text-sm text-text-primary">{trend.lastSnippet ?? 'Fresh signal detected.'}</p>
        </div>
        {trend.sentimentLabel && trend.sentimentLabel !== 'unknown' ? (
          <span className="inline-flex items-center rounded-full bg-sentiment-bull-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sentiment-bull">
            {trend.sentimentLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-text-tertiary">
        {trend.hypeLevel && trend.hypeLevel !== 'unknown' ? (
          <Badge label={`Hype: ${trend.hypeLevel}`} />
        ) : null}
        {typeof trend.trendingScore === 'number' ? <Badge label={`Score ${Math.round(trend.trendingScore * 100) / 100}`} /> : null}
        {trend.callToAction && trend.callToAction !== 'unknown' ? <Badge label={`CTA: ${trend.callToAction}`} /> : null}
        {typeof trend.alertRelevance === 'number' ? (
          <Badge label={`Relevance ${(trend.alertRelevance * 100).toFixed(0)}%`} />
        ) : null}
        <Badge label={`Updated ${new Date(trend.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC`} />
      </div>

      {trend.lastTweetUrl ? (
        <a
          href={trend.lastTweetUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sentiment-bull underline decoration-sentiment-bull/70 decoration-dotted underline-offset-4"
        >
          View source tweet
          <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border-moderate bg-surface-skeleton px-2.5 py-1 text-[11px] font-semibold text-text-primary">
      {label}
    </span>
  );
}
