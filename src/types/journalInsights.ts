/**
 * Journal AI Insights Types (Loop J3-A)
 * 
 * Types for AI-powered behavioral pattern detection and coaching recommendations.
 * Focus: Multi-entry analysis, not single-entry summarization.
 */

export type JournalInsightCategory =
  | 'BEHAVIOR_LOOP'      // Repeated patterns (e.g., always FOMOing into pumps)
  | 'TIMING'             // Time-based patterns (e.g., worse performance after 8pm)
  | 'RISK_MANAGEMENT'    // Position sizing, stop-loss discipline
  | 'SETUP_DISCIPLINE'   // Setup adherence, quality vs. quantity
  | 'EMOTIONAL_PATTERN'  // Emotion-driven decisions
  | 'OTHER';             // Fallback for uncategorized insights

export type JournalInsightSeverity = 
  | 'INFO'      // General observation, neutral
  | 'WARNING'   // Pattern that needs attention
  | 'CRITICAL'; // Major issue requiring immediate action

export interface JournalInsight {
  id: string;                      // UUID or stable hash
  category: JournalInsightCategory;
  severity: JournalInsightSeverity;
  title: string;                   // Short, user-facing label (e.g., "FOMO-Breakout Loop")
  summary: string;                 // 1–2 sentences describing the pattern
  recommendation: string;          // 1–3 sentences, actionable advice
  evidenceEntries: string[];       // JournalEntry IDs supporting this insight
  confidence?: number;             // Optional: 0–100, how confident the AI is
  detectedAt?: number;             // Optional: Unix timestamp when insight was generated
}

/**
 * Envelope for insight results (optional, for future metadata)
 */
export interface JournalInsightResult {
  insights: JournalInsight[];
  generatedAt: number;             // Unix timestamp
  modelUsed?: string;              // e.g., "gpt-4o-mini"
  costUsd?: number;                // Optional: AI API cost
  rawResponse?: unknown;           // Optional: raw AI response for debugging
}

// ============================================================================
// PERSISTENCE (Loop J3-C)
// ============================================================================

/**
 * Persisted record for journal insights (Dexie/IndexedDB storage)
 */
export interface JournalInsightRecord {
  id: string;                      // insight.id as Primary Key
  analysisKey: string;             // Describes which entry set these insights apply to
  category: JournalInsightCategory;
  severity: JournalInsightSeverity;
  title: string;
  summary: string;
  recommendation: string;
  evidenceEntries: string[];       // Array of JournalEntry IDs
  confidence: number | null;
  
  // Metadata
  generatedAt: string;             // ISO-8601 timestamp
  modelUsed?: string;
  journeyPhaseAtGeneration?: import('@/types/journal').JourneyPhase;
  version: 1;                      // Schema version for future migrations
}
