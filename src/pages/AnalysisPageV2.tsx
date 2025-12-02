import React from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AnalysisLayout from "@/components/analysis/AnalysisLayout";
import {
  AdvancedInsightCard,
  generateMockAdvancedInsight,
  useAdvancedInsightStore,
} from "@/features/analysis";
import { fetchAnalysisSnapshot, type AnalysisSnapshot } from "@/features/market/analysisData";
import { useSearchParams } from "react-router-dom";
import { AnalysisHeaderActions } from "@/components/analysis/AnalysisHeaderActions";
import AnalysisOverviewStats, { type AnalysisOverviewStat } from "@/components/analysis/AnalysisOverviewStats";
import StateView from "@/components/ui/StateView";
import { Activity, ArrowDownRight, ArrowUpRight, Target, TrendingUp, Zap } from "@/lib/icons";
import type { BiasLabel } from "@/types/ai";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "flow", label: "Flow" },
  { id: "playbook", label: "Playbook" },
] as const;

type AnalysisTabId = (typeof tabs)[number]["id"];

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const COMPACT_USD_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function AnalysisPageV2() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabs.some((tab) => tab.id === tabFromUrl)
    ? (tabFromUrl as AnalysisTabId)
    : tabs[0].id;
  const [activeTab, setActiveTab] = React.useState<AnalysisTabId>(initialTab);
  const [marketSnapshot, setMarketSnapshot] = React.useState<AnalysisSnapshot | null>(null);
  const [isMarketLoading, setIsMarketLoading] = React.useState(false);
  const [marketError, setMarketError] = React.useState<string | null>(null);
  const ingestAdvancedInsight = useAdvancedInsightStore((state) => state.ingest);
  const analysisSections = useAdvancedInsightStore((state) => state.sections);
  const hasInsight = Boolean(analysisSections);
  const trendSnapshots = useAdvancedInsightStore((state) => state.trendSnapshots);
  const sourcePayloadMeta = useAdvancedInsightStore((state) => state.sourcePayload?.meta);
  const hasLoadedMarketRef = React.useRef(false);
  const trendInsight = React.useMemo(() => {
    const keys = Object.keys(trendSnapshots);
    const firstKey = keys[0];
    if (!firstKey) return undefined;
    return trendSnapshots[firstKey];
  }, [trendSnapshots]);
  const insightSourceLabel = sourcePayloadMeta?.source ?? null;
  const isInsightMock = Boolean(
    insightSourceLabel && insightSourceLabel.toLowerCase().includes("mock")
  );

  const loadMarketSnapshot = React.useCallback(async () => {
    setIsMarketLoading(true);
    setMarketError(null);

    try {
      const snapshot = await fetchAnalysisSnapshot();
      setMarketSnapshot(snapshot);
    } catch (error) {
      console.warn("[analysis] Failed to fetch market snapshot", error);
      setMarketError("Failed to load analysis data. Please try again.");
    } finally {
      setIsMarketLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!tabFromUrl || tabFromUrl !== activeTab) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("tab", activeTab);
      setSearchParams(nextParams, { replace: true });
    }
    // Note: searchParams and setSearchParams are intentionally omitted from deps
    // to prevent infinite loop (searchParams is recreated on every URL change)
  }, [activeTab, tabFromUrl]);

  React.useEffect(() => {
    if (activeTab !== "overview" || hasLoadedMarketRef.current) {
      return;
    }

    hasLoadedMarketRef.current = true;
    void loadMarketSnapshot();
  }, [activeTab, loadMarketSnapshot]);

  React.useEffect(() => {
    if (hasInsight) {
      return;
    }

    const livePrice = marketSnapshot?.price ?? 42.8;
    const mockInsight = generateMockAdvancedInsight("SOL", livePrice);
    ingestAdvancedInsight(mockInsight);
  }, [hasInsight, ingestAdvancedInsight, marketSnapshot?.price]);

  const analysisStats = React.useMemo<AnalysisOverviewStat[]>(() => {
    if (!analysisSections) {
      return [];
    }

    const stats: AnalysisOverviewStat[] = [];
    const bias = analysisSections.market_structure.bias.auto_value;
    const range = analysisSections.market_structure.range.auto_value;
    const flow = analysisSections.flow_volume.flow.auto_value;

    if (bias) {
      stats.push({
        id: "bias",
        label: "Bias",
        value: formatBiasLabel(bias.bias),
        helper: truncate(bias.reason, 120),
        icon: Activity,
        tone: getToneFromBias(bias.bias),
      });
    }

    if (range) {
      stats.push({
        id: "range",
        label: "Range window",
        value: `${formatUsd(range.low)} to ${formatUsd(range.high)}`,
        helper: `${range.window_hours}h window`,
        icon: Target,
        tone: "neutral",
      });
    }

    if (flow?.vol_24h_usd) {
      const delta = typeof flow.vol_24h_delta_pct === "number" ? flow.vol_24h_delta_pct : undefined;
      stats.push({
        id: "volume",
        label: "24h Volume",
        value: formatCompactUsd(flow.vol_24h_usd),
        helper:
          delta !== undefined
            ? `${formatChangePct(delta)} vs prev 24h`
            : flow.source
              ? `Source: ${flow.source}`
              : undefined,
        icon: Zap,
        tone: getToneFromNumber(delta),
      });
    }

    if (marketSnapshot) {
      stats.push({
        id: "price",
        label: `${marketSnapshot.symbol} price`,
        value: formatUsd(marketSnapshot.price),
        helper: `${marketSnapshot.timeframeLabel} close`,
        icon: TrendingUp,
        tone: "neutral",
      });

      stats.push({
        id: "change",
        label: "24h change",
        value: formatChangePct(marketSnapshot.change24hPct),
        helper: "vs previous 24h",
        icon: marketSnapshot.change24hPct >= 0 ? ArrowUpRight : ArrowDownRight,
        tone: getToneFromNumber(marketSnapshot.change24hPct),
      });
    }

    return stats;
  }, [analysisSections, marketSnapshot]);

  const renderTabContent = () => {
    if (activeTab === "overview") {
      if (!analysisSections) {
        return (
          <div className="rounded-2xl border border-border bg-surface p-10">
            <StateView
              type={isMarketLoading ? "loading" : "empty"}
              title={isMarketLoading ? "Loading analysis..." : "No analysis data yet"}
              description={
                isMarketLoading
                  ? "Preparing the latest AI overview."
                  : "Run your first analysis or import trading history to see insights here."
              }
              compact
            />
          </div>
        );
      }

      const bias = analysisSections.market_structure.bias.auto_value;
      const summaryHeadline = bias
        ? `Bias: ${formatBiasLabel(bias.bias)}`
        : "Bias pending";
      const summaryDescription =
        bias?.reason ?? "AI insight summary will appear once data is ready.";
      const summaryTimeframe =
        sourcePayloadMeta?.timeframe ?? marketSnapshot?.timeframeLabel ?? "4H";
      const statsDescription = marketSnapshot
        ? `${marketSnapshot.symbol} ${marketSnapshot.timeframeLabel} window`
        : "AI snapshot uses heuristics until live data arrives.";
      const statsLoading = !analysisStats.length && isMarketLoading;
      const statsError = marketError && !analysisStats.length ? marketError : null;

      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-text-tertiary">Current AI Insight</p>
            <h2 className="text-2xl font-semibold text-text-primary">{summaryHeadline}</h2>
            <p className="text-sm text-text-secondary max-w-3xl">{summaryDescription}</p>
            <p className="text-xs uppercase tracking-wide text-text-tertiary">
              Focus timeframe: {summaryTimeframe}
            </p>
            <AnalysisOverviewStats
              stats={analysisStats}
              isLoading={statsLoading}
              error={statsError}
              onRetry={loadMarketSnapshot}
              showMockBadge={isInsightMock}
              title="Analysis snapshot"
              description={statsDescription}
            />
          </div>

          {trendInsight ? (
            <div className="space-y-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Social trend</p>
                  <p className="text-sm text-text-secondary">{trendInsight.tweet.snippet ?? trendInsight.tweet.fullText}</p>
                </div>
                {trendInsight.sentiment?.label ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                    {trendInsight.sentiment.label}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-text-tertiary">
                {trendInsight.trading?.hypeLevel && trendInsight.trading.hypeLevel !== 'unknown' ? (
                  <TrendBadge label={`Hype: ${trendInsight.trading.hypeLevel}`} />
                ) : null}
                {typeof trendInsight.sparkfined.trendingScore === 'number' ? (
                  <TrendBadge label={`Score ${trendInsight.sparkfined.trendingScore.toFixed(2)}`} />
                ) : null}
                {typeof trendInsight.sparkfined.alertRelevance === 'number' ? (
                  <TrendBadge label={`Relevance ${(trendInsight.sparkfined.alertRelevance * 100).toFixed(0)}%`} />
                ) : null}
                {trendInsight.trading?.callToAction && trendInsight.trading.callToAction !== 'unknown' ? (
                  <TrendBadge label={`CTA: ${trendInsight.trading.callToAction}`} />
                ) : null}
              </div>
              {trendInsight.source.tweetUrl ? (
                <a
                  href={trendInsight.source.tweetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 underline decoration-emerald-500/70 decoration-dotted underline-offset-4"
                >
                  View tweet
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="max-w-4xl">
            <AdvancedInsightCard />
          </div>
        </div>
      );
    }

    if (activeTab === "flow") {
      return (
        <ComingSoonBlock
          title="Flow view is coming soon."
          description="You’ll see sequence, triggers and confirmations here."
        />
      );
    }

    return (
      <ComingSoonBlock
        title="Playbook view is coming soon."
        description="You’ll see your rules and checklists here."
      />
    );
  };

  return (
    <DashboardShell
      title="Analysis"
      description="AI-backed market views, flows and playbooks."
      actions={
        <AnalysisHeaderActions
          activeTab={activeTab}
          isMarketLoading={isMarketLoading}
          marketError={marketError}
        />
      }
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 text-text-primary md:px-6 lg:py-8">
        <section className="space-y-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">Pattern analysis</p>
            <p className="text-base text-text-primary">Deep dives into setups, timing, and sentiment.</p>
            <p className="text-sm text-text-secondary">
              Use filters and tabs to isolate the conditions that matter for your playbook.
            </p>
          </div>
          <div className="space-y-1 text-xs">
            {isMarketLoading && <p className="text-text-tertiary">Syncing the latest market snapshot…</p>}
            {!isMarketLoading && marketError && (
              <p className="font-medium text-warn">{marketError}</p>
            )}
            {!isMarketLoading && !marketError && (
              <p className="text-text-secondary">Insights refresh automatically as new context comes in.</p>
            )}
          </div>
        </section>

        <section>
          <AnalysisLayout
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => {
              setActiveTab(id as AnalysisTabId);
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set("tab", id);
              setSearchParams(nextParams, { replace: true });
            }}
            showHeader={false}
          >
            {renderTabContent()}
          </AnalysisLayout>
        </section>
      </div>
    </DashboardShell>
  );
}

interface ComingSoonBlockProps {
  title: string;
  description: string;
}

function ComingSoonBlock({ title, description }: ComingSoonBlockProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-border bg-surface/70 p-8 text-center">
      <p className="text-base font-semibold text-text-primary">{title}</p>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}

function TrendBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
      {label}
    </span>
  );
}

function formatUsd(value: number): string {
  return USD_FORMATTER.format(value);
}

function formatCompactUsd(value: number): string {
  if (value < 1000) {
    return USD_FORMATTER.format(value);
  }
  return COMPACT_USD_FORMATTER.format(value);
}

function formatChangePct(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function formatBiasLabel(bias?: BiasLabel): string {
  if (!bias) {
    return "Neutral";
  }
  return bias.charAt(0).toUpperCase() + bias.slice(1);
}

function truncate(text: string | undefined, maxLength: number): string {
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}...`;
}

function getToneFromBias(bias?: BiasLabel): AnalysisOverviewStat["tone"] {
  if (bias === "bullish") {
    return "positive";
  }
  if (bias === "bearish") {
    return "negative";
  }
  return "neutral";
}

function getToneFromNumber(value?: number): AnalysisOverviewStat["tone"] {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "neutral";
  }
  if (value > 0) {
    return "positive";
  }
  if (value < 0) {
    return "negative";
  }
  return "neutral";
}
