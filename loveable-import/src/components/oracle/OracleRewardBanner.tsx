import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OracleRewardBannerProps {
  streak: number;
}

export function OracleRewardBanner({ streak }: OracleRewardBannerProps) {
  const navigate = useNavigate();

  if (streak < 2) return null;

  return (
    <Card className="border-accent/20 bg-accent/5" data-testid="oracle-reward-banner">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <TrendingUp className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                From degen to disciplined
              </p>
              <p className="text-sm text-muted-foreground">
                {streak} insights logged — steady progress compounds.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/journal')}
            className="shrink-0 focus-visible:ring-offset-background"
            data-testid="oracle-view-journal"
          >
            View Journal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
