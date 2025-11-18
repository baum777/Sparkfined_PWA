import React from 'react';
import AlertsLayout from '@/components/alerts/AlertsLayout';
import AlertsList, { type AlertListItem } from '@/components/alerts/AlertsList';

export default function AlertsPageV2() {
  const alerts = DUMMY_ALERTS;
  const headerDescription = `${alerts.length} alerts tracked · Stay ahead of key levels, momentum shifts and volatility spikes`;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Signal board</p>
          <div>
            <h1 className="text-4xl font-semibold text-white">Alerts</h1>
            <p className="mt-2 text-sm text-zinc-400">{headerDescription}</p>
          </div>
        </header>

        <AlertsLayout
          title="Alerts"
          subtitle="Centralize signals, key levels and volatility triggers."
        >
          <AlertsList alerts={alerts} />
        </AlertsLayout>
      </div>
    </div>
  );
}

const DUMMY_ALERTS: AlertListItem[] = [
  {
    id: 'btc-breakout',
    symbol: 'BTCUSDT',
    condition: 'Price closes above 42,500 with RSI > 60',
    type: 'price',
    status: 'armed',
    timeframe: '4H',
  },
  {
    id: 'eth-volume-surge',
    symbol: 'ETHUSDT',
    condition: 'Volume spikes > 160% of 20-session average',
    type: 'volume',
    status: 'triggered',
    timeframe: '1H',
  },
  {
    id: 'sol-volatility-squeeze',
    symbol: 'SOLUSDT',
    condition: 'Volatility compression breaks with > 4% range expansion',
    type: 'volatility',
    status: 'snoozed',
    timeframe: '1D',
  },
  {
    id: 'op-reclaim',
    symbol: 'OPUSDT',
    condition: 'Price reclaims 200 EMA and holds for 2 closes',
    type: 'price',
    status: 'armed',
    timeframe: '4H',
  },
  {
    id: 'arb-volume-imabalance',
    symbol: 'ARBUSDT',
    condition: 'Buy volume > sell volume by 30% on session open',
    type: 'volume',
    status: 'snoozed',
    timeframe: '30M',
  },
  {
    id: 'avax-volatility-break',
    symbol: 'AVAXUSDT',
    condition: 'ATR(14) expands above 2.8 with +3% move in hour',
    type: 'volatility',
    status: 'triggered',
    timeframe: '1H',
  },
];
