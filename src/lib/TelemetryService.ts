/**
 * Alpha Issue 12: Performance & Telemetry
 * Local telemetry service for metrics collection
 *
 * Privacy-first: All data stays local, manual export only
 */

export interface TelemetryEvent {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceBudget {
  name: string;
  budgetMs: number;
  p95Threshold?: number;
}

class TelemetryServiceClass {
  private events: TelemetryEvent[] = [];
  private budgets: PerformanceBudget[] = [];

  /**
   * Log a telemetry event
   * @param name - Event name (e.g., "ai_teaser_ms")
   * @param value - Numeric value (usually duration in ms)
   * @param metadata - Optional metadata
   */
  log(name: string, value: number, metadata?: Record<string, unknown>): void {
    this.events.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });

    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  /**
   * Register performance budget
   */
  registerBudget(budget: PerformanceBudget): void {
    this.budgets.push(budget);
  }

  /**
   * Check if metric exceeds budget
   */
  checkBudget(name: string, value: number): boolean {
    const budget = this.budgets.find(b => b.name === name);
    if (!budget) return true;

    return value <= budget.budgetMs;
  }

  /**
   * Get performance statistics for an event
   */
  getStats(name: string): {
    count: number;
    median: number;
    p95: number;
    max: number;
  } | null {
    const filtered = this.events
      .filter(e => e.name === name)
      .map(e => e.value)
      .sort((a, b) => a - b);

    if (filtered.length === 0) return null;

    const p95Index = Math.floor(filtered.length * 0.95);

    return {
      count: filtered.length,
      median: filtered[Math.floor(filtered.length / 2)],
      p95: filtered[p95Index],
      max: filtered[filtered.length - 1],
    };
  }

  /**
   * Export events as JSON
   */
  dump(): { events: TelemetryEvent[]; budgets: PerformanceBudget[] } {
    return {
      events: [...this.events],
      budgets: [...this.budgets],
    };
  }

  /**
   * Export events as CSV
   */
  exportCSV(): string {
    const header = 'name,value,timestamp,metadata\n';
    const rows = this.events
      .map(e => `${e.name},${e.value},${e.timestamp},${JSON.stringify(e.metadata || {})}`)
      .join('\n');

    return header + rows;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }
}

// Singleton instance
export const Telemetry = new TelemetryServiceClass();

// Standard event names
export const TelemetryEvents = {
  AI_TEASER_MS: 'ai_teaser_ms',
  PROVIDER_FALLBACK: 'provider_fallback',
  SNAPSHOT_AGE_S: 'snapshot_age_s',
  REPLAY_OPEN_MS: 'replay_open_ms',
  JOURNAL_SAVE_MS: 'journal_save_ms',
  JOURNAL_GRID_MS: 'journal_grid_ms',
  EXPORT_ZIP_MS: 'export_zip_ms',
  OCR_PARSE_MS: 'ocr_parse_ms',
  API_REQUEST_MS: 'api_request_ms',
} as const;
