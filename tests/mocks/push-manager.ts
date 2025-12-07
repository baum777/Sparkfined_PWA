import { vi } from 'vitest';

export class MockPushManager {
  subscriptions: any[] = [];

  subscribe = vi.fn(async () => {
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/mock-endpoint',
      keys: { p256dh: 'mock-p256dh-key', auth: 'mock-auth-key' },
    } as any;
    this.subscriptions.push(subscription);
    return subscription;
  });

  getSubscription = vi.fn(async () => {
    return this.subscriptions[0] || null;
  });

  unsubscribe = vi.fn(async () => {
    this.subscriptions = [];
    return true as const;
  });
}

export function installServiceWorkerMock(pushManager: MockPushManager) {
  const registration: any = { pushManager };
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      serviceWorker: {
        register: vi.fn(async () => registration),
        ready: Promise.resolve(registration),
      },
    },
    writable: true,
    configurable: true,
  });
}

export function mockNotificationPermission(permission: NotificationPermission) {
  const NotificationMock: any = function Notification() {};
  NotificationMock.permission = permission;
  NotificationMock.requestPermission = vi.fn(async () => permission);
  Object.defineProperty(globalThis, 'Notification', { value: NotificationMock, configurable: true });
}
