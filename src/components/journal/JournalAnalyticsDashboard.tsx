import React from 'react';
import type { AdvancedAnalyticsReport } from '@/types/analytics-v2';
import Card from '@/components/ui/Card';

// ============================================================================
// JOURNAL ANALYTICS DASHBOARD
// ============================================================================

type JournalAnalyticsDashboardProps = {
  analytics: AdvancedAnalyticsReport | null;
  isLoading?: boolean;
};

export default function JournalAnalyticsDashboard({
  analytics,
  isLoading,
}: JournalAnalyticsDashboardProps) {
  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  // ========== EMPTY STATE ==========
  if (!analytics) {
    return (
      <div className="flex h-64 items-center justify-center text-center">
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">No analytics data available yet.</p>
          <p className="text-xs text-text-tertiary">
            Create more journal entries to see advanced analytics.
          </p>
        </div>
      </div>
    );
  }

  const { overall, bySetup, byEmotion, bySession, equityCurve, perfectTrader } = analytics;

  return (
    <div className="space-y-6">
      {/* ========== OVERALL METRICS (KPI CARDS) ========== */}
      <section>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Overall Performance
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Win Rate"
            value={`${overall.winRate.toFixed(1)}%`}
            trend={overall.winRate >= 50 ? 'positive' : 'negative'}
          />
          <MetricCard
            label="Total PnL"
            value={formatCurrency(overall.totalPnl)}
            trend={overall.totalPnl >= 0 ? 'positive' : 'negative'}
          />
          <MetricCard
            label="Expectancy"
            value={formatCurrency(overall.expectancy)}
            trend={overall.expectancy >= 0 ? 'positive' : 'negative'}
          />
          <MetricCard
            label="Profit Factor"
            value={overall.profitFactor.toFixed(2)}
            trend={overall.profitFactor >= 1.5 ? 'positive' : 'neutral'}
          />
        </div>
      </section>

      {/* ========== BREAKDOWNS (BY SETUP/EMOTION/SESSION) ========== */}
      <section>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Performance Breakdowns
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* TODO Codex: Replace with actual chart components */}
          <BreakdownCard title="By Setup" data={bySetup.slice(0, 5)} />
          <BreakdownCard title="By Emotion" data={byEmotion.slice(0, 5)} />
          <BreakdownCard title="By Session" data={bySession} />
        </div>
      </section>

      {/* ========== EQUITY CURVE ========== */}
      <section>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Equity Curve
        </h3>
        <Card className="p-4">
          {/* TODO Codex: Implement EquityCurveChart component */}
          <div className="flex h-48 items-center justify-center text-sm text-text-secondary">
            Equity Curve Chart (TODO: Implement with recharts or lightweight-charts)
          </div>
        </Card>
      </section>

      {/* ========== PERFECT TRADER COMPARISON ========== */}
      <section>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Perfect Trader Comparison
        </h3>
        <Card className="p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-text-tertiary">Actual Performance</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">
                {formatCurrency(perfectTrader.actualPnl)}
              </p>
              <p className="text-sm text-text-secondary">
                Win Rate: {perfectTrader.actualWinRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-text-tertiary">
                Perfect Trader (Best Setups Only)
              </p>
              <p className="mt-2 text-2xl font-semibold text-sentiment-bull">
                {formatCurrency(perfectTrader.perfectPnl)}
              </p>
              <p className="text-sm text-text-secondary">
                Win Rate: {perfectTrader.perfectWinRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {perfectTrader.recommendations.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border-subtle pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                Recommendations
              </p>
              <ul className="space-y-1">
                {perfectTrader.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-text-secondary">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </section>

      {/* TODO Codex: Add Monte Carlo Simulation Panel */}
    </div>
  );
}

// ============================================================================
// METRIC CARD (KPI Card)
// ============================================================================

type MetricCardProps = {
  label: string;
  value: string;
  trend: 'positive' | 'negative' | 'neutral';
};

function MetricCard({ label, value, trend }: MetricCardProps) {
  const trendColorClass =
    trend === 'positive'
      ? 'text-sentiment-bull'
      : trend === 'negative'
        ? 'text-sentiment-bear'
        : 'text-text-primary';

  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${trendColorClass}`}>{value}</p>
    </Card>
  );
}

// ============================================================================
// BREAKDOWN CARD (Mini Table)
// ============================================================================

type BreakdownCardProps = {
  title: string;
  data: Array<{
    dimension: string;
    metrics: { winRate: number; expectancy: number };
    tradeCount: number;
  }>;
};

function BreakdownCard({ title, data }: BreakdownCardProps) {
  return (
    <Card className="p-4">
      <h4 className="mb-3 text-sm font-semibold text-text-primary">{title}</h4>
      {data.length === 0 ? (
        <p className="text-xs text-text-secondary">No data available</p>
      ) : (
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{item.dimension}</p>
                <p className="text-xs text-text-secondary">{item.tradeCount} trades</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary">
                  {item.metrics.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-text-secondary">
                  {formatCurrency(item.metrics.expectancy)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* TODO Codex: Add bar chart visualization */}
    </Card>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}
