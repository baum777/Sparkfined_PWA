import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

interface AiNotesSectionProps {
  aiNotes: string;
  onAiNotesChange: (value: string) => void;
  onGenerateNotes: () => void;
  isGenerating?: boolean;
}

export function AiNotesSection({
  aiNotes,
  onAiNotesChange,
  onGenerateNotes,
  isGenerating = false,
}: AiNotesSectionProps) {
  return (
    <div className="space-y-3" data-testid="ai-notes-section">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">AI Notes</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateNotes}
          disabled={isGenerating}
          className="gap-2"
          data-testid="generate-ai-notes-btn"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? "Generating..." : "Generate AI Note"}
        </Button>
      </div>
      
      <Textarea
        value={aiNotes}
        onChange={(e) => onAiNotesChange(e.target.value)}
        placeholder="AI-generated insights will appear here, or add your own notes..."
        className="min-h-[120px] resize-none"
        data-testid="ai-notes-textarea"
      />
      
      <p className="text-[10px] text-muted-foreground">
        AI notes are generated based on your trade context and emotional state.
      </p>
    </div>
  );
}
