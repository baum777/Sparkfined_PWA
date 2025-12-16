import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { LogEntryOverlayPanel } from "@/components/dashboard/LogEntryOverlayPanel";
import DashboardKpiStrip from "@/components/dashboard/DashboardKpiStrip";
import DashboardMainGrid from "@/components/dashboard/DashboardMainGrid";
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
import {
  calculateJournalStreak,
  calculateNetPnL,
  calculateWinRate,
  getEntryDate,
} from "@/lib/dashboard/calculateKPIs";
import { getAllTrades, type TradeEntry } from "@/lib/db";
import { useTradeEventInbox, type TradeEventInboxItem } from "@/hooks/useTradeEventInbox";
import { useSettings } from "@/state/settings";
import { useTradeEventJournalBridge } from "@/store/tradeEventJournalBridge";
import { useWalletHoldings } from "@/hooks/useWalletHoldings";
import { getMonitoredWallet } from "@/lib/wallet/monitoredWallet";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogEntryOverlayPanel } from '@/components/dashboard/LogEntryOverlayPanel';
import InsightTeaser from '@/components/dashboard/InsightTeaser';
import JournalSnapshot from '@/components/dashboard/JournalSnapshot';
import AlertsSnapshot from '@/components/dashboard/AlertsSnapshot';
import { HoldingsList, type HoldingPosition } from '@/components/dashboard/HoldingsList';
import { TradeLogList } from '@/components/dashboard/TradeLogList';
import { Container, KpiTile, PageHeader } from '@/components/ui';
import ErrorBanner from '@/components/ui/ErrorBanner';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import StateView from '@/components/ui/StateView';
import { useJournalStore } from '@/store/journalStore';
import { useAlertsStore } from '@/store/alertsStore';
import { calculateJournalStreak, calculateNetPnL, calculateWinRate, getEntryDate } from '@/lib/dashboard/calculateKPIs';
import { getAllTrades, type TradeEntry } from '@/lib/db';
import { useTradeEventInbox, type TradeEventInboxItem } from '@/hooks/useTradeEventInbox';
import { useSettings } from '@/state/settings';
import { useTradeEventJournalBridge } from '@/store/tradeEventJournalBridge';

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

  const [isLoading, setIsLoading] = useState(false);
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
    window.addEventListener("sparkfined:monitored-wallet-changed", handleWalletChange);

    return () => {
      window.removeEventListener("storage", handleWalletChange);
      window.removeEventListener("sparkfined:monitored-wallet-changed", handleWalletChange);
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
    void getAllTrades()
      .then((entries) => setTradeEntries(entries))
      .catch(() => setTradeEntries([]));
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

  const handleMarkEntry = React.useCallback(() => {
    void refresh();
    setIsLogOverlayOpen(true);
  }, [refresh]);

  const renderHoldingsAndTrades = () => (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <HoldingsList
        holdings={holdingsData?.tokens ?? []}
        nativeBalanceLamports={holdingsData?.nativeBalanceLamports ?? null}
        status={holdingsStatus}
        walletAddress={monitoredWallet}
        error={holdingsError}
        onRetry={refetchHoldings}
      />
      <TradeLogList trades={recentTrades} quoteCurrency={settings.quoteCurrency} />
    <div className="grid gap-6 xl:grid-cols-2">
      <HoldingsList holdings={holdings} quoteCurrency={settings.quoteCurrency} />
      <TradeLogList
        trades={recentTrades}
        quoteCurrency={settings.quoteCurrency}
        onMarkEntry={handleMarkEntry}
        isMarkEntryDisabled={unconsumedCount === 0}
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
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <Skeleton variant="card" className="h-72 w-full" />
            {renderHoldingsAndTrades()}
          </div>
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            <Skeleton variant="card" className="h-60 w-full" />
            <Skeleton variant="card" className="h-60 w-full" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <ErrorBanner message={error} onRetry={handleRetry} />
          <div className="card-glass rounded-3xl p-6">
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
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <div className="card-elevated rounded-3xl p-6">
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
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            <div className="card-glass rounded-3xl p-6">
              <StateView
                type="empty"
                title="No journal entries"
                description="Log a trade or mindset note to build your streaks."
                actionLabel="Open journal"
                onAction={() => navigate("/journal")}
                onAction={() => navigate('/journal')}
                compact
              />
            </div>
            <AlertsSnapshot />
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <InsightTeaser {...dummyInsight} />
          {renderHoldingsAndTrades()}
        </div>
        <div className="space-y-6 lg:col-span-5 xl:col-span-4">
          <JournalSnapshot entries={recentJournalEntries} />
          <AlertsSnapshot />
        </div>
      </div>
    );
  };

  return (
    <div data-testid="dashboard-page">
      <DashboardShell
        title="Dashboard"
        description="Command surface for your net risk, streaks, and live intelligence."
        meta={`${journalEntries.length} journal entries · ${alerts.length} alerts`}
        kpiStrip={kpiStripContent}
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
      <Container maxWidth="2xl" className="py-6">
        <PageHeader
          title="Dashboard"
          subtitle="Command surface for your net risk, streaks, and live intelligence."
          actions={
            <>
              <Button variant="primary" size="sm" onClick={() => navigate('/chart')} data-testid="dashboard-open-chart">
                Open chart
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/alerts')} data-testid="dashboard-new-alert">
                New alert
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/journal')} data-testid="dashboard-run-journal">
                Run journal
              </Button>
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
                  <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs">{unconsumedCount}</span>
                ) : null}
              </Button>
            </>
          }
        />

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Key performance indicators loading">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="card" className="h-24 w-full" />
              ))}
            </div>
          ) : error ? null : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Key performance indicators">
              {kpiItems.map((item) => (
                <KpiTile
                  key={item.label}
                  label={item.label}
                  value={item.value === 'N/A' ? <span className="text-text-tertiary">—</span> : item.value}
                />
              ))}
            </div>
          )}

          {renderMainContent()}
        </div>
      </Container>
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
