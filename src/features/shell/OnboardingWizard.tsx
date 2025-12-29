import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Circle, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetupStep {
  id: string;
  label: string;
  completed: boolean;
}

export function OnboardingWizard() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  // Check completion status (mocked for now based on existing component)
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
      completed: false, // Stub
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedCount / totalSteps) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]" data-testid="onboarding-modal">
        <DialogHeader>
          <div className="mx-auto bg-brand/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
             <PartyPopper className="h-6 w-6 text-brand" />
          </div>
          <DialogTitle className="text-center">Welcome to Sparkfined</DialogTitle>
          <DialogDescription className="text-center">
            Your journey to trading mastery begins here. Let's get you set up.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Setup Progress</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-brand transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="space-y-3">
            {steps.map((step) => (
              <li 
                key={step.id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                {step.completed ? (
                  <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    step.completed ? "text-muted-foreground line-through" : "text-foreground"
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full" data-testid="onboarding-close-btn">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
