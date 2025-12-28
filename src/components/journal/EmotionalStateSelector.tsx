import { Smile, Meh, Frown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type EmotionalState = "positive" | "neutral" | "negative";

interface EmotionalStateSelectorProps {
  value?: EmotionalState;
  onChange: (state: EmotionalState) => void;
  error?: boolean;
}

const STATES: { value: EmotionalState; icon: React.ElementType; label: string }[] = [
  { value: "positive", icon: Smile, label: "Positive" },
  { value: "neutral", icon: Meh, label: "Neutral" },
  { value: "negative", icon: Frown, label: "Negative" },
];

export function EmotionalStateSelector({ 
  value, 
  onChange,
  error 
}: EmotionalStateSelectorProps) {
  return (
    <div className="space-y-2" data-testid="emotional-state-selector">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          Emotional State <span className="text-destructive">*</span>
        </Label>
        {error && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            Required
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {STATES.map((state) => {
          const Icon = state.icon;
          const isSelected = value === state.value;
          
          return (
            <Button
              key={state.value}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(state.value)}
              className={cn(
                "flex-1 gap-2",
                error && !value && "border-destructive"
              )}
              data-testid={`emotional-state-${state.value}`}
              aria-pressed={isSelected}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{state.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
