import { BookOpen, Bell, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  entriesCount: number;
  alertsCount: number;
  onLogEntry: () => void;
}

export function DashboardHeader({ 
  entriesCount, 
  alertsCount,
  onLogEntry 
}: DashboardHeaderProps) {
  return (
    <header 
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="dashboard-header"
    >
      <div>
        <h1 className="text-2xl font-bold" data-testid="dashboard-heading">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Your trading command center
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Meta counters */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground" data-testid="dashboard-meta-counters">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span data-testid="dashboard-entries-count">{entriesCount}</span>
            <span className="hidden sm:inline">entries</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            <span data-testid="dashboard-alerts-count">{alertsCount}</span>
            <span className="hidden sm:inline">alerts</span>
          </span>
        </div>
        
        {/* Primary CTA */}
        <Button 
          onClick={onLogEntry}
          className="hidden sm:flex"
          data-testid="dashboard-log-entry-cta"
        >
          <PenLine className="mr-2 h-4 w-4" />
          Log Entry
        </Button>
      </div>
    </header>
  );
}
