import { ChartToolbar, LogSetupCTA, ChartParamsHint } from "@/components/chart";
import { ChartCanvas } from "@/features/chart";

export default function Chart() {
  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-chart">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chart</h1>
          <p className="text-sm text-muted-foreground">
            Analyze and annotate your trading setups.
          </p>
        </div>
        <LogSetupCTA />
      </div>

      <ChartParamsHint />
      
      <ChartToolbar />

      <ChartCanvas />
    </div>
  );
}
