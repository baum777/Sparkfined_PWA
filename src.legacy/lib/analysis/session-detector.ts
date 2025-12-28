/**
 * Trading Session Detection
 *
 * Detects:
 * - Trading sessions (Asian, London, NY, Sydney)
 * - ICT Killzones
 * - High-volatility periods
 */

import type { SessionInfo, TradingSession, ICTKillzone } from '@/types/wallet-tracking';

// ============================================================================
// SESSION DETECTION
// ============================================================================

/**
 * Detect trading session and killzone from timestamp
 *
 * @param timestamp - Unix timestamp (milliseconds)
 * @returns Session information
 */
export function detectSession(timestamp: number): SessionInfo {
  const date = new Date(timestamp);
  const utcHour = date.getUTCHours();
  const utcMinute = date.getUTCMinutes();
  const totalMinutes = utcHour * 60 + utcMinute;

  // Determine session
  const session = detectTradingSession(totalMinutes);

  // Determine killzone
  const killzone = detectKillzone(totalMinutes);

  // Determine if high volatility period
  const isHighVolatility = isHighVolatilityPeriod(totalMinutes);

  // Calculate session boundaries
  const { start, end } = getSessionBoundaries(session, timestamp);

  return {
    session,
    killzone,
    isHighVolatility,
    sessionStart: start,
    sessionEnd: end,
  };
}

// ============================================================================
// TRADING SESSIONS (UTC)
// ============================================================================

/**
 * Detect trading session based on UTC time
 *
 * Sessions (UTC):
 * - Sydney: 21:00 - 06:00
 * - Asian: 23:00 - 08:00
 * - London: 07:00 - 16:00
 * - NY: 12:00 - 21:00
 */
function detectTradingSession(totalMinutes: number): TradingSession {
  // London: 07:00 - 16:00 UTC (420 - 960 minutes)
  if (totalMinutes >= 420 && totalMinutes < 960) {
    return 'london';
  }

  // NY: 12:00 - 21:00 UTC (720 - 1260 minutes)
  if (totalMinutes >= 720 && totalMinutes < 1260) {
    return 'ny';
  }

  // Sydney: 21:00 - 06:00 UTC (1260 - 1440 or 0 - 360 minutes)
  if (totalMinutes >= 1260 || totalMinutes < 360) {
    return 'sydney';
  }

  // Asian: 23:00 - 08:00 UTC (1380 - 1440 or 0 - 480 minutes)
  if (totalMinutes >= 1380 || totalMinutes < 480) {
    return 'asian';
  }

  // Default to Asian if unclear
  return 'asian';
}

// ============================================================================
// ICT KILLZONES (UTC)
// ============================================================================

/**
 * Detect ICT Killzone
 *
 * ICT Killzones (UTC):
 * - Asian Killzone: 01:00 - 05:00 UTC (20:00 - 00:00 EST)
 * - London Killzone: 07:00 - 10:00 UTC (02:00 - 05:00 EST)
 * - NY AM Killzone: 13:30 - 16:00 UTC (08:30 - 11:00 EST)
 * - NY PM Killzone: 18:30 - 21:00 UTC (13:30 - 16:00 EST)
 */
function detectKillzone(totalMinutes: number): ICTKillzone {
  // Asian Killzone: 01:00 - 05:00 UTC (60 - 300 minutes)
  if (totalMinutes >= 60 && totalMinutes < 300) {
    return 'asian-killzone';
  }

  // London Killzone: 07:00 - 10:00 UTC (420 - 600 minutes)
  if (totalMinutes >= 420 && totalMinutes < 600) {
    return 'london-killzone';
  }

  // NY AM Killzone: 13:30 - 16:00 UTC (810 - 960 minutes)
  if (totalMinutes >= 810 && totalMinutes < 960) {
    return 'ny-am-killzone';
  }

  // NY PM Killzone: 18:30 - 21:00 UTC (1110 - 1260 minutes)
  if (totalMinutes >= 1110 && totalMinutes < 1260) {
    return 'ny-pm-killzone';
  }

  return 'none';
}

// ============================================================================
// HIGH VOLATILITY PERIODS
// ============================================================================

/**
 * Check if time is during high-volatility period
 *
 * High volatility periods:
 * - London open: 07:00 - 09:00 UTC
 * - NY open: 13:00 - 15:00 UTC
 * - London-NY overlap: 12:00 - 16:00 UTC
 */
function isHighVolatilityPeriod(totalMinutes: number): boolean {
  // London open: 07:00 - 09:00 UTC (420 - 540 minutes)
  if (totalMinutes >= 420 && totalMinutes < 540) {
    return true;
  }

  // NY open: 13:00 - 15:00 UTC (780 - 900 minutes)
  if (totalMinutes >= 780 && totalMinutes < 900) {
    return true;
  }

  // London-NY overlap: 12:00 - 16:00 UTC (720 - 960 minutes)
  if (totalMinutes >= 720 && totalMinutes < 960) {
    return true;
  }

  return false;
}

// ============================================================================
// SESSION BOUNDARIES
// ============================================================================

/**
 * Get session start and end timestamps
 */
function getSessionBoundaries(
  session: TradingSession,
  currentTimestamp: number,
): { start: number; end: number } {
  const date = new Date(currentTimestamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  let startHour: number;
  let endHour: number;

  switch (session) {
    case 'asian':
      startHour = 23;
      endHour = 8;
      break;
    case 'london':
      startHour = 7;
      endHour = 16;
      break;
    case 'ny':
      startHour = 12;
      endHour = 21;
      break;
    case 'sydney':
      startHour = 21;
      endHour = 6;
      break;
  }

  // Handle sessions that span midnight
  let startDate = new Date(Date.UTC(year, month, day, startHour, 0, 0));
  let endDate = new Date(Date.UTC(year, month, day, endHour, 0, 0));

  // If current time is before session start, session started yesterday
  if (currentTimestamp < startDate.getTime()) {
    startDate = new Date(Date.UTC(year, month, day - 1, startHour, 0, 0));
  }

  // If end is before start, end is next day
  if (endHour < startHour) {
    if (currentTimestamp >= startDate.getTime()) {
      endDate = new Date(Date.UTC(year, month, day + 1, endHour, 0, 0));
    } else {
      endDate = new Date(Date.UTC(year, month, day, endHour, 0, 0));
      startDate = new Date(Date.UTC(year, month, day - 1, startHour, 0, 0));
    }
  }

  return {
    start: startDate.getTime(),
    end: endDate.getTime(),
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get session name (human-readable)
 */
export function getSessionName(session: TradingSession): string {
  const names: Record<TradingSession, string> = {
    asian: 'Asian Session',
    london: 'London Session',
    ny: 'New York Session',
    sydney: 'Sydney Session',
  };
  return names[session];
}

/**
 * Get killzone name (human-readable)
 */
export function getKillzoneName(killzone: ICTKillzone): string {
  const names: Record<ICTKillzone, string> = {
    'asian-killzone': 'Asian Killzone (01:00-05:00 UTC)',
    'london-killzone': 'London Killzone (07:00-10:00 UTC)',
    'ny-am-killzone': 'NY AM Killzone (13:30-16:00 UTC)',
    'ny-pm-killzone': 'NY PM Killzone (18:30-21:00 UTC)',
    'none': 'No Killzone',
  };
  return names[killzone];
}

/**
 * Get current session (live)
 */
export function getCurrentSession(): SessionInfo {
  return detectSession(Date.now());
}

/**
 * Check if timestamp is within a specific session
 */
export function isInSession(timestamp: number, targetSession: TradingSession): boolean {
  const info = detectSession(timestamp);
  return info.session === targetSession;
}

/**
 * Check if timestamp is within a specific killzone
 */
export function isInKillzone(timestamp: number, targetKillzone: ICTKillzone): boolean {
  const info = detectSession(timestamp);
  return info.killzone === targetKillzone;
}

/**
 * Get time until next killzone
 */
export function getTimeUntilNextKillzone(currentTimestamp = Date.now()): {
  killzone: ICTKillzone;
  milliseconds: number;
} {
  const date = new Date(currentTimestamp);
  const utcHour = date.getUTCHours();
  const utcMinute = date.getUTCMinutes();
  const totalMinutes = utcHour * 60 + utcMinute;

  // Killzone start times (in minutes from midnight UTC)
  const killzones: Array<{ killzone: ICTKillzone; start: number }> = [
    { killzone: 'asian-killzone', start: 60 },       // 01:00 UTC
    { killzone: 'london-killzone', start: 420 },     // 07:00 UTC
    { killzone: 'ny-am-killzone', start: 810 },      // 13:30 UTC
    { killzone: 'ny-pm-killzone', start: 1110 },     // 18:30 UTC
  ];

  // Find next killzone
  for (const kz of killzones) {
    if (totalMinutes < kz.start) {
      const minutesUntil = kz.start - totalMinutes;
      return {
        killzone: kz.killzone,
        milliseconds: minutesUntil * 60 * 1000,
      };
    }
  }

  // If no killzone today, next is tomorrow's Asian killzone
  const minutesUntilMidnight = 1440 - totalMinutes;
  const minutesUntilAsianKZ = minutesUntilMidnight + 60;

  return {
    killzone: 'asian-killzone',
    milliseconds: minutesUntilAsianKZ * 60 * 1000,
  };
}
