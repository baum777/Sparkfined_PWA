import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleNavigate = React.useCallback(() => navigate('/analysis-v2'), [navigate]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border-moderate bg-gradient-to-br from-surface to-surface-elevated p-6 shadow-sm transition-all hover:border-border-hover hover:shadow-glow-cyan">
      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${biasStyles[bias]}`}>
            {bias === 'long' && '↗ Long'}
            {bias === 'short' && '↘ Short'}
            {bias === 'neutral' && '→ Neutral'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">Confidence</span>
          <span className="text-xs font-medium text-text-secondary">{confidenceLabel}</span>
        </div>

        <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">{summary}</p>

        <div className="pt-2">
          <Button size="sm" onClick={handleNavigate}>
            View Analysis →
          </Button>
        </div>
      </div>
    </div>
  );
}
