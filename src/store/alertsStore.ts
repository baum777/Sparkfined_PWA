import { create } from 'zustand';
import type { SolanaMemeTrendEvent, TrendCallToAction, TrendHypeLevel, TrendSentimentLabel } from '@/types/events';

export type AlertType = 'price-above' | 'price-below';
export type AlertStatus = 'armed' | 'triggered' | 'paused';
export type AlertOrigin = 'manual' | 'grok-trend';

export type Alert = {
  id: string;
  symbol: string;
  type: AlertType;
  condition: string;
  threshold: number;
  timeframe: string;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  origin?: AlertOrigin;
  meta?: Record<string, unknown>;
  summary?: string;
  sourceUrl?: string;
  sentimentLabel?: TrendSentimentLabel;
  trendingScore?: number;
  hypeLevel?: TrendHypeLevel;
  callToAction?: TrendCallToAction;
};

export type CreateAlertInput = {
  symbol: string;
  type: AlertType;
  condition: string;
  threshold: number;
  timeframe: string;
};

interface AlertsState {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  pushAlert: (alert: Alert) => void;
  createAlert: (input: CreateAlertInput) => Alert;
  processTrendEvent?: (evt: SolanaMemeTrendEvent) => void;
  createDraftFromChart: (input: { address: string; symbol: string; price: number; time: number; timeframe: string }) => Alert;
}

const ALERT_LIMIT = 50;

const INITIAL_ALERTS: Alert[] = buildInitialAlerts();

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: INITIAL_ALERTS,
  setAlerts: (alerts) => set({ alerts }),
  pushAlert: (alert) =>
    set((state) => ({
      alerts: dedupeAlerts([alert, ...state.alerts]).slice(0, ALERT_LIMIT),
    })),
  createAlert: (input) => {
    const now = new Date().toISOString();
    const normalizedSymbol = input.symbol.trim().toUpperCase();
    const normalizedCondition = input.condition.trim();
    const alert: Alert = {
      id: generateAlertId(),
      symbol: normalizedSymbol,
      type: input.type,
      condition: normalizedCondition,
      threshold: input.threshold,
      timeframe: input.timeframe,
      status: 'armed',
      createdAt: now,
      updatedAt: now,
      origin: 'manual',
    };

    set((state) => ({
      alerts: dedupeAlerts([alert, ...state.alerts]).slice(0, ALERT_LIMIT),
    }));

    return alert;
  },
  createDraftFromChart: (input) => {
    const timestamp = new Date(input.time).toISOString();
    const alert: Alert = {
      id: `chart-${input.symbol}-${input.time}`,
      symbol: input.symbol.trim().toUpperCase(),
      condition: `Create alert @ ${input.price} on ${new Date(input.time).toUTCString()}`,
      type: 'price-above',
      status: 'armed',
      timeframe: input.timeframe,
      threshold: input.price,
      createdAt: timestamp,
      updatedAt: timestamp,
      origin: 'manual',
    };
    set((state) => ({ alerts: dedupeAlerts([alert, ...state.alerts]).slice(0, ALERT_LIMIT) }));
    return alert;
  },
  processTrendEvent: (evt) =>
    set((state) => {
      const nextAlerts = buildTrendAlerts(evt).reduce<Alert[]>((acc, alert) => {
        return dedupeAlerts([alert, ...acc]);
      }, state.alerts);

      return { alerts: nextAlerts.slice(0, ALERT_LIMIT) };
    }),
}));

function buildInitialAlerts(): Alert[] {
  const now = Date.now();
  const createTimestamp = (offsetHours: number) => new Date(now - offsetHours * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'btc-breakout',
      symbol: 'BTCUSDT',
      condition: 'Price closes above 42,500 with RSI > 60',
      type: 'price-above',
      status: 'armed',
      timeframe: '4h',
      threshold: 42500,
      createdAt: createTimestamp(12),
      updatedAt: createTimestamp(6),
    },
    {
      id: 'eth-liquidity-run',
      symbol: 'ETHUSDT',
      condition: 'Watch for failure to reclaim $2,350 after sweep',
      type: 'price-below',
      status: 'triggered',
      timeframe: '1h',
      threshold: 2350,
      createdAt: createTimestamp(24),
      updatedAt: createTimestamp(2),
    },
    {
      id: 'sol-squeeze',
      symbol: 'SOLUSDT',
      condition: 'Breaks above prior value area and holds for 2 closes',
      type: 'price-above',
      status: 'paused',
      timeframe: '1d',
      threshold: 190,
      createdAt: createTimestamp(30),
      updatedAt: createTimestamp(18),
    },
    {
      id: 'op-200ema-reclaim',
      symbol: 'OPUSDT',
      condition: '200 EMA reclaim with 4h close confirmation',
      type: 'price-above',
      status: 'armed',
      timeframe: '4h',
      threshold: 3.15,
      createdAt: createTimestamp(40),
      updatedAt: createTimestamp(12),
    },
    {
      id: 'arb-bid-imbalance',
      symbol: 'ARBUSDT',
      condition: 'Alert when price loses VWAP after early session imbalance',
      type: 'price-below',
      status: 'paused',
      timeframe: '30m',
      threshold: 1.63,
      createdAt: createTimestamp(55),
      updatedAt: createTimestamp(20),
    },
    {
      id: 'avax-volatility-break',
      symbol: 'AVAXUSDT',
      condition: 'Momentum continuation above 42.80 with expanding ATR',
      type: 'price-above',
      status: 'triggered',
      timeframe: '1h',
      threshold: 42.8,
      createdAt: createTimestamp(65),
      updatedAt: createTimestamp(4),
    },
  ];
}

function buildTrendAlerts(evt: SolanaMemeTrendEvent): Alert[] {
  const alerts: Alert[] = [];
  const timestamp = evt.receivedAt ?? new Date().toISOString();
  const threshold = typeof evt.market?.priceUsd === 'number' ? evt.market.priceUsd : 0;
  const direction: AlertType =
    typeof evt.market?.priceChange24hPct === 'number' && evt.market.priceChange24hPct < 0 ? 'price-below' : 'price-above';

  const base: Partial<Alert> = {
    symbol: evt.token.symbol.toUpperCase(),
    type: direction,
    status: 'triggered',
    timeframe: evt.trading?.timeframe ?? '1h',
    createdAt: timestamp,
    updatedAt: timestamp,
    threshold,
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

function generateAlertId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `alert-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

