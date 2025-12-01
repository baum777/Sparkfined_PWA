import type { JournalEntry } from '@/store/journalStore';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const USD_FALLBACK_ACCOUNT_SIZE = 10_000;

type ParsedPnl =
  | { kind: 'percent'; value: number }
  | { kind: 'absolute'; value: number };

/**
 * Aggregate net PnL across entries, returning a formatted percent string.
 * Falls back to approximating USD values as a percentage of a default account size.
 */
export function calculateNetPnL(entries: JournalEntry[]): string {
  if (!Array.isArray(entries) || entries.length === 0) {
    return 'N/A';
  }

  let totalPercent = 0;
  let hasValidValue = false;

  for (const entry of entries) {
    const parsed = parsePnl(entry.pnl);
    if (!parsed) {
      continue;
    }
    hasValidValue = true;
    if (parsed.kind === 'percent') {
      totalPercent += parsed.value;
    } else {
      totalPercent += convertAbsoluteToPercent(parsed.value);
    }
  }

  if (!hasValidValue) {
    return 'N/A';
  }

  return formatPercent(totalPercent);
}

/**
 * Calculate win rate for the provided lookback window, rounded to whole percents.
 */
export function calculateWinRate(entries: JournalEntry[], days = 30): string {
  if (!Array.isArray(entries) || entries.length === 0) {
    return 'N/A';
  }

  const cutoff = Date.now() - Math.max(days, 1) * ONE_DAY_MS;
  let wins = 0;
  let total = 0;

  for (const entry of entries) {
    const entryDate = getEntryDate(entry);
    if (!entryDate || entryDate.getTime() < cutoff) {
      continue;
    }

    const parsed = parsePnl(entry.pnl);
    if (!parsed) {
      continue;
    }

    const normalizedValue = parsed.kind === 'percent' ? parsed.value : convertAbsoluteToPercent(parsed.value);
    total += 1;
    if (normalizedValue > 0) {
      wins += 1;
    }
  }

  if (total === 0) {
    return 'N/A';
  }

  const rate = Math.round((wins / total) * 100);
  return `${rate}%`;
}

/**
 * Determine consecutive-day streak of journal activity, starting from today (or yesterday if today has no entries).
 */
export function calculateJournalStreak(entries: JournalEntry[]): string {
  if (!Array.isArray(entries) || entries.length === 0) {
    return '0 days';
  }

  const dayKeys = new Set<string>();
  for (const entry of entries) {
    const entryDate = getEntryDate(entry);
    if (!entryDate) {
      continue;
    }
    dayKeys.add(formatDayKey(entryDate));
  }

  if (dayKeys.size === 0) {
    return '0 days';
  }

  const today = startOfUTCDay(new Date());
  const todayKey = formatDayKey(today);

  let cursor = dayKeys.has(todayKey) ? today : addDays(today, -1);
  if (!dayKeys.has(formatDayKey(cursor))) {
    return '0 days';
  }

  let streak = 0;
  while (dayKeys.has(formatDayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return `${streak} day${streak === 1 ? '' : 's'}`;
}

function parsePnl(pnl?: string | null): ParsedPnl | null {
  if (typeof pnl !== 'string') {
    return null;
  }
  const trimmed = pnl.trim();
  if (!trimmed) {
    return null;
  }

  const percentMatch = trimmed.match(/([-+]?[0-9]+(?:\.[0-9]+)?)\s*%/);
  if (percentMatch) {
    const value = Number(percentMatch[1]);
    return Number.isFinite(value) ? { kind: 'percent', value } : null;
  }

  if (trimmed.includes('$')) {
    const absolute = Number(trimmed.replace(/[^0-9.+-]/g, ''));
    return Number.isFinite(absolute) ? { kind: 'absolute', value: absolute } : null;
  }

  // Attempt to parse plain numeric strings (without % or $) defensively.
  const numericValue = Number(trimmed);
  if (Number.isFinite(numericValue)) {
    return { kind: 'percent', value: numericValue };
  }

  return null;
}

function convertAbsoluteToPercent(value: number): number {
  if (!Number.isFinite(value) || USD_FALLBACK_ACCOUNT_SIZE <= 0) {
    return 0;
  }
  return (value / USD_FALLBACK_ACCOUNT_SIZE) * 100;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return 'N/A';
  }
  if (value === 0) {
    return '0%';
  }
  const precision = Math.abs(value) >= 100 ? 0 : 1;
  const rounded = Number(value.toFixed(precision));
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(precision)}%`;
}

export function getEntryDate(entry: JournalEntry): Date | null {
  if (!entry?.date) {
    return null;
  }

  const direct = Date.parse(entry.date);
  if (!Number.isNaN(direct)) {
    return new Date(direct);
  }

  const sanitized = entry.date.replace(/·/g, ' ').replace(/\s+/g, ' ').trim();
  const match = sanitized.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}):(\d{2})\s*(UTC)?$/i);
  if (!match) {
    return null;
  }

  const [, monthRaw = '', dayRaw = '0', hourRaw = '0', minuteRaw = '0'] = match;
  const monthIndex = MONTHS.indexOf(monthRaw.toLowerCase());
  if (monthIndex < 0) {
    return null;
  }

  const now = new Date();
  const candidate = new Date(Date.UTC(now.getUTCFullYear(), monthIndex, Number(dayRaw), Number(hourRaw), Number(minuteRaw)));

  // If the parsed date ends up in the future (e.g., entries from last year), roll back year until it is not.
  while (candidate.getTime() - now.getTime() > ONE_DAY_MS) {
    candidate.setUTCFullYear(candidate.getUTCFullYear() - 1);
  }

  return candidate;
}

function formatDayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;
}

function startOfUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * ONE_DAY_MS);
}

