/**
 * Product Tour Configuration with Driver.js
 * 
 * Creates persona-based tours:
 * - Beginner: 7 steps (comprehensive)
 * - Intermediate: 3 steps (quick highlights)
 * - Advanced: 1 step (feature showcase)
 */

import { driver, DriveStep, Config } from 'driver.js';
import 'driver.js/dist/driver.css';
import { UserLevel } from '@/store/onboardingStore';

export function createProductTour(
  level: UserLevel,
  onComplete: () => void
): ReturnType<typeof driver> {
  const steps = getTourSteps(level);

  const config: Config = {
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Finish Tour',
    progressText: '{{current}} of {{total}}',
    steps,
    onDestroyed: () => {
      onComplete();
    },
    onDestroyStarted: () => {
      // Allow destruction
      return true;
    },
  };

  return driver(config);
}

function getTourSteps(level: UserLevel): DriveStep[] {
  // Common base steps
  const navigationStep: DriveStep = {
    element: '#main-navigation',
    popover: {
      title: '👆 Main Navigation',
      description: 'Switch between Board (Dashboard), Analyze (Token Research), Chart (Advanced TA), Journal (Track Trades), and Alerts.',
      side: 'bottom',
      align: 'center',
    },
  };

  const overviewStep: DriveStep = {
    element: '#overview-section',
    popover: {
      title: '📊 Your Command Center',
      description: 'Real-time KPIs at a glance: Today\'s P&L, Active Alerts, Risk Score, Sentiment Analysis, and more. Click any tile for details!',
      side: 'bottom',
      align: 'start',
    },
  };

  const quickActionsStep: DriveStep = {
    element: '#quick-actions',
    popover: {
      title: '⚡ Quick Actions',
      description: 'Jump-start your workflow: Create Chart, Add Alert, New Journal Entry, or run AI Analysis.',
      side: 'left',
      align: 'start',
    },
  };

  if (level === 'beginner') {
    return [
      navigationStep,
      overviewStep,
      {
        element: '#analyze-link',
        popover: {
          title: '🔍 Token Analysis',
          description: 'Search for any token and get instant KPIs: volatility, momentum, volume, and AI-powered insights.',
          side: 'bottom',
        },
      },
      {
        element: '#chart-link',
        popover: {
          title: '📈 Advanced Charting',
          description: 'Professional candlestick charts with 10+ technical indicators (RSI, MACD, Bollinger Bands) and drawing tools.',
          side: 'bottom',
        },
      },
      {
        element: '#journal-link',
        popover: {
          title: '📝 Trading Journal',
          description: 'Document every trade with screenshots, notes, and AI summaries. Learn from your wins and losses!',
          side: 'bottom',
        },
      },
      quickActionsStep,
      {
        element: '#settings-link',
        popover: {
          title: '⚙️ Settings & Help',
          description: 'Customize your theme, manage alerts, and access the Help Center with guides and tutorials.',
          side: 'bottom',
        },
      },
    ];
  }

  if (level === 'intermediate') {
    return [
      navigationStep,
      overviewStep,
      quickActionsStep,
    ];
  }

  if (level === 'advanced') {
    return [
      {
        popover: {
          title: '🚀 Welcome, Pro Trader!',
          description: `
            <div class="space-y-3">
              <p><strong>Key Features for Power Users:</strong></p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>Keyboard Shortcuts: Press <kbd class="px-1 py-0.5 bg-zinc-700 rounded">?</kbd> anytime</li>
                <li>API Integration: Settings → Advanced</li>
                <li>Alert Backtesting: Test rules before activation</li>
                <li>Chart Replay: Practice strategies risk-free</li>
                <li>AI Analysis: Unlimited token insights</li>
              </ul>
              <p class="text-xs text-zinc-400 mt-3">Explore at your own pace. You're in control! 💪</p>
            </div>
          `,
        },
      },
    ];
  }

  // Fallback: intermediate tour
  return [navigationStep, overviewStep, quickActionsStep];
}

// Export tour step IDs for testing/debugging
export const TOUR_STEP_IDS = {
  navigation: '#main-navigation',
  overview: '#overview-section',
  quickActions: '#quick-actions',
  analyze: '#analyze-link',
  chart: '#chart-link',
  journal: '#journal-link',
  settings: '#settings-link',
};
