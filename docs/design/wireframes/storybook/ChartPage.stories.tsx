import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import ChartPage from '../../src/pages/ChartPage';

// Mock OHLC data
const mockOhlcData = Array.from({ length: 96 }, (_, i) => ({
  t: 1698765432000 + i * 900000, // 15-minute intervals
  o: 0.00450 + Math.random() * 0.0002,
  h: 0.00455 + Math.random() * 0.0002,
  l: 0.00448 + Math.random() * 0.0002,
  c: 0.00452 + Math.random() * 0.0002,
  v: 100000 + Math.random() * 50000,
}));

const mockShapes = [
  { id: 'trend-1', type: 'trend', x1: 20, y1: 100, x2: 60, y2: 50, color: '#10b981' },
  { id: 'hline-1', type: 'hline', y: 120, color: '#ef4444' },
];

const mockBookmarks = [
  { id: 'bm-1', t: mockOhlcData[23].t, label: 'Support test', createdAt: Date.now() },
  { id: 'bm-2', t: mockOhlcData[67].t, label: 'Breakout', createdAt: Date.now() },
];

const mockBacktestResult = {
  hits: [
    { t: mockOhlcData[23].t, ruleId: 'rule-1', kind: 'price-cross', c: 0.00451 },
    { t: mockOhlcData[45].t, ruleId: 'rule-2', kind: 'pct-change-24h', c: 0.00478 },
    { t: mockOhlcData[67].t, ruleId: 'rule-1', kind: 'price-cross', c: 0.00492 },
  ],
  perRule: { 'rule-1': 2, 'rule-2': 1 },
};

export default {
  title: 'Screens/ChartPage',
  component: ChartPage,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0a0a0a' }],
    },
  },
} as ComponentMeta<typeof ChartPage>;

const Template: ComponentStory<typeof ChartPage> = (args) => <ChartPage {...args} />;

/**
 * **Default - Empty** - No data loaded yet
 * 
 * - Input field for CA
 * - Empty canvas with tip
 * - All toolbars visible but inactive
 */
export const Empty = Template.bind({});
Empty.parameters = {
  docs: {
    description: {
      story: 'Empty state with no chart data. Shows input field and placeholder canvas.',
    },
  },
};

/**
 * **Chart Loaded** - OHLC data rendered as candlesticks
 * 
 * - Candlestick chart visible
 * - Indicators (SMA20, EMA20) overlaid
 * - Drawing tools available
 * - HUD shows current bar info
 */
export const ChartLoaded = Template.bind({});
ChartLoaded.parameters = {
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    indState: { sma20: true, ema20: true, vwap: false },
    shapes: [],
    loading: false,
  },
  docs: {
    description: {
      story: 'Chart with OHLC data loaded. Shows candlesticks with SMA20 and EMA20 indicators.',
    },
  },
};

/**
 * **Replay Mode Active** - Playback in progress
 * 
 * - Replay cursor visible (vertical line)
 * - Play button → Pause icon
 * - Speed: 4x
 * - HUD shows replay status
 * - Bars after cursor dimmed/hidden
 */
export const ReplayActive = Template.bind({});
ReplayActive.parameters = {
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    replay: { isPlaying: true, cursor: 67, speed: 4 },
    bookmarks: mockBookmarks,
    loading: false,
  },
  docs: {
    description: {
      story: 'Replay mode active at 4x speed. Cursor at bar 67, future bars hidden.',
    },
  },
};

/**
 * **Drawing Mode** - User-drawn shapes on chart
 * 
 * - Trend line and horizontal line visible
 * - Tool: Trend (active)
 * - Shapes persisted to localStorage
 * - Selected shape highlighted
 */
export const DrawingMode = Template.bind({});
DrawingMode.parameters = {
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    tool: 'trend',
    shapes: mockShapes,
    selectedId: 'trend-1',
    loading: false,
  },
  docs: {
    description: {
      story: 'Drawing mode with trend tool active. User-drawn shapes visible on chart.',
    },
  },
};

/**
 * **Backtest Results** - Alert rule hits displayed
 * 
 * - Backtest panel expanded
 * - Results table with 3 hits
 * - Timeline markers on chart
 * - Clickable rows to jump to timestamp
 */
export const BacktestResults = Template.bind({});
BacktestResults.parameters = {
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    btResult: mockBacktestResult,
    btServerMs: 234,
    loading: false,
  },
  docs: {
    description: {
      story: 'Backtest results showing 3 hits. Timeline markers visible on chart.',
    },
  },
};

/**
 * **MiniMap & Timeline Visible** - Navigation aids active
 * 
 * - MiniMap shows full data range with view window
 * - Timeline shows event markers
 * - Both draggable/clickable
 */
export const NavigationAids = Template.bind({});
NavigationAids.parameters = {
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    settings: { showMinimap: true, showTimeline: true },
    events: [
      { t: mockOhlcData[23].t, type: 'bookmark', label: 'Support' },
      { t: mockOhlcData[67].t, type: 'alert', ruleId: 'rule-1' },
    ],
    loading: false,
  },
  docs: {
    description: {
      story: 'MiniMap and Timeline visible below chart. Shows event markers.',
    },
  },
};

/**
 * **Mobile View** - Responsive layout at 375px
 * 
 * - Toolbars may wrap
 * - Chart canvas smaller (aspect ~1.5:1)
 * - Touch-optimized controls
 */
export const Mobile = Template.bind({});
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    loading: false,
  },
  docs: {
    description: {
      story: 'Mobile layout at 375px. Compact toolbars and smaller canvas.',
    },
  },
};

/**
 * **Desktop View** - Wide layout at 1280px+
 * 
 * - Chart canvas much wider (aspect ~2.5:1)
 * - MiniMap and Timeline side-by-side
 * - All toolbars in single row
 */
export const Desktop = Template.bind({});
Desktop.parameters = {
  viewport: {
    defaultViewport: 'desktop',
  },
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    settings: { showMinimap: true, showTimeline: true },
    loading: false,
  },
  docs: {
    description: {
      story: 'Desktop layout at 1280px+. Wider canvas and side-by-side navigation.',
    },
  },
};
