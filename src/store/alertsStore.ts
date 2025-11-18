import { create } from 'zustand';

export type AlertType = 'price' | 'volume' | 'volatility';
export type AlertStatus = 'armed' | 'triggered' | 'snoozed';

export type Alert = {
  id: string;
  symbol: string;
  condition: string;
  type: AlertType;
  status: AlertStatus;
  timeframe: string;
};

interface AlertsState {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
}

const INITIAL_ALERTS: Alert[] = [
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

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: INITIAL_ALERTS,
  setAlerts: (alerts) => set({ alerts }),
}));

