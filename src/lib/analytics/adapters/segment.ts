/**
 * Segment Analytics Adapter
 * Server-side implementation using @segment/analytics-node
 */

import type { AnalyticsAdapter } from './index';

export class SegmentAdapter implements AnalyticsAdapter {
  private client: any = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const { Analytics } = require('@segment/analytics-node');
      const writeKey = process.env.SEGMENT_WRITE_KEY;

      if (!writeKey) {
        throw new Error('SEGMENT_WRITE_KEY not set');
      }

      this.client = new Analytics({
        writeKey,
        flushInterval: 10000 // Flush every 10s
      });

      console.log('[Segment] Initialized');
    } catch (error) {
      console.error('[Segment] Failed to initialize', error);
      throw error;
    }
  }

  async track(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.client) {
      throw new Error('[Segment] Client not initialized');
    }

    // Sanitize properties
    const sanitized = this.sanitizeProperties(properties);

    // Extract user identifier
    const userId = sanitized.user_bucket !== null
      ? `bucket_${sanitized.user_bucket}`
      : 'anonymous';

    try {
      await this.client.track({
        event: eventName,
        userId,
        properties: sanitized
      });
    } catch (error) {
      console.error('[Segment] Track failed', error);
      throw error;
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.client) {
      throw new Error('[Segment] Client not initialized');
    }

    const sanitized = this.sanitizeProperties(traits || {});

    try {
      await this.client.identify({
        userId,
        traits: sanitized
      });
    } catch (error) {
      console.error('[Segment] Identify failed', error);
      throw error;
    }
  }

  async flush(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.flush();
    } catch (error) {
      console.error('[Segment] Flush failed', error);
      throw error;
    }
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Skip sensitive fields
      if (key === 'user_id' || key === 'email' || key === 'ip_address') {
        continue;
      }

      // Keep all other properties
      sanitized[key] = value;
    }

    return sanitized;
  }
}
