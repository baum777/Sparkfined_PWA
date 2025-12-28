import { Calendar, TrendingUp, TrendingDown, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ArchivedEntry, ArchiveReason } from "../types";

interface LogbookRowProps {
  entry: ArchivedEntry;
  onAddToJournal: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const reasonConfig: Record<ArchiveReason, { label: string; className: string }> = {
  full_exit: {
    label: "Full Exit",
    className: "bg-sentiment-bull-bg text-sentiment-bull border-sentiment-bull-border",
  },
  expired: {
    label: "Expired",
    className: "bg-surface-hover text-text-tertiary border-border-sf-subtle",
  },
  manual: {
    label: "Manual",
    className: "bg-brand/20 text-brand border-brand/30",
  },
};

export function LogbookRow({ entry, onAddToJournal, onViewDetails }: LogbookRowProps) {
  const pnl = entry.pnl.realizedUsd;
  const pnlPositive = pnl >= 0;
  const { label, className } = reasonConfig[entry.archiveReason];

  return (
    <Card 
      className="border-border-sf-subtle bg-surface"
      data-testid="logbook-row"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Token + Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold text-text-primary">
                {entry.token.symbol}
              </span>
              <span className="text-sm text-text-tertiary hidden sm:inline">
                {entry.token.name}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-medium ${className}`}
              >
                {label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <Calendar className="h-3 w-3" />
              {formatDate(entry.archivedAt)}
            </div>
          </div>

          {/* PnL */}
          <div
            className={`flex items-center gap-1 font-mono font-medium shrink-0 ${
              pnlPositive ? "text-sentiment-bull" : "text-sentiment-bear"
            }`}
          >
            {pnlPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {formatUsd(pnl)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            className="flex-1 bg-brand hover:bg-brand-hover text-black font-medium gap-1.5"
            onClick={() => onAddToJournal(entry.id)}
            data-testid="logbook-add-btn"
          >
            <Plus className="h-4 w-4" />
            Add to Journal
          </Button>
          {onViewDetails && (
            <Button
              size="sm"
              variant="outline"
              className="border-border-sf-moderate bg-surface-subtle hover:bg-surface-hover gap-1.5"
              onClick={() => onViewDetails(entry.id)}
              data-testid="logbook-view-btn"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
