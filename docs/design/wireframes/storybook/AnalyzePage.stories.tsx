import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import AnalyzePage from '../../src/pages/AnalyzePage';

// Mock data for stories
const mockOhlcData = [
  { t: 1698765432000, o: 0.00450, h: 0.00465, l: 0.00448, c: 0.00460, v: 123456 },
  { t: 1698765532000, o: 0.00460, h: 0.00475, l: 0.00458, c: 0.00470, v: 134567 },
  // ... more data points
];

const mockMetrics = {
  lastClose: 0.00460,
  change24h: 12.34,
  volStdev: 3.21,
  atr14: 0.000123,
  hiLoPerc: 18.54,
  volumeSum: 1234567,
};

const mockAiResult = {
  text: `• Kontext: SOL/USDT 15m
• Momentum: Bullish (+12.3%)
• SMA20 support @ 0.00456
• Hypothesis: Breakout pending above 0.00470
• Risk: Watch for rejection at 0.00475
• Next: Monitor volume spike confirmation`,
  provider: 'openai',
  model: 'gpt-4o-mini',
  ms: 234,
  costUsd: 0.0012,
};

export default {
  title: 'Screens/AnalyzePage',
  component: AnalyzePage,
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
} as ComponentMeta<typeof AnalyzePage>;

const Template: ComponentStory<typeof AnalyzePage> = (args) => <AnalyzePage {...args} />;

/**
 * **Empty State** - Default view when user first lands on Analyze page
 * 
 * - Input field for Contract Address
 * - TF dropdown (default: 15m)
 * - "Analysieren" button (disabled)
 * - Empty state message
 */
export const Empty = Template.bind({});
Empty.parameters = {
  docs: {
    description: {
      story: 'Initial empty state with placeholder text. User needs to enter a contract address to proceed.',
    },
  },
};

/**
 * **Loading State** - After user clicks "Analysieren"
 * 
 * - Button shows "Lade…"
 * - Button is disabled
 * - Loading indicator (text-based)
 */
export const Loading = Template.bind({});
Loading.parameters = {
  mockData: {
    loading: true,
    address: '7xKF...abc123',
    tf: '15m',
  },
  docs: {
    description: {
      story: 'Loading state while fetching OHLC data from API. Button text changes to "Lade…".',
    },
  },
};

/**
 * **Success - Data Loaded** - KPIs and Heatmap displayed
 * 
 * - 6 KPI cards (3 columns on desktop)
 * - Indicator heatmap
 * - AI Assist panel (empty)
 * - Export buttons
 */
export const DataLoaded = Template.bind({});
DataLoaded.parameters = {
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    metrics: mockMetrics,
    loading: false,
    error: null,
  },
  docs: {
    description: {
      story: 'Success state with OHLC data loaded. Shows KPI cards, heatmap, and AI Assist panel.',
    },
  },
};

/**
 * **AI Generated** - AI analysis result displayed
 * 
 * - All from DataLoaded state
 * - AI Assist panel shows generated bullets
 * - Cost info displayed
 * - "One-Click Trade-Idea" CTA enabled
 */
export const AIGenerated = Template.bind({});
AIGenerated.parameters = {
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    data: mockOhlcData,
    metrics: mockMetrics,
    aiResult: mockAiResult,
    loading: false,
    error: null,
  },
  docs: {
    description: {
      story: 'AI analysis generated. Shows bullet points with cost info and CTA button.',
    },
  },
};

/**
 * **Error State** - API error occurred
 * 
 * - Error banner with message
 * - Data cleared
 * - User can retry by clicking "Analysieren" again
 */
export const Error = Template.bind({});
Error.parameters = {
  mockData: {
    address: '7xKF...abc123',
    tf: '15m',
    loading: false,
    error: 'Network error: Failed to fetch OHLC data',
  },
  docs: {
    description: {
      story: 'Error state when API call fails. Shows red banner with error message.',
    },
  },
};

/**
 * **Mobile View** - Responsive layout at 375px
 * 
 * - KPI cards stacked (1 column)
 * - Buttons wrap
 * - Bottom navigation visible
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
    metrics: mockMetrics,
  },
  docs: {
    description: {
      story: 'Mobile responsive layout at 375px width. Single column KPI cards.',
    },
  },
};

/**
 * **Desktop View** - Wide layout at 1280px+
 * 
 * - KPI cards in 3-column grid
 * - AI panel has 2-column layout (result left, controls right)
 * - Playbook expanded inline
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
    metrics: mockMetrics,
    aiResult: mockAiResult,
  },
  docs: {
    description: {
      story: 'Desktop layout at 1280px+ width. Shows 3-column KPI grid and wider AI panel.',
    },
  },
};
