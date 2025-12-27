import { Wallet, Settings, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";

interface HoldingsCardProps {
  loading?: boolean;
}

/**
 * HoldingsCard displays active wallet holdings.
 * Currently a stub - wallet monitoring system not yet implemented.
 * Shows empty state with CTA to Settings.
 */
export function HoldingsCard({ loading = false }: HoldingsCardProps) {
  // Stub: no wallet system exists yet
  const isMonitoringEnabled = false;
  const holdings: unknown[] = [];

  // State: Loading
  if (loading) {
    return (
      <Card data-testid="dashboard-holdings-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Wallet Holdings
          </CardTitle>
        </CardHeader>
        <CardContent data-testid="dashboard-holdings-loading">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // State: Monitoring not enabled
  if (!isMonitoringEnabled) {
    return (
      <Card data-testid="dashboard-holdings-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Wallet Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md bg-muted/30 py-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Connect your wallet to track holdings
            </p>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="focus-visible:ring-offset-background"
              data-testid="dashboard-holdings-cta"
            >
              <Link to="/settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Enable Wallet Monitoring
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State: No holdings (wallet connected but empty)
  if (holdings.length === 0) {
    return (
      <Card data-testid="dashboard-holdings-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Wallet Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md bg-muted/30 py-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              No holdings found in wallet
            </p>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="focus-visible:ring-offset-background"
              data-testid="dashboard-holdings-cta"
            >
              <Link to="/chart" className="gap-2">
                <LineChart className="h-4 w-4" />
                Open Chart
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Future: render holdings list
  return null;
}
