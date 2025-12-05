# Push Notifications Testing (PushManager Mocking)

**Priorität**: 🔴 P0 BLOCKER
**Aufwand**: 1 Tag
**Dringlichkeit**: VOR R1 BETA LAUNCH
**Abhängigkeiten**: Alert System

---

## Problem

Push Notifications funktionieren nur **manuell getestet**. Es gibt:
- ❌ Keine PushManager Mocks für Tests
- ❌ Keine Contract Tests für `/api/push/*`
- ❌ Keine VAPID Key Setup Dokumentation
- ❌ Keine E2E Tests für Alert → Push Flow

**Risiken**:
- Push Subscriptions können brechen ohne Tests
- VAPID Key Rotation ungetestet
- iOS/Android Permission Flow nicht validiert

**Betroffene Files**:
- `api/push/subscribe.ts` - VAPID Subscription
- `api/push/send.ts` - Push Notification Versand
- `src/components/alerts/NotificationsPermissionButton.tsx` - Permission UI
- `src/hooks/useAlertRules.ts` - Ungetestet

---

## Push Notification Flow (Aktuell)

### 1. User Permission Request
```typescript
// User klickt "Enable Notifications"
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });

  // Send to backend
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription)
  });
}
```

**UNGETESTET**:
- ❌ Permission denied → Graceful fallback
- ❌ VAPID Key validation
- ❌ Subscription storage in backend

### 2. Alert Trigger → Push
```typescript
// Cron evaluates alert rule
if (price > alertThreshold) {
  await fetch('/api/push/send', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'user-123',
      title: 'SOL Price Alert',
      body: 'SOL reached $100'
    })
  });
}
```

**UNGETESTET**:
- ❌ Push payload validation
- ❌ Delivery confirmation
- ❌ Retry logic on failure

---

## Tasks

### Phase 1: PushManager Mocking (3h)

#### Mock Setup
```typescript
// tests/mocks/push-manager.ts
import { vi } from 'vitest';

export class MockPushManager {
  private subscriptions = new Map();

  async subscribe(options: PushSubscriptionOptions) {
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/mock-endpoint',
      keys: {
        p256dh: 'mock-p256dh-key',
        auth: 'mock-auth-key'
      }
    };

    this.subscriptions.set(options.applicationServerKey, subscription);
    return subscription;
  }

  async getSubscription() {
    return Array.from(this.subscriptions.values())[0] || null;
  }

  async unsubscribe() {
    this.subscriptions.clear();
    return true;
  }
}

// Inject into Service Worker Registration mock
global.registration = {
  pushManager: new MockPushManager()
};
```

#### Test 1: Subscribe Flow
```typescript
it('should subscribe to push notifications', async () => {
  const mockSW = new MockPushManager();
  global.registration = { pushManager: mockSW };

  const subscription = await mockSW.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'test-vapid-key'
  });

  expect(subscription.endpoint).toBeDefined();
  expect(subscription.keys.p256dh).toBeDefined();
  expect(subscription.keys.auth).toBeDefined();
});
```

#### Test 2: Permission Denied
```typescript
it('should handle permission denied gracefully', async () => {
  // Mock Notification API
  global.Notification = {
    requestPermission: vi.fn().mockResolvedValue('denied')
  };

  const result = await requestNotificationPermission();

  expect(result).toBe('denied');
  // Should NOT call subscribe
  expect(mockSW.subscribe).not.toHaveBeenCalled();
});
```

---

### Phase 2: `/api/push/*` Contract Tests (2h)

#### Test 1: Subscribe Endpoint
```typescript
it('POST /api/push/subscribe - should store subscription', async () => {
  const subscription = {
    endpoint: 'https://fcm.googleapis.com/test',
    keys: {
      p256dh: 'test-key',
      auth: 'test-auth'
    }
  };

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'x-user-id': 'user-123' },
    body: JSON.stringify(subscription)
  });

  expect(res.status).toBe(201);

  // Verify stored in DB
  const stored = await db.pushSubscriptions.get('user-123');
  expect(stored.endpoint).toBe(subscription.endpoint);
});
```

#### Test 2: Send Push Notification
```typescript
it('POST /api/push/send - should send push notification', async () => {
  // Seed subscription
  await db.pushSubscriptions.add({
    userId: 'user-123',
    endpoint: 'https://fcm.googleapis.com/mock',
    keys: { p256dh: 'key', auth: 'auth' }
  });

  const payload = {
    userId: 'user-123',
    title: 'Test Alert',
    body: 'SOL price alert triggered',
    icon: '/icon-192x192.png'
  };

  const res = await fetch('/api/push/send', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  expect(res.status).toBe(200);

  // Verify web-push library was called
  expect(webpush.sendNotification).toHaveBeenCalledWith(
    expect.objectContaining({ endpoint: expect.stringContaining('fcm') }),
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon
    })
  );
});
```

#### Test 3: VAPID Key Validation
```typescript
it('should reject invalid VAPID keys', async () => {
  delete process.env.VITE_VAPID_PUBLIC_KEY;

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint: 'test' })
  });

  expect(res.status).toBe(503);
  const data = await res.json();
  expect(data.error).toContain('VAPID keys not configured');
});
```

---

### Phase 3: E2E Alert → Push Flow (2h)

#### E2E Test: Create Alert → Trigger → Push
```typescript
// tests/e2e/alert-push-flow.spec.ts
import { test, expect } from '@playwright/test';

test('should send push notification when alert triggers', async ({ page, context }) => {
  // Grant notification permission
  await context.grantPermissions(['notifications']);

  await page.goto('/alerts-v2');

  // Create alert
  await page.getByTestId('create-alert-button').click();
  await page.getByTestId('alert-symbol-input').fill('SOL');
  await page.getByTestId('alert-condition-select').selectOption('price_above');
  await page.getByTestId('alert-threshold-input').fill('100');

  // Enable push notifications for this alert
  await page.getByTestId('alert-push-toggle').check();

  await page.getByTestId('alert-save-button').click();

  // Wait for alert to be saved
  await expect(page.getByTestId('alert-list-item').first()).toBeVisible();

  // Mock price update that triggers alert
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('price-update', {
      detail: { symbol: 'SOL', price: 101 }
    }));
  });

  // Verify push notification was triggered
  const notifications = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.notification'));
  });

  expect(notifications).toHaveLength(1);
  expect(notifications[0].textContent).toContain('SOL Price Alert');
});
```

---

### Phase 4: VAPID Key Documentation (1h)

#### Create: `docs/setup/vapid-keys.md`
```markdown
# VAPID Key Setup für Push Notifications

## Generation (Einmalig)

```bash
npx web-push generate-vapid-keys
```

Output:
```
Public Key: BKxT...
Private Key: abc123...
```

## Environment Variables

### `.env.local`
```bash
VITE_VAPID_PUBLIC_KEY="BKxT..."  # Public (Frontend)
VAPID_PRIVATE_KEY="abc123..."    # Private (Backend only)
VAPID_SUBJECT="mailto:support@sparkfined.com"
```

### Vercel Deployment
```bash
vercel env add VITE_VAPID_PUBLIC_KEY
vercel env add VAPID_PRIVATE_KEY
vercel env add VAPID_SUBJECT
```

## Testing

### Local Testing
```bash
# Start dev server
pnpm dev

# Open Browser DevTools → Application → Service Workers
# Check "Push Subscription"
```

### Production Testing
1. Deploy to Vercel
2. Install PWA on mobile device
3. Create alert with push enabled
4. Trigger alert condition
5. Verify push notification received
```

---

## Mock Web-Push Library

### `tests/mocks/web-push.ts`
```typescript
import { vi } from 'vitest';

export const webpush = {
  setVapidDetails: vi.fn(),
  sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 }),
  generateVAPIDKeys: vi.fn().mockReturnValue({
    publicKey: 'mock-public-key',
    privateKey: 'mock-private-key'
  })
};

// Mock module
vi.mock('web-push', () => ({ default: webpush }));
```

---

## Acceptance Criteria

✅ PushManager Mock implementiert
✅ `/api/push/subscribe` - Contract Test
✅ `/api/push/send` - Contract Test
✅ VAPID Key Validation Test
✅ E2E Alert → Push Flow Test
✅ VAPID Setup Dokumentation (`docs/setup/vapid-keys.md`)
✅ `pnpm test` - Push Tests grün
✅ Manual Test auf iOS + Android erfolgreich

---

## Validation

```bash
# Run Push Tests
pnpm vitest --run tests/api/push.test.ts

# E2E Test
pnpm test:e2e tests/e2e/alert-push-flow.spec.ts

# Manual Test (Local)
pnpm dev
# → Open http://localhost:5173/alerts-v2
# → Create alert with push enabled
# → Verify notification received
```

---

## Related

- Siehe: `docs/tickets/notifications-center-todo.md` (F-07)
- Abhängig von: Alert System (P1)
- **BLOCKER** für: R1 Beta Launch (Push ist P0 Feature)

---

## iOS/Android Besonderheiten

### iOS
- Benötigt PWA Installation (Add to Home Screen)
- Push nur in Safari (nicht Chrome iOS)
- Permission Prompt erscheint nach User Interaction

### Android
- Push funktioniert in Browser + PWA
- Chrome, Firefox, Edge unterstützt
- Notification Channel konfigurierbar

---

**Owner**: Frontend + Backend Team
**Status**: 🔴 KRITISCH - NICHT GESTARTET
**Deadline**: Woche 2 (Sprint 2)
