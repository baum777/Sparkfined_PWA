import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { JournalHeader, JournalTemplate } from "./JournalHeader";
import { EmotionalStateCards, EmotionalStateValue } from "./EmotionalStateCards";
import { ConfidenceSlider } from "./ConfidenceSlider";
import { AdditionalSliders } from "./AdditionalSliders";
import { MarketContextPanel } from "./MarketContextPanel";
import { AiNotesSection } from "./AiNotesSection";
import { CreateTemplateModal } from "./CreateTemplateModal";

interface JournalFormState {
  template?: JournalTemplate;
  emotionalState?: EmotionalStateValue;
  confidence: number;
  conviction: number;
  patternQuality: number;
  reasoning: string;
  expectation: string;
  imageFile?: File;
  imageUrl?: string;
  tags: string[];
  aiNotes: string;
}

const INITIAL_STATE: JournalFormState = {
  template: undefined,
  emotionalState: undefined,
  confidence: 50,
  conviction: 50,
  patternQuality: 50,
  reasoning: "",
  expectation: "",
  imageFile: undefined,
  imageUrl: undefined,
  tags: [],
  aiNotes: "",
};

interface JournalEntryFormProps {
  onSubmit?: (data: JournalFormState) => void;
}

export function JournalEntryForm({ onSubmit }: JournalEntryFormProps) {
  const [state, setState] = useState<JournalFormState>(INITIAL_STATE);
  const [history, setHistory] = useState<JournalFormState[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<JournalTemplate[]>([]);

  const updateState = useCallback((updates: Partial<JournalFormState>) => {
    setState((prev) => {
      setHistory((h) => [...h.slice(-10), prev]); // Keep last 10 states
      return { ...prev, ...updates };
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setState(previousState);
      setHistory((h) => h.slice(0, -1));
      toast({ title: "Undo", description: "Reverted to previous state" });
    }
  }, [history]);

  const handleApplyTemplate = useCallback((template: JournalTemplate) => {
    updateState({
      template,
      tags: template.tags || [],
      reasoning: template.notes || "",
    });
    toast({ title: "Template Applied", description: `${template.name} template loaded` });
  }, [updateState]);

  const handleCreateTemplate = useCallback(() => {
    setIsTemplateModalOpen(true);
  }, []);

  const handleSaveTemplate = useCallback((template: JournalTemplate) => {
    setCustomTemplates((prev) => [...prev, template]);
    toast({ title: "Template Saved", description: `"${template.name}" added to your templates` });
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      updateState({ imageFile: file, imageUrl: url });
    } else {
      if (state.imageUrl) {
        URL.revokeObjectURL(state.imageUrl);
      }
      updateState({ imageFile: undefined, imageUrl: undefined });
    }
  }, [state.imageUrl, updateState]);

  const handleGenerateAiNotes = useCallback(async () => {
    setIsGeneratingAi(true);
    // Simulate AI generation - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const mockNote = `Based on your ${state.emotionalState || "neutral"} state with ${state.confidence}% confidence, consider:
- Review your risk management before entry
- Set clear invalidation levels
- Document your exit strategy`;
    
    updateState({ aiNotes: mockNote });
    setIsGeneratingAi(false);
    toast({ title: "AI Notes Generated", description: "Review and edit as needed" });
  }, [state.emotionalState, state.confidence, updateState]);

  const handleSubmit = useCallback(() => {
    if (!state.emotionalState) {
      toast({ title: "Required Field", description: "Please select your emotional state", variant: "destructive" });
      return;
    }
    
    onSubmit?.(state);
    setState(INITIAL_STATE);
    setHistory([]);
    toast({ title: "Entry Saved", description: "Your journal entry has been saved" });
  }, [state, onSubmit]);

  return (
    <>
      <CreateTemplateModal
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onSave={handleSaveTemplate}
        currentState={{
          emotionalState: state.emotionalState,
          confidence: state.confidence,
          conviction: state.conviction,
          patternQuality: state.patternQuality,
          reasoning: state.reasoning,
          tags: state.tags,
        }}
      />
      
      <Card data-testid="journal-entry-form">
        <CardContent className="p-6 space-y-6">
          {/* Header Section */}
          <JournalHeader
            onApplyTemplate={handleApplyTemplate}
            onUndo={handleUndo}
            onCreateTemplate={handleCreateTemplate}
            canUndo={history.length > 0}
            appliedTemplate={state.template?.name}
            customTemplates={customTemplates}
          />

        <Separator />

        {/* Emotional State Section */}
        <div className="space-y-6">
          <EmotionalStateCards
            value={state.emotionalState}
            onChange={(emotionalState) => updateState({ emotionalState })}
          />

          <ConfidenceSlider
            value={state.confidence}
            onChange={(confidence) => updateState({ confidence })}
          />

          <AdditionalSliders
            conviction={state.conviction}
            patternQuality={state.patternQuality}
            onConvictionChange={(conviction) => updateState({ conviction })}
            onPatternQualityChange={(patternQuality) => updateState({ patternQuality })}
          />
        </div>

        <Separator />

        {/* Market Context Panel */}
        <MarketContextPanel
          reasoning={state.reasoning}
          expectation={state.expectation}
          imageUrl={state.imageUrl}
          tags={state.tags}
          onReasoningChange={(reasoning) => updateState({ reasoning })}
          onExpectationChange={(expectation) => updateState({ expectation })}
          onImageChange={handleImageChange}
          onTagsChange={(tags) => updateState({ tags })}
        />

        <Separator />

        {/* AI Notes Section */}
        <AiNotesSection
          aiNotes={state.aiNotes}
          onAiNotesChange={(aiNotes) => updateState({ aiNotes })}
          onGenerateNotes={handleGenerateAiNotes}
          isGenerating={isGeneratingAi}
        />

        <Separator />

        {/* Save Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button 
            onClick={handleSubmit} 
            className="w-full sm:w-auto gap-2"
            size="lg"
            data-testid="save-journal-btn"
          >
            <Save className="h-4 w-4" />
            Save Entry
          </Button>
          
          <span 
            className="text-xs text-muted-foreground flex items-center gap-1"
            data-testid="journal-mastery-cue"
          >
            <span className="opacity-70">degen</span>
            <ArrowRight className="h-3 w-3 opacity-50" />
            <span>mastery</span>
            <span className="opacity-50">— each log sharpens your edge</span>
          </span>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
