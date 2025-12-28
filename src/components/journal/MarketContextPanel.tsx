import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Upload, X, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_TAGS = [
  "breakout",
  "pullback",
  "reversal",
  "scalp",
  "swing",
  "momentum",
  "support",
  "resistance",
  "trend",
  "range",
];

interface MarketContextPanelProps {
  reasoning: string;
  expectation: string;
  imageUrl?: string;
  tags: string[];
  onReasoningChange: (value: string) => void;
  onExpectationChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onTagsChange: (tags: string[]) => void;
}

export function MarketContextPanel({
  reasoning,
  expectation,
  imageUrl,
  tags,
  onReasoningChange,
  onExpectationChange,
  onImageChange,
  onTagsChange,
}: MarketContextPanelProps) {
  const [open, setOpen] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageChange(file);
    }
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} data-testid="market-context-panel">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          data-testid="market-context-toggle"
        >
          <span className="font-medium">Market Context</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-4 space-y-6">
        {/* Trade Thesis Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Trade Thesis
          </h4>

          {/* Reasoning */}
          <div className="space-y-2">
            <Label htmlFor="reasoning" className="text-sm font-medium">
              Reasoning
            </Label>
            <Textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => onReasoningChange(e.target.value)}
              placeholder="Why are you taking this trade? What's your analysis?"
              className="min-h-[100px] resize-none"
              data-testid="reasoning-textarea"
            />
          </div>

          {/* Expectation */}
          <div className="space-y-2">
            <Label htmlFor="expectation" className="text-sm font-medium">
              Expectation
            </Label>
            <Input
              id="expectation"
              value={expectation}
              onChange={(e) => onExpectationChange(e.target.value)}
              placeholder="What outcome do you expect? e.g., 2R target, breakout to $X"
              data-testid="expectation-input"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Chart Screenshot</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="image-file-input"
          />
          
          {imageUrl ? (
            <div className="relative group">
              <img
                src={imageUrl}
                alt="Trade chart"
                className="w-full h-48 object-cover rounded-lg border"
                data-testid="uploaded-image-preview"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onImageChange(null)}
                data-testid="remove-image-btn"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              data-testid="image-drop-zone"
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Tags</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTags(!editingTags)}
              className="h-7 text-xs"
              data-testid="edit-tags-btn"
            >
              <Pencil className="h-3 w-3 mr-1" />
              {editingTags ? "Done" : "Edit"}
            </Button>
          </div>

          {/* Tag Input */}
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tag..."
              className="flex-1"
              data-testid="tag-input"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleAddTag(tagInput)}
              disabled={!tagInput.trim()}
              data-testid="add-tag-btn"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="selected-tags">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {tag}
                  {editingTags && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`remove-tag-${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          )}

          {/* Sample Tags */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick add:</p>
            <div className="flex flex-wrap gap-1" data-testid="sample-tags">
              {SAMPLE_TAGS.filter((t) => !tags.includes(t)).slice(0, 6).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => handleAddTag(tag)}
                  data-testid={`sample-tag-${tag}`}
                >
                  + {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
