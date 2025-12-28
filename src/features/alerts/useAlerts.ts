import { useState, useMemo, useCallback, useEffect } from 'react';
import { notifyContextChange } from "@/lib/handbook/handbookContext";
import type { Alert, AlertStatus } from './types';

const STORAGE_KEY = "sparkfined_alerts";

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    symbol: 'BTC',
    condition: 'Price above',
    targetPrice: 70000,
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    symbol: 'ETH',
    condition: 'Price below',
    targetPrice: 3000,
    status: 'triggered',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    symbol: 'SOL',
    condition: 'Price above',
    targetPrice: 150,
    status: 'paused',
    createdAt: new Date('2024-01-12'),
  },
];

// Load initial data from localStorage or use mock
function loadAlerts(): Alert[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((alert: Alert) => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
      }));
    }
  } catch {
    // Ignore parse errors
  }
  // Return mock and persist it
  saveAlerts(MOCK_ALERTS);
  return MOCK_ALERTS;
}

function saveAlerts(alerts: Alert[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    notifyContextChange();
  } catch {
    // Ignore storage errors
  }
}

export type FilterType = 'all' | AlertStatus;

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(() => loadAlerts());
  const [filter, setFilter] = useState<FilterType>('all');

  // Persist whenever alerts change
  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter((alert) => alert.status === filter);
  }, [alerts, filter]);

  const createAlert = useCallback((symbol: string, condition: string, targetPrice: number) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      condition,
      targetPrice,
      status: 'active',
      createdAt: new Date(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, status: alert.status === 'active' ? 'paused' : 'active' }
          : alert
      )
    );
  }, []);

  const clearFilter = useCallback(() => {
    setFilter('all');
  }, []);

  return {
    alerts,
    filteredAlerts,
    filter,
    setFilter,
    clearFilter,
    createAlert,
    deleteAlert,
    toggleAlert,
  };
}
