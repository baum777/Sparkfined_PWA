import { TrendingUp, TrendingDown, Minus, RefreshCw, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type BiasDirection = "bullish" | "bearish" | "neutral";

interface DailyBiasCardProps {
  symbol?: string;
  bias?: BiasDirection;
  confidence?: number;
  bulletPoints?: string[];
  lastChecked?: Date;
  onRefresh?: () => void;
  onViewAnalysis?: () => void;
  onOpenChart?: () => void;
  isRefreshing?: boolean;
}

export function DailyBiasCard({ 
  symbol = "SOL",
  bias = "bullish", 
  confidence = 0,
  bulletPoints = [
    "Market structure shows higher lows with strong momentum on intraday timeframes.",
    "Watching for pullbacks to re-enter long positions with tight risk management."
  ],
  lastChecked = new Date(),
  onRefresh,
  onViewAnalysis,
  onOpenChart,
  isRefreshing = false,
}: DailyBiasCardProps) {
  const biasConfig = {
    bullish: {
      icon: TrendingUp,
      badgeClass: "badge-bull",
      label: "LONG HIGH",
    },
    bearish: {
      icon: TrendingDown,
      badgeClass: "badge-bear",
      label: "SHORT HIGH",
    },
    neutral: {
      icon: Minus,
      badgeClass: "badge-neutral",
      label: "NEUTRAL",
    },
  };

  const config = biasConfig[bias];

  return (
    <div 
      className="card-default w-full" 
      data-testid="dashboard-daily-bias"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <h3 className="text-xl font-semibold text-text-primary">
          {symbol} Daily Bias
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
          onClick={onRefresh}
          disabled={isRefreshing}
          data-testid="daily-bias-refresh"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-4">
        {/* Bias Label */}
        <span className={config.badgeClass}>
          {config.label}
        </span>

        {/* AI Summary Bullet Points */}
        <ul className="space-y-2">
          {bulletPoints.map((point, index) => (
            <li 
              key={index} 
              className="flex items-start gap-2 text-sm text-text-secondary"
            >
              <span className="mt-1.5 h-1 w-1 rounded-full bg-text-tertiary shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            onClick={onViewAnalysis}
            data-testid="daily-bias-view-analysis"
          >
            View full analysis
          </Button>
          <button
            className="btn-primary h-9 px-3 py-2 text-sm gap-1.5 inline-flex items-center"
            onClick={onOpenChart}
            data-testid="daily-bias-open-chart"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Open chart
          </button>
        </div>

        {/* Last Checked Timestamp */}
        <p className="text-xs text-text-tertiary pt-2 border-t border-border-sf-subtle">
          Last checked {format(lastChecked, "MM.dd HH:mm")}
        </p>
      </div>
    </div>
  );
}
