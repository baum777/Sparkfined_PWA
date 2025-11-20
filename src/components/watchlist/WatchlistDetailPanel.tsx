import React from 'react';
import type { WatchlistRow, WatchlistTrendSnapshot } from '@/store/watchlistStore';

interface WatchlistDetailPanelProps {
  row?: WatchlistRow;
  trend?: WatchlistTrendSnapshot;
}

export default function WatchlistDetailPanel({ row, trend }: WatchlistDetailPanelProps) {
  if (!row) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center">
        <p className="text-sm text-zinc-400">Select an asset on the left to see more context here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-black/30 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">{row.symbol}</h2>
        <p className="text-sm text-zinc-400">{row.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Price</p>
          <p className="mt-1 text-lg font-semibold text-amber-200">{row.price}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">24h change</p>
          <p className={`mt-1 text-lg font-semibold ${getChangeAccent(row.change24h)}`}>
            {row.change24h}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">Session</p>
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200">
          {row.session}
        </span>
      </div>

      <div className="space-y-4 border-t border-white/5 pt-6">
        <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-center">
          <p className="text-xs text-zinc-400">Mini chart coming soon.</p>
        </div>
        <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-center">
          <p className="text-xs text-zinc-400">Links to Analysis and Journal will appear here.</p>
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
      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-zinc-900/40 to-black/40 p-4 text-xs text-zinc-400">
        No recent social trend signals yet. When Grok spots movement, you’ll see it here.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Social trend</p>
          <p className="text-sm text-white/80">{trend.lastSnippet ?? 'Fresh signal detected.'}</p>
        </div>
        {trend.sentimentLabel && trend.sentimentLabel !== 'unknown' ? (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
            {trend.sentimentLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-white/60">
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 underline decoration-emerald-500/70 decoration-dotted underline-offset-4"
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
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80">
      {label}
    </span>
  );
}
