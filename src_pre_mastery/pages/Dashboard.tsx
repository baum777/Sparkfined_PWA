import {
  DailySnapshotCard,
  QuickActionsCard,
  InsightCard,
  AlertsSnapshotCard,
  MasteryProgressCard,
  DashboardEmptyState,
  HoldingsCard,
  LastTradesCard,
} from "@/components/dashboard";
import { useTradesStore } from "@/features/journal/useTradesStore";

export default function Dashboard() {
  const { hasTrades, trades } = useTradesStore();
  const triggeredAlerts = 0;

  const insightsReady = trades.length >= 5;
  const masteryStep = Math.min(trades.length, 5);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" data-testid="page-dashboard">
      {/* Mastery Progress - quiet, top placement */}
      <MasteryProgressCard currentStep={masteryStep} totalSteps={5} />

      {!hasTrades ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <DailySnapshotCard />
          <HoldingsCard />
          <LastTradesCard />
          <QuickActionsCard hasEntries={hasTrades} />
          <InsightCard isReady={insightsReady} />
          <AlertsSnapshotCard triggeredCount={triggeredAlerts} />
        </div>
      )}

      {/* Show widgets in preview mode even when empty */}
      {!hasTrades && (
        <div className="grid gap-4 md:grid-cols-2 opacity-60">
          <DailySnapshotCard />
          <HoldingsCard />
          <LastTradesCard />
          <QuickActionsCard hasEntries={hasTrades} />
          <InsightCard isReady={false} />
          <AlertsSnapshotCard triggeredCount={triggeredAlerts} />
        </div>
      )}
    </div>
  );
}
