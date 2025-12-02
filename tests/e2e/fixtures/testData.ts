export type JournalTestEntry = {
  title: string;
  notes: string;
};

export function makeJournalTestEntry(label: string = 'Quick log'): JournalTestEntry {
  const suffix = new Date().toISOString().replace(/[^0-9]/g, '').slice(-8);
  return {
    title: `${label} #${suffix}`,
    notes: `Automated notes for ${label} run ${suffix}.`,
  };
}

export const ALERT_IDS = {
  armed: 'btc-breakout',
  triggered: 'eth-liquidity-run',
  paused: 'sol-squeeze',
  volatility: 'avax-volatility-break',
} as const;

export const WATCHLIST_SYMBOLS = {
  primary: 'BTCUSDT',
  trending: 'OPUSDT',
  chartable: 'SOLUSDT',
  nySession: 'ETHUSDT',
} as const;
