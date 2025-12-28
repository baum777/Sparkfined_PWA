import { useState } from "react";
import { BookOpen, Calendar, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ConfirmedEntry, EmotionTag } from "../types";

interface ConfirmedViewProps {
  entries?: ConfirmedEntry[];
}

// Mock data for development
const MOCK_ENTRIES: ConfirmedEntry[] = [
  {
    id: "c1",
    token: { symbol: "BONK", name: "Bonk" },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 3600000).toISOString(),
    position: { avgEntry: 0.0000021, sizeUsd: 450 },
    pnl: { unrealizedUsd: 0, realizedUsd: 135, pct: 30 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 21000000, priceUsd: 0.0000021, valueUsd: 450 },
      { type: "SELL", time: new Date(Date.now() - 86400000).toISOString(), amount: 21000000, priceUsd: 0.00000273, valueUsd: 585 },
    ],
    confirmedAt: new Date(Date.now() - 86400000).toISOString(),
    enrichment: {
      emotion: "setup",
      notes: "Clean breakout setup with volume confirmation. Took profits at 2R target as planned. Good execution on entry timing.",
      tags: ["breakout", "volume", "2R"],
    },
  },
  {
    id: "c2",
    token: { symbol: "WIF", name: "dogwifhat" },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    position: { avgEntry: 2.34, sizeUsd: 1200 },
    pnl: { unrealizedUsd: 0, realizedUsd: -180, pct: -15 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 86400000 * 4).toISOString(), amount: 512, priceUsd: 2.34, valueUsd: 1200 },
      { type: "SELL", time: new Date(Date.now() - 86400000 * 3).toISOString(), amount: 512, priceUsd: 1.99, valueUsd: 1020 },
    ],
    confirmedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    enrichment: {
      emotion: "fomo",
      notes: "Chased after seeing Twitter hype. No clear setup, just wanted to be in. Cut loss when I realized the mistake.",
      tags: ["fomo", "no-setup", "lesson"],
    },
  },
  {
    id: "c3",
    token: { symbol: "POPCAT", name: "Popcat" },
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    position: { avgEntry: 0.89, sizeUsd: 890 },
    pnl: { unrealizedUsd: 0, realizedUsd: 267, pct: 30 },
    txs: [
      { type: "BUY", time: new Date(Date.now() - 86400000 * 6).toISOString(), amount: 1000, priceUsd: 0.89, valueUsd: 890 },
      { type: "SELL", time: new Date(Date.now() - 86400000 * 5).toISOString(), amount: 1000, priceUsd: 1.157, valueUsd: 1157 },
    ],
    confirmedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    enrichment: {
      emotion: "setup",
      notes: "Followed the plan. Entry at support, exit at resistance. Patient hold through the dip.",
      tags: ["plan", "patience", "support"],
    },
  },
];

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const emotionConfig: Record<EmotionTag, { emoji: string; label: string; className: string }> = {
  fomo: { emoji: "😰", label: "FOMO", className: "bg-sentiment-bear-bg text-sentiment-bear border-sentiment-bear-border" },
  setup: { emoji: "📊", label: "Setup", className: "bg-sentiment-bull-bg text-sentiment-bull border-sentiment-bull-border" },
  revenge: { emoji: "😤", label: "Revenge", className: "bg-sentiment-bear-bg text-sentiment-bear border-sentiment-bear-border" },
  fear: { emoji: "😨", label: "Fear", className: "bg-sentiment-neutral-bg text-sentiment-neutral border-sentiment-neutral-border" },
  greed: { emoji: "🤑", label: "Greed", className: "bg-sentiment-neutral-bg text-sentiment-neutral border-sentiment-neutral-border" },
};

export function ConfirmedView({ entries = MOCK_ENTRIES }: ConfirmedViewProps) {
  const [selectedEntry, setSelectedEntry] = useState<ConfirmedEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetails = (entry: ConfirmedEntry) => {
    setSelectedEntry(entry);
    setDetailOpen(true);
  };

  // Empty state
  if (entries.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center"
        data-testid="confirmed-empty-state"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-text-tertiary" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No journal entries yet
        </h3>
        <p className="text-sm text-text-secondary max-w-sm">
          Confirm pending trades with your notes and emotions to build your trading journal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="confirmed-list">
      {entries.map((entry) => {
        const pnl = entry.pnl.realizedUsd + entry.pnl.unrealizedUsd;
        const pnlPositive = pnl >= 0;
        const emotion = entry.enrichment.emotion;
        const emotionInfo = emotion ? emotionConfig[emotion] : null;

        return (
          <Card
            key={entry.id}
            className="border-border-sf-subtle bg-surface cursor-pointer hover:border-brand/30 transition-all hover:shadow-glow"
            onClick={() => handleViewDetails(entry)}
            data-testid="confirmed-entry-card"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                {/* Left: Token + Meta */}
                <div className="flex-1 min-w-0">
                  {/* Token + Emotion */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-semibold text-text-primary">
                      {entry.token.symbol}
                    </span>
                    {emotionInfo && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${emotionInfo.className}`}
                      >
                        {emotionInfo.emoji} {emotionInfo.label}
                      </Badge>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-text-tertiary mb-2">
                    <Calendar className="h-3 w-3" />
                    {formatDate(entry.confirmedAt)}
                  </div>

                  {/* Notes preview */}
                  {entry.enrichment.notes && (
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                      {entry.enrichment.notes}
                    </p>
                  )}

                  {/* Tags */}
                  {entry.enrichment.tags && entry.enrichment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.enrichment.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] bg-surface-subtle border-border-sf-subtle text-text-tertiary"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {entry.enrichment.tags.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-surface-subtle border-border-sf-subtle text-text-tertiary"
                        >
                          +{entry.enrichment.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: PnL + Arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
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
                      {formatUsd(pnl)}
                    </div>
                    <div
                      className={`text-xs font-mono ${
                        pnlPositive ? "text-sentiment-bull/70" : "text-sentiment-bear/70"
                      }`}
                    >
                      {formatPct(entry.pnl.pct)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-tertiary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent 
          className="bg-surface border-border-sf-subtle max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
          data-testid="entry-detail-modal"
        >
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-text-primary flex items-center gap-2">
                  {selectedEntry.token.symbol}
                  <span className="text-text-tertiary font-normal text-base">
                    {selectedEntry.token.name}
                  </span>
                </DialogTitle>
              </DialogHeader>

              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-surface-subtle border border-border-sf-subtle">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-text-secondary">Result</span>
                  <div
                    className={`flex items-center gap-1 font-mono font-semibold text-lg ${
                      (selectedEntry.pnl.realizedUsd + selectedEntry.pnl.unrealizedUsd) >= 0
                        ? "text-sentiment-bull"
                        : "text-sentiment-bear"
                    }`}
                  >
                    {(selectedEntry.pnl.realizedUsd + selectedEntry.pnl.unrealizedUsd) >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {formatUsd(selectedEntry.pnl.realizedUsd + selectedEntry.pnl.unrealizedUsd)}
                    <span className="text-sm opacity-70 ml-1">
                      ({formatPct(selectedEntry.pnl.pct)})
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-text-tertiary">Entry</span>
                    <p className="text-text-primary font-mono">{formatUsd(selectedEntry.position.avgEntry)}</p>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Size</span>
                    <p className="text-text-primary font-mono">{formatUsd(selectedEntry.position.sizeUsd)}</p>
                  </div>
                </div>
              </div>

              {/* Emotion */}
              {selectedEntry.enrichment.emotion && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Emotional State
                  </label>
                  <Badge
                    variant="outline"
                    className={`text-sm px-3 py-1.5 ${emotionConfig[selectedEntry.enrichment.emotion].className}`}
                  >
                    {emotionConfig[selectedEntry.enrichment.emotion].emoji}{" "}
                    {emotionConfig[selectedEntry.enrichment.emotion].label}
                  </Badge>
                </div>
              )}

              {/* Notes */}
              {selectedEntry.enrichment.notes && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Notes
                  </label>
                  <p className="text-sm text-text-primary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border-sf-subtle">
                    {selectedEntry.enrichment.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedEntry.enrichment.tags && selectedEntry.enrichment.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEntry.enrichment.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-brand/20 text-brand border-brand/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Transactions
                </label>
                <div className="space-y-1.5">
                  {selectedEntry.txs.map((tx, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-surface-subtle"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0 ${
                            tx.type === "BUY"
                              ? "text-sentiment-bull border-sentiment-bull-border bg-sentiment-bull-bg"
                              : "text-sentiment-bear border-sentiment-bear-border bg-sentiment-bear-bg"
                          }`}
                        >
                          {tx.type}
                        </Badge>
                        <span className="text-text-tertiary">
                          {formatDateTime(tx.time)}
                        </span>
                      </div>
                      <span className="font-mono text-text-primary">
                        {formatUsd(tx.valueUsd)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logged Date */}
              <div className="pt-2 border-t border-border-sf-subtle">
                <p className="text-xs text-text-tertiary">
                  Logged on {formatDate(selectedEntry.confirmedAt)}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
