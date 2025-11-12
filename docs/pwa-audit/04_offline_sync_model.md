---
title: "Offline & Sync Model"
summary: "Caching, queueing, and background sync mechanisms in the PWA."
sources:
  - src/lib/offline-sync.ts
  - src/lib/db-board.ts
  - src/lib/datastore.ts
  - src/lib/push.ts
  - src/lib/swUpdater.ts
  - public/offline.html
  - public/manifest.webmanifest
  - public/push/sw.js
---

### Storage Layers
- **IndexedDB (Dexie `BoardDatabase`)** — persists chart sessions, alert rules, feed cache, KPI cache for offline dashboards.
- **IndexedDB (Journal Dexie)** — local-first journal entries with sync queue (see `src/lib/journal.ts`).
- **Cache Storage** — managed by service worker build (Vite plugin) for app shell + assets; offline fallback `offline.html` served when navigations fail.
- **localStorage** — feature toggles (theme, onboarding, access status, watchlists), AI token counters.

### Sync Entry Points
1. `syncKPIsToCache` / `syncFeedToCache`
   - Called after successful API fetches to persist arrays into IndexedDB.
   - Applies rolling window cleanup (7-day TTL) on feed cache.
2. `fetchWithSWR`
   - Implements stale-while-revalidate: return cached data, fetch fresh, update cache, emit callback.
3. `useJournal`
   - Creates/updates notes locally, pushes to `/api/journal`, merges responses, keeps offline drafts until ack.
4. `datastore.ts`
   - Wraps `localforage` for generic key-value caching (used by telemetry + onboarding artifacts).
5. `push.ts`
   - Registers scoped service worker for push, ensures subscription ready before returning registration.

### Background Connectivity
```
Service Worker (prod)
  | install -> skipWaiting
  | activate -> clients.claim
  | push -> showNotification(payload)
  | notificationclick -> focus/open client URL
```
- Push payload expectation: JSON with `title`, `body`, `url`, optional `actions`.
- Update banner listens for `waiting` worker and offers reload; `applyUpdate()` posts `SKIP_WAITING` message to activate.

### Offline UX
- `UpdateBanner` prompts manual refresh when new SW available.
- `AppErrorBoundary` allows clearing caches + service worker if fatal error.
- `offline.html` static fallback messaging for navigation when offline.

### Idempotency & Conflict Notes
- Journal `saveServer` merges local draft with server response; lacks conflict resolution (last write wins). Flag for review.
- Analyze exports and rule creation rely on server acceptance; retries not queued.
- Access status cached for 5 min (plus 24h grace) to avoid lock-out when offline.

