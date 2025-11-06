/* Minimaler Push-SW mit eigenem Scope (/push/) – kollidiert nicht mit Workbox PWA-SW */
 
self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", () => { self.clients.claim(); });

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data?.json?.() ?? JSON.parse(event.data?.text?.() ?? "{}"); } catch (err) {
    console.error('[SW] Failed to parse push data:', err);
  }
  const title = data.title || "Sparkfined Alert";
  const body  = data.body  || "Signal erhalten.";
  const tag   = data.tag   || "sparkfined";
  const icon  = data.icon  || "/icons/android-chrome-192x192.png";
  const url   = data.url   || "/notifications";
  event.waitUntil(
    self.registration.showNotification(title, {
      body, tag, icon, data: { url }, renotify: true, requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((clis) => {
    const c = clis.find((c) => "focus" in c);
    if (c) { c.navigate(url); return c.focus(); }
    return clients.openWindow(url);
  }));
});
