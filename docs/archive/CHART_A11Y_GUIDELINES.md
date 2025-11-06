# Chart Accessibility Guidelines

## Overview

Making trading charts accessible to all users, including those using screen readers, keyboard navigation, and assistive technologies.

## WCAG 2.1 Requirements

### Success Criteria
- **1.1.1 Non-text Content (A)**: Provide text alternatives for charts
- **1.3.1 Info and Relationships (A)**: Present chart data in accessible structure
- **2.1.1 Keyboard (A)**: All chart functionality available via keyboard
- **2.4.3 Focus Order (A)**: Logical tab order for chart controls
- **4.1.2 Name, Role, Value (A)**: Proper ARIA attributes for chart elements

---

## Implementation Checklist

### 1. Chart Container ARIA Attributes

```tsx
<div
  role="img"
  aria-label="BTC/USD 15-minute candlestick chart"
  aria-describedby="chart-description chart-summary"
>
  {/* Chart canvas/SVG */}
</div>

<div id="chart-description" className="sr-only">
  Interactive price chart showing BTC/USD trading data
  from {startDate} to {endDate}. Use arrow keys to navigate
  data points, or access the data table below.
</div>

<div id="chart-summary" className="sr-only" aria-live="polite">
  Current price: ${currentPrice}. 
  24h change: {change24h}%. 
  High: ${high24h}. Low: ${low24h}.
</div>
```

### 2. Data Table Alternative

Provide a hidden (but screen reader accessible) data table:

```tsx
<table className="sr-only" aria-label="Chart data table">
  <caption>
    BTC/USD Price Data - 15 minute intervals
  </caption>
  <thead>
    <tr>
      <th scope="col">Time</th>
      <th scope="col">Open</th>
      <th scope="col">High</th>
      <th scope="col">Low</th>
      <th scope="col">Close</th>
      <th scope="col">Volume</th>
    </tr>
  </thead>
  <tbody>
    {ohlcData.map((candle, index) => (
      <tr key={index}>
        <th scope="row">{formatTime(candle.timestamp)}</th>
        <td>${candle.open}</td>
        <td>${candle.high}</td>
        <td>${candle.low}</td>
        <td>${candle.close}</td>
        <td>{candle.volume}</td>
      </tr>
    ))}
  </tbody>
</table>

{/* Screen Reader Only class */}
<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
```

### 3. Keyboard Navigation

Implement keyboard controls for chart interaction:

```tsx
function ChartComponent() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        // Navigate to previous candle
        setFocusedIndex(Math.max(0, focusedIndex - 1));
        announceDataPoint(ohlcData[focusedIndex - 1]);
        break;
      case 'ArrowRight':
        // Navigate to next candle
        setFocusedIndex(Math.min(ohlcData.length - 1, focusedIndex + 1));
        announceDataPoint(ohlcData[focusedIndex + 1]);
        break;
      case 'Home':
        // Jump to first candle
        setFocusedIndex(0);
        announceDataPoint(ohlcData[0]);
        break;
      case 'End':
        // Jump to last candle
        setFocusedIndex(ohlcData.length - 1);
        announceDataPoint(ohlcData[ohlcData.length - 1]);
        break;
      case 'Enter':
      case ' ':
        // Toggle crosshair or show details modal
        showDetailsModal(ohlcData[focusedIndex]);
        break;
    }
  };
  
  const announceDataPoint = (candle: OHLCData) => {
    // Update aria-live region
    setLiveRegionText(
      `${formatTime(candle.timestamp)}: 
       Open ${candle.open}, 
       High ${candle.high}, 
       Low ${candle.low}, 
       Close ${candle.close}`
    );
  };
  
  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="Interactive chart"
    >
      {/* Chart rendering */}
      <div aria-live="polite" className="sr-only">
        {liveRegionText}
      </div>
    </div>
  );
}
```

### 4. Chart Controls Accessibility

Timeframe selector, indicators, drawing tools:

```tsx
<div role="toolbar" aria-label="Chart controls">
  <button
    aria-label="15 minute timeframe"
    aria-pressed={timeframe === '15m'}
    onClick={() => setTimeframe('15m')}
  >
    15m
  </button>
  
  <button
    aria-label="1 hour timeframe"
    aria-pressed={timeframe === '1h'}
    onClick={() => setTimeframe('1h')}
  >
    1h
  </button>
  
  <button
    aria-label="Add moving average indicator"
    aria-expanded={indicatorMenuOpen}
    onClick={() => setIndicatorMenuOpen(!indicatorMenuOpen)}
  >
    Indicators
  </button>
</div>
```

### 5. Live Data Updates

Announce price changes without interrupting user:

```tsx
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {/* Only announce significant changes (> 0.5%) */}
  {shouldAnnounce && `Price updated: ${currentPrice}, ${priceChange}%`}
</div>
```

### 6. Touch Gestures Alternative

Provide accessible alternatives to touch gestures:

| Gesture | Keyboard Alternative | Description |
|---------|---------------------|-------------|
| Pinch zoom | `+` / `-` keys | Zoom in/out |
| Pan | Arrow keys + Shift | Move chart view |
| Two-finger scroll | Arrow keys | Navigate timeline |
| Long press | Enter key | Show details modal |

### 7. Color Independence

Ensure chart information is not conveyed by color alone:

- **Candlestick patterns**: Use border styles (solid for bullish, dashed for bearish)
- **Indicators**: Use line patterns (solid, dashed, dotted)
- **Annotations**: Use shapes + labels (not just color)
- **Alerts**: Use icons + text (not just color-coded backgrounds)

Example:

```tsx
<path
  d={candlePath}
  fill={isBullish ? '#00ff00' : '#ff0000'}
  stroke={isBullish ? 'solid' : 'dashed'} // Pattern, not just color
  aria-label={`${isBullish ? 'Bullish' : 'Bearish'} candle`}
/>
```

---

## Testing Checklist

### Screen Readers
- [ ] NVDA (Windows) - Test with Chrome/Firefox
- [ ] JAWS (Windows) - Test with Chrome/IE
- [ ] VoiceOver (macOS/iOS) - Test with Safari
- [ ] TalkBack (Android) - Test with Chrome

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] All interactive elements reachable
- [ ] Arrow keys navigate data points
- [ ] Home/End jump to first/last
- [ ] Enter/Space activate controls
- [ ] Escape closes modals/menus
- [ ] No keyboard traps

### Visual
- [ ] Focus indicators visible (2px outline minimum)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Information not conveyed by color alone
- [ ] Text scales to 200% without loss of content

### Automated Tools
- [ ] axe DevTools (Chrome extension)
- [ ] Lighthouse A11y audit (90+ score)
- [ ] WAVE (Web Accessibility Evaluation Tool)

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Highcharts Accessibility Module](https://www.highcharts.com/docs/accessibility/accessibility-module)
- [Chart.js Accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html)
- [Trading View Accessibility Features](https://www.tradingview.com/support/solutions/43000555312/)

---

## Implementation Priority

1. **P0 (MVP)**: Chart description, data table, keyboard nav
2. **P1 (Post-MVP)**: Live updates, touch alternatives
3. **P2 (Enhancement)**: Advanced keyboard shortcuts, voice commands
