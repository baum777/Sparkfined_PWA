/**
 * Live Data v1 - Zustand Store
 *
 * Manages real-time price data, connection state, and live updates.
 * Integrates with PricePollingService and (future) WebSocket client.
 */

import { create } from 'zustand';
import type {
  LivePriceSnapshot,
  LivePriceWithDirection,
  PriceDirection,
  PollingStatus,
  LiveDataMode,
  PollingError,
} from '@/types/live';

/**
 * Live data state
 */
interface LiveDataState {
  // Connection state
  mode: LiveDataMode;
  pollingStatus: PollingStatus;
  wsConnected: boolean;
  lastHeartbeat: number | null;
  isEnabled: boolean;

  // Price data
  prices: Record<string, LivePriceWithDirection>;

  // Error tracking
  errors: PollingError[];
  errorCount: number;

  // Active symbols
  activeSymbols: string[];

  // Actions - Connection Management
  setMode: (mode: LiveDataMode) => void;
  setPollingStatus: (status: PollingStatus) => void;
  setWsConnected: (connected: boolean) => void;
  setEnabled: (enabled: boolean) => void;
  heartbeat: () => void;

  // Actions - Price Updates
  updatePrice: (snapshot: LivePriceSnapshot) => void;
  updatePriceBatch: (snapshots: LivePriceSnapshot[]) => void;

  // Actions - Symbol Management
  addActiveSymbol: (symbol: string) => void;
  removeActiveSymbol: (symbol: string) => void;
  setActiveSymbols: (symbols: string[]) => void;

  // Actions - Error Management
  addError: (error: PollingError) => void;
  clearErrors: () => void;

  // Getters
  getPrice: (symbol: string) => LivePriceWithDirection | null;
  getPriceDirection: (symbol: string) => PriceDirection | null;
  isSymbolActive: (symbol: string) => boolean;
}

/**
 * Calculate price direction
 */
function calculateDirection(current: number, previous: number | null): PriceDirection {
  if (previous === null) {
    return 'flat';
  }

  const change = current - previous;
  const threshold = previous * 0.0001; // 0.01% threshold to avoid noise

  if (Math.abs(change) < threshold) {
    return 'flat';
  }

  return change > 0 ? 'up' : 'down';
}

/**
 * Max errors to keep in history
 */
const MAX_ERROR_HISTORY = 50;

/**
 * Create live data store
 */
export const useLiveDataStore = create<LiveDataState>((set, get) => ({
  // Initial state
  mode: 'polling',
  pollingStatus: 'idle',
  wsConnected: false,
  lastHeartbeat: null,
  isEnabled: false,
  prices: {},
  errors: [],
  errorCount: 0,
  activeSymbols: [],

  // Connection management
  setMode: (mode) => set({ mode }),

  setPollingStatus: (status) => set({ pollingStatus: status }),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  setEnabled: (enabled) => set({ isEnabled: enabled }),

  heartbeat: () => set({ lastHeartbeat: Date.now() }),

  // Price updates
  updatePrice: (snapshot) =>
    set((state) => {
      const { symbol } = snapshot;
      const previous = state.prices[symbol];
      const previousPrice = previous?.price || null;
      const direction = calculateDirection(snapshot.price, previousPrice);

      const priceWithDirection: LivePriceWithDirection = {
        ...snapshot,
        direction,
        previousPrice,
      };

      return {
        prices: {
          ...state.prices,
          [symbol]: priceWithDirection,
        },
      };
    }),

  updatePriceBatch: (snapshots) =>
    set((state) => {
      const nextPrices = { ...state.prices };

      for (const snapshot of snapshots) {
        const { symbol } = snapshot;
        const previous = nextPrices[symbol];
        const previousPrice = previous?.price || null;
        const direction = calculateDirection(snapshot.price, previousPrice);

        nextPrices[symbol] = {
          ...snapshot,
          direction,
          previousPrice,
        };
      }

      return { prices: nextPrices };
    }),

  // Symbol management
  addActiveSymbol: (symbol) =>
    set((state) => {
      if (state.activeSymbols.includes(symbol)) {
        return state;
      }
      return {
        activeSymbols: [...state.activeSymbols, symbol],
      };
    }),

  removeActiveSymbol: (symbol) =>
    set((state) => ({
      activeSymbols: state.activeSymbols.filter((s) => s !== symbol),
    })),

  setActiveSymbols: (symbols) => set({ activeSymbols: symbols }),

  // Error management
  addError: (error) =>
    set((state) => {
      const nextErrors = [error, ...state.errors].slice(0, MAX_ERROR_HISTORY);
      return {
        errors: nextErrors,
        errorCount: state.errorCount + 1,
      };
    }),

  clearErrors: () => set({ errors: [], errorCount: 0 }),

  // Getters
  getPrice: (symbol) => {
    const state = get();
    return state.prices[symbol] || null;
  },

  getPriceDirection: (symbol) => {
    const state = get();
    const price = state.prices[symbol];
    return price?.direction || null;
  },

  isSymbolActive: (symbol) => {
    const state = get();
    return state.activeSymbols.includes(symbol);
  },
}));

/**
 * Get connection health status
 */
export function getConnectionHealth(): 'healthy' | 'degraded' | 'offline' {
  const state = useLiveDataStore.getState();

  if (!state.isEnabled) {
    return 'offline';
  }

  if (state.pollingStatus === 'error' || state.errorCount > 10) {
    return 'degraded';
  }

  if (state.mode === 'websocket' && !state.wsConnected) {
    return 'degraded';
  }

  if (state.pollingStatus === 'active' || state.wsConnected) {
    return 'healthy';
  }

  return 'offline';
}

/**
 * Get live price for a symbol (convenience helper)
 */
export function getLivePrice(symbol: string): number | null {
  const price = useLiveDataStore.getState().prices[symbol];
  return price?.price || null;
}

/**
 * Get all live prices
 */
export function getAllLivePrices(): Record<string, LivePriceWithDirection> {
  return useLiveDataStore.getState().prices;
}
