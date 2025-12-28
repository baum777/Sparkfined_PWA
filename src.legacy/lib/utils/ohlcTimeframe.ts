import type { Timeframe } from '../types/ohlc'

const TIMEFRAME_INTERVAL: Record<Timeframe, number | string> = {
  '30s': '30s',
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  '1d': '1d',
}

export function timeframeToInterval(timeframe: Timeframe): number | string {
  return TIMEFRAME_INTERVAL[timeframe] ?? timeframe
}
