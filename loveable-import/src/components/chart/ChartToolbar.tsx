import { Search, PenTool, Bell } from "lucide-react";

const steps = [
  { icon: Search, label: "Analyze", hint: "Study price action" },
  { icon: PenTool, label: "Mark", hint: "Draw key levels" },
  { icon: Bell, label: "Alert", hint: "Set price alerts" },
];

export function ChartToolbar() {
  return (
    <div 
      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border"
      role="group"
      aria-label="Chart workflow steps"
    >
      {steps.map((step, index) => (
        <div 
          key={step.label} 
          className="flex items-center gap-2"
          data-testid={`chart-workflow-step-${step.label.toLowerCase()}`}
        >
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/50 text-sm"
            title={step.hint}
          >
            <step.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <span className="text-muted-foreground" aria-hidden="true">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
