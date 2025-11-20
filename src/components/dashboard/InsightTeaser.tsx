import React from 'react';
import Button from '@/components/ui/Button';

interface InsightTeaserProps {
  title: string;
  bias: 'long' | 'short' | 'neutral';
  confidenceLabel: string;
  summary: string;
}

const biasStyles: Record<InsightTeaserProps['bias'], string> = {
  long: 'border border-sentiment-bull-border bg-sentiment-bull-bg text-sentiment-bull',
  short: 'border border-sentiment-bear-border bg-sentiment-bear-bg text-sentiment-bear',
  neutral: 'border border-sentiment-neutral-border bg-sentiment-neutral-bg text-amber-200',
};

export default function InsightTeaser({ title, bias, confidenceLabel, summary }: InsightTeaserProps) {
  return (
    <div className="rounded-lg border border-border-moderate bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${biasStyles[bias]}`}>
          {bias === 'long' && 'Long'}
          {bias === 'short' && 'Short'}
          {bias === 'neutral' && 'Neutral'}
        </span>
      </div>

      <p className="mt-3 text-xs uppercase tracking-wide text-text-tertiary">Confidence: {confidenceLabel}</p>

      <p className="mt-2 text-sm text-text-secondary line-clamp-3 leading-relaxed">{summary}</p>

      <div className="mt-4">
        <Button size="sm" onClick={() => { /* TODO: wire navigation to analysis */ }}>
          View full analysis
        </Button>
      </div>
    </div>
  );
}
