import React from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AnalysisLayout from "@/components/analysis/AnalysisLayout";
import {
  AdvancedInsightCard,
  generateMockAdvancedInsight,
  generateMockUnlockedAccess,
  useAdvancedInsightStore,
} from "@/features/analysis";
import { fetchAnalysisSnapshot, type AnalysisSnapshot } from "@/features/market/analysisData";
import { useSearchParams } from "react-router-dom";
import { AnalysisHeaderActions } from "@/components/analysis/AnalysisHeaderActions";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "flow", label: "Flow" },
  { id: "playbook", label: "Playbook" },
] as const;

type AnalysisTabId = (typeof tabs)[number]["id"];

const overviewInsight = {
  bias: "Bullish",
  confidence: 0.78,
  timeFrame: "4H",
  summary:
    "Momentum stays constructive above the 42.50 liquidity shelf. AI expects continuation toward the weekly supply band as long as higher lows remain intact.",
};

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
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
  const hasInsight = Boolean(useAdvancedInsightStore((state) => state.sections));
  const trendSnapshots = useAdvancedInsightStore((state) => state.trendSnapshots);
  const hasLoadedMarketRef = React.useRef(false);
  const trendInsight = React.useMemo(() => {
    const keys = Object.keys(trendSnapshots);
    const firstKey = keys[0];
    if (!firstKey) return undefined;
    return trendSnapshots[firstKey];
  }, [trendSnapshots]);

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
    setIsMarketLoading(true);
    setMarketError(null);

    void fetchAnalysisSnapshot()
      .then((snapshot) => {
        setMarketSnapshot(snapshot);
      })
      .catch((error) => {
        console.warn("[analysis] Failed to fetch market snapshot", error);
        setMarketError("Market snapshot unavailable, showing AI bias only.");
      })
      .finally(() => {
        setIsMarketLoading(false);
      });
  }, [activeTab]);

  React.useEffect(() => {
    if (hasInsight) {
      return;
    }

    const livePrice = marketSnapshot?.price ?? 42.8;
    const mockInsight = generateMockAdvancedInsight("SOL", livePrice);
    ingestAdvancedInsight(mockInsight, generateMockUnlockedAccess());
  }, [hasInsight, ingestAdvancedInsight, marketSnapshot?.price]);

  const renderTabContent = () => {
    if (activeTab === "overview") {
      if (!hasInsight) {
        return <OverviewInsightSkeleton />;
      }

      const stats: Array<{ label: string; value: React.ReactNode; accent?: string }> = [
        { label: "Bias", value: overviewInsight.bias, accent: "text-emerald-300" },
        {
          label: "Confidence",
          value: `${Math.round(overviewInsight.confidence * 100)}%`,
          accent: "text-amber-300",
        },
        { label: "Timeframe", value: overviewInsight.timeFrame, accent: "text-text-primary" },
      ];

      if (marketSnapshot) {
        stats.push(
          {
            label: "Last price",
            value: formatUsd(marketSnapshot.price),
            accent: "text-amber-200",
          },
          {
            label: "24h change",
            value: formatChangePct(marketSnapshot.change24hPct),
            accent: getChangeAccentFromNumber(marketSnapshot.change24hPct),
          }
        );
      } else if (isMarketLoading) {
        const placeholder = (
          <span className="inline-flex h-5 w-20 rounded-full bg-surface-hover animate-pulse" />
        );
        stats.push(
          { label: "Last price", value: placeholder, accent: "text-text-secondary" },
          { label: "24h change", value: placeholder, accent: "text-text-secondary" }
        );
      }

      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-text-tertiary">Current AI Insight</p>
            <h2 className="text-2xl font-semibold text-text-primary">
              Bias remains {overviewInsight.bias.toLowerCase()} while liquidity builds.
            </h2>
            <p className="text-sm text-text-secondary max-w-3xl">{overviewInsight.summary}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary"
                >
                  <p className="text-xs uppercase tracking-wide text-text-tertiary">{stat.label}</p>
                  <p className={`mt-1 text-lg font-semibold ${stat.accent ?? "text-text-primary"}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            {isMarketLoading && !marketSnapshot && (
              <p className="text-xs text-text-tertiary">Fetching market snapshot…</p>
            )}
            {marketError && <p className="text-xs text-amber-300">{marketError}</p>}
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

function OverviewInsightSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-40 rounded-full bg-surface-hover animate-pulse" />
          <div className="h-6 w-3/4 rounded-full bg-surface-hover animate-pulse" />
          <div className="h-4 w-full rounded-full bg-surface animate-pulse" />
          <div className="h-4 w-2/3 rounded-full bg-surface animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-20 rounded-2xl border border-border bg-surface animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-surface p-6">
        <div className="h-64 w-full animate-pulse rounded-2xl bg-surface-hover" />
        <p className="mt-4 text-center text-sm text-text-tertiary">
          No AI insight available yet. Fetching the latest market view…
        </p>
      </div>
    </div>
  );
}

function formatUsd(value: number): string {
  return USD_FORMATTER.format(value);
}

function formatChangePct(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function getChangeAccentFromNumber(value: number): string {
  if (value > 0) {
    return "text-emerald-300";
  }
  if (value < 0) {
    return "text-rose-300";
  }
  return "text-text-primary";
}
