import { usePushQueueStore } from "../store/pushQueueStore";
import type { PushPermissionState, PushQueueStatus } from "../types/push";

export type PushSubscribeResult = {
  status: PushQueueStatus;
  permission: PushPermissionState;
  subscription: PushSubscription | null;
  reason?: string;
};

export interface QueuePushPayload {
  alertId: string;
  title: string;
  body?: string;
  url?: string;
  userId?: string;
}

const FALLBACK_VAPID = "BKxTtVd0ZJ9d9y1DMzWqOw5kh6gcdfe1h7L8xJQ8x0kQnZSWm2LC36JzYAgqjs3OZc2gTThxjeRGna43GgLlJxw";

export class PushClient {
  private getVapidKey(explicit?: string): string | undefined {
    if (explicit !== undefined) return explicit?.trim() ? explicit.trim() : undefined;
    const envKey =
      (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY : undefined) ||
      (typeof process !== "undefined" ? process.env.VITE_VAPID_PUBLIC_KEY : undefined);
    if (envKey?.trim()) return envKey.trim();
    if (typeof process !== "undefined" && process.env.NODE_ENV === "test") return FALLBACK_VAPID;
    return undefined;
  }

  private isPushSupported() {
    return (
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  }

  private getPermission(): PushPermissionState {
    if (typeof Notification === "undefined") return "unsupported";
    return Notification.permission as PushPermissionState;
  }

  async requestPermission(): Promise<PushPermissionState> {
    if (typeof Notification === "undefined") return "unsupported";
    if (Notification.permission === "granted") return "granted";
    try {
      const perm = await Notification.requestPermission();
      return perm as PushPermissionState;
    } catch (err) {
      console.error("push: requestPermission failed", err);
      return "unsupported";
    }
  }

  async ensurePushRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isPushSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.register("/push/sw.js", { scope: "/push/" });
      await navigator.serviceWorker.ready;
      return reg;
    } catch (err) {
      console.warn("push: failed to register service worker", err);
      return null;
    }
  }

  async currentSubscription(): Promise<PushSubscription | null> {
    if (!this.isPushSupported()) return null;
    const reg = await this.ensurePushRegistration();
    if (!reg) return null;
    try {
      return await reg.pushManager.getSubscription();
    } catch (err) {
      console.warn("push: unable to read subscription", err);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    const reg = await this.ensurePushRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return true;
    return sub.unsubscribe();
  }

  async subscribe(vapidKey?: string): Promise<PushSubscribeResult> {
    const permission = await this.requestPermission();
    if (permission === "denied" || permission === "unsupported") {
      return { status: permission === "denied" ? "denied" : "unsupported", permission, subscription: null };
    }

    const resolvedVapid = this.getVapidKey(vapidKey);
    if (!resolvedVapid) {
      return { status: "skipped", permission, subscription: null, reason: "vapid-missing" };
    }

    const reg = await this.ensurePushRegistration();
    if (!reg) return { status: "unsupported", permission, subscription: null, reason: "registration-failed" };

    let appServerKey: BufferSource;
    try {
      appServerKey = urlBase64ToUint8Array(resolvedVapid);
    } catch (err) {
      return { status: "error", permission, subscription: null, reason: "invalid-vapid-key" };
    }

    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      });
      return { status: "queued", permission, subscription };
    } catch (err: any) {
      return { status: "error", permission, subscription: null, reason: err?.message ?? String(err) };
    }
  }

  async queueAlertPush(payload: QueuePushPayload, vapidKey?: string) {
    const store = usePushQueueStore.getState();
    const permission = this.getPermission();

    if (permission === "denied") {
      return store.recordAttempt({
        alertId: payload.alertId,
        title: payload.title,
        status: "denied",
        reason: "permission-denied",
      });
    }

    const existing = await this.currentSubscription();
    const result: PushSubscribeResult = existing
      ? { status: "queued", permission, subscription: existing }
      : await this.subscribe(vapidKey);

    const entry = store.recordAttempt({
      alertId: payload.alertId,
      title: payload.title,
      status: result.status,
      reason: result.reason,
      endpoint: result.subscription?.endpoint ?? existing?.endpoint ?? null,
    });

    if (result.subscription) {
      try {
        const target = new URL("/api/push/subscribe", typeof window !== "undefined" && window.location ? window.location.origin : "http://localhost");
        await fetch(target, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ subscription: result.subscription, userId: payload.userId ?? "anon" }),
        });
      } catch (err) {
        console.warn("push: failed to persist subscription", err);
      }
    }

    return entry;
  }
}

export const pushClient = new PushClient();

export async function ensurePushRegistration() {
  return pushClient.ensurePushRegistration();
}

export async function subscribePush(vapidPublicKeyBase64Url?: string): Promise<PushSubscribeResult> {
  return pushClient.subscribe(vapidPublicKeyBase64Url);
}

export async function unsubscribePush(): Promise<boolean> {
  return pushClient.unsubscribe();
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  return pushClient.currentSubscription();
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
