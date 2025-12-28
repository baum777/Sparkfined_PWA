import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, X, Mic, Camera } from "lucide-react";
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
import type { AutoCapturedEntry, ArchivedEntry, EmotionTag, EntryEnrichment } from "../types";

interface QuickLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AutoCapturedEntry | ArchivedEntry | null;
  onSave: (enrichment: EntryEnrichment) => void;
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

const EMOTIONS: { value: EmotionTag; emoji: string; label: string }[] = [
  { value: "fomo", emoji: "😰", label: "FOMO" },
  { value: "setup", emoji: "📊", label: "Setup" },
  { value: "revenge", emoji: "😤", label: "Revenge" },
  { value: "fear", emoji: "😨", label: "Fear" },
  { value: "greed", emoji: "🤑", label: "Greed" },
];

const INITIAL_STATE = {
  emotion: undefined as EmotionTag | undefined,
  notes: "",
  tagInput: "",
  tags: [] as string[],
};

export function QuickLogModal({ open, onOpenChange, entry, onSave, onSkip }: QuickLogModalProps) {
  const [emotion, setEmotion] = useState<EmotionTag | undefined>(INITIAL_STATE.emotion);
  const [notes, setNotes] = useState(INITIAL_STATE.notes);
  const [tagInput, setTagInput] = useState(INITIAL_STATE.tagInput);
  const [tags, setTags] = useState<string[]>(INITIAL_STATE.tags);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setEmotion(INITIAL_STATE.emotion);
      setNotes(INITIAL_STATE.notes);
      setTagInput(INITIAL_STATE.tagInput);
      setTags(INITIAL_STATE.tags);
    }
  }, [open]);

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
    onSave({
      emotion,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const handleSkip = () => {
    onSkip?.();
    onOpenChange(false);
  };

  if (!entry) return null;

  const pnlTotal = entry.pnl.realizedUsd + entry.pnl.unrealizedUsd;
  const pnlPositive = pnlTotal >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-surface border-border-sf-subtle max-w-md mx-4"
        data-testid="quick-log-modal"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Quick Log</DialogTitle>
        </DialogHeader>

        {/* Read-only Summary */}
        <div 
          className="p-4 rounded-xl bg-surface-subtle border border-border-sf-subtle"
          data-testid="quick-log-summary"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary text-lg">
                {entry.token.symbol}
              </span>
              <span className="text-text-tertiary text-sm">
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
              {formatUsd(pnlTotal)}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>Entry: {formatUsd(entry.position.avgEntry)}</span>
            <span>Size: {formatUsd(entry.position.sizeUsd)}</span>
            <span
              className={`font-mono ${pnlPositive ? "text-sentiment-bull" : "text-sentiment-bear"}`}
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
          <div className="flex flex-wrap gap-2" data-testid="emotion-buttons">
            {EMOTIONS.map((e) => (
              <button
                key={e.value}
                type="button"
                onClick={() => setEmotion(emotion === e.value ? undefined : e.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  emotion === e.value
                    ? "bg-brand text-black shadow-glow-brand"
                    : "bg-surface-subtle text-text-secondary border border-border-sf-subtle hover:border-brand/50"
                }`}
                data-testid={`emotion-${e.value}`}
              >
                {e.emoji} {e.label}
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
            className="min-h-[100px] bg-surface-subtle border-border-sf-moderate resize-none"
            data-testid="quick-log-notes"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tags (optional)
          </label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2" data-testid="tags-list">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-brand/20 text-brand border-brand/30 gap-1 pr-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white ml-0.5 p-0.5 rounded-full hover:bg-brand/30"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAddTag}
            placeholder="Add tags (press Enter)"
            className="bg-surface-subtle border-border-sf-moderate"
            data-testid="quick-log-tag-input"
          />
        </div>

        {/* Phase 2 Placeholders */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="gap-1.5 text-text-tertiary border-border-sf-subtle opacity-50 cursor-not-allowed"
            title="Coming in Phase 2"
          >
            <Mic className="h-4 w-4" />
            Voice
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="gap-1.5 text-text-tertiary border-border-sf-subtle opacity-50 cursor-not-allowed"
            title="Coming in Phase 2"
          >
            <Camera className="h-4 w-4" />
            Screenshot
          </Button>
          <span className="text-[10px] text-text-tertiary ml-auto">Phase 2</span>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {onSkip && (
            <Button
              variant="outline"
              onClick={handleSkip}
              className="border-border-sf-moderate bg-surface-subtle hover:bg-surface-hover"
              data-testid="quick-log-skip"
            >
              Skip
            </Button>
          )}
          <Button
            onClick={handleSave}
            className="flex-1 bg-brand hover:bg-brand-hover text-black font-medium"
            data-testid="quick-log-save"
          >
            Save to Journal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
