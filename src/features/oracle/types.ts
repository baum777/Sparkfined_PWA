/**
 * Oracle (Loveable UI adapter types)
 *
 * These types exist to support the Loveable-style Oracle UI while keeping
 * Sparkfined's Oracle business logic in `src/store/oracleStore.ts` (protected).
 */

export type OracleFilter = 'all' | 'new' | 'read'

export interface OracleInsight {
  /**
   * Stable ID for UI lists and telemetry.
   * For Sparkfined Oracle reports we use the report date (YYYY-MM-DD).
   */
  id: string

  title: string
  summary: string
  takeaway: string

  /** Sparkfined theme (e.g. "Gaming", "RWA") */
  theme: string

  /** Full text for "view full analysis" */
  content: string

  isRead: boolean

  /** ISO date string for display/sorting */
  date: string

  /** 0-7 score */
  score: number
}

