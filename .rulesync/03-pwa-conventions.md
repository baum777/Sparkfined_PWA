---
mode: SYSTEM
id: "03-pwa-conventions"
priority: 2
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode"]
globs: ["vite.config.ts", "src/main.tsx", "public/**/*", "src/lib/sw*.ts", "src/lib/offline-sync.ts"]
description: "PWA conventions: Service Worker, caching strategies, offline-first patterns, and update flow for Sparkfined"
---

# 03 – PWA Conventions

## 1. PWA Goals

Sparkfined ist **PWA-First**, nicht PWA-optional. Das bedeutet:

* **Installierbarkeit:** App muss vom Browser als installierbar erkannt werden
* **Offline-Funktionalität:** Kern-Features (Journal, Board, Charts) funktionieren ohne Internet
* **Update-Transparenz:** User sieht neue Versionen und kann Update triggern (kein erzwungener Reload)
* **Performance:** Precaching reduziert Load-Time auf <2s bei Repeat-Visits
* **Native-ähnliche UX:** Add-to-Homescreen, Fullscreen-Mode, Push-Notifications

### Offline-Szenarien (Priorität)

**MUST-Offline (Kern-Features):**
- ✅ Journal (Lesen, Schreiben, Tags-Filter)
- ✅ Board/Dashboard (KPI-Tiles, Feed mit gecachten Daten)
- ✅ Charts (Letzte gecachte OHLC-Daten)
- ✅ Watchlist (Lokal persistiert)

**SHOULD-Offline (Mit degraded UX):**
- ⚠️ Analyze-Page (Zeigt Cached-Token-Daten, kein Fresh-Fetch)
- ⚠️ Settings (Lokale Änderungen, Sync beim Reconnect)

**CAN-Offline (Fallback-Message):**
- ❌ Signals/Alerts (Benötigt Server-Evaluation)
- ❌ Access-Page (On-Chain-Check unmöglich)
- ❌ AI-Features (OpenAI/Grok erfordern Netzwerk)

---

## 2. Service Worker (vite-plugin-pwa + Workbox)

### Setup (vite.config.ts)

**Sparkfined nutzt `vite-plugin-pwa` mit Workbox für automatisches SW-Management:**

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico', 
        'apple-touch-icon.png', 
        'icons/*', 
        'offline.html'
      ],
      
      strategies: 'generateSW',  // Workbox generiert SW automatisch
      
      workbox: {
        cleanupOutdatedCaches: true,  // Alte Caches löschen
        skipWaiting: true,             // Neuer SW aktiviert sofort
        clientsClaim: true,            // SW übernimmt sofort alle Tabs
        
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2}'
        ],
        
        navigateFallback: '/index.html',  // SPA-Routing offline
        navigateFallbackDenylist: [/^\/api/, /^\/_next/],
        
        // Asset-Hashing für Versionierung
        dontCacheBustURLsMatching: /^\/assets\/.*-[a-zA-Z0-9]{8}\.(js|css)$/,
        
        runtimeCaching: [
          // Siehe "Caching-Strategien" unten
        ]
      }
    })
  ]
});
```

### SW-Lifecycle (src/main.tsx)

**[MUST]** Registriere SW nur in Production, nicht im Dev-Mode

```tsx
// src/main.tsx
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Listen for SW messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'CACHE_UPDATED') {
      console.log('📦 Cache updated:', event.data.url);
    }
  });

  // Reload bei neuem SW (controllerchange)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    console.log('[PWA] New SW active → reload');
    refreshing = true;
    setTimeout(() => location.reload(), 250);
  });

  // SW-Ready-Event für Debugging
  navigator.serviceWorker.ready
    .then((registration) => {
      console.log('[PWA] SW ready:', {
        scope: registration.scope,
        active: !!registration.active,
        waiting: !!registration.waiting,
      });
    })
    .catch((error) => {
      console.error('[PWA] SW registration failed:', error);
    });
}
```

**[SHOULD]** Zeige Update-Banner bei verfügbarem SW-Update

```tsx
// src/components/UpdateBanner.tsx
export function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setShowUpdate(true);
      }
    });
  }, []);

  const handleUpdate = () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center z-50">
      New version available!
      <button onClick={handleUpdate} className="ml-2 underline">
        Update Now
      </button>
    </div>
  );
}
```

---

## 3. Caching-Strategien

Sparkfined nutzt **3 Haupt-Strategien** je nach Asset-Typ:

### Cache-First (Static Assets)

**Für:** JS, CSS, Fonts, Icons (versioniert via Hash)

```ts
// Automatisch via vite-plugin-pwa precache
// Keine manuelle Config nötig, Workbox handhabt es
```

**Verhalten:**
1. SW checkt Cache zuerst
2. Falls Hit → sofort zurückgeben
3. Falls Miss → Network-Fetch → Cache-Update

**Use Case:** Maximale Performance für unveränderliche Assets

### Network-First (API-Calls)

**Für:** Token-Daten, OHLC, Moralis/DexPaprika-APIs

```ts
// vite.config.ts → workbox.runtimeCaching
{
  urlPattern: /^\/api\/(moralis|dexpaprika|data)\/.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'token-api-cache',
    networkTimeoutSeconds: 3,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 300,  // 5 Minuten
    },
    cacheableResponse: {
      statuses: [0, 200],
    },
  },
}
```

**Verhalten:**
1. Network-Request mit 3s Timeout
2. Falls Erfolg → Cache-Update + Rückgabe
3. Falls Timeout/Error → Fallback zu Cache (wenn vorhanden)

**Use Case:** Fresh-Data bevorzugt, Offline-Fallback als Safety-Net

### Stale-While-Revalidate (Board-API)

**Für:** KPIs, Feed, Dashboard-Daten (Freshness nicht kritisch)

```ts
// vite.config.ts → workbox.runtimeCaching
{
  urlPattern: /^\/api\/board\/(kpis|feed)/,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'board-api-cache',
    expiration: {
      maxEntries: 20,
      maxAgeSeconds: 60,  // 1 Minute
    },
    cacheableResponse: {
      statuses: [0, 200],
    },
    backgroundSync: {
      name: 'board-api-sync',
      options: {
        maxRetentionTime: 24 * 60,  // 24h Retry
      },
    },
  },
}
```

**Verhalten:**
1. Cache-Hit → sofort zurückgeben
2. Parallel: Network-Request im Background
3. Bei Network-Success → Cache-Update (für nächsten Request)

**Use Case:** Schnelle Perceived-Performance, Background-Refresh

---

## 4. Asset & Cache Conventions

### Precache-Manifest

**[MUST]** Alle kritischen Assets müssen precached werden

**Automatisch precached via `vite-plugin-pwa`:**
- `/index.html`
- `/assets/*.js` (Main-Bundle, Vendor-Chunks)
- `/assets/*.css` (Compiled Tailwind)
- `/icons/*.png` (14 Icons, 32px-1024px)
- `/offline.html` (Fallback-Page)

**Total Precache-Size:** ~428KB gzipped (66 Entries)

**[SHOULD]** Halte Precache unter 500KB (Performance-Budget)

### Cache-Invalidation

**Automatische Invalidation:**
- Workbox invalidiert automatisch bei neuer SW-Version (neue `revision` im Manifest)
- Asset-Hashes im Filename sorgen für Cache-Busting (`main-a3f4b8c9.js`)

**Manuelle Invalidation (bei Breaking-Changes):**

```ts
// src/lib/offline-sync.ts
export async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('[Cache] All caches cleared');
  }
}

// Usage in Settings-Page
<button onClick={clearAllCaches}>Clear Offline Cache</button>
```

### Offline-Fallback-Page

**[MUST]** Nutze custom Offline-Page statt Browser-Default

```html
<!-- public/offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sparkfined - Offline</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔌 You're Offline</h1>
    <p>Some features require an internet connection.</p>
    <p>Your journal and saved data are still available!</p>
    <button onclick="location.reload()" 
            style="margin-top: 1rem; padding: 0.5rem 1rem; 
                   background: white; color: #667eea; 
                   border: none; border-radius: 4px; cursor: pointer;">
      Retry Connection
    </button>
  </div>
</body>
</html>
```

---

## 5. Offline-Sync-Patterns

### IndexedDB via Dexie

**[MUST]** Nutze Dexie für strukturierte Offline-Daten

```tsx
// src/lib/db-board.ts
import Dexie, { Table } from 'dexie';

interface KPICache {
  id: string;
  data: KPIData;
  timestamp: number;
}

class BoardDatabase extends Dexie {
  kpiCache!: Table<KPICache>;
  feedCache!: Table<FeedItem>;

  constructor() {
    super('BoardDatabase');
    this.version(1).stores({
      kpiCache: 'id, timestamp',
      feedCache: 'id, timestamp',
    });
  }
}

export const db = new BoardDatabase();
```

**Usage:**

```tsx
// src/hooks/useBoardKPIs.ts
export function useBoardKPIs() {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const loadKPIs = async () => {
      if (isOnline) {
        // Network-First
        const result = await fetchKPIs();
        if (result.success) {
          await db.kpiCache.put({ 
            id: 'latest', 
            data: result.data, 
            timestamp: Date.now() 
          });
          setKpis(result.data);
        }
      } else {
        // Offline: Load from IndexedDB
        const cached = await db.kpiCache.get('latest');
        if (cached) {
          setKpis(cached.data);
        }
      }
    };

    loadKPIs();

    // Online/Offline-Listener
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, [isOnline]);

  return { kpis, isOnline };
}
```

### Background-Sync (Geplant)

**[FUTURE]** Nutze Background-Sync für verzögerte Writes

```tsx
// Geplant für Q1 2025: Offline Journal-Writes mit Background-Sync
if ('serviceWorker' in navigator && 'sync' in registration) {
  // Register sync event
  await registration.sync.register('journal-sync');
  
  // SW handhabt Sync-Event
  self.addEventListener('sync', (event) => {
    if (event.tag === 'journal-sync') {
      event.waitUntil(syncJournalEntries());
    }
  });
}
```

---

## 6. Debugging & Local Dev

### SW zurücksetzen (DevTools)

**Schritte bei SW-Problemen:**

1. **Chrome DevTools → Application → Service Workers**
   - Click "Unregister" bei aktuellem SW
   - Reload-Page

2. **Chrome DevTools → Application → Storage**
   - Click "Clear site data"
   - Reload-Page

3. **Programmatisch:**
   ```tsx
   // src/lib/swUpdater.ts
   export async function unregisterServiceWorker() {
     const registrations = await navigator.serviceWorker.getRegistrations();
     for (const registration of registrations) {
       await registration.unregister();
     }
     console.log('[SW] All service workers unregistered');
   }
   ```

### Häufige Fehler & Workarounds

**Problem 1: SW cacht alte Version, Update wird nicht erkannt**

```tsx
// Solution: Force-Skip-Waiting
navigator.serviceWorker.ready.then((registration) => {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    // SW wird sofort aktiviert, Reload nötig
    window.location.reload();
  }
});
```

**Problem 2: Offline-Page wird nicht angezeigt**

```tsx
// Check: navigateFallback darf nicht /offline.html sein
// Correct (vite.config.ts):
workbox: {
  navigateFallback: '/index.html',  // ✅ SPA-Shell
  // offline.html wird via runtimeCaching gehandhabt
}
```

**Problem 3: API-Cache ist stale**

```tsx
// Solution: Clear specific cache
async function clearApiCache() {
  const cache = await caches.open('token-api-cache');
  await cache.delete('/api/data/ohlc?address=...');
  console.log('[Cache] API cache cleared');
}
```

### Dev-Mode: SW deaktiviert

**[MUST]** Deaktiviere SW im Dev-Mode (Debugging)

```ts
// vite.config.ts
VitePWA({
  devOptions: {
    enabled: false,  // ✅ Kein SW in Dev-Mode
  }
})
```

**Rationale:** SW-Caching erschwert Hot-Module-Replacement (HMR) und Debugging.

---

## 7. Manifest & Icons

### manifest.webmanifest

**[MUST]** Nutze separate Manifest-Datei (nicht inline)

```json
// public/manifest.webmanifest
{
  "name": "Sparkfined - Trading Command Center",
  "short_name": "Sparkfined",
  "description": "Crypto trading journal, charts, and alerts",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#667eea",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-1024.png", "sizes": "1024x1024", "type": "image/png" }
  ]
}
```

**Link im HTML:**

```html
<!-- index.html -->
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="theme-color" content="#667eea">
```

### Icon-Anforderungen

**[MUST]** Bereitstellung aller Required-Sizes:

- **32x32** – Browser-Favicon
- **72x72** – Android-Homescreen (low-dpi)
- **192x192** – Android-Homescreen (standard)
- **512x512** – Android-Splashscreen
- **1024x1024** – iOS-Homescreen (high-dpi)

**[SHOULD]** Nutze maskable-Icons für adaptive Shapes

```json
{
  "icons": [
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## 8. Examples

### ✅ Good – Complete Offline-Hook

```tsx
// src/hooks/useOfflineSync.ts
import { useState, useEffect } from 'react';
import { db } from '@/lib/db-board';
import type { KPIData } from '@/types';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      console.log('[Offline-Sync] Back online, syncing...');
      
      // Sync pending writes
      const pendingEntries = await db.pendingWrites.toArray();
      for (const entry of pendingEntries) {
        try {
          await fetch('/api/journal', {
            method: 'POST',
            body: JSON.stringify(entry),
          });
          await db.pendingWrites.delete(entry.id);
        } catch (error) {
          console.error('[Offline-Sync] Sync failed:', error);
        }
      }
      
      setLastSyncTime(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[Offline-Sync] Now offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastSyncTime };
}
```

### ❌ Avoid – Anti-Patterns

```tsx
// ❌ Bad: Keine Offline-Fallback-Logik
async function fetchKPIs() {
  const response = await fetch('/api/board/kpis');
  return response.json();  // Fails silently offline!
}

// ❌ Bad: SW-Update ohne User-Benachrichtigung
navigator.serviceWorker.ready.then((registration) => {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    location.reload();  // Erzwungener Reload ohne User-Consent!
  }
});

// ❌ Bad: Cache-Clear ohne Bestätigung
<button onClick={() => caches.delete('token-api-cache')}>
  Clear Cache
</button>
// Keine Warnung, User verliert alle Offline-Daten!

// ❌ Bad: Precache-Bloat
includeAssets: ['**/*']  // Cacht ALLE Files (Bilder, Videos, etc.)
```

---

## Related

- `00-project-core.md` – PWA-First-Vision & Offline-Szenarien
- `02-frontend-arch.md` – State-Management für Offline-Sync
- `05-api-integration.md` – API-Adapter mit Offline-Fallbacks
- `08-performance.md` – Bundle-Budgets & Precache-Limits
- `src/main.tsx` – SW-Registrierung & Lifecycle-Events
- `vite.config.ts` – Workbox-Config & Caching-Strategien

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 2 (vite-plugin-pwa + Workbox strategies)
