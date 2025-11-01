export type PushStatus = "idle" | "subscribed" | "unsubscribed" | "unsupported" | "denied" | "error";

export async function ensurePushRegistration() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  // separater SW mit Scope /push/
  const reg = await navigator.serviceWorker.register("/push/sw.js", { scope: "/push/" });
  await navigator.serviceWorker.ready; // safety
  return reg;
}

export async function subscribePush(vapidPublicKeyBase64Url: string): Promise<PushSubscription | null> {
  if (!("Notification" in window)) return null;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("permission-denied");
  const reg = await ensurePushRegistration();
  if (!reg) throw new Error("unsupported");
  const appServerKey = urlBase64ToUint8Array(vapidPublicKeyBase64Url);
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appServerKey });
  return sub;
}

export async function unsubscribePush(): Promise<boolean> {
  const reg = await ensurePushRegistration();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return true;
  return sub.unsubscribe();
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await ensurePushRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}
