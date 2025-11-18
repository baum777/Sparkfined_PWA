import React from 'react';
import Button from '@/components/ui/Button';

interface InsightTeaserProps {
  title: string;
  bias: 'long' | 'short' | 'neutral';
  confidenceLabel: string;
  summary: string;
}

const biasStyles: Record<InsightTeaserProps['bias'], string> = {
  long: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  short: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
  neutral: 'bg-zinc-800 text-zinc-200 border border-zinc-700',
};

export default function InsightTeaser({ title, bias, confidenceLabel, summary }: InsightTeaserProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${biasStyles[bias]}`}>
          {bias === 'long' && 'Long'}
          {bias === 'short' && 'Short'}
          {bias === 'neutral' && 'Neutral'}
        </span>
      </div>

      <p className="mt-3 text-xs uppercase tracking-wide text-zinc-400">Confidence: {confidenceLabel}</p>

      <p className="mt-2 text-sm text-zinc-200 line-clamp-3 leading-relaxed">{summary}</p>

      <div className="mt-4">
        <Button size="sm" onClick={() => { /* TODO: wire navigation to analysis */ }}>
          View full analysis
        </Button>
      </div>
    </div>
  );
}
