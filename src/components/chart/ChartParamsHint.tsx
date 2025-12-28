import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const HINT_KEY = "chart-params-hint-dismissed";

export function ChartParamsHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(HINT_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(HINT_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Alert 
      className="flex items-center gap-3 pr-12"
      data-testid="chart-params-hint"
    >
      <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
      <AlertDescription className="flex-1">
        <span className="font-medium text-foreground">Default symbol loaded.</span>{" "}
        Select a different asset from your watchlist to analyze.
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute right-2 top-2 h-7 w-7 p-0 focus-visible:ring-offset-background"
        aria-label="Dismiss hint"
        data-testid="chart-params-hint-dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
