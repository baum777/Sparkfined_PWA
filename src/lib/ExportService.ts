/**
 * Alpha Issue 11: Export Bundle (ZIP)
 * Service for exporting journal data as ZIP bundle
 */

import type { JournalEntry } from './JournalService';

export interface ExportOptions {
  entries: JournalEntry[];
  includeScreenshots: boolean;
  includeShareCard: boolean;
}

/**
 * Create ZIP bundle with CSV and PNG share cards
 * Target: <800ms p95
 * NOTE(P1-backlog): Implementation tracked in Issue #11. Requires CSV generation,
 * share card rendering, image down-scaling, and ZIP bundling (likely via JSZip).
 */
export async function createExportBundle(
  _options: ExportOptions
): Promise<Blob> {
  // TODO[P1]: Implement export bundle pipeline (Issue #11)
  throw new Error('Not implemented - Issue 11');
}

/**
 * Generate PNG share card for a journal entry
 * Dimensions: 1200x630 (Open Graph standard)
 */
export async function generateShareCard(_entry: JournalEntry): Promise<Blob> {
  // NOTE(P2-backlog): Share card rendering to reuse export bundle pipeline
  throw new Error('Not implemented - Issue 11');
}

/**
 * Validate and optimize image size
 * Max dimensions: 2048x2048
 */
export async function optimizeImage(_blob: Blob): Promise<Blob> {
  // NOTE(P2-backlog): Image optimization to be added alongside share card generation
  throw new Error('Not implemented - Issue 11');
}
