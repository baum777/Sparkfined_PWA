/**
 * Dashboard KPI Calculations
 *
 * Calculates key performance indicators from Journal entries:
 * - Net P&L (Profit & Loss)
 * - Win Rate (percentage of profitable trades)
 * - Journal Streak (consecutive days with entries)
 */

import type { JournalEntry } from '@/store/journalStore';

/**
 * Calculate Net P&L from journal entries
 * Aggregates PnL fields and returns formatted percentage or dollar value
 */
export function calculateNetPnL(entries: JournalEntry[]): string {
  if (entries.length === 0) return 'N/A';

  let totalPnL = 0;
  let validEntries = 0;

  for (const entry of entries) {
    if (!entry.pnl) continue;

    // Parse PnL string (e.g., "+12.4%", "-5.3%", "+$250", "-$150")
    const pnlStr = entry.pnl.trim();
    const isPercentage = pnlStr.includes('%');
    const numericValue = parseFloat(pnlStr.replace(/[%$,+]/g, ''));

    if (!isNaN(numericValue)) {
      totalPnL += numericValue;
      validEntries++;
    }
  }

  if (validEntries === 0) return 'N/A';

  // Return formatted value
  const sign = totalPnL >= 0 ? '+' : '';
  return `${sign}${totalPnL.toFixed(1)}%`;
}

/**
 * Calculate Win Rate from journal entries
 * Returns percentage of trades with positive PnL
 */
export function calculateWinRate(entries: JournalEntry[], days = 30): string {
  if (entries.length === 0) return 'N/A';

  // Filter entries from last N days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentEntries = entries.filter((entry) => {
    // Parse entry.date (e.g., "2025-02-16")
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });

  if (recentEntries.length === 0) return 'N/A';

  let wins = 0;
  let totalTrades = 0;

  for (const entry of recentEntries) {
    if (!entry.pnl) continue;

    const pnlStr = entry.pnl.trim();
    const numericValue = parseFloat(pnlStr.replace(/[%$,+]/g, ''));

    if (!isNaN(numericValue)) {
      totalTrades++;
      if (numericValue > 0) {
        wins++;
      }
    }
  }

  if (totalTrades === 0) return 'N/A';

  const winRate = (wins / totalTrades) * 100;
  return `${Math.round(winRate)}%`;
}

/**
 * Calculate Journal Streak
 * Returns number of consecutive days with at least one journal entry
 */
export function calculateJournalStreak(entries: JournalEntry[]): string {
  if (entries.length === 0) return '0 days';

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Get unique dates
  const uniqueDates = new Set(
    sortedEntries.map((entry) => {
      const date = new Date(entry.date);
      // Normalize to start of day
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    })
  );

  const sortedUniqueDates = Array.from(uniqueDates).sort((a, b) => b - a);

  // Calculate streak starting from today
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  let streak = 0;
  let currentDate = todayNormalized;

  for (const dateTimestamp of sortedUniqueDates) {
    if (dateTimestamp === currentDate) {
      streak++;
      // Move to previous day
      currentDate -= 24 * 60 * 60 * 1000;
    } else if (dateTimestamp < currentDate) {
      // Gap found, streak broken
      break;
    }
  }

  // If no entry today, check if streak starts yesterday
  if (streak === 0 && sortedUniqueDates.length > 0) {
    const yesterday = todayNormalized - 24 * 60 * 60 * 1000;
    currentDate = yesterday;

    for (const dateTimestamp of sortedUniqueDates) {
      if (dateTimestamp === currentDate) {
        streak++;
        currentDate -= 24 * 60 * 60 * 1000;
      } else if (dateTimestamp < currentDate) {
        break;
      }
    }
  }

  if (streak === 0) return '0 days';
  if (streak === 1) return '1 day';
  return `${streak} days`;
}

/**
 * Get trend indicator based on value comparison
 * Used for KPI trend arrows
 */
export function getTrend(current: number, previous: number): 'up' | 'down' | 'flat' {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'flat';
}
