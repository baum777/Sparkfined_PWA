import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardKpiStrip from "@/components/dashboard/DashboardKpiStrip";
import { LogEntryOverlayPanel } from "@/components/dashboard/LogEntryOverlayPanel";
import InsightTeaser from "@/components/dashboard/InsightTeaser";
import JournalSnapshot from "@/components/dashboard/JournalSnapshot";
import AlertsSnapshot from "@/components/dashboard/AlertsSnapshot";
import { HoldingsList } from "@/components/dashboard/HoldingsList";
import { TradeLogList } from "@/components/dashboard/TradeLogList";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import StateView from "@/components/ui/StateView";
import { useJournalStore } from "@/store/journalStore";
import { useAlertsStore } from "@/store/alertsStore";
import { calculateJournalStreak, calculateNetPnL, calculateWinRate, getEntryDate } from "@/lib/dashboard/calculateKPIs";
import { getAllTrades, type TradeEntry } from "@/lib/db";
import { useTradeEventInbox, type TradeEventInboxItem } from "@/hooks/useTradeEventInbox";
import { useSettings } from "@/state/settings";
import { useTradeEventJournalBridge } from "@/store/tradeEventJournalBridge";
import { useWalletHoldings } from "@/hooks/useWalletHoldings";
import { getMonitoredWallet, WALLET_CHANGED_EVENT } from "@/lib/wallet/monitoredWallet";
import "@/features/dashboard/dashboard.css";

const dummyInsight = {
  title: "SOL Daily Bias",
  bias: "long" as const,
  confidenceLabel: "High",
  summary:
    "Market structure shows higher lows with strong momentum on intraday timeframes. Watching for pullbacks to re-enter long positions with tight risk management.",
};

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
  const [monitoredWallet, setMonitoredWallet] = useState<string | null>(() => getMonitoredWallet());

  const {
    events: inboxEvents,
    unconsumedCount,
    isLoading: isInboxLoading,
    refresh,
  } = useTradeEventInbox();
  const {
    data: holdingsData,
    status: holdingsStatus,
    error: holdingsError,
    refetch: refetchHoldings,
  } = useWalletHoldings(monitoredWallet);

  useEffect(() => {
    const handleWalletChange = () => setMonitoredWallet(getMonitoredWallet());

    window.addEventListener("storage", handleWalletChange);
    window.addEventListener(WALLET_CHANGED_EVENT, handleWalletChange);

    return () => {
      window.removeEventListener("storage", handleWalletChange);
      window.removeEventListener(WALLET_CHANGED_EVENT, handleWalletChange);
    };
  }, []);

  const hasData = journalEntries.length > 0;

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const kpiItems = useMemo(() => {
    const armedAlertsCount = alerts.filter((alert) => alert.status === "armed").length;
    const netPnLValue = calculateNetPnL(journalEntries);
    const winRateValue = calculateWinRate(journalEntries, 30);
    const streakValue = calculateJournalStreak(journalEntries);

    const netTrend: "up" | "down" | "flat" =
      netPnLValue === "N/A" || netPnLValue === "0%"
        ? "flat"
        : netPnLValue.startsWith("-")
          ? "down"
          : "up";

    return [
      { label: "Net P&L", value: netPnLValue, trend: netTrend },
      { label: "Win Rate", value: winRateValue, trend: "flat" as const },
      { label: "Alerts Armed", value: String(armedAlertsCount), trend: "up" as const },
      { label: "Journal Streak", value: streakValue, trend: "up" as const },
    ];
  }, [alerts, journalEntries]);

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

  const recentTrades = useMemo(
    () => [...tradeEntries].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 5),
    [tradeEntries]
  );

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

  const handleMarkEntry = useCallback(() => {
    void refresh();
    setIsLogOverlayOpen(true);
  }, [refresh]);

  const renderHoldingsAndTrades = () => (
    <div className="dashboard-split">
      <HoldingsList
        holdings={holdingsData?.tokens ?? []}
        nativeBalanceLamports={holdingsData?.nativeBalanceLamports ?? null}
        status={holdingsStatus}
        walletAddress={monitoredWallet}
        error={holdingsError}
        onRetry={refetchHoldings}
        className="dashboard-card sf-card"
      />
      <TradeLogList
        trades={recentTrades}
        quoteCurrency={settings.quoteCurrency}
        onMarkEntry={handleMarkEntry}
        isMarkEntryDisabled={unconsumedCount === 0}
        className="dashboard-card sf-card"
      />
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

  const renderMainContent = () => {
    if (isLoading) {
      return (
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
            <AlertsSnapshot className="dashboard-card sf-card" />
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-grid dashboard-grid--two">
        <div className="dashboard-primary dashboard-stack">
          <InsightTeaser {...dummyInsight} className="dashboard-card sf-card" />
          {renderHoldingsAndTrades()}
        </div>
        <div className="dashboard-secondary dashboard-stack">
          <JournalSnapshot entries={recentJournalEntries} className="dashboard-card sf-card" />
          <AlertsSnapshot className="dashboard-card sf-card" />
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      {/* Note: DashboardShell is the single layout source-of-truth (no legacy Container/PageHeader duplication). */}
      <DashboardShell
        title="Dashboard"
        description="Command surface for your net risk, streaks, and live intelligence."
        meta={`${journalEntries.length} journal entries · ${alerts.length} alerts`}
        kpiStrip={<DashboardKpiStrip items={kpiItems} />}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void refresh();
              setIsLogOverlayOpen(true);
            }}
            disabled={unconsumedCount === 0}
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
      </DashboardShell>
      <LogEntryOverlayPanel
        isOpen={isLogOverlayOpen}
        onClose={() => setIsLogOverlayOpen(false)}
        events={inboxEvents}
        isLoading={isInboxLoading}
        onSelect={handleJournalTrade}
      />
    </div>
  );
}
