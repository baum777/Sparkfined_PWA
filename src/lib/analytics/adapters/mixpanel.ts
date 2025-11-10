/**
 * Mixpanel Analytics Adapter
 * Server-side implementation using mixpanel-node
 */

import type { AnalyticsAdapter } from './index';

export class MixpanelAdapter implements AnalyticsAdapter {
  private client: any = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Lazy load mixpanel to avoid bundling in client
      const Mixpanel = require('mixpanel');
      const token = process.env.MIXPANEL_TOKEN;

      if (!token) {
        throw new Error('MIXPANEL_TOKEN not set');
      }

      this.client = Mixpanel.init(token, {
        protocol: 'https',
        keepAlive: false
      });

      console.log('[Mixpanel] Initialized');
    } catch (error) {
      console.error('[Mixpanel] Failed to initialize', error);
      throw error;
    }
  }

  async track(eventName: string, properties: Record<string, any>): Promise<void> {
    if (!this.client) {
      throw new Error('[Mixpanel] Client not initialized');
    }

    // Sanitize properties (hash PII, remove sensitive data)
    const sanitized = this.sanitizeProperties(properties);

    return new Promise((resolve, reject) => {
      this.client.track(eventName, sanitized, (err: any) => {
        if (err) {
          console.error('[Mixpanel] Track failed', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.client) {
      throw new Error('[Mixpanel] Client not initialized');
    }

    const sanitized = this.sanitizeProperties(traits || {});

    return new Promise((resolve, reject) => {
      this.client.people.set(userId, sanitized, (err: any) => {
        if (err) {
          console.error('[Mixpanel] Identify failed', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Skip sensitive fields
      if (key === 'user_id' || key === 'email' || key === 'ip_address') {
        continue;
      }

      // Convert user_bucket to distinct_id
      if (key === 'user_bucket' && value !== null) {
        sanitized.distinct_id = `bucket_${value}`;
        continue;
      }

      // Keep all other properties
      sanitized[key] = value;
    }

    return sanitized;
  }
}
