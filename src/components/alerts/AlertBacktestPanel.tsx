import React, { useState } from 'react';
import type { AlertRule, BacktestConfig, BacktestResult } from '@/types/confluence-alerts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

// ============================================================================
// ALERT BACKTEST PANEL
// ============================================================================

type AlertBacktestPanelProps = {
  rule: AlertRule;
};

export default function AlertBacktestPanel({ rule }: AlertBacktestPanelProps) {
  const [symbol, setSymbol] = useState('SOL');
  const [timeframe, setTimeframe] = useState('15m');
  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'custom'>('90d');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    setResult(null);

    // TODO Codex: Import and use backtestAlertRule from @/lib/alerts/backtest
    // const config: BacktestConfig = {
    //   alertRuleId: rule.id,
    //   symbol,
    //   timeframe,
    //   startDate: Date.now() - (dateRange === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000,
    //   endDate: Date.now(),
    //   includePartialTriggers: false,
    // };
    //
    // try {
    //   const backtestResult = await backtestAlertRule(rule, config);
    //   setResult(backtestResult);
    // } catch (error) {
    //   console.error('[AlertBacktestPanel] Backtest failed', error);
    // } finally {
    //   setIsRunning(false);
    // }

    // Mock result for now
    setTimeout(() => {
      setResult({
        config: {
          alertRuleId: rule.id,
          symbol,
          timeframe,
          startDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
          endDate: Date.now(),
          includePartialTriggers: false,
        },
        ranAt: Date.now(),
        totalTriggers: 47,
        avgTriggersPerDay: 1.2,
        triggersPerMonth: [],
        triggers: [],
        performanceBySession: [],
        performanceByWeekday: [],
      } as BacktestResult);
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* ========== BACKTEST CONFIGURATION ========== */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Backtest Configuration</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-text-primary">Symbol</label>
            <Select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1"
            >
              <option value="SOL">SOL</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </Select>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-sm font-medium text-text-primary">Timeframe</label>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="mt-1"
            >
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-text-primary">Date Range</label>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="mt-1"
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom</option>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="mt-4"
        >
          {isRunning ? 'Running Backtest...' : 'Run Backtest'}
        </Button>
      </Card>

      {/* ========== BACKTEST RESULTS ========== */}
      {result && (
        <>
          {/* Summary Stats */}
          <Card className="p-4">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Results</h3>
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Total Triggers" value={result.totalTriggers.toString()} />
              <StatCard label="Avg/Day" value={result.avgTriggersPerDay.toFixed(1)} />
              <StatCard
                label="Best Session"
                value={result.performanceBySession[0]?.session || 'N/A'}
              />
              <StatCard
                label="Best Weekday"
                value={result.performanceByWeekday[0]?.weekday || 'N/A'}
              />
            </div>
          </Card>

          {/* Triggers Over Time Chart */}
          <Card className="p-4">
            <h4 className="mb-3 text-sm font-semibold text-text-primary">
              Triggers Over Time
            </h4>
            <div className="flex h-48 items-center justify-center rounded-lg border border-border-subtle bg-surface-elevated">
              <p className="text-sm text-text-secondary">
                TODO Codex: Implement chart (line chart with trigger timestamps)
              </p>
            </div>
          </Card>

          {/* Individual Trigger Details */}
          <Card className="p-4">
            <h4 className="mb-3 text-sm font-semibold text-text-primary">
              Trigger Details
            </h4>
            {result.triggers.length === 0 ? (
              <p className="text-sm text-text-secondary">No triggers found in this backtest</p>
            ) : (
              <div className="space-y-2">
                {/* TODO Codex: Render trigger table with timestamp, price, conditions met */}
                <p className="text-xs text-text-secondary">
                  TODO Codex: Implement trigger detail table
                </p>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Empty State */}
      {!result && !isRunning && (
        <Card className="flex h-48 items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Configure backtest parameters above and click "Run Backtest"
            </p>
            <p className="mt-2 text-xs text-text-tertiary">
              Backtest shows how this alert would have performed on historical data
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-elevated p-3">
      <p className="text-xs uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}
