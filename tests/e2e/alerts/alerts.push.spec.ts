import { expect, test } from '../fixtures/baseTest';

test.describe('alerts push indicator', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.addInitScript(() => {
      class MockPushManager {
        subscriptions = [] as any[];
        subscribe = async () => {
          const subscription = {
            endpoint: 'https://fcm.googleapis.com/mock-endpoint',
            keys: { p256dh: 'mock-p256dh-key', auth: 'mock-auth-key' },
          } as any;
          this.subscriptions.push(subscription);
          return subscription;
        };
        getSubscription = async () => this.subscriptions[0] || null;
      }
      const registration: any = { pushManager: new MockPushManager() };
      Object.defineProperty(window, 'PushManager', { value: MockPushManager, configurable: true });
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: async () => registration,
          ready: Promise.resolve(registration),
        },
        configurable: true,
      });
      if (!('Notification' in window)) {
        (window as any).Notification = function Notification() {} as any;
      }
      Object.defineProperty(Notification, 'permission', { value: 'granted', configurable: true });
      (Notification as any).requestPermission = () => Promise.resolve('granted');
    });

    await page.goto('/notifications');
  });

  test('@push queues entry when manual trigger is fired', async ({ page }) => {
    await page.getByTestId('subscribe-push-button').click();
    await page.getByTestId('manual-push-trigger').click();

    await expect(page.getByTestId('push-queue-panel')).toBeVisible();
    await expect(page.getByTestId('push-queue-count')).toHaveText('1');
    await expect(page.getByTestId('push-last-status')).toContainText('queued');
  });
});
