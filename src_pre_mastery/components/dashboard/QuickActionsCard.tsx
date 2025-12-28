import { PenLine, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsCardProps {
  hasEntries?: boolean;
}

export function QuickActionsCard({ hasEntries = false }: QuickActionsCardProps) {
  return (
    <Card data-testid="dashboard-quick-actions">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            disabled={!hasEntries}
            data-testid="dashboard-log-entry-btn"
          >
            <PenLine className="h-4 w-4" />
            Log Entry
          </Button>
          {!hasEntries && (
            <p className="text-xs text-muted-foreground pl-1">
              Start by adding your first trade in{" "}
              <Link 
                to="/journal" 
                className="text-primary underline underline-offset-2 hover:text-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Journal
                <ArrowRight className="inline h-3 w-3 ml-0.5" />
              </Link>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
