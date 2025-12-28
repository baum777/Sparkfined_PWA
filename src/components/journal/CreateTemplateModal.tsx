import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Zap, Clock, TrendingUp, Plus } from "lucide-react";
import { JournalTemplate } from "./JournalHeader";
import { EmotionalStateValue } from "./EmotionalStateCards";

interface CreateTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: JournalTemplate) => void;
  currentState?: {
    emotionalState?: EmotionalStateValue;
    confidence?: number;
    conviction?: number;
    patternQuality?: number;
    reasoning?: string;
    tags?: string[];
  };
}

const ICON_OPTIONS = [
  { value: "scalp", label: "Scalp", icon: Zap },
  { value: "swing", label: "Swing", icon: Clock },
  { value: "daytrade", label: "Day Trade", icon: TrendingUp },
  { value: "breakout", label: "Breakout", icon: TrendingUp },
] as const;

const EMOTIONAL_STATE_OPTIONS: { value: EmotionalStateValue; label: string }[] = [
  { value: "fearful", label: "Fearful" },
  { value: "anxious", label: "Anxious" },
  { value: "neutral", label: "Neutral" },
  { value: "confident", label: "Confident" },
  { value: "euphoric", label: "Euphoric" },
];

const SAMPLE_TAGS = ["scalp", "swing", "breakout", "reversal", "momentum", "news", "earnings"];

export function CreateTemplateModal({
  open,
  onOpenChange,
  onSave,
  currentState,
}: CreateTemplateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<JournalTemplate["icon"]>("scalp");
  const [emotionalState, setEmotionalState] = useState<EmotionalStateValue | undefined>(
    currentState?.emotionalState
  );
  const [confidence, setConfidence] = useState(currentState?.confidence ?? 50);
  const [conviction, setConviction] = useState(currentState?.conviction ?? 50);
  const [patternQuality, setPatternQuality] = useState(currentState?.patternQuality ?? 50);
  const [notes, setNotes] = useState(currentState?.reasoning ?? "");
  const [tags, setTags] = useState<string[]>(currentState?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSelectSampleTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const template: JournalTemplate = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `Custom ${name} template`,
      icon,
      emotionalState,
      tags,
      notes,
    };

    onSave(template);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setIcon("scalp");
    setEmotionalState(undefined);
    setConfidence(50);
    setConviction(50);
    setPatternQuality(50);
    setNotes("");
    setTags([]);
    setTagInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-testid="create-template-modal"
      >
        <DialogHeader>
          <DialogTitle>Create Custom Template</DialogTitle>
          <DialogDescription>
            Save your preferred defaults as a reusable template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder="e.g., My Scalp Setup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="template-name-input"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Input
              id="template-description"
              placeholder="Short description of this template"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="template-description-input"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={icon} onValueChange={(v) => setIcon(v as JournalTemplate["icon"])}>
              <SelectTrigger data-testid="template-icon-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon className="h-4 w-4" />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Emotional State */}
          <div className="space-y-2">
            <Label>Default Emotional State</Label>
            <Select
              value={emotionalState ?? ""}
              onValueChange={(v) => setEmotionalState(v as EmotionalStateValue)}
            >
              <SelectTrigger data-testid="template-emotional-select">
                <SelectValue placeholder="Select default state" />
              </SelectTrigger>
              <SelectContent>
                {EMOTIONAL_STATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Confidence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Default Confidence</Label>
              <span className="text-sm text-muted-foreground">{confidence}%</span>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={([v]) => setConfidence(v)}
              min={0}
              max={100}
              step={1}
              data-testid="template-confidence-slider"
            />
          </div>

          {/* Default Conviction */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Default Conviction</Label>
              <span className="text-sm text-muted-foreground">{conviction}%</span>
            </div>
            <Slider
              value={[conviction]}
              onValueChange={([v]) => setConviction(v)}
              min={0}
              max={100}
              step={1}
              data-testid="template-conviction-slider"
            />
          </div>

          {/* Default Pattern Quality */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Default Pattern Quality</Label>
              <span className="text-sm text-muted-foreground">{patternQuality}%</span>
            </div>
            <Slider
              value={[patternQuality]}
              onValueChange={([v]) => setPatternQuality(v)}
              min={0}
              max={100}
              step={1}
              data-testid="template-pattern-slider"
            />
          </div>

          {/* Default Notes */}
          <div className="space-y-2">
            <Label htmlFor="template-notes">Default Notes / Reasoning</Label>
            <Textarea
              id="template-notes"
              placeholder="Pre-filled notes for this template..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="template-notes-input"
            />
          </div>

          {/* Default Tags */}
          <div className="space-y-3">
            <Label>Default Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                data-testid="template-tag-input"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                data-testid="template-add-tag-btn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2" data-testid="template-selected-tags">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/20"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Sample Tags */}
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSelectSampleTag(tag)}
                  data-testid={`template-sample-tag-${tag}`}
                >
                  + {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="template-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="gap-2"
            data-testid="template-save-btn"
          >
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
