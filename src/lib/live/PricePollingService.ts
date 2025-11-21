/**
 * Live Data v1 - Price Polling Service
 *
 * Manages HTTP-based polling for real-time price updates.
 * Supports different polling intervals for active vs passive symbols.
 * Integrates with marketOrchestrator for provider fallbacks.
 */

import { getMarketSnapshot } from '@/lib/data/marketOrchestrator';
import { getLiveDataConfig } from '@/lib/config/flags';
import type { LivePriceSnapshot, PollingStatus, PollingError } from '@/types/live';

/**
 * Symbol configuration for polling
 */
interface SymbolConfig {
  symbol: string;
  network: string;
  address: string;
  priority: 'active' | 'passive';
}

/**
 * Callback for price updates
 */
type PriceUpdateCallback = (snapshot: LivePriceSnapshot) => void;

/**
 * Callback for polling errors
 */
type ErrorCallback = (error: PollingError) => void;

/**
 * PricePollingService manages real-time price polling for multiple symbols
 */
export class PricePollingService {
  private symbols: Map<string, SymbolConfig> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private status: PollingStatus = 'idle';
  private updateCallbacks: Set<PriceUpdateCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private errorCounts: Map<string, number> = new Map();
  private lastPrices: Map<string, number> = new Map();
  private config = getLiveDataConfig();
  private isPaused = false;

  /**
   * Subscribe to price updates
   */
  onPriceUpdate(callback: PriceUpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  /**
   * Subscribe to polling errors
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Add a symbol to poll
   */
  addSymbol(config: SymbolConfig): void {
    this.symbols.set(config.symbol, config);

    if (this.status === 'active' && !this.isPaused) {
      this.startPollingSymbol(config);
    }
  }

  /**
   * Remove a symbol from polling
   */
  removeSymbol(symbol: string): void {
    this.stopPollingSymbol(symbol);
    this.symbols.delete(symbol);
    this.errorCounts.delete(symbol);
    this.lastPrices.delete(symbol);
  }

  /**
   * Start polling all configured symbols
   */
  start(): void {
    if (this.status === 'active') {
      console.warn('[PricePollingService] Already active');
      return;
    }

    this.status = 'active';
    this.isPaused = false;

    // Start polling all symbols
    for (const config of this.symbols.values()) {
      this.startPollingSymbol(config);
    }

    if (import.meta.env.DEV) {
      console.log('[PricePollingService] Started polling', this.symbols.size, 'symbols');
    }
  }

  /**
   * Stop polling all symbols
   */
  stop(): void {
    if (this.status === 'idle') {
      return;
    }

    this.status = 'idle';

    // Clear all intervals
    for (const symbol of this.symbols.keys()) {
      this.stopPollingSymbol(symbol);
    }

    if (import.meta.env.DEV) {
      console.log('[PricePollingService] Stopped');
    }
  }

  /**
   * Pause polling (keep configuration, stop intervals)
   */
  pause(): void {
    if (this.isPaused) {
      return;
    }

    this.isPaused = true;
    this.status = 'paused';

    // Clear all intervals but keep configuration
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();

    if (import.meta.env.DEV) {
      console.log('[PricePollingService] Paused');
    }
  }

  /**
   * Resume polling after pause
   */
  resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;
    this.status = 'active';

    // Restart polling for all symbols
    for (const config of this.symbols.values()) {
      this.startPollingSymbol(config);
    }

    if (import.meta.env.DEV) {
      console.log('[PricePollingService] Resumed');
    }
  }

  /**
   * Get current status
   */
  getStatus(): PollingStatus {
    return this.status;
  }

  /**
   * Get active symbol count
   */
  getSymbolCount(): number {
    return this.symbols.size;
  }

  /**
   * Get error count for a symbol
   */
  getErrorCount(symbol: string): number {
    return this.errorCounts.get(symbol) || 0;
  }

  /**
   * Start polling a single symbol
   */
  private startPollingSymbol(config: SymbolConfig): void {
    // Clear existing interval if any
    this.stopPollingSymbol(config.symbol);

    // Determine interval based on priority
    const intervalMs = config.priority === 'active'
      ? this.config.activePollIntervalMs
      : this.config.passivePollIntervalMs;

    // Fetch immediately
    void this.fetchPriceForSymbol(config);

    // Set up recurring polling
    const interval = setInterval(() => {
      void this.fetchPriceForSymbol(config);
    }, intervalMs);

    this.intervals.set(config.symbol, interval);
  }

  /**
   * Stop polling a single symbol
   */
  private stopPollingSymbol(symbol: string): void {
    const interval = this.intervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(symbol);
    }
  }

  /**
   * Fetch price for a single symbol
   */
  private async fetchPriceForSymbol(config: SymbolConfig): Promise<void> {
    const { symbol, address, network } = config;

    try {
      const result = await getMarketSnapshot(address, network as any);

      if (!result.snapshot) {
        throw new Error('No snapshot returned');
      }

      const price = result.snapshot.price.current;
      const priceChange24h = result.snapshot.price.change24h;
      const volume24h = result.snapshot.volume.volume24h;

      // Create snapshot
      const snapshot: LivePriceSnapshot = {
        symbol,
        price,
        priceChange24h,
        volume24h,
        timestamp: Date.now(),
        source: result.provider as any,
      };

      // Store last price for direction detection
      this.lastPrices.set(symbol, price);

      // Reset error count on success
      this.errorCounts.set(symbol, 0);

      // Notify subscribers
      for (const callback of this.updateCallbacks) {
        try {
          callback(snapshot);
        } catch (callbackError) {
          console.error('[PricePollingService] Callback error:', callbackError);
        }
      }

      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true') {
        console.log(`[PricePollingService] ${symbol}: $${price.toFixed(4)}`);
      }
    } catch (error) {
      const errorCount = (this.errorCounts.get(symbol) || 0) + 1;
      this.errorCounts.set(symbol, errorCount);

      const pollingError: PollingError = {
        symbol,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        attempt: errorCount,
        willRetry: errorCount < 5, // Stop retrying after 5 consecutive errors
      };

      // Notify error subscribers
      for (const callback of this.errorCallbacks) {
        try {
          callback(pollingError);
        } catch (callbackError) {
          console.error('[PricePollingService] Error callback error:', callbackError);
        }
      }

      // If too many errors, switch to passive polling
      if (errorCount >= 5 && config.priority === 'active') {
        console.warn(`[PricePollingService] ${symbol}: Too many errors, switching to passive`);
        config.priority = 'passive';
        this.startPollingSymbol(config); // Restart with passive interval
      }

      if (import.meta.env.DEV) {
        console.warn(`[PricePollingService] ${symbol} error:`, pollingError.message);
      }
    }
  }
}

/**
 * Singleton instance
 */
let instance: PricePollingService | null = null;

/**
 * Get singleton instance
 */
export function getPricePollingService(): PricePollingService {
  if (!instance) {
    instance = new PricePollingService();
  }
  return instance;
}
