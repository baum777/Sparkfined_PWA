/**
 * OHLC Data Types and Utilities
 *
 * Types for candlestick chart data (Open, High, Low, Close, Volume).
 * Used with TradingView Lightweight Charts.
 */

export interface OHLCData {
  /** Unix timestamp in seconds */
  time: number;

  /** Opening price */
  open: number;

  /** Highest price in period */
  high: number;

  /** Lowest price in period */
  low: number;

  /** Closing price */
  close: number;

  /** Trading volume (optional) */
  volume?: number;
}

/**
 * Generate mock OHLC data for testing
 *
 * @param symbol - Token symbol (e.g., "SOL")
 * @param days - Number of days of historical data
 * @param interval - Interval in seconds (e.g., 3600 for 1h)
 * @returns Array of OHLC candlesticks
 */
export function generateMockOHLC(
  symbol: string,
  days: number = 30,
  interval: number = 3600 // 1 hour default
): OHLCData[] {
  const data: OHLCData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - days * 24 * 3600;

  // Base prices for different tokens
  const basePrices: Record<string, number> = {
    SOL: 152,
    BTC: 98000,
    ETH: 3800,
    BONK: 0.000012,
    WIF: 2.84,
  };

  let basePrice = basePrices[symbol] || 100;
  let currentPrice = basePrice;

  for (let time = startTime; time <= now; time += interval) {
    // Random walk with mean reversion
    const change = (Math.random() - 0.48) * (basePrice * 0.02); // Slight upward bias
    currentPrice += change;

    // Mean reversion
    if (Math.abs(currentPrice - basePrice) > basePrice * 0.15) {
      currentPrice = basePrice + (currentPrice - basePrice) * 0.9;
    }

    const open = currentPrice;
    const close = currentPrice + (Math.random() - 0.5) * (basePrice * 0.01);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.005);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.005);
    const volume = Math.random() * 1000000 + 500000;

    data.push({
      time,
      open: Number(open.toFixed(symbol === 'BONK' ? 8 : 2)),
      high: Number(high.toFixed(symbol === 'BONK' ? 8 : 2)),
      low: Number(low.toFixed(symbol === 'BONK' ? 8 : 2)),
      close: Number(close.toFixed(symbol === 'BONK' ? 8 : 2)),
      volume: Math.round(volume),
    });

    currentPrice = close;
  }

  return data;
}

/**
 * Calculate RSI (Relative Strength Index)
 *
 * @param data - OHLC data array
 * @param period - RSI period (default: 14)
 * @returns Array of RSI values with timestamps
 */
export function calculateRSI(
  data: OHLCData[],
  period: number = 14
): { time: number; value: number }[] {
  if (data.length < period + 1) return [];

  const rsi: { time: number; value: number }[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate initial gains/losses
  for (let i = 1; i <= period; i++) {
    const change = data[i]!.close - data[i - 1]!.close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  let avgGain = gains.reduce((sum, g) => sum + g, 0) / period;
  let avgLoss = losses.reduce((sum, l) => sum + l, 0) / period;

  for (let i = period; i < data.length; i++) {
    const change = data[i]!.close - data[i - 1]!.close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiValue = 100 - 100 / (1 + rs);

    rsi.push({
      time: data[i]!.time,
      value: Number(rsiValue.toFixed(2)),
    });
  }

  return rsi;
}

/**
 * Calculate EMA (Exponential Moving Average)
 *
 * @param data - OHLC data array
 * @param period - EMA period (default: 20)
 * @returns Array of EMA values with timestamps
 */
export function calculateEMA(
  data: OHLCData[],
  period: number = 20
): { time: number; value: number }[] {
  if (data.length < period) return [];

  const ema: { time: number; value: number }[] = [];
  const multiplier = 2 / (period + 1);

  // Calculate initial SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i]!.close;
  }
  let emaValue = sum / period;

  ema.push({ time: data[period - 1]!.time, value: Number(emaValue.toFixed(2)) });

  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    emaValue = (data[i]!.close - emaValue) * multiplier + emaValue;
    ema.push({ time: data[i]!.time, value: Number(emaValue.toFixed(2)) });
  }

  return ema;
}
