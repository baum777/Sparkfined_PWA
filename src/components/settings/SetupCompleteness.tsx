import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetupStep {
  id: string;
  label: string;
  completed: boolean;
}

export function SetupCompleteness() {
  // Check completion status from localStorage or defaults
  const steps: SetupStep[] = [
    {
      id: "theme",
      label: "Set your theme preference",
      completed: localStorage.getItem("theme") !== null,
    },
    {
      id: "export",
      label: "Create a backup",
      completed: localStorage.getItem("lastExportDate") !== null,
    },
    {
      id: "journal",
      label: "Log your first trade",
      completed: false, // Stub - would check journal entries
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const allComplete = completedCount === totalSteps;

  if (allComplete) {
    return null; // Hide when setup is complete
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4" data-testid="settings-setup-completeness">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Quick setup</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount} of {totalSteps} complete
        </span>
      </div>

      <ul className="space-y-2">
        {steps.map((step) => (
          <li 
            key={step.id} 
            className="flex items-center gap-2 text-sm"
            data-testid={`setup-step-${step.id}`}
          >
            {step.completed ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={cn(
                step.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
