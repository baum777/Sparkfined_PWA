import { useState } from "react";
import { Plus, PenLine, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardFabProps {
  onLogEntry: () => void;
  onCreateAlert: () => void;
}

export function DashboardFab({ onLogEntry, onCreateAlert }: DashboardFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: "Log Entry",
      icon: PenLine,
      onClick: () => {
        onLogEntry();
        setIsOpen(false);
      },
      testId: "fab-log-entry",
    },
    {
      label: "Create Alert",
      icon: Bell,
      onClick: () => {
        onCreateAlert();
        setIsOpen(false);
      },
      testId: "fab-create-alert",
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col-reverse items-end gap-2 md:hidden" data-testid="dashboard-fab">
      {/* Action buttons (shown when open) */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {actions.map((action) => (
            <Button
              key={action.testId}
              size="sm"
              variant="secondary"
              className="gap-2 shadow-lg"
              onClick={action.onClick}
              data-testid={action.testId}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-transform",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
        data-testid="fab-toggle"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
