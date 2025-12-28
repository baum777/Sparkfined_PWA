import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UnlockCalloutProps {
  lockedCount: number;
}

export function UnlockCallout({ lockedCount }: UnlockCalloutProps) {
  if (lockedCount === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5" data-testid="unlock-callout">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              How to unlock lessons
            </h3>
            <p className="text-sm text-muted-foreground">
              Log trades in your Journal to unlock {lockedCount} more lessons. 
              Each trade brings you closer to mastery.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0" data-testid="btn-go-to-journal">
          <Link to="/journal">
            Go to Journal
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
