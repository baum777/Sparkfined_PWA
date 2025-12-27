import { Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function DashboardEmptyState() {
  return (
    <div 
      className="flex flex-col items-center justify-center gap-4 py-12 text-center"
      data-testid="dashboard-empty-state"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
        <Rocket className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Welcome to Sparkfined</h2>
        <p className="max-w-sm text-muted-foreground">
          Your journey from degen to mastery starts here.
        </p>
        <p 
          className="text-sm text-muted-foreground/80"
          data-testid="dashboard-next-step-hint"
        >
          <span className="font-medium text-foreground">Next step:</span> Log your first trade → unlock daily snapshots and insights
        </p>
      </div>
      <Button asChild data-testid="dashboard-start-cta">
        <Link to="/journal" className="gap-2">
          Start Your First Entry
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
