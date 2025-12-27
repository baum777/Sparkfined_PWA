import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import StateView from "@/components/ui/StateView";
import KPIBar, { type KPIItem } from "@/features/dashboard/KPIBar";
import DailyBiasCard from "@/features/dashboard/DailyBiasCard";
import FAB from "@/features/dashboard/FAB";
import { useJournalStore } from "@/store/journalStore";
import { useAlertsStore } from "@/store/alertsStore";
import { useLogEntryAvailability, type TradeEventInboxItem } from "@/features/journal/useLogEntryAvailability";
import { useSettings } from "@/state/settings";
import { useTradeEventJournalBridge } from "@/store/tradeEventJournalBridge";
import { Telemetry } from "@/lib/TelemetryService";
import { useDashboardTradeEntriesAdapter } from "@/features/dashboard/adapters/useDashboardTradeEntriesAdapter";
import { useDashboardKpiItemsAdapter } from "@/features/dashboard/adapters/useDashboardKpiItemsAdapter";
import { useDashboardRecentJournalEntriesAdapter } from "@/features/dashboard/adapters/useDashboardRecentJournalEntriesAdapter";
import "@/features/dashboard/dashboard.css";

const dummyInsight = {
  title: "SOL Daily Bias",
  bias: "long" as const,
  confidenceLabel: "High",
  summary:
    "Market structure shows higher lows with strong momentum on intraday timeframes. Watching for pullbacks to re-enter long positions with tight risk management.",
};

const RecentEntriesSection = lazy(() => import("@/features/dashboard/RecentEntriesSection"));
const AlertsOverviewWidget = lazy(() => import("@/features/dashboard/AlertsOverviewWidget"));
const FABMenu = lazy(() => import("@/features/dashboard/FABMenu"));
const HoldingsCard = lazy(() => import("@/features/dashboard/HoldingsCard"));
const TradeLogCard = lazy(() => import("@/features/dashboard/TradeLogCard"));
const InsightTeaser = lazy(() => import("@/components/dashboard/InsightTeaser"));
const JournalSnapshot = lazy(() => import("@/components/dashboard/JournalSnapshot"));
const AlertsSnapshot = lazy(() => import("@/components/dashboard/AlertsSnapshot"));
const AlertCreateDialog = lazy(() => import("@/components/alerts/AlertCreateDialog"));
const LogEntryOverlayPanel = lazy(async () => {
  const module = await import("@/components/dashboard/LogEntryOverlayPanel");
  return { default: module.LogEntryOverlayPanel };
});

export default function DashboardPage() {
  const journalEntries = useJournalStore((state) => state.entries);
  const alerts = useAlertsStore((state) => state.alerts);
  const { settings } = useSettings();
  const { setTradeContext } = useTradeEventJournalBridge();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isLogOverlayOpen, setIsLogOverlayOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);

  const { tradeEntries, isLoading } = useDashboardTradeEntriesAdapter();

  const {
    events: inboxEvents,
    pendingCount: unconsumedCount,
    isLoading: isInboxLoading,
    hasBuySignal,
    refresh,
  } = useLogEntryAvailability();

  const hasData = journalEntries.length > 0;

  useEffect(() => {
    Telemetry.log("ui.dashboard.loaded", 1);
  }, []);

  const handleRetry = () => {
    setError(null);
  };

  const kpiItems = useDashboardKpiItemsAdapter({
    journalEntries,
    alerts,
    tradeEntries,
    inboxEvents,
    unconsumedCount,
    isInboxLoading,
    hasData,
  });

  const recentJournalEntries = useDashboardRecentJournalEntriesAdapter(journalEntries, 3);

  const handleOpenLogEntryOverlay = useCallback(() => {
    Telemetry.log("ui.dashboard.quick_action_clicked", 1, { action: "log-entry" });
    void refresh();
    setIsLogOverlayOpen(true);
  }, [refresh]);

  const handleOpenCreateAlert = useCallback(() => {
    Telemetry.log("ui.dashboard.quick_action_clicked", 1, { action: "create-alert" });
    setIsCreateAlertOpen(true);
  }, []);

  const closeFabMenu = () => setIsFabMenuOpen(false);

  const renderHoldingsAndTrades = () => (
    <div className="dashboard-split">
      <Suspense
        fallback={
          <div className="dashboard-card sf-card" aria-busy="true">
            <Skeleton variant="card" className="h-72 w-full" />
          </div>
        }
      >
        <HoldingsCard className="dashboard-card sf-card" />
      </Suspense>
      <Suspense
        fallback={
          <div className="dashboard-card sf-card" aria-busy="true">
            <Skeleton variant="card" className="h-72 w-full" />
          </div>
        }
      >
        <TradeLogCard
          className="dashboard-card"
          onLogEntry={handleOpenLogEntryOverlay}
          isLogEntryEnabled={hasBuySignal}
          logEntryTooltip="Enabled when a BUY signal is detected"
        />
      </Suspense>
    </div>
  );

  const handleJournalTrade = (event: TradeEventInboxItem) => {
    setTradeContext({
      eventId: event.id,
      txHash: event.txHash,
      walletId: event.walletId,
      timestamp: event.timestamp,
      side: event.side,
      amount: event.amount,
      price: event.price,
      baseSymbol: event.baseSymbol,
      quoteSymbol: event.quoteSymbol,
      quoteCurrency: settings.quoteCurrency,
    });
    setIsLogOverlayOpen(false);
    navigate("/journal");
  };

  const handleKpiClick = useCallback(
    (item: KPIItem) => {
      Telemetry.log("ui.dashboard.kpi_clicked", 1, { kpi: item.label });
      if (item.label === "Alerts Armed") {
        navigate("/alerts");
        return;
      }
      if (item.label === "Trade Inbox") {
        handleOpenLogEntryOverlay();
        return;
      }
      navigate("/journal");
    },
    [handleOpenLogEntryOverlay, navigate]
  );

  const renderMainContent = () => {
    const biasCard = <DailyBiasCard className="dashboard-card sf-card" />;

    if (isLoading) {
      return (
        <div className="dashboard-stack">
          {biasCard}
          <div className="dashboard-grid dashboard-grid--two">
            <div className="dashboard-primary dashboard-stack">
              <div className="dashboard-card sf-card">
                <Skeleton variant="card" className="h-72 w-full" />
              </div>
              <div className="dashboard-split">
                <div className="dashboard-card sf-card">
                  <Skeleton variant="card" className="h-64 w-full" />
                </div>
                <div className="dashboard-card sf-card">
                  <Skeleton variant="card" className="h-64 w-full" />
                </div>
              </div>
            </div>
            <div className="dashboard-secondary dashboard-stack">
              <div className="dashboard-card sf-card">
                <Skeleton variant="card" className="h-60 w-full" />
              </div>
              <div className="dashboard-card sf-card">
                <Skeleton variant="card" className="h-60 w-full" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard-stack">
          {biasCard}
          <ErrorBanner message={error} onRetry={handleRetry} />
          <div className="dashboard-card sf-card">
            <StateView
              type="error"
              title="Unable to load dashboard"
              description="Please check your connection or reload. Your latest synced data remains safe."
              actionLabel="Retry sync"
              onAction={handleRetry}
            />
          </div>
        </div>
      );
    }

    if (!hasData) {
      return (
        <div className="dashboard-stack">
          {biasCard}
          <div className="dashboard-grid dashboard-grid--two">
            <div className="dashboard-primary dashboard-stack">
              <div className="dashboard-card sf-card">
                <StateView
                  type="empty"
                  title="No insights yet"
                  description="Run your first chart session to unlock AI bias, flow and volatility context."
                  actionLabel="Open chart"
                  onAction={() => navigate("/chart")}
                />
              </div>
              {renderHoldingsAndTrades()}
            </div>
            <div className="dashboard-secondary dashboard-stack">
              <div className="dashboard-card sf-card">
                <StateView
                  type="empty"
                  title="No journal entries"
                  description="Log a trade or mindset note to build your streaks."
                  actionLabel="Open journal"
                  onAction={() => navigate("/journal")}
                  compact
                />
              </div>
              <Suspense
                fallback={
                  <div className="dashboard-card sf-card" aria-busy="true">
                    <Skeleton variant="card" className="h-52 w-full" />
                  </div>
                }
              >
                <AlertsSnapshot className="dashboard-card sf-card" />
              </Suspense>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-stack">
        {biasCard}
        <div className="dashboard-grid dashboard-grid--two">
          <div className="dashboard-primary dashboard-stack">
            <Suspense
              fallback={
                <div className="dashboard-card sf-card" aria-busy="true">
                  <Skeleton variant="card" className="h-48 w-full" />
                </div>
              }
            >
              <InsightTeaser {...dummyInsight} className="dashboard-card sf-card" />
            </Suspense>
            {renderHoldingsAndTrades()}
          </div>
          <div className="dashboard-secondary dashboard-stack">
            <Suspense
              fallback={
                <div className="dashboard-card sf-card" aria-busy="true">
                  <Skeleton variant="card" className="h-60 w-full" />
                </div>
              }
            >
              <JournalSnapshot entries={recentJournalEntries} className="dashboard-card sf-card" />
            </Suspense>
            <Suspense
              fallback={
                <div className="dashboard-card sf-card" aria-busy="true">
                  <Skeleton variant="card" className="h-52 w-full" />
                </div>
              }
            >
              <AlertsSnapshot className="dashboard-card sf-card" />
            </Suspense>
          </div>
        </div>
      </div>
    );
  };

  const renderBottomSections = () => (
    <Suspense
      fallback={
        <div
          className="dashboard-grid dashboard-grid--two"
          aria-busy="true"
          aria-label="Loading dashboard widgets"
        >
          <div className="dashboard-primary">
            <div className="dashboard-card sf-card" aria-hidden>
              <Skeleton variant="card" className="h-64 w-full" />
            </div>
          </div>
          <div className="dashboard-secondary">
            <div className="dashboard-card sf-card" aria-hidden>
              <Skeleton variant="card" className="h-64 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <div className="dashboard-grid dashboard-grid--two">
        <div className="dashboard-primary">
          <RecentEntriesSection />
        </div>
        <div className="dashboard-secondary">
          <AlertsOverviewWidget />
        </div>
      </div>
    </Suspense>
  );

  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      {/* Note: DashboardShell is the single layout source-of-truth (no legacy Container/PageHeader duplication). */}
      <DashboardShell
        title="Dashboard"
        description="Command surface for your net risk, streaks, and live intelligence."
        meta={`${journalEntries.length} journal entries · ${alerts.length} alerts`}
        kpiStrip={<KPIBar items={kpiItems} onItemClick={handleKpiClick} data-testid="dashboard-kpi-bar" />}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenLogEntryOverlay}
            disabled={!hasBuySignal}
            title={!hasBuySignal ? "Enabled when a BUY signal is detected" : undefined}
            data-testid="dashboard-log-entry"
          >
            Log entry
            {unconsumedCount > 0 ? (
              <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs">
                {unconsumedCount}
              </span>
            ) : null}
          </Button>
        }
      >
        {renderMainContent()}
        {renderBottomSections()}
      </DashboardShell>
      <Suspense
        fallback={
          isLogOverlayOpen ? (
            <div
              role="status"
              aria-live="polite"
              className="fixed inset-x-0 bottom-0 z-modal flex items-end justify-center bg-surface/60 px-4 pb-8 pt-12 backdrop-blur"
            >
              <div className="dashboard-card sf-card" aria-busy="true">
                <Skeleton variant="card" className="h-64 w-[min(720px,90vw)]" />
              </div>
            </div>
          ) : null
        }
      >
        {isLogOverlayOpen ? (
          <LogEntryOverlayPanel
            isOpen={isLogOverlayOpen}
            onClose={() => setIsLogOverlayOpen(false)}
            events={inboxEvents}
            isLoading={isInboxLoading}
            onSelect={handleJournalTrade}
          />
        ) : null}
      </Suspense>
      <FAB ariaExpanded={isFabMenuOpen} onClick={() => setIsFabMenuOpen((prev) => !prev)} />
      <Suspense
        fallback={
          isFabMenuOpen ? (
            <div
              role="status"
              aria-live="polite"
              className="fixed bottom-24 right-5 rounded-2xl bg-surface px-4 py-3 text-sm text-text-secondary shadow-card"
            >
              Loading quick actions…
            </div>
          ) : null
        }
      >
        {isFabMenuOpen ? (
          <FABMenu
            isOpen={isFabMenuOpen}
            onClose={closeFabMenu}
            onLogEntry={() => {
              closeFabMenu();
              handleOpenLogEntryOverlay();
            }}
            onCreateAlert={() => {
              closeFabMenu();
              handleOpenCreateAlert();
            }}
          />
        ) : null}
      </Suspense>
      <Suspense
        fallback={
          isCreateAlertOpen ? (
            <div
              role="status"
              aria-live="polite"
              className="fixed inset-0 z-modal flex items-center justify-center bg-surface/70 backdrop-blur"
            >
              <div className="dashboard-card sf-card" aria-busy="true">
                <Skeleton variant="card" className="h-64 w-[min(560px,92vw)]" />
              </div>
            </div>
          ) : null
        }
      >
        {isCreateAlertOpen ? (
          <AlertCreateDialog
            isOpen={isCreateAlertOpen}
            onClose={() => setIsCreateAlertOpen(false)}
            triggerButton={false}
          />
        ) : null}
      </Suspense>
    </div>
  );
}
