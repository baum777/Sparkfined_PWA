/**
 * Chart Feature Types
 * Sparkfined PWA Trading Platform
 */

export interface ChartData {
  symbol: string
  interval: string
  data: OHLCV[]
  lastUpdate: number
}

export interface OHLCV {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Indicator {
  id: string
  type: IndicatorType
  params: Record<string, any>
  visible: boolean
}

export type IndicatorType = 
  | 'SMA' 
  | 'EMA' 
  | 'RSI' 
  | 'MACD' 
  | 'Bollinger' 
  | 'Volume'

export interface DrawingTool {
  id: string
  type: DrawingType
  points: Point[]
  style: DrawingStyle
}

export type DrawingType = 
  | 'trendline' 
  | 'horizontal' 
  | 'rectangle' 
  | 'fibonacci'

export interface Point {
  time: number
  price: number
}

export interface DrawingStyle {
  color: string
  width: number
  lineStyle: 'solid' | 'dashed' | 'dotted'
}

export interface ChartSettings {
  theme: 'light' | 'dark'
  gridVisible: boolean
  volumeVisible: boolean
  crosshairMode: number
}
