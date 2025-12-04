/**
 * Oracle Subsystem Types
 * 
 * Type definitions for the Daily Oracle meta-market intelligence system.
 * Handles daily trading environment assessments, themes, and reports.
 */

// ============================================================================
// ORACLE REPORT (Dexie + Store)
// ============================================================================

export interface OracleReport {
  id?: number;           // Auto-increment (Dexie Primary Key)
  date: string;          // YYYY-MM-DD (logical primary key)
  score: number;         // 0-7
  topTheme: OracleTheme; // Top meta-shift theme
  fullReport: string;    // Complete text report
  read: boolean;         // XP guard flag (false until user reads)
  notified: boolean;     // Notification guard flag (false until notified)
  timestamp: number;     // Unix ms (when report was generated)
  createdAt: number;     // Unix ms (when saved to Dexie)
}

// ============================================================================
// API RESPONSE
// ============================================================================

export interface OracleAPIResponse {
  report: string;        // Full combined report
  score: number;         // 0-7
  theme: string;         // e.g., "Gaming"
  timestamp: number;     // Unix ms
  date: string;          // YYYY-MM-DD
}

// ============================================================================
// ORACLE THEMES
// ============================================================================

export const ORACLE_THEMES = [
  'Gaming',
  'RWA',
  'AI Agents',
  'DePIN',
  'Privacy/ZK',
  'Collectibles/TCG',
  'Stablecoin Yield',
] as const;

export type OracleTheme = typeof ORACLE_THEMES[number];

// Helper function to validate and coerce theme strings
export function coerceOracleTheme(theme?: string): OracleTheme {
  if (theme && ORACLE_THEMES.includes(theme as OracleTheme)) {
    return theme as OracleTheme;
  }
  return 'Gaming'; // Default fallback
}

// Helper function to validate score range
export function coerceOracleScore(score: number): number {
  return Math.max(0, Math.min(7, Math.round(score)));
}
