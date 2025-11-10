/**
 * Amplitude Analytics Adapter
 * Server-side implementation using @amplitude/analytics-node
 */

import type { AnalyticsAdapter } from './index';

export class AmplitudeAdapter implements AnalyticsAdapter {
  private client: any = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { init, track, identify } = require('@amplitude/analytics-node');
      const apiKey = process.env.AMPLITUDE_API_KEY;

      if (!apiKey) {
        throw new Error('AMPLITUDE_API_KEY not set');
      }

      init(apiKey, {
        flushIntervalMillis: 10000, // Flush every 10s
        flushQueueSize: 50 // Flush after 50 events
      });

      this.client = { track, identify };
      console.log('[Amplitude] Initialized');
    } catch (error) {
      console.error('[Amplitude] Failed to initialize', error);
      throw error;
    }
  }

  async track(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.client) {
      throw new Error('[Amplitude] Client not initialized');
    }

    // Sanitize properties
    const sanitized = this.sanitizeProperties(properties);

    // Extract user identifier
    const userId = sanitized.user_bucket !== null
      ? `bucket_${sanitized.user_bucket}`
      : 'anonymous';

    try {
      await this.client.track({
        event_type: eventName,
        user_id: userId,
        event_properties: sanitized
      }).promise;
    } catch (error) {
      console.error('[Amplitude] Track failed', error);
      throw error;
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.client) {
      throw new Error('[Amplitude] Client not initialized');
    }

    const sanitized = this.sanitizeProperties(traits || {});

    try {
      await this.client.identify({
        user_id: userId,
        user_properties: sanitized
      }).promise;
    } catch (error) {
      console.error('[Amplitude] Identify failed', error);
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
