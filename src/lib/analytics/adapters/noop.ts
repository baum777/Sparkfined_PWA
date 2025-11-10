/**
 * Noop Analytics Adapter
 * Used for development, testing, or when no analytics provider is configured
 *
 * Simply logs events to console instead of sending to external service
 */

import type { AnalyticsAdapter } from './index';

export class NoopAdapter implements AnalyticsAdapter {
  private eventCount = 0;

  async track(eventName: string, properties: Record<string, any>): Promise<void> {
    this.eventCount++;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics:Noop] Track:', {
        event: eventName,
        properties,
        count: this.eventCount
      });
    }

    // Simulate network delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics:Noop] Identify:', {
        userId,
        traits
      });
    }

    await new Promise(resolve => setTimeout(resolve, 10));
  }

  async flush(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics:Noop] Flush: ${this.eventCount} events tracked`);
    }
  }

  getEventCount(): number {
    return this.eventCount;
  }

  reset(): void {
    this.eventCount = 0;
  }
}
