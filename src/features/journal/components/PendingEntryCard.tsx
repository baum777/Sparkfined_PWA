import { useState } from "react";
import { Clock, TrendingUp, TrendingDown, Archive, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TxTimeline, ExtendedSections } from "./pending";
import type { AutoCapturedEntry, PendingStatus, ExtendedDataSettings } from "@/features/journal/types";

interface PendingEntryCardProps {
  entry: AutoCapturedEntry;
  extendedSettings?: ExtendedDataSettings;
  onConfirm: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRefreshExtended?: (id: string) => void;
}

// Default settings if not provided
const DEFAULT_SETTINGS: ExtendedDataSettings = {
  preset: "default",
  marketContext: true,
  technicalIndicators: true,
  onChainMetrics: false,
  customTimeframes: ["1h", "4h", "1d"],
};

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

const statusConfig: Record<PendingStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-brand/20 text-brand border-brand/30",
  },
  ready: {
    label: "Ready",
    className: "bg-sentiment-bull-bg text-sentiment-bull border-sentiment-bull-border",
  },
  expiring: {
    label: "Expiring",
    className: "bg-sentiment-neutral-bg text-sentiment-neutral border-sentiment-neutral-border",
  },
};

export function PendingEntryCard({ 
  entry, 
  extendedSettings = DEFAULT_SETTINGS,
  onConfirm, 
  onArchive, 
  onDelete,
  onRefreshExtended,
}: PendingEntryCardProps) {
  const [expanded, setExpanded] = useState<string | undefined>();
  
  const status = entry.status ?? "active";
  const timeLeft = entry.timeLeftMs ?? 0;
  const pnlTotal = entry.pnl.realizedUsd + entry.pnl.unrealizedUsd;
  const pnlPositive = pnlTotal >= 0;
  const { label, className } = statusConfig[status];
  const isExpiring = status === "expiring";

  return (
    <Card 
      className={`border-border-sf-subtle bg-surface overflow-hidden transition-colors ${
        isExpiring ? "border-sentiment-neutral/50" : ""
      }`}
      data-testid="pending-entry-card"
    >
      <CardContent className="p-0">
        <Accordion
          type="single"
          collapsible
          value={expanded}
          onValueChange={setExpanded}
        >
          <AccordionItem value="details" className="border-none">
            {/* Collapsed Content */}
            <div className="p-4">
              {/* Top Row: Token + PnL */}
              <div className="flex items-start justify-between gap-3">
                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-text-primary truncate">
                      {entry.token.symbol}
                    </span>
                    <span className="text-sm text-text-tertiary truncate hidden sm:inline">
                      {entry.token.name}
                    </span>
                  </div>

                  {/* Status Pill + Countdown */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-semibold ${className}`}
                    >
                      {label}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Clock className="h-3 w-3" />
                      {formatTimeLeft(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* PnL */}
                <div className="text-right shrink-0">
                  <div
                    className={`flex items-center justify-end gap-1 font-mono font-medium ${
                      pnlPositive ? "text-sentiment-bull" : "text-sentiment-bear"
                    }`}
                  >
                    {pnlPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatUsd(pnlTotal)}
                  </div>
                  <div
                    className={`text-xs font-mono ${
                      pnlPositive ? "text-sentiment-bull/70" : "text-sentiment-bear/70"
                    }`}
                  >
                    {formatPct(entry.pnl.pct)}
                  </div>
                </div>
              </div>

              {/* Position Info */}
              <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                <span>Size: {formatUsd(entry.position.sizeUsd)}</span>
                <span>Avg: {formatUsd(entry.position.avgEntry)}</span>
              </div>

              {/* Expiring Warning */}
              {isExpiring && (
                <div 
                  className="mt-3 p-2.5 rounded-lg bg-sentiment-neutral-bg/50 border border-sentiment-neutral-border/50 text-xs text-sentiment-neutral flex items-start gap-2"
                  data-testid="expiring-warning"
                >
                  <span className="text-base leading-none">⚠️</span>
                  <div>
                    <p className="font-medium">Expires soon</p>
                    <p className="text-sentiment-neutral/80 mt-0.5">
                      Confirm now to add notes before it moves to Logbook
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1 bg-brand hover:bg-brand-hover text-black font-medium"
                  onClick={() => onConfirm(entry.id)}
                  data-testid="pending-confirm-btn"
                >
                  Quick Log
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border-sf-moderate bg-surface-subtle hover:bg-surface-hover"
                  onClick={() => onArchive(entry.id)}
                  data-testid="pending-archive-btn"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-sentiment-bear-border/50 text-sentiment-bear hover:bg-sentiment-bear/10"
                      data-testid="pending-delete-btn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-surface border-border-sf-subtle">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-text-primary">Delete Entry?</AlertDialogTitle>
                      <AlertDialogDescription className="text-text-secondary">
                        This will permanently delete this pending entry. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-surface-subtle border-border-sf-moderate hover:bg-surface-hover">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-sentiment-bear hover:bg-sentiment-bear/90 text-white"
                        onClick={() => onDelete(entry.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Expand Trigger */}
            <AccordionTrigger 
              className="px-4 py-2.5 border-t border-border-sf-subtle text-xs text-text-tertiary hover:text-text-secondary hover:no-underline hover:bg-surface-subtle/50 transition-colors [&[data-state=open]>svg]:rotate-180"
              data-testid="expand-trigger"
            >
              <span>View Details</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform duration-200" />
            </AccordionTrigger>

            {/* Expanded Content */}
            <AccordionContent className="px-4 pb-4 pt-2">
              {/* Transaction Timeline */}
              <div>
                <h4 className="text-xs font-medium text-text-secondary mb-2">
                  Transactions ({entry.txs.length})
                </h4>
                <TxTimeline transactions={entry.txs} />
              </div>

              {/* Extended Data Sections */}
              <ExtendedSections
                extended={entry.extended}
                settings={extendedSettings}
                onRefresh={onRefreshExtended ? () => onRefreshExtended(entry.id) : undefined}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
