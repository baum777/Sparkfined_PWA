import { BookOpen, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ConfirmedEntry, EmotionTag } from "@/features/journal/types";

interface ConfirmedJournalListProps {
  entries: ConfirmedEntry[];
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
    year: "numeric",
  });
}

const emotionEmojis: Record<EmotionTag, string> = {
  fomo: "😰",
  setup: "📊",
  revenge: "😤",
  fear: "😨",
  greed: "🤑",
};

const emotionLabels: Record<EmotionTag, string> = {
  fomo: "FOMO",
  setup: "Setup",
  revenge: "Revenge",
  fear: "Fear",
  greed: "Greed",
};

export function ConfirmedJournalList({ entries, onViewDetails }: ConfirmedJournalListProps) {
  if (entries.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center"
        data-testid="journal-empty-state"
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
    <div className="space-y-3" data-testid="journal-list">
      {entries.map((entry) => {
        const pnl = entry.pnl.realizedUsd + entry.pnl.unrealizedUsd;
        const pnlPositive = pnl >= 0;
        const emotion = entry.enrichment.emotion;

        return (
          <Card
            key={entry.id}
            className="border-border-sf-subtle bg-surface cursor-pointer hover:border-brand/30 transition-colors"
            onClick={() => onViewDetails?.(entry.id)}
            data-testid="journal-card"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                {/* Token + Emotion */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-primary">
                      {entry.token.symbol}
                    </span>
                    {emotion && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-surface-subtle border-border-sf-subtle"
                      >
                        {emotionEmojis[emotion]} {emotionLabels[emotion]}
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
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {entry.enrichment.notes}
                    </p>
                  )}

                  {/* Tags */}
                  {entry.enrichment.tags && entry.enrichment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.enrichment.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] border-border-sf-subtle text-text-tertiary"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {entry.enrichment.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-border-sf-subtle text-text-tertiary"
                        >
                          +{entry.enrichment.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
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
                    {formatUsd(pnl)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
