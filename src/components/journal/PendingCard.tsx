import { useState } from "react";
import { ChevronDown, Archive, Trash2, Clock, TrendingUp, TrendingDown } from "lucide-react";
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
import type { AutoCapturedEntry } from "@/features/journal/types";

interface PendingCardProps {
  entry: AutoCapturedEntry;
  onConfirm: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

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

export function PendingCard({ entry, onConfirm, onArchive, onDelete }: PendingCardProps) {
  const [expanded, setExpanded] = useState<string | undefined>();

  const statusColors = {
    active: "bg-brand/20 text-brand border-brand/30",
    ready: "bg-sentiment-bull-bg text-sentiment-bull border-sentiment-bull-border",
    expiring: "bg-sentiment-neutral-bg text-sentiment-neutral border-sentiment-neutral-border",
  };

  const statusLabels = {
    active: "Active",
    ready: "Ready",
    expiring: "Expiring Soon",
  };

  const pnlPositive = entry.pnl.pct >= 0;
  const timeLeft = entry.timeLeftMs ?? 0;
  const status = entry.status ?? "active";

  return (
    <Card 
      className="border-border-sf-subtle bg-surface overflow-hidden"
      data-testid="pending-card"
    >
      <CardContent className="p-0">
        <Accordion
          type="single"
          collapsible
          value={expanded}
          onValueChange={setExpanded}
        >
          <AccordionItem value="details" className="border-none">
            {/* Collapsed Header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-primary truncate">
                      {entry.token.symbol}
                    </span>
                    <span className="text-sm text-text-tertiary truncate">
                      {entry.token.name}
                    </span>
                  </div>

                  {/* Status + Countdown */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase ${statusColors[status]}`}
                    >
                      {statusLabels[status]}
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
                    className={`flex items-center gap-1 font-mono font-medium ${
                      pnlPositive ? "text-sentiment-bull" : "text-sentiment-bear"
                    }`}
                  >
                    {pnlPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatUsd(entry.pnl.realizedUsd + entry.pnl.unrealizedUsd)}
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
              {status === "expiring" && (
                <div className="mt-3 p-2 rounded-lg bg-sentiment-neutral-bg/50 border border-sentiment-neutral-border text-xs text-sentiment-neutral">
                  ⚠️ Expires soon — confirm now to save your notes
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1 bg-brand hover:bg-brand-hover text-black"
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
                      className="border-sentiment-bear-border text-sentiment-bear hover:bg-sentiment-bear/10"
                      data-testid="pending-delete-btn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-surface border-border-sf-subtle">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                      <AlertDialogDescription className="text-text-secondary">
                        This will permanently delete this pending entry. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-surface-subtle border-border-sf-moderate">
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
            <AccordionTrigger className="px-4 py-2 border-t border-border-sf-subtle text-xs text-text-tertiary hover:no-underline hover:bg-surface-subtle">
              <span>View Details</span>
            </AccordionTrigger>

            {/* Expanded Content */}
            <AccordionContent className="px-4 pb-4">
              {/* Transaction Timeline */}
              <div className="mt-2">
                <h4 className="text-xs font-medium text-text-secondary mb-2">
                  Transactions
                </h4>
                <div className="space-y-1.5">
                  {entry.txs.map((tx, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-surface-subtle"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            tx.type === "BUY"
                              ? "text-sentiment-bull border-sentiment-bull-border"
                              : "text-sentiment-bear border-sentiment-bear-border"
                          }`}
                        >
                          {tx.type}
                        </Badge>
                        <span className="text-text-tertiary">
                          {new Date(tx.time).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-text-secondary">
                          {tx.amount.toLocaleString()}
                        </span>
                        <span className="text-text-tertiary">
                          @ {formatUsd(tx.priceUsd)}
                        </span>
                        <span className="text-text-primary">
                          {formatUsd(tx.valueUsd)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extended Data Sections */}
              {entry.extended?.marketContext && (
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-text-secondary mb-2">
                    Market Context
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {entry.extended.marketContext.marketCapCategory && (
                      <Badge variant="secondary" className="text-[10px]">
                        {entry.extended.marketContext.marketCapCategory} cap
                      </Badge>
                    )}
                    {entry.extended.marketContext.volume24h && (
                      <Badge variant="secondary" className="text-[10px]">
                        Vol: {formatUsd(entry.extended.marketContext.volume24h)}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {entry.extended?.technical && (
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-text-secondary mb-2">
                    Technical
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {entry.extended.technical.rsiCondition && (
                      <Badge variant="secondary" className="text-[10px]">
                        RSI: {entry.extended.technical.rsiCondition}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {entry.extended?.onChain && (
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-text-secondary mb-2">
                    On-Chain
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {entry.extended.onChain.whaleConcentration && (
                      <Badge variant="secondary" className="text-[10px]">
                        Whales: {entry.extended.onChain.whaleConcentration}%
                      </Badge>
                    )}
                    {entry.extended.onChain.tokenMaturity && (
                      <Badge variant="secondary" className="text-[10px]">
                        {entry.extended.onChain.tokenMaturity}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
