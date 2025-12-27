import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TrendDirection } from '@/features/watchlist/types';
import { cn } from '@/lib/utils';

interface TrendPillProps {
  trend: TrendDirection;
  relevance?: number;
}

const trendConfig: Record<TrendDirection, { icon: typeof TrendingUp; label: string; className: string }> = {
  bullish: {
    icon: TrendingUp,
    label: 'Bullish',
    className: 'bg-success/15 text-success border-success/30',
  },
  bearish: {
    icon: TrendingDown,
    label: 'Bearish',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  neutral: {
    icon: Minus,
    label: 'Neutral',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function TrendPill({ trend, relevance }: TrendPillProps) {
  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium', config.className)}
      data-testid="trend-pill"
    >
      <span className="text-muted-foreground">Trend</span>
      <span className="opacity-50">·</span>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
      {relevance !== undefined && (
        <span className="opacity-70">{relevance}%</span>
      )}
    </Badge>
  );
}
