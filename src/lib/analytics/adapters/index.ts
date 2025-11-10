/**
 * Analytics Adapter Interface
 * Provider-agnostic abstraction for analytics tracking
 *
 * Supported providers:
 * - Mixpanel
 * - Amplitude
 * - Segment
 * - Noop (dev/test)
 */

export interface AnalyticsAdapter {
  /**
   * Track an event
   *
   * @param eventName - Event name (e.g., "chart.crosshair_agg")
   * @param properties - Event properties
   */
  track(eventName: string, properties: Record<string, any>): Promise<void>;

  /**
   * Identify a user (optional)
   *
   * @param userId - User identifier (hashed)
   * @param traits - User traits
   */
  identify?(userId: string, traits?: Record<string, any>): Promise<void>;

  /**
   * Flush pending events (optional)
   */
  flush?(): Promise<void>;
}

/**
 * Create analytics adapter based on environment config
 *
 * @param provider - Provider name (from env ANALYTICS_PROVIDER)
 * @returns Analytics adapter instance
 */
export function createAdapter(provider?: string): AnalyticsAdapter {
  const providerName = provider || process.env.ANALYTICS_PROVIDER || 'noop';

  switch (providerName.toLowerCase()) {
    case 'mixpanel':
      return createMixpanelAdapter();
    case 'amplitude':
      return createAmplitudeAdapter();
    case 'segment':
      return createSegmentAdapter();
    case 'noop':
    default:
      console.warn(`[Analytics] Using noop adapter (provider: ${providerName})`);
      return createNoopAdapter();
  }
}

// Lazy imports to avoid bundling all adapters
function createMixpanelAdapter(): AnalyticsAdapter {
  const { MixpanelAdapter } = require('./mixpanel');
  return new MixpanelAdapter();
}

function createAmplitudeAdapter(): AnalyticsAdapter {
  const { AmplitudeAdapter } = require('./amplitude');
  return new AmplitudeAdapter();
}

function createSegmentAdapter(): AnalyticsAdapter {
  const { SegmentAdapter } = require('./segment');
  return new SegmentAdapter();
}

function createNoopAdapter(): AnalyticsAdapter {
  const { NoopAdapter } = require('./noop');
  return new NoopAdapter();
}
