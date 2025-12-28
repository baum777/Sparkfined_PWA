import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export type EmotionalStateValue = "fearful" | "anxious" | "neutral" | "confident" | "euphoric";

interface EmotionalState {
  value: EmotionalStateValue;
  emoji: string;
  title: string;
  phrase: string;
}

const EMOTIONAL_STATES: EmotionalState[] = [
  {
    value: "fearful",
    emoji: "😰",
    title: "Fearful",
    phrase: "Hesitant to pull the trigger",
  },
  {
    value: "anxious",
    emoji: "😟",
    title: "Anxious",
    phrase: "Second-guessing my analysis",
  },
  {
    value: "neutral",
    emoji: "😐",
    title: "Neutral",
    phrase: "Following the plan calmly",
  },
  {
    value: "confident",
    emoji: "😊",
    title: "Confident",
    phrase: "Clear thesis, defined risk",
  },
  {
    value: "euphoric",
    emoji: "🤩",
    title: "Euphoric",
    phrase: "Feeling invincible — caution!",
  },
];

interface EmotionalStateCardsProps {
  value?: EmotionalStateValue;
  onChange: (state: EmotionalStateValue) => void;
}

export function EmotionalStateCards({ value, onChange }: EmotionalStateCardsProps) {
  return (
    <div className="space-y-3" data-testid="emotional-state-cards">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">How are you feeling about this trade?</h3>
        <p className="text-xs text-muted-foreground">
          Your emotional state affects decision-making. Be honest.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {EMOTIONAL_STATES.map((state) => (
          <Card
            key={state.value}
            onClick={() => onChange(state.value)}
            className={cn(
              "p-3 cursor-pointer transition-all hover:border-primary/50",
              "flex flex-col items-center text-center gap-1",
              value === state.value && "border-primary bg-primary/5 ring-1 ring-primary/20"
            )}
            data-testid={`emotional-state-card-${state.value}`}
          >
            <span className="text-2xl">{state.emoji}</span>
            <span className="text-sm font-medium">{state.title}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {state.phrase}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
