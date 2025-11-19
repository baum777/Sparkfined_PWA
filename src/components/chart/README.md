# Chart Components

High-performance trading charts using TradingView Lightweight Charts.

## Components

### LightweightChartCanvas

Main candlestick chart component with volume bars.

**Features:**
- 📊 Candlestick OHLC charts
- 📈 Volume histogram overlay
- 📱 Touch-optimized (pinch-to-zoom, horizontal drag)
- ⚡ 60 FPS performance (Canvas-based, GPU-accelerated)
- 🌙 Dark mode optimized
- 📦 35KB bundle size (gzipped ~15KB)

**Touch Gestures:**
- **Pinch-to-Zoom:** Two-finger pinch to zoom in/out on price axis
- **Horizontal Drag:** One-finger drag to pan through time
- **Double-Tap:** Reset zoom to fit content

**Usage:**
```tsx
import LightweightChartCanvas from '@/components/chart/LightweightChartCanvas';
import { generateMockOHLC } from '@/lib/chartUtils';

const data = generateMockOHLC('SOL', 30, 3600); // 30 days, 1h candles

<LightweightChartCanvas
  data={data}
  symbol="SOL"
  height={500}
  onCrosshairMove={(price, time) => console.log(price, time)}
  showVolume={true}
/>
```

**Props:**
- `data` (required): Array of OHLC candlestick data
- `symbol` (optional): Token symbol for display
- `height` (optional): Chart height in pixels (default: 500)
- `onCrosshairMove` (optional): Callback when crosshair moves
- `showVolume` (optional): Show volume bars (default: true)

---

### IndicatorPanel

Technical indicator charts (RSI, EMA, MACD) in separate panes.

**Features:**
- 📊 Multi-pane support (RSI, EMA, MACD)
- 🎯 Overbought/Oversold zones for RSI (70/30)
- 🔗 Auto-sync with main chart (shared time axis)
- 📱 Touch-optimized

**Usage:**
```tsx
import IndicatorPanel from '@/components/chart/IndicatorPanel';
import { calculateRSI } from '@/lib/chartUtils';

const rsiData = calculateRSI(ohlcData, 14); // 14-period RSI

<IndicatorPanel
  data={rsiData}
  type="RSI"
  height={150}
/>
```

**Props:**
- `data` (required): Array of indicator data (time + value)
- `type` (required): Indicator type ('RSI' | 'EMA' | 'MACD')
- `height` (optional): Panel height in pixels (default: 150)

---

## Chart Utilities

### generateMockOHLC

Generate mock OHLC data for testing.

```tsx
import { generateMockOHLC } from '@/lib/chartUtils';

const data = generateMockOHLC('SOL', 30, 3600);
// Returns 30 days of 1-hour candles for SOL
```

**Parameters:**
- `symbol` (string): Token symbol (e.g., 'SOL', 'BTC')
- `days` (number): Number of days of historical data (default: 30)
- `interval` (number): Interval in seconds (default: 3600 = 1 hour)

---

### calculateRSI

Calculate Relative Strength Index.

```tsx
import { calculateRSI } from '@/lib/chartUtils';

const rsiData = calculateRSI(ohlcData, 14);
// Returns RSI values with timestamps
```

**Parameters:**
- `data` (OHLCData[]): Array of OHLC candlestick data
- `period` (number): RSI period (default: 14)

---

### calculateEMA

Calculate Exponential Moving Average.

```tsx
import { calculateEMA } from '@/lib/chartUtils';

const emaData = calculateEMA(ohlcData, 20);
// Returns EMA values with timestamps
```

**Parameters:**
- `data` (OHLCData[]): Array of OHLC candlestick data
- `period` (number): EMA period (default: 20)

---

## Performance

**Bundle Size:**
- lightweight-charts: 35KB (gzipped ~15KB)
- LightweightChartCanvas: ~3KB
- IndicatorPanel: ~2KB
- chartUtils: ~2KB
- **Total:** ~42KB (gzipped ~22KB)

**Rendering:**
- Canvas-based (GPU-accelerated)
- 60 FPS on modern devices
- Efficient data updates (only re-renders changed data)

**Mobile:**
- Touch-optimized with native gestures
- Kinetic scrolling for smooth panning
- Pinch-to-zoom with natural feel
- No 300ms tap delay (touch-manipulation)

---

## Future Enhancements

**Phase 4 (Mobile Gestures):**
- Long-press to add alert
- Swipe up/down to switch timeframes
- Haptic feedback on crosshair snap

**Phase 5 (Advanced Features):**
- Drawing tools (trendlines, fibonacci)
- Custom indicators (Bollinger, Ichimoku)
- Real-time data streaming (WebSocket)
- Multi-chart layouts (4-up, 6-up)

---

## Related

- [TradingView Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/)
- [Chart Utils](../../lib/chartUtils.ts)
- [Chart Page V2](../../pages/ChartPageV2.tsx)
