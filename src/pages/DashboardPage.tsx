import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import StateView from "@/components/ui/StateView";
import KPIBar, { type KPIDeltaDirection, type KPIItem } from "@/features/dashboard/KPIBar";
import DailyBiasCard from "@/features/dashboard/DailyBiasCard";
import FAB from "@/features/dashboard/FAB";
import { useJournalStore } from "@/store/journalStore";
import { useAlertsStore } from "@/store/alertsStore";
import { calculateJournalStreak, calculateNetPnL, calculateWinRate, getEntryDate } from "@/lib/dashboard/calculateKPIs";
import { getAllTrades, type TradeEntry } from "@/lib/db";
import { useLogEntryAvailability, type TradeEventInboxItem } from "@/features/journal/useLogEntryAvailability";
import { useSettings } from "@/state/settings";
import { useTradeEventJournalBridge } from "@/store/tradeEventJournalBridge";
import Activity from "lucide-react/dist/esm/icons/activity";
import Bell from "lucide-react/dist/esm/icons/bell";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Target from "lucide-react/dist/esm/icons/target";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeEntries, setTradeEntries] = useState<TradeEntry[]>([]);
  const [isLogOverlayOpen, setIsLogOverlayOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);

  const {
    events: inboxEvents,
    pendingCount: unconsumedCount,
    isLoading: isInboxLoading,
    hasBuySignal,
    refresh,
  } = useLogEntryAvailability();

  const hasData = journalEntries.length > 0;

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const kpiItems = useMemo<KPIItem[]>(() => {
    const armedAlertsCount = alerts.filter((alert) => alert.status === "armed").length;
    const netPnLValue = calculateNetPnL(journalEntries);
    const winRateValue = calculateWinRate(journalEntries, 30);
    const streakValue = calculateJournalStreak(journalEntries);
    const tradesTracked = tradeEntries.length;
    const inboxCount = Array.isArray(inboxEvents) ? inboxEvents.length : 0;
    const reviewCount = Number.isFinite(unconsumedCount) ? unconsumedCount : 0;

    const netTrend: KPIDeltaDirection =
      netPnLValue === "N/A" || netPnLValue === "0%"
        ? "flat"
        : netPnLValue.startsWith("-")
          ? "down"
          : "up";

    const winRateTrend: KPIDeltaDirection =
      winRateValue === "N/A"
        ? "flat"
        : Number.parseInt(winRateValue, 10) >= 50
          ? "up"
          : "down";

    const alertsTrend: KPIDeltaDirection = armedAlertsCount > 0 ? "up" : "flat";
    const streakTrend: KPIDeltaDirection = streakValue === "0 days" ? "flat" : "up";
    const inboxTrend: KPIDeltaDirection = isInboxLoading ? "flat" : reviewCount > 0 ? "up" : "flat";

    return [
      {
        label: "Net P&L",
        value: netPnLValue,
        delta: {
          value: netPnLValue === "N/A" ? "Awaiting trades" : netPnLValue,
          direction: netTrend,
          srLabel: "Net profitability",
        },
        icon: <TrendingUp size={18} />,
      },
      {
        label: "Win Rate",
        value: winRateValue,
        delta: {
          value: "30d window",
          direction: winRateTrend,
          srLabel: "Win rate momentum",
        },
        icon: <Target size={18} />,
      },
      {
        label: "Alerts Armed",
        value: String(armedAlertsCount),
        delta: {
          value: reviewCount > 0 ? `${reviewCount} to review` : "Standing by",
          direction: alertsTrend,
          srLabel: "Alerts readiness",
        },
        icon: <Bell size={18} />,
      },
      {
        label: "Journal Streak",
        value: streakValue,
        delta: {
          value: hasData ? "Keep it going" : "Start logging",
          direction: streakTrend,
          srLabel: "Journal consistency",
        },
        icon: <FileText size={18} />,
      },
      {
        label: "Trade Inbox",
        value: String(tradesTracked),
        delta: {
          value: isInboxLoading ? "Syncing..." : `${inboxCount} new`,
          direction: inboxTrend,
          srLabel: "Trade events queued",
        },
        icon: <Activity size={18} />,
      },
    ];
  }, [alerts, hasData, inboxEvents, isInboxLoading, journalEntries, tradeEntries.length, unconsumedCount]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    void (async () => {
      try {
        const entries = await getAllTrades();
        if (mounted) setTradeEntries(entries);
      } catch {
        if (mounted) setTradeEntries([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const recentJournalEntries = useMemo(() => {
    if (!journalEntries.length) {
      return [];
    }
    return [...journalEntries]
      .map((entry) => ({ entry, timestamp: getEntryDate(entry)?.getTime() ?? 0 }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
      .map(({ entry }) => entry);
  }, [journalEntries]);

  const handleOpenLogEntryOverlay = useCallback(() => {
    void refresh();
    setIsLogOverlayOpen(true);
  }, [refresh]);

  const handleOpenCreateAlert = useCallback(() => {
    setIsCreateAlertOpen(true);
  }, []);

  const closeFabMenu = () => setIsFabMenuOpen(false);

  const renderHoldingsCard = () => (
    <Suspense
      fallback={
        <div className="dashboard-card sf-card" aria-busy="true">
          <Skeleton variant="card" className="h-72 w-full" />
        </div>
      }
    >
      <HoldingsCard className="dashboard-card sf-card" />
    </Suspense>
  );

  const renderTradeLogCard = () => (
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

  const renderMainContent = () => {
    const leftColumn = (
      <div className="dashboard-stack">
        <DailyBiasCard className="dashboard-card sf-card" />
        {renderHoldingsCard()}
        {renderTradeLogCard()}
      </div>
    );

    const rightColumn = (
      <div className="dashboard-stack">
        <Suspense
          fallback={
            <div className="dashboard-card sf-card" aria-busy="true">
              <Skeleton variant="card" className="h-48 w-full" />
            </div>
          }
        >
          <InsightTeaser {...dummyInsight} className="dashboard-card sf-card" />
        </Suspense>
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
    );

    if (isLoading) {
      return (
        <div className="dashboard-grid dashboard-grid--two">
          <div className="dashboard-primary dashboard-stack">{leftColumn}</div>
          <div className="dashboard-secondary dashboard-stack">{rightColumn}</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard-stack">
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
          <div className="dashboard-grid dashboard-grid--two">
            <div className="dashboard-primary dashboard-stack">{leftColumn}</div>
            <div className="dashboard-secondary dashboard-stack">{rightColumn}</div>
          </div>
        </div>
      );
    }

    if (!hasData) {
      return (
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
            {leftColumn}
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
            {rightColumn}
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-grid dashboard-grid--two">
        <div className="dashboard-primary dashboard-stack">{leftColumn}</div>
        <div className="dashboard-secondary dashboard-stack">{rightColumn}</div>
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
        kpiStrip={<KPIBar items={kpiItems} data-testid="dashboard-kpi-bar" />}
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
