/**
 * Live Data v1 - Manager
 *
 * Integrates PricePollingService with LiveDataStore.
 * Manages lifecycle, subscriptions, and visibility handling.
 */

import { getPricePollingService } from './PricePollingService';
import { useLiveDataStore } from '@/store/liveDataStore';
import { getLiveDataConfig, isLiveDataEnabled } from '@/lib/config/flags';
import type { LivePriceSnapshot, PollingError } from '@/types/live';

/**
 * Token configuration - mirrors watchlistData.ts
 * In production, this would be user-configurable
 */
const DEFAULT_WATCHLIST_TOKENS = [
  {
    symbol: 'BTCUSDT',
    network: 'ethereum',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    priority: 'active' as const,
  },
  {
    symbol: 'ETHUSDT',
    network: 'ethereum',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    priority: 'active' as const,
  },
  {
    symbol: 'SOLUSDT',
    network: 'solana',
    address: 'So11111111111111111111111111111111111111112',
    priority: 'active' as const,
  },
  {
    symbol: 'OPUSDT',
    network: 'ethereum',
    address: '0x4200000000000000000000000000000000000042',
    priority: 'passive' as const,
  },
  {
    symbol: 'LINKUSDT',
    network: 'ethereum',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    priority: 'passive' as const,
  },
  {
    symbol: 'ARBUSDT',
    network: 'ethereum',
    address: '0x912ce59144191c1204f64559fe8253a0e49e6548',
    priority: 'passive' as const,
  },
  {
    symbol: 'TIAUSDT',
    network: 'ethereum',
    address: '0x2261daa3a42d3a7c2717b1b0ce68b6310c47fe0a',
    priority: 'passive' as const,
  },
];

/**
 * LiveDataManager - Central coordinator for Live Data v1
 */
class LiveDataManager {
  private pollingService = getPricePollingService();
  private isInitialized = false;
  private unsubscribeFns: Array<() => void> = [];
  private visibilityHandler: (() => void) | null = null;

  /**
   * Initialize live data system
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('[LiveDataManager] Already initialized');
      return;
    }

    if (!isLiveDataEnabled()) {
      if (import.meta.env.DEV) {
        console.log('[LiveDataManager] Live data disabled by feature flag');
      }
      return;
    }

    const config = getLiveDataConfig();

    // Set initial store state
    useLiveDataStore.getState().setEnabled(true);
    useLiveDataStore.getState().setMode(config.mode === 'auto' ? 'polling' : config.mode);

    // Subscribe to price updates
    const unsubPrice = this.pollingService.onPriceUpdate((snapshot: LivePriceSnapshot) => {
      useLiveDataStore.getState().updatePrice(snapshot);
      useLiveDataStore.getState().heartbeat();
    });
    this.unsubscribeFns.push(unsubPrice);

    // Subscribe to errors
    const unsubError = this.pollingService.onError((error: PollingError) => {
      useLiveDataStore.getState().addError(error);
    });
    this.unsubscribeFns.push(unsubError);

    // Add default symbols
    const symbols = DEFAULT_WATCHLIST_TOKENS.map((token) => token.symbol);
    useLiveDataStore.getState().setActiveSymbols(symbols);

    for (const token of DEFAULT_WATCHLIST_TOKENS) {
      this.pollingService.addSymbol(token);
    }

    // Set up Page Visibility API handling
    this.setupVisibilityHandling();

    // Start polling
    this.pollingService.start();
    useLiveDataStore.getState().setPollingStatus('active');

    this.isInitialized = true;

    if (import.meta.env.DEV) {
      console.log('[LiveDataManager] Initialized with', symbols.length, 'symbols');
      console.log('[LiveDataManager] Active interval:', config.activePollIntervalMs, 'ms');
      console.log('[LiveDataManager] Passive interval:', config.passivePollIntervalMs, 'ms');
    }
  }

  /**
   * Shutdown live data system
   */
  shutdown(): void {
    if (!this.isInitialized) {
      return;
    }

    // Stop polling
    this.pollingService.stop();
    useLiveDataStore.getState().setPollingStatus('idle');
    useLiveDataStore.getState().setEnabled(false);

    // Unsubscribe from all callbacks
    for (const unsubscribe of this.unsubscribeFns) {
      unsubscribe();
    }
    this.unsubscribeFns = [];

    // Remove visibility handler
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    this.isInitialized = false;

    if (import.meta.env.DEV) {
      console.log('[LiveDataManager] Shutdown complete');
    }
  }

  /**
   * Pause live data (when tab is hidden)
   */
  pause(): void {
    if (!this.isInitialized) {
      return;
    }

    this.pollingService.pause();
    useLiveDataStore.getState().setPollingStatus('paused');

    if (import.meta.env.DEV) {
      console.log('[LiveDataManager] Paused (tab hidden)');
    }
  }

  /**
   * Resume live data (when tab is visible again)
   */
  resume(): void {
    if (!this.isInitialized) {
      return;
    }

    this.pollingService.resume();
    useLiveDataStore.getState().setPollingStatus('active');

    if (import.meta.env.DEV) {
      console.log('[LiveDataManager] Resumed (tab visible)');
    }
  }

  /**
   * Add a custom symbol for polling
   */
  addSymbol(config: {
    symbol: string;
    network: string;
    address: string;
    priority?: 'active' | 'passive';
  }): void {
    if (!this.isInitialized) {
      console.warn('[LiveDataManager] Not initialized, call initialize() first');
      return;
    }

    const symbolConfig = {
      ...config,
      priority: config.priority || 'passive',
    };

    this.pollingService.addSymbol(symbolConfig);
    useLiveDataStore.getState().addActiveSymbol(config.symbol);

    if (import.meta.env.DEV) {
      console.log('[LiveDataManager] Added symbol:', config.symbol);
    }
  }

  /**
   * Remove a symbol from polling
   */
  removeSymbol(symbol: string): void {
    if (!this.isInitialized) {
      return;
    }

    this.pollingService.removeSymbol(symbol);
    useLiveDataStore.getState().removeActiveSymbol(symbol);

    if (import.meta.env.DEV) {
      console.log('[LiveDataManager] Removed symbol:', symbol);
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      pollingStatus: this.pollingService.getStatus(),
      symbolCount: this.pollingService.getSymbolCount(),
      isEnabled: isLiveDataEnabled(),
    };
  }

  /**
   * Set up Page Visibility API to pause/resume polling when tab is hidden
   */
  private setupVisibilityHandling(): void {
    if (typeof document === 'undefined') {
      return; // SSR safety
    }

    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }
}

/**
 * Singleton instance
 */
let manager: LiveDataManager | null = null;

/**
 * Get LiveDataManager singleton
 */
export function getLiveDataManager(): LiveDataManager {
  if (!manager) {
    manager = new LiveDataManager();
  }
  return manager;
}

/**
 * Initialize live data (convenience function)
 */
export function initializeLiveData(): void {
  getLiveDataManager().initialize();
}

/**
 * Shutdown live data (convenience function)
 */
export function shutdownLiveData(): void {
  getLiveDataManager().shutdown();
}
