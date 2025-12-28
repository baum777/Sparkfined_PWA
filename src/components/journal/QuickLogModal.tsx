import { useState } from "react";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AutoCapturedEntry, ArchivedEntry, EmotionTag, EntryEnrichment } from "@/features/journal/types";

interface QuickLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AutoCapturedEntry | ArchivedEntry | null;
  onSave: (id: string, enrichment: EntryEnrichment) => void;
  onSkip?: () => void;
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

const emotions: { value: EmotionTag; emoji: string; label: string }[] = [
  { value: "fomo", emoji: "😰", label: "FOMO" },
  { value: "setup", emoji: "📊", label: "Setup" },
  { value: "revenge", emoji: "😤", label: "Revenge" },
  { value: "fear", emoji: "😨", label: "Fear" },
  { value: "greed", emoji: "🤑", label: "Greed" },
];

export function QuickLogModal({ open, onOpenChange, entry, onSave, onSkip }: QuickLogModalProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTag | undefined>();
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Reset on close
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedEmotion(undefined);
      setNotes("");
      setTagInput("");
      setTags([]);
    }
    onOpenChange(isOpen);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    if (!entry) return;
    onSave(entry.id, {
      emotion: selectedEmotion,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    handleOpenChange(false);
  };

  if (!entry) return null;

  const pnl = entry.pnl.realizedUsd + entry.pnl.unrealizedUsd;
  const pnlPositive = pnl >= 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="bg-surface border-border-sf-subtle max-w-md"
        data-testid="quick-log-modal"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Quick Log</DialogTitle>
        </DialogHeader>

        {/* Read-only Summary */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border-sf-subtle">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold text-text-primary text-lg">
                {entry.token.symbol}
              </span>
              <span className="text-text-tertiary text-sm ml-2">
                {entry.token.name}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 font-mono font-semibold ${
                pnlPositive ? "text-sentiment-bull" : "text-sentiment-bear"
              }`}
            >
              {pnlPositive ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {formatUsd(pnl)}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>Entry: {formatUsd(entry.position.avgEntry)}</span>
            <span>Size: {formatUsd(entry.position.sizeUsd)}</span>
            <span
              className={pnlPositive ? "text-sentiment-bull" : "text-sentiment-bear"}
            >
              {formatPct(entry.pnl.pct)}
            </span>
          </div>
        </div>

        {/* Emotion Selection */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            How did you feel?
          </label>
          <div className="flex flex-wrap gap-2">
            {emotions.map((emotion) => (
              <button
                key={emotion.value}
                type="button"
                onClick={() =>
                  setSelectedEmotion(
                    selectedEmotion === emotion.value ? undefined : emotion.value
                  )
                }
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedEmotion === emotion.value
                    ? "bg-brand text-black shadow-glow-brand"
                    : "bg-surface-subtle text-text-secondary border border-border-sf-subtle hover:border-brand/50"
                }`}
                data-testid={`emotion-${emotion.value}`}
              >
                {emotion.emoji} {emotion.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Notes (optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was your reasoning? What did you learn?"
            className="min-h-[100px] bg-surface-subtle border-border-sf-moderate"
            data-testid="quick-log-notes"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tags (optional)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-brand/20 text-brand border-brand/30 gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAddTag}
            placeholder="Add tags (press Enter)"
            className="bg-surface-subtle border-border-sf-moderate"
            data-testid="quick-log-tags"
          />
        </div>

        <DialogFooter className="gap-2">
          {onSkip && (
            <Button
              variant="outline"
              onClick={() => {
                onSkip();
                handleOpenChange(false);
              }}
              className="border-border-sf-moderate bg-surface-subtle hover:bg-surface-hover"
              data-testid="quick-log-skip"
            >
              Skip
            </Button>
          )}
          <Button
            onClick={handleSave}
            className="flex-1 bg-brand hover:bg-brand-hover text-black"
            data-testid="quick-log-save"
          >
            Save to Journal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
