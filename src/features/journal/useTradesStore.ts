import { useSyncExternalStore, useCallback } from "react";
import type { Trade } from "./types";

const STORAGE_KEY = "sparkfined_trades";

// Simple external store for trades
let trades: Trade[] = [];

// Load from localStorage on init
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    trades = JSON.parse(stored);
  }
} catch {
  trades = [];
}

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return trades;
}

function addTrade(trade: Omit<Trade, "id" | "createdAt">) {
  const newTrade: Trade = {
    ...trade,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  trades = [newTrade, ...trades];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  emitChange();
  return newTrade;
}

function getTrades(): Trade[] {
  return trades;
}

function getRecentTrades(count: number = 5): Trade[] {
  return trades.slice(0, count);
}

export function useTradesStore() {
  const allTrades = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const add = useCallback((trade: Omit<Trade, "id" | "createdAt">) => {
    return addTrade(trade);
  }, []);

  const recent = useCallback((count: number = 5) => {
    return allTrades.slice(0, count);
  }, [allTrades]);

  return {
    trades: allTrades,
    addTrade: add,
    getRecentTrades: recent,
    hasTrades: allTrades.length > 0,
  };
}

// Export standalone functions for non-hook contexts
export { getTrades, getRecentTrades, addTrade };
