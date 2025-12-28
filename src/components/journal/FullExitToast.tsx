import { useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FullExitToastProps {
  symbol: string;
  pnlUsd: number;
  pnlPct: number;
  onAddToJournal: () => void;
  onViewLogbook: () => void;
}

function formatUsd(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)}`;
}

function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function showFullExitToast({
  symbol,
  pnlUsd,
  pnlPct,
  onAddToJournal,
  onViewLogbook,
}: FullExitToastProps) {
  const pnlPositive = pnlUsd >= 0;
  const Icon = pnlPositive ? TrendingUp : TrendingDown;

  toast({
    title: `${symbol} Position Closed`,
    description: (
      <div className="flex flex-col gap-3">
        <div
          className={`flex items-center gap-2 font-mono font-semibold text-lg ${
            pnlPositive ? "text-sentiment-bull" : "text-sentiment-bear"
          }`}
        >
          <Icon className="h-5 w-5" />
          {formatUsd(pnlUsd)} ({formatPct(pnlPct)})
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddToJournal}
            className="flex-1 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-black text-sm font-medium transition-colors"
          >
            Add to Journal
          </button>
          <button
            onClick={onViewLogbook}
            className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover text-text-secondary text-sm font-medium border border-border-sf-subtle transition-colors"
          >
            View Logbook
          </button>
        </div>
      </div>
    ),
    duration: 10000,
  });
}
