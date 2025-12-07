import { describe, expect, it, beforeEach } from 'vitest';
import { pushClient } from '../../src/lib/push';
import { usePushQueueStore } from '../../src/store/pushQueueStore';
import { MockPushManager, installServiceWorkerMock, mockNotificationPermission } from '../mocks/push-manager';

const VAPID = 'BKxTtVd0ZJ9d9y1DMzWqOw5kh6gcdfe1h7L8xJQ8x0kQnZSWm2LC36JzYAgqjs3OZc2gTThxjeRGna43GgLlJxw';

describe('push client', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', { value: globalThis, configurable: true });
    Object.defineProperty(globalThis, 'PushManager', { value: function PushManager() {}, configurable: true });
    usePushQueueStore.getState().clear();
  });

  it('queues alert push when permission granted', async () => {
    const pushManager = new MockPushManager();
    installServiceWorkerMock(pushManager);
    mockNotificationPermission('granted');

    const entry = await pushClient.queueAlertPush({
      alertId: 'alert-1',
      title: 'Price crossed',
      body: 'SOL above threshold',
    }, VAPID);

    expect(entry.status).toBe('queued');
    expect(usePushQueueStore.getState().attempts[0]?.status).toBe('queued');
    expect(pushManager.subscribe).toHaveBeenCalled();
  });

  it('skips subscription when vapid key missing', async () => {
    const pushManager = new MockPushManager();
    installServiceWorkerMock(pushManager);
    mockNotificationPermission('granted');

    const entry = await pushClient.queueAlertPush({
      alertId: 'alert-2',
      title: 'Missing VAPID',
    }, '');

    expect(entry.status).toBe('skipped');
    expect(usePushQueueStore.getState().lastReason).toBe('vapid-missing');
    expect(pushManager.subscribe).not.toHaveBeenCalled();
  });

  it('marks denied permission without subscribing', async () => {
    const pushManager = new MockPushManager();
    installServiceWorkerMock(pushManager);
    mockNotificationPermission('denied');

    const entry = await pushClient.queueAlertPush({
      alertId: 'alert-3',
      title: 'Denied',
    }, VAPID);

    expect(entry.status).toBe('denied');
    expect(pushManager.subscribe).not.toHaveBeenCalled();
  });

  it('handles invalid vapid key gracefully', async () => {
    const pushManager = new MockPushManager();
    installServiceWorkerMock(pushManager);
    mockNotificationPermission('granted');

    const entry = await pushClient.queueAlertPush({
      alertId: 'alert-4',
      title: 'Invalid VAPID',
    }, '#$invalid#');

    expect(entry.status).toBe('error');
    expect(entry.reason).toBe('invalid-vapid-key');
    expect(usePushQueueStore.getState().attempts[0]?.reason).toBe('invalid-vapid-key');
  });
});
