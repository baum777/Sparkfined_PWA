import { useState, useEffect } from "react";
import { Check, Circle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SetupStep {
  id: string;
  label: string;
  completed: boolean;
}

export function SetupCompleteness() {
  const [isOpen, setIsOpen] = useState(false);

  // Check completion status from localStorage or defaults
  const steps: SetupStep[] = [
    {
      id: "theme",
      label: "Set your theme preference",
      completed: localStorage.getItem("theme") !== null,
    },
    {
      id: "export",
      label: "Create a backup (Export Data)",
      completed: localStorage.getItem("lastExportDate") !== null,
    },
    {
      id: "journal",
      label: "Log your first trade",
      // Simple check if we have trades in localStorage (a bit hacky but works for now)
      completed: localStorage.getItem("journal-storage")?.includes("trades") || false,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const allComplete = completedCount === totalSteps;

  useEffect(() => {
    // Open if not complete and haven't dismissed it this session (or ever? logic can vary)
    // For now, let's show it if not complete.
    if (!allComplete) {
      const hasDismissed = sessionStorage.getItem("setup-wizard-dismissed");
      if (!hasDismissed) {
        setIsOpen(true);
      }
    }
  }, [allComplete]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      sessionStorage.setItem("setup-wizard-dismissed", "true");
    }
  };

  if (allComplete) {
    return null; 
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-brand" />
            Welcome to Sparkfined
          </DialogTitle>
          <DialogDescription>
            Complete these steps to get the most out of your trading journal.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 flex items-center justify-between text-sm">
             <span className="font-medium">Progress</span>
             <span className="text-muted-foreground">{completedCount}/{totalSteps}</span>
          </div>
          
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
             <div 
               className="h-full bg-brand transition-all duration-500 ease-in-out" 
               style={{ width: `${(completedCount / totalSteps) * 100}%` }}
             />
          </div>

          <ul className="mt-6 space-y-3">
            {steps.map((step) => (
              <li 
                key={step.id} 
                className="flex items-center gap-3 text-sm"
                data-testid={`setup-step-${step.id}`}
              >
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border",
                  step.completed 
                    ? "border-success bg-success/10 text-success" 
                    : "border-muted-foreground text-muted-foreground"
                )}>
                  {step.completed ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                </div>
                <span
                  className={cn(
                    step.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground font-medium"
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>
            I'll do this later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
