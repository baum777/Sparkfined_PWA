/**
 * P0 BLOCKER: Push Notifications Contract Tests
 *
 * Tests for API endpoints:
 * - POST /api/push/subscribe - Store push subscriptions
 * - POST /api/push/unsubscribe - Remove push subscriptions
 * - POST /api/push/test-send - Send test notifications
 *
 * Validates:
 * - Subscription lifecycle (subscribe/unsubscribe)
 * - Push notification delivery
 * - VAPID key validation
 * - Authorization and error handling
 *
 * NOTE: This tests subscription storage and validation.
 * E2E tests for actual push delivery are handled separately.
 */

// Set env vars FIRST (before ANY imports) - needed for VAPID initialization in test-send.ts
process.env.VAPID_PUBLIC_KEY = 'test-public-key';
process.env.VAPID_PRIVATE_KEY = 'test-private-key';
process.env.VAPID_CONTACT = 'mailto:test@example.com';
process.env.NODE_ENV = 'test';
process.env.ALERTS_ADMIN_SECRET = 'test-admin-secret';

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock @vercel/kv (must be before imports)
vi.mock('../../src/lib/kv', () => ({
  kvSet: vi.fn().mockResolvedValue(undefined),
  kvGet: vi.fn(),
  kvDel: vi.fn().mockResolvedValue(1),
  kvSAdd: vi.fn().mockResolvedValue(undefined),
  kvSMembers: vi.fn(),
}));

// Mock sha256Url
vi.mock('../../src/lib/sha', () => ({
  sha256Url: vi.fn().mockImplementation(async (url: string) => {
    // Generate consistent hash from URL
    return url.split('/').pop() || 'mock-hash-123';
  }),
}));

// Mock web-push library
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 }),
  },
}));

import subscribeHandler from '../../api/push/subscribe';
import unsubscribeHandler from '../../api/push/unsubscribe';
import testSendHandler from '../../api/push/test-send';
import { kvSet, kvDel, kvSAdd } from '../../src/lib/kv';
import { sha256Url } from '../../src/lib/sha';
import webpush from 'web-push';

// Helper: Create mock PushSubscription
function createMockSubscription(endpoint?: string) {
  return {
    endpoint: endpoint || 'https://fcm.googleapis.com/fcm/send/mock-endpoint-123',
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=',
      auth: 'tBHItJI5svbpez7KI4CCXg==',
    },
  };
}

// Helper: Create mock Request for subscribe/unsubscribe
function createRequest(body: any, userId?: string): Request {
  return new Request('https://example.com/api/push/subscribe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      ...body,
      userId: userId || body.userId,
    }),
  });
}

// Helper: Create mock Vercel Request for test-send
function createVercelRequest(body: any, authToken?: string): any {
  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': authToken ? `Bearer ${authToken}` : undefined,
    },
    body,
  };
}

// Helper: Create mock Vercel Response
function createVercelResponse(): any {
  const res: any = {
    statusCode: 200,
    body: null,
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      this.body = data;
      return this;
    },
  };
  return res;
}

describe('Push Notifications API - Contract Tests', () => {
  // Save original env vars
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars
    process.env.NODE_ENV = 'test';
    process.env.VAPID_PUBLIC_KEY = 'test-public-key';
    process.env.VAPID_PRIVATE_KEY = 'test-private-key';
    process.env.VAPID_CONTACT = 'mailto:test@example.com';
    process.env.ALERTS_ADMIN_SECRET = 'test-admin-secret';
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe('POST /api/push/subscribe - Subscription Storage', () => {
    it('should store valid push subscription', async () => {
      const subscription = createMockSubscription();
      const req = createRequest({ subscription }, 'user-123');

      const res = await subscribeHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.id).toBeDefined();

      // Verify kvSet was called with subscription data
      expect(kvSet).toHaveBeenCalledWith(
        expect.stringContaining('push:sub:'),
        expect.objectContaining({
          userId: 'user-123',
          subscription: expect.objectContaining({
            endpoint: subscription.endpoint,
          }),
        })
      );

      // Verify added to user's subscription set
      expect(kvSAdd).toHaveBeenCalledWith(
        'push:subs:byUser:user-123',
        expect.any(String)
      );
    });

    it('should default to "anon" user if no userId provided', async () => {
      const subscription = createMockSubscription();
      const req = createRequest({ subscription });

      const res = await subscribeHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);

      // Should use "anon" as default userId
      expect(kvSet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: 'anon',
        })
      );

      expect(kvSAdd).toHaveBeenCalledWith(
        'push:subs:byUser:anon',
        expect.any(String)
      );
    });

    it('should generate consistent ID from endpoint hash', async () => {
      const endpoint = 'https://fcm.googleapis.com/fcm/send/consistent-endpoint';
      const subscription = createMockSubscription(endpoint);

      // Subscribe twice with same endpoint
      const req1 = createRequest({ subscription }, 'user-123');
      const res1 = await subscribeHandler(req1);
      const data1 = await res1.json();

      const req2 = createRequest({ subscription }, 'user-123');
      const res2 = await subscribeHandler(req2);
      const data2 = await res2.json();

      // Should generate same ID for same endpoint
      expect(data1.id).toBe(data2.id);
    });

    it('should return 400 if subscription is missing', async () => {
      const req = createRequest({}, 'user-123');

      const res = await subscribeHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('subscription required');
    });

    it('should return 400 if subscription.endpoint is missing', async () => {
      const invalidSubscription = {
        keys: {
          p256dh: 'key',
          auth: 'auth',
        },
        // Missing endpoint
      };

      const req = createRequest({ subscription: invalidSubscription }, 'user-123');

      const res = await subscribeHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('subscription required');
    });

    it('should return 405 for non-POST requests', async () => {
      const req = new Request('https://example.com/api/push/subscribe', {
        method: 'GET',
      });

      const res = await subscribeHandler(req);

      expect(res.status).toBe(405);
      expect(await res.text()).toBe('POST only');
    });

    it('should handle KV errors gracefully', async () => {
      vi.mocked(kvSet).mockRejectedValue(new Error('KV connection failed'));

      const subscription = createMockSubscription();
      const req = createRequest({ subscription }, 'user-123');

      const res = await subscribeHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200); // Errors returned as 200 with ok:false
      expect(data.ok).toBe(false);
      expect(data.error).toContain('KV connection failed');
    });
  });

  describe('POST /api/push/unsubscribe - Subscription Removal', () => {
    it('should remove subscription by endpoint', async () => {
      const endpoint = 'https://fcm.googleapis.com/fcm/send/to-remove';

      vi.mocked(kvDel).mockResolvedValue(1); // 1 key deleted

      const req = new Request('https://example.com/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ endpoint }),
      });

      const res = await unsubscribeHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.removed).toBe(1);

      // Verify kvDel was called with hashed endpoint
      expect(kvDel).toHaveBeenCalledWith(expect.stringContaining('push:sub:'));
    });

    it('should return 400 if endpoint is missing', async () => {
      const req = new Request('https://example.com/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const res = await unsubscribeHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('endpoint required');
    });

    it('should return 405 for non-POST requests', async () => {
      const req = new Request('https://example.com/api/push/unsubscribe', {
        method: 'DELETE',
      });

      const res = await unsubscribeHandler(req);

      expect(res.status).toBe(405);
      expect(await res.text()).toBe('POST only');
    });

    it('should handle KV errors gracefully', async () => {
      vi.mocked(kvDel).mockRejectedValue(new Error('KV delete failed'));

      const req = new Request('https://example.com/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ endpoint: 'https://fcm.googleapis.com/test' }),
      });

      const res = await unsubscribeHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('KV delete failed');
    });
  });

  describe('POST /api/push/test-send - Notification Delivery', () => {
    it('should send test push notification with valid auth', async () => {
      const subscription = createMockSubscription();

      const req = createVercelRequest(
        { subscription },
        'test-admin-secret'
      );
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);

      // Verify webpush.sendNotification was called
      expect(webpush.sendNotification).toHaveBeenCalledWith(
        subscription,
        expect.stringContaining('Sparkfined')
      );
    });

    it('should send custom payload if provided', async () => {
      const subscription = createMockSubscription();
      const customPayload = {
        title: 'SOL Price Alert',
        body: 'SOL reached $100',
        url: '/alerts-v2',
        tag: 'price-alert',
      };

      const req = createVercelRequest(
        { subscription, payload: customPayload },
        'test-admin-secret'
      );
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);

      // Verify custom payload was sent
      const callArgs = vi.mocked(webpush.sendNotification).mock.calls[0];
      const sentPayload = JSON.parse(callArgs![1] as string);
      expect(sentPayload.title).toBe('SOL Price Alert');
      expect(sentPayload.body).toBe('SOL reached $100');
    });

    it('should send default payload if none provided', async () => {
      const subscription = createMockSubscription();

      const req = createVercelRequest(
        { subscription },
        'test-admin-secret'
      );
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(200);

      // Verify default payload was sent
      const callArgs = vi.mocked(webpush.sendNotification).mock.calls[0];
      const sentPayload = JSON.parse(callArgs![1] as string);
      expect(sentPayload.title).toContain('Sparkfined');
      expect(sentPayload.body).toContain('Web-Push aktiv');
    });

    it('should return 500 if VAPID keys are missing', async () => {
      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;

      const subscription = createMockSubscription();

      const req = createVercelRequest(
        { subscription },
        'test-admin-secret'
      );
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('VAPID keys missing');
    });

    it('should return 400 if subscription is missing', async () => {
      const req = createVercelRequest(
        {},
        'test-admin-secret'
      );
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('subscription required');
    });

    it('should return 401 if Authorization header is missing', async () => {
      const subscription = createMockSubscription();

      const req = createVercelRequest({ subscription }); // No auth token
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('unauthorized');
    });

    it('should return 401 if Authorization format is invalid', async () => {
      const subscription = createMockSubscription();

      const req = {
        method: 'POST',
        headers: {
          'authorization': 'InvalidFormat test-admin-secret', // Not "Bearer"
        },
        body: { subscription },
      } as any;
      const res = createVercelResponse();

      await testSendHandler(req, res as any);

      expect(res.statusCode).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('unauthorized');
    });

    it('should return 403 if Authorization token is wrong', async () => {
      const subscription = createMockSubscription();

      const req = createVercelRequest(
        { subscription },
        'wrong-secret'
      );
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('unauthorized');
    });

    it('should return 503 if ALERTS_ADMIN_SECRET is missing in production', async () => {
      delete process.env.ALERTS_ADMIN_SECRET;
      process.env.NODE_ENV = 'production';

      const subscription = createMockSubscription();

      const req = createVercelRequest({ subscription });
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(503);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('push test disabled');
    });

    it('should allow request without auth in non-production', async () => {
      delete process.env.ALERTS_ADMIN_SECRET;
      process.env.NODE_ENV = 'development';

      const subscription = createMockSubscription();

      const req = createVercelRequest({ subscription });
      const res = createVercelResponse();

      await testSendHandler(req, res);

      // Should succeed in non-production even without auth
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('should return 405 for non-POST requests', async () => {
      const req = {
        method: 'GET',
        headers: {},
        body: {},
      } as any;
      const res = createVercelResponse();

      await testSendHandler(req, res as any);

      expect(res.statusCode).toBe(405);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe('POST only');
    });

    it('should handle webpush sendNotification errors gracefully', async () => {
      vi.mocked(webpush.sendNotification).mockRejectedValue(
        new Error('Push service unavailable')
      );

      const subscription = createMockSubscription();

      const req = createVercelRequest(
        { subscription },
        'test-admin-secret'
      );
      const res = createVercelResponse();

      await testSendHandler(req, res);

      expect(res.statusCode).toBe(200); // Errors returned as 200 with ok:false
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('Push service unavailable');
    });
  });

  describe('Subscription Lifecycle Integration', () => {
    it('should handle full subscribe → unsubscribe lifecycle', async () => {
      const subscription = createMockSubscription();

      // Step 1: Subscribe
      const subscribeReq = createRequest({ subscription }, 'user-123');
      const subscribeRes = await subscribeHandler(subscribeReq);
      const subscribeData = await subscribeRes.json();

      expect(subscribeData.ok).toBe(true);
      expect(subscribeData.id).toBeDefined();

      const subscriptionId = subscribeData.id;

      // Step 2: Unsubscribe
      vi.mocked(kvDel).mockResolvedValue(1);

      const unsubscribeReq = new Request('https://example.com/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      const unsubscribeRes = await unsubscribeHandler(unsubscribeReq);
      const unsubscribeData = await unsubscribeRes.json();

      expect(unsubscribeData.ok).toBe(true);
      expect(unsubscribeData.removed).toBe(1);

      // Verify kvDel was called with correct key
      expect(kvDel).toHaveBeenCalledWith(`push:sub:${subscriptionId}`);
    });

    it('should handle multiple subscriptions for same user', async () => {
      const subscription1 = createMockSubscription('https://fcm.googleapis.com/endpoint-1');
      const subscription2 = createMockSubscription('https://fcm.googleapis.com/endpoint-2');

      // Subscribe with first device
      const req1 = createRequest({ subscription: subscription1 }, 'user-123');
      const res1 = await subscribeHandler(req1);
      const data1 = await res1.json();

      expect(data1.ok).toBe(true);

      // Subscribe with second device
      const req2 = createRequest({ subscription: subscription2 }, 'user-123');
      const res2 = await subscribeHandler(req2);
      const data2 = await res2.json();

      expect(data2.ok).toBe(true);

      // Both should be added to same user's subscription set
      expect(kvSAdd).toHaveBeenCalledWith(
        'push:subs:byUser:user-123',
        expect.any(String)
      );
      expect(kvSAdd).toHaveBeenCalledTimes(2);

      // IDs should be different
      expect(data1.id).not.toBe(data2.id);
    });
  });
});
