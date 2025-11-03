/**
 * Chart Module Types
 */

export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'

export interface OHLCV {
  time: number // Unix timestamp in seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ChartIndicator {
  id: string
  type: 'MA' | 'EMA' | 'RSI' | 'MACD' | 'BB' | 'Volume'
  params: Record<string, number>
  visible: boolean
  color?: string
}

export interface ChartDrawing {
  id: string
  type: 'trendline' | 'horizontal' | 'rectangle' | 'fibonacci' | 'text'
  points: Array<{ time: number; price: number }>
  color?: string
  style?: 'solid' | 'dashed' | 'dotted'
  text?: string
}

export interface ChartTheme {
  background: string
  text: string
  grid: {
    vertLines: string
    horzLines: string
  }
  candlestick: {
    upColor: string
    downColor: string
    borderUpColor: string
    borderDownColor: string
    wickUpColor: string
    wickDownColor: string
  }
}

export const DARK_THEME: ChartTheme = {
  background: '#0A0E27',
  text: '#D9D9D9',
  grid: {
    vertLines: 'rgba(42, 46, 57, 0.5)',
    horzLines: 'rgba(42, 46, 57, 0.2)',
  },
  candlestick: {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderUpColor: '#26a69a',
    borderDownColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  },
}

export const LIGHT_THEME: ChartTheme = {
  background: '#FFFFFF',
  text: '#191919',
  grid: {
    vertLines: 'rgba(197, 203, 206, 0.5)',
    horzLines: 'rgba(197, 203, 206, 0.2)',
  },
  candlestick: {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderUpColor: '#26a69a',
    borderDownColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  },
}
