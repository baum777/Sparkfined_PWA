import { create } from 'zustand';
import type { SolanaMemeTrendEvent, TrendCallToAction, TrendHypeLevel, TrendSentimentLabel } from '@/types/events';

export type AlertType = 'price' | 'volume' | 'volatility' | 'trend';
export type AlertStatus = 'armed' | 'triggered' | 'snoozed';
export type AlertOrigin = 'manual' | 'grok-trend';

export type Alert = {
  id: string;
  symbol: string;
  condition: string;
  type: AlertType;
  status: AlertStatus;
  timeframe: string;
  createdAt?: string;
  meta?: Record<string, unknown>;
  origin?: AlertOrigin;
  summary?: string;
  sourceUrl?: string;
  sentimentLabel?: TrendSentimentLabel;
  trendingScore?: number;
  hypeLevel?: TrendHypeLevel;
  callToAction?: TrendCallToAction;
};

interface AlertsState {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  pushAlert: (alert: Alert) => void;
  processTrendEvent?: (evt: SolanaMemeTrendEvent) => void;
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
  pushAlert: (alert) =>
    set((state) => ({
      alerts: dedupeAlerts([alert, ...state.alerts]).slice(0, 50),
    })),
  processTrendEvent: (evt) =>
    set((state) => {
      const nextAlerts = buildTrendAlerts(evt).reduce<Alert[]>((acc, alert) => {
        return dedupeAlerts([alert, ...acc]);
      }, state.alerts);

      return { alerts: nextAlerts.slice(0, 50) };
    }),
}));

function buildTrendAlerts(evt: SolanaMemeTrendEvent): Alert[] {
  const alerts: Alert[] = [];
  const base: Partial<Alert> = {
    symbol: evt.token.symbol.toUpperCase(),
    type: 'trend',
    status: 'triggered',
    timeframe: evt.trading?.timeframe ?? '1H',
    createdAt: evt.receivedAt,
    origin: 'grok-trend',
    sourceUrl: evt.source.tweetUrl,
    sentimentLabel: evt.sentiment?.label,
    trendingScore: evt.sparkfined.trendingScore,
    hypeLevel: evt.trading?.hypeLevel ?? evt.sentiment?.hypeLevel,
    callToAction: evt.trading?.callToAction ?? evt.sparkfined.callToAction,
  };

  if (evt.sparkfined.alertRelevance > 0.7) {
    alerts.push({
      ...base,
      id: `${evt.id}-high-relevance`,
      condition: 'High social relevance detected',
      summary: 'Trend scored high on Grok relevance and engagement.',
      meta: { reason: 'high-relevance', score: evt.sparkfined.alertRelevance },
    } as Alert);
  }

  if (evt.sentiment?.label === 'warning') {
    alerts.push({
      ...base,
      id: `${evt.id}-risk-warning`,
      condition: 'Warning sentiment spotted',
      summary: evt.tweet.snippet ?? 'Risk sentiment flagged in stream.',
      meta: { reason: 'warning-sentiment' },
    } as Alert);
  }

  const priceChange = evt.market?.priceChange24hPct;
  if (typeof priceChange === 'number' && Math.abs(priceChange) > 3) {
    alerts.push({
      ...base,
      id: `${evt.id}-momentum`,
      condition: 'Momentum shift alongside social spike',
      summary: `Price moved ${priceChange.toFixed(1)}% in 24h with social momentum.`,
      meta: { reason: 'momentum', priceChange },
    } as Alert);
  }

  return alerts;
}

function dedupeAlerts(alerts: Alert[]): Alert[] {
  const seen = new Set<string>();
  const result: Alert[] = [];

  alerts.forEach((alert) => {
    if (seen.has(alert.id)) {
      return;
    }
    seen.add(alert.id);
    result.push(alert);
  });

  return result;
}

