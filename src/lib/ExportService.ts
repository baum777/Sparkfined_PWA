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
 *
 * TODO[P1] (Issue #11 - Export Bundle Implementation):
 * - Generate CSV from entries
 * - Create PNG share cards
 * - Pre-scale large images
 * - Bundle into ZIP
 * - Use JSZip or similar library
 */
export async function createExportBundle(
  _options: ExportOptions
): Promise<Blob> {
  // TODO[P1]: Implement ZIP bundling (Issue #11)
  throw new Error('Not implemented - Issue 11');
}

/**
 * Generate PNG share card for a journal entry
 * Dimensions: 1200x630 (Open Graph standard)
 */
export async function generateShareCard(_entry: JournalEntry): Promise<Blob> {
  // TODO[P1]: Implement share card generation (Issue #11)
  // Use canvas API or similar
  throw new Error('Not implemented - Issue 11');
}

/**
 * Validate and optimize image size
 * Max dimensions: 2048x2048
 */
export async function optimizeImage(_blob: Blob): Promise<Blob> {
  // TODO[P1]: Implement image optimization (Issue #11)
  throw new Error('Not implemented - Issue 11');
}
