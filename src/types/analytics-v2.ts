/**
 * Advanced Analytics Types
 *
 * Next-gen analytics for Journal 2.0:
 * - Win rate by setup/session/emotion/weekday
 * - Expectancy calculation
 * - Monte Carlo simulation
 * - "Perfect Trader" comparison
 */

import type { ICTSetupType, TradingSession, ICTKillzone } from './wallet-tracking';
import type { SetupTag, EmotionTag } from './journal';

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export type PerformanceMetrics = {
  // Basic Stats
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;

  // Win Rate
  winRate: number;              // % (0-100)
  winRateByAmount: number;      // Win rate weighted by trade size

  // PnL
  totalPnl: number;             // USD
  totalPnlPercent: number;      // %
  avgPnl: number;               // Average PnL per trade
  avgWinPnl: number;            // Average winning trade
  avgLossPnl: number;           // Average losing trade

  // Risk Metrics
  largestWin: number;
  largestLoss: number;
  avgRiskReward: number;        // Average R:R ratio
  expectancy: number;           // Expected value per trade (USD)
  expectancyR: number;          // Expected value in R multiples

  // Streaks
  currentStreak: number;        // Current win/loss streak (positive = wins)
  longestWinStreak: number;
  longestLossStreak: number;

  // Drawdown
  maxDrawdown: number;          // USD
  maxDrawdownPercent: number;   // %
  currentDrawdown: number;      // Current drawdown from peak

  // Time-Based
  avgTimeInTrade: number;       // milliseconds
  profitFactor: number;         // Gross profit / Gross loss
  sharpeRatio?: number;         // Risk-adjusted return (if daily returns available)
};

// ============================================================================
// BREAKDOWN ANALYTICS (By Dimension)
// ============================================================================

export type AnalyticsDimension =
  | 'setup'
  | 'emotion'
  | 'session'
  | 'killzone'
  | 'weekday'
  | 'timeframe'
  | 'direction'
  | 'tilt-level';

export type DimensionBreakdown<T extends string = string> = {
  dimension: T;
  metrics: PerformanceMetrics;
  tradeCount: number;

  // Comparison to overall
  winRateDiff: number;          // Difference from overall win rate
  expectancyDiff: number;       // Difference from overall expectancy

  // Ranking
  rank?: number;                // 1 = best performing
};

// Setup Breakdown
export type SetupBreakdown = DimensionBreakdown<SetupTag | ICTSetupType>;

// Emotion Breakdown
export type EmotionBreakdown = DimensionBreakdown<EmotionTag>;

// Session Breakdown
export type SessionBreakdown = DimensionBreakdown<TradingSession>;

// Killzone Breakdown
export type KillzoneBreakdown = DimensionBreakdown<ICTKillzone>;

// Weekday Breakdown
export type WeekdayBreakdown = DimensionBreakdown<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;

// Direction Breakdown
export type DirectionBreakdown = DimensionBreakdown<'long' | 'short'>;

// Tilt Level Breakdown
export type TiltBreakdown = DimensionBreakdown<'low' | 'medium' | 'high'>;

// ============================================================================
// ADVANCED ANALYTICS REPORT
// ============================================================================

export type AdvancedAnalyticsReport = {
  // Overall Performance
  overall: PerformanceMetrics;

  // Breakdowns
  bySetup: SetupBreakdown[];
  byEmotion: EmotionBreakdown[];
  bySession: SessionBreakdown[];
  byKillzone: KillzoneBreakdown[];
  byWeekday: WeekdayBreakdown[];
  byDirection: DirectionBreakdown[];
  byTiltLevel: TiltBreakdown[];

  // Time Series
  equityCurve: EquityPoint[];
  monthlyPerformance: MonthlyStats[];

  // Best/Worst Analysis
  bestSetup: SetupBreakdown | null;
  worstSetup: SetupBreakdown | null;
  bestSession: SessionBreakdown | null;
  worstSession: SessionBreakdown | null;
  bestEmotion: EmotionBreakdown | null;
  worstEmotion: EmotionBreakdown | null;

  // Perfect Trader Comparison
  perfectTrader: PerfectTraderComparison;

  // Monte Carlo Simulation
  monteCarlo?: MonteCarloResult;
};

// ============================================================================
// EQUITY CURVE
// ============================================================================

export type EquityPoint = {
  timestamp: number;
  balance: number;              // Account balance at this point
  pnl: number;                  // Cumulative PnL
  tradeNumber: number;          // Trade sequence number
  drawdown: number;             // Current drawdown from peak
};

// ============================================================================
// MONTHLY STATS
// ============================================================================

export type MonthlyStats = {
  year: number;
  month: number;                // 1-12
  monthLabel: string;           // e.g., "Jan 2025"

  trades: number;
  wins: number;
  losses: number;
  winRate: number;

  pnl: number;
  pnlPercent: number;

  expectancy: number;
  profitFactor: number;

  isProfit: boolean;
};

// ============================================================================
// PERFECT TRADER COMPARISON
// ============================================================================

export type PerfectTraderComparison = {
  // Actual Performance
  actualPnl: number;
  actualWinRate: number;
  actualExpectancy: number;

  // Perfect Trader (if only took best setups/sessions/emotions)
  perfectPnl: number;
  perfectWinRate: number;
  perfectExpectancy: number;

  // What if scenarios
  whatIfScenarios: WhatIfScenario[];

  // Recommendations
  recommendations: string[];
};

export type WhatIfScenario = {
  scenario: string;             // e.g., "Only trade FVG setups during London Killzone"
  potentialPnl: number;
  potentialWinRate: number;
  tradesFiltered: number;       // How many trades would be excluded
  improvement: number;          // % improvement in PnL
};

// ============================================================================
// MONTE CARLO SIMULATION
// ============================================================================

export type MonteCarloInput = {
  startingBalance: number;
  numSimulations: number;       // e.g., 1000
  numTrades: number;            // e.g., 100 (project next 100 trades)

  // Based on historical performance
  winRate: number;
  avgWin: number;
  avgLoss: number;
  stdDevWin: number;
  stdDevLoss: number;
};

export type MonteCarloResult = {
  simulations: MonteCarloSimulation[];

  // Aggregated Results
  medianFinalBalance: number;
  meanFinalBalance: number;

  // Risk Metrics
  probabilityOfProfit: number;  // % of simulations ending in profit
  probabilityOfRuin: number;    // % of simulations hitting zero

  // Confidence Intervals
  percentile10: number;         // 10th percentile final balance
  percentile25: number;         // 25th percentile
  percentile50: number;         // 50th (median)
  percentile75: number;         // 75th percentile
  percentile90: number;         // 90th percentile

  // Drawdown Stats
  avgMaxDrawdown: number;
  worstDrawdown: number;
};

export type MonteCarloSimulation = {
  simulationId: number;
  equityCurve: number[];        // Balance at each trade
  finalBalance: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  didBlowUp: boolean;           // Did account hit zero?
};

// ============================================================================
// EXPECTANCY CALCULATION
// ============================================================================

/**
 * Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
 *
 * This is the expected value per trade.
 * Positive expectancy = profitable system long-term
 */
export function calculateExpectancy(
  winRate: number,              // 0-1 (e.g., 0.65 for 65%)
  avgWin: number,
  avgLoss: number,
): number {
  const lossRate = 1 - winRate;
  return (winRate * avgWin) - (lossRate * Math.abs(avgLoss));
}

/**
 * Expectancy in R multiples (assuming 1R = risk per trade)
 */
export function calculateExpectancyR(
  winRate: number,
  avgRMultipleWin: number,      // e.g., 2.5 (winner is 2.5R)
  avgRMultipleLoss: number,     // e.g., -1 (loser is -1R)
): number {
  const lossRate = 1 - winRate;
  return (winRate * avgRMultipleWin) + (lossRate * avgRMultipleLoss);
}

// ============================================================================
// PROFIT FACTOR
// ============================================================================

/**
 * Profit Factor = Gross Profit / Gross Loss
 *
 * > 2.0 = excellent
 * 1.5-2.0 = good
 * 1.0-1.5 = acceptable
 * < 1.0 = losing system
 */
export function calculateProfitFactor(
  grossProfit: number,          // Sum of all winning trades
  grossLoss: number,            // Sum of all losing trades (absolute value)
): number {
  if (grossLoss === 0) {
    return grossProfit > 0 ? Infinity : 0;
  }
  return grossProfit / Math.abs(grossLoss);
}

// ============================================================================
// SHARPE RATIO
// ============================================================================

/**
 * Sharpe Ratio = (Mean Return - Risk-Free Rate) / Std Dev of Returns
 *
 * Measures risk-adjusted return
 * > 1.0 = good
 * > 2.0 = very good
 * > 3.0 = excellent
 */
export function calculateSharpeRatio(
  returns: number[],            // Array of daily/trade returns (%)
  riskFreeRate = 0,             // Annual risk-free rate (default 0 for crypto)
): number {
  if (returns.length === 0) return 0;

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return (meanReturn - riskFreeRate) / stdDev;
}

// ============================================================================
// MAX DRAWDOWN
// ============================================================================

export type DrawdownAnalysis = {
  maxDrawdown: number;          // USD
  maxDrawdownPercent: number;   // %
  currentDrawdown: number;
  currentDrawdownPercent: number;

  // When did max DD occur?
  maxDrawdownStart: number;     // Timestamp of peak before DD
  maxDrawdownEnd: number;       // Timestamp of valley (lowest point)
  maxDrawdownDuration: number;  // milliseconds

  // Recovery
  recoveredAt?: number;         // Timestamp of recovery (if recovered)
  recoveryDuration?: number;    // milliseconds to recover
  isRecovered: boolean;
};

/**
 * Calculate maximum drawdown from equity curve
 */
export function calculateMaxDrawdown(equityCurve: EquityPoint[]): DrawdownAnalysis {
  if (equityCurve.length === 0) {
    return {
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      currentDrawdown: 0,
      currentDrawdownPercent: 0,
      maxDrawdownStart: 0,
      maxDrawdownEnd: 0,
      maxDrawdownDuration: 0,
      isRecovered: true,
    };
  }

  let peak = equityCurve[0].balance;
  let peakTimestamp = equityCurve[0].timestamp;
  let maxDD = 0;
  let maxDDPercent = 0;
  let maxDDStart = 0;
  let maxDDEnd = 0;

  for (const point of equityCurve) {
    if (point.balance > peak) {
      peak = point.balance;
      peakTimestamp = point.timestamp;
    }

    const dd = peak - point.balance;
    const ddPercent = peak === 0 ? 0 : (dd / peak) * 100;

    if (dd > maxDD) {
      maxDD = dd;
      maxDDPercent = ddPercent;
      maxDDStart = peakTimestamp;
      maxDDEnd = point.timestamp;
    }
  }

  const currentBalance = equityCurve[equityCurve.length - 1].balance;
  const currentDD = Math.max(0, peak - currentBalance);
  const currentDDPercent = peak === 0 ? 0 : (currentDD / peak) * 100;

  return {
    maxDrawdown: maxDD,
    maxDrawdownPercent: maxDDPercent,
    currentDrawdown: currentDD,
    currentDrawdownPercent: currentDDPercent,
    maxDrawdownStart: maxDDStart,
    maxDrawdownEnd: maxDDEnd,
    maxDrawdownDuration: maxDDEnd - maxDDStart,
    isRecovered: currentBalance >= peak,
  };
}
