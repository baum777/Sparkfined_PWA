/**
 * Alpha Issue 9: Journal v2
 * Service for managing journal entries with screenshots
 */

import type { TeaserResult } from '@/types/teaser';

export interface JournalEntry {
  id: string;
  timestamp: number;
  token: string;
  address: string;
  price: number;
  status: 'winner' | 'loser' | 'breakout' | 'range' | 'pending';
  analysis?: TeaserResult;
  screenshot?: Blob;
  notes?: string;
}

export type JournalPreset = 'W' | 'L' | 'B' | 'R' | 'all';

/**
 * Save journal entry to IndexedDB
 * Target: <=60ms p95
 */
export async function saveEntry(_entry: Omit<JournalEntry, 'id'>): Promise<string> {
  // TODO: Implement IndexedDB storage
  throw new Error('Not implemented - Issue 9');
}

/**
 * Query journal entries with optional preset filter
 */
export async function queryEntries(_options: {
  preset?: JournalPreset;
  limit?: number;
  offset?: number;
}): Promise<JournalEntry[]> {
  // TODO: Implement query with filters
  throw new Error('Not implemented - Issue 9');
}

/**
 * Export journal entries to CSV
 * Includes teaser fields (SL, TP, indicators, etc.)
 */
export async function exportToCSV(_entries: JournalEntry[]): Promise<string> {
  // TODO: Implement CSV export
  throw new Error('Not implemented - Issue 9');
}

/**
 * Delete journal entry
 */
export async function deleteEntry(_id: string): Promise<void> {
  // TODO: Implement delete
  throw new Error('Not implemented - Issue 9');
}
