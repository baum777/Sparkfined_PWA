# PWA Load-Failure Audit Report
**Datum:** 2025-01-XX  
**Problem:** Schwarzer Bildschirm ohne Styles nach Build/Deploy auf Vercel  
**Betroffene URLs:** `/journal`, `/analyze`, etc. (SPA-Routes)

---

## 🔍 Root Cause Analysis

### 1. Service Worker Cache-Invalidierung
**Problem:** Service Worker cached alte Asset-Versionen nach neuem Deploy.

**Symptome:**
- CSS/JS-Dateien werden nicht geladen (404/403)
- Alte SW-Version cached neue Asset-Hashes nicht
- Browser lädt gecachte, aber nicht mehr existierende Assets

**Fix:**
- ✅ `skipWaiting: true` bereits gesetzt
- ✅ `clientsClaim: true` bereits gesetzt
- ✅ `cleanupOutdatedCaches: true` bereits gesetzt
- ⚠️ **FEHLT:** Explizite Cache-Versionierung im SW
- ⚠️ **FEHLT:** SW-Update-Strategie für Production

### 2. Vercel Asset-Serving
**Problem:** Vercel könnte Assets mit falschen MIME-Types oder Headers ausliefern.

**Symptome:**
- CSS-Dateien werden als `text/html` statt `text/css` ausgeliefert
- Browser blockiert Styles wegen falschem Content-Type

**Fix:**
- ✅ `vercel.json` hat bereits Asset-Headers
- ⚠️ **FEHLT:** Explizite MIME-Type-Header für CSS/JS

### 3. SPA-Rewrite-Konflikte
**Problem:** Vercel-Rewrites könnten Asset-Requests abfangen.

**Symptome:**
- `/assets/*.css` wird zu `/index.html` umgeschrieben
- Assets werden als HTML ausgeliefert

**Fix:**
- ✅ Rewrite-Regel ist korrekt (`/(.*)` → `/index.html`)
- ⚠️ **FEHLT:** Explizite Ausnahme für `/assets/*`

### 4. CSS-Import-Probleme
**Problem:** CSS-Dateien werden nicht korrekt in den Build eingebunden.

**Status:**
- ✅ CSS-Imports in `main.tsx` vorhanden
- ✅ Tailwind-Konfiguration korrekt
- ✅ PostCSS-Konfiguration korrekt
- ✅ Build generiert CSS-Dateien korrekt

---

## 🛠️ Fix-Plan (Priorisiert)

### PRIORITÄT 1: Service Worker Cache-Versionierung
**Problem:** SW cached alte Assets nach neuem Deploy.

**Fix:**
1. SW-Version explizit in `vite.config.ts` setzen
2. Cache-Busting für SW selbst implementieren
3. Update-Strategie für Production optimieren

### PRIORITÄT 2: Vercel Asset-Headers
**Problem:** CSS/JS könnten falsche MIME-Types haben.

**Fix:**
1. Explizite MIME-Type-Header in `vercel.json` für `/assets/*`
2. Cache-Control-Header für Assets optimieren

### PRIORITÄT 3: SPA-Rewrite-Ausnahmen
**Problem:** Asset-Requests könnten zu `/index.html` umgeschrieben werden.

**Fix:**
1. Explizite Ausnahme für `/assets/*` in `vercel.json`
2. Ausnahme für statische Dateien (`/icons/*`, `/manifest.webmanifest`, etc.)

### PRIORITÄT 4: SW-Update-Handling
**Problem:** SW-Updates werden nicht zuverlässig aktiviert.

**Fix:**
1. `registerSW.js` erweitern mit Update-Check
2. Automatisches Reload bei SW-Update (bereits vorhanden in `main.tsx`)

---

## ✅ Implementierte Fixes

### 1. Vercel Asset-Rewrite-Ausnahmen (`vercel.json`)
**Problem:** Asset-Requests (`/assets/*`, `/sw.js`, etc.) wurden zu `/index.html` umgeschrieben.

**Fix:**
- Explizite Rewrite-Regeln für Assets VOR der Catch-All-Regel
- Assets werden jetzt direkt ausgeliefert, nicht über SPA-Rewrite

**Code:**
```json
{
  "rewrites": [
    { "source": "/assets/(.*)", "destination": "/assets/$1" },
    { "source": "/icons/(.*)", "destination": "/icons/$1" },
    { "source": "/manifest.webmanifest", "destination": "/manifest.webmanifest" },
    { "source": "/sw.js", "destination": "/sw.js" },
    { "source": "/registerSW.js", "destination": "/registerSW.js" },
    { "source": "/workbox-(.*)", "destination": "/workbox-$1" },
    { "source": "/(.*)", "destination": "/index.html" }  // Catch-all LAST
  ]
}
```

### 2. Explizite MIME-Type-Header (`vercel.json`)
**Problem:** CSS/JS könnten mit falschem Content-Type ausgeliefert werden (z.B. `text/html` statt `text/css`).

**Fix:**
- Explizite `Content-Type`-Header für CSS (`text/css; charset=utf-8`)
- Explizite `Content-Type`-Header für JS (`application/javascript; charset=utf-8`)
- Explizite `Content-Type`-Header für Manifest (`application/manifest+json; charset=utf-8`)

**Code:**
```json
{
  "headers": [
    {
      "source": "/assets/(.*\\.css)",
      "headers": [
        { "key": "Content-Type", "value": "text/css; charset=utf-8" },
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/assets/(.*\\.js)",
      "headers": [
        { "key": "Content-Type", "value": "application/javascript; charset=utf-8" },
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 3. Service Worker Cache-Strategie (`vite.config.ts`)
**Problem:** SW könnte Assets mit falscher Cache-Strategie behandeln.

**Fix:**
- Explizite `strategies: 'generateSW'` (bereits Standard, aber explizit gesetzt)
- `dontCacheBustURLsMatching` für gehashte Assets (Vite generiert bereits Hashes)
- Bestehende `skipWaiting`/`clientsClaim` bleiben aktiv

**Code:**
```typescript
VitePWA({
  strategies: 'generateSW',
  workbox: {
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    dontCacheBustURLsMatching: /^\/assets\/.*-[a-zA-Z0-9]{8}\.(js|css)$/,
    // ...
  }
})
```

### 4. Asset-Debug-Utility (`src/lib/debug-assets.ts`)
**Problem:** Keine Möglichkeit, Asset-Load-Failures zu diagnostizieren.

**Fix:**
- Automatische Asset-Checks nach Page-Load (nur in Preview/Prod)
- Prüft CSS/JS/Manifest auf Erreichbarkeit
- Loggt Failures in Console (nur in Preview-Mode)

**Code:**
- Neue Datei: `src/lib/debug-assets.ts`
- Integration in `main.tsx`: `autoCheckAssets()` wird nach Load aufgerufen

---

## 📝 Zusammenfassung der Änderungen

### Geänderte Dateien:
1. ✅ `vercel.json` - Asset-Rewrites + MIME-Type-Header
2. ✅ `vite.config.ts` - SW-Strategie-Verbesserungen
3. ✅ `src/main.tsx` - Asset-Debug-Integration
4. ✅ `src/lib/debug-assets.ts` - Neue Debug-Utility

### Neue Dateien:
1. ✅ `PWA_LOAD_FAILURE_AUDIT.md` - Dieser Audit-Report

---

## 🧪 Test-Plan

### Lokal
1. `pnpm build`
2. `pnpm preview` → `http://localhost:4173/journal`
3. DevTools → Network: Prüfe CSS/JS-Loads
4. DevTools → Application → Service Workers: Prüfe SW-Status

### Vercel
1. Deploy auf Preview-Branch
2. Öffne `/journal` in Incognito-Modus
3. DevTools → Network: Prüfe 404/403 auf Assets
4. DevTools → Console: Prüfe SW-Errors
5. DevTools → Application → Service Workers: Prüfe SW-Version

### Debug-Checklist
- [ ] CSS-Dateien laden (Status 200, MIME-Type `text/css`)
- [ ] JS-Dateien laden (Status 200, MIME-Type `application/javascript`)
- [ ] `manifest.webmanifest` lädt (Status 200, MIME-Type `application/manifest+json`)
- [ ] Service Worker registriert (keine Errors in Console)
- [ ] SW cached aktuelle Assets (nicht alte Hashes)
- [ ] Keine 404/403 auf `/assets/*`
- [ ] Keine CORS-Errors
- [ ] Keine CSP-Errors

---

## 📋 Vercel-Deploy-Checklist

Nach jedem Deploy prüfen:
1. ✅ Build erfolgreich (keine Errors)
2. ✅ `dist/` enthält alle Assets
3. ✅ `dist/index.html` hat korrekte Asset-Pfade (`/assets/*`)
4. ✅ `dist/sw.js` existiert und ist aktuell
5. ✅ Vercel-Deploy-Logs zeigen keine Asset-Errors
6. ✅ Preview-URL lädt korrekt (nicht schwarz)
7. ✅ Network-Tab zeigt alle Assets als 200

---

## 🔗 Referenzen

- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Vercel SPA Routing](https://vercel.com/docs/configuration#routes)
- [Service Worker Update Strategies](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
