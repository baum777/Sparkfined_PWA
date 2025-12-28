import { useState, useMemo, useCallback } from 'react';
import type { Alert, AlertStatus } from './types';

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

export type FilterType = 'all' | AlertStatus;

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<FilterType>('all');

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
