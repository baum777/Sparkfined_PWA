/**
 * Shared Oracle subsystem types.
 * Keep in sync with docs/core/concepts/oracle-subsystem.md.
 */

export type OracleScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const ORACLE_THEMES = [
  'Gaming',
  'RWA',
  'AI Agents',
  'DePIN',
  'Privacy/ZK',
  'Collectibles/TCG',
  'Stablecoin Yield',
] as const;

export type OracleTheme = (typeof ORACLE_THEMES)[number];

export interface OracleReport {
  id?: number;
  date: string;
  score: OracleScore;
  topTheme: OracleTheme;
  fullReport: string;
  read: boolean;
  notified: boolean;
  timestamp: number;
}

export interface OracleAPIResponse {
  report: string;
  score: OracleScore;
  theme: OracleTheme;
  timestamp: number;
  date: string;
}

export type JourneyPhase = 'DEGEN' | 'SEEKER' | 'WARRIOR' | 'MASTER' | 'SAGE';

export interface GamificationStreaks {
  journal: number;
  oracle: number;
  analysis: number;
}

export interface GamificationSnapshot {
  xp: number;
  phase: JourneyPhase;
  streaks: GamificationStreaks;
  badges: string[];
}
