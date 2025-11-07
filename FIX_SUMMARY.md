# PWA Load-Failure Fix - Zusammenfassung

## 🎯 Problem
Schwarzer Bildschirm ohne Styles nach Build/Deploy auf Vercel, insbesondere bei SPA-Routes wie `/journal`.

## 🔍 Root Cause
1. **Asset-Rewrite-Konflikt**: Vercel-Rewrites haben Asset-Requests (`/assets/*.css`, `/assets/*.js`) zu `/index.html` umgeschrieben
2. **Fehlende MIME-Type-Header**: CSS/JS wurden möglicherweise mit falschem Content-Type ausgeliefert
3. **Service Worker Cache**: SW könnte alte Asset-Versionen cached haben

## ✅ Implementierte Fixes

### 1. Vercel Asset-Rewrite-Ausnahmen
- Explizite Rewrite-Regeln für `/assets/*`, `/icons/*`, `/manifest.webmanifest`, `/sw.js` etc.
- Catch-All-Rewrite (`/(.*)` → `/index.html`) kommt jetzt ZULETZT

### 2. Explizite MIME-Type-Header
- CSS: `text/css; charset=utf-8`
- JS: `application/javascript; charset=utf-8`
- Manifest: `application/manifest+json; charset=utf-8`

### 3. Service Worker Optimierungen
- Explizite `strategies: 'generateSW'`
- `dontCacheBustURLsMatching` für gehashte Assets

### 4. Asset-Debug-Utility
- Automatische Asset-Checks nach Page-Load (nur Preview/Prod)
- Loggt Failures in Console für einfacheres Debugging

## 📋 Nächste Schritte

1. **Deploy auf Vercel Preview**
   ```bash
   git add .
   git commit -m "fix: PWA load failure - asset rewrites and MIME types"
   git push
   ```

2. **Test auf Preview-URL**
   - Öffne `/journal` in Incognito-Modus
   - DevTools → Network: Prüfe CSS/JS-Loads (sollten 200 sein)
   - DevTools → Console: Prüfe auf `[Asset Check]` Logs

3. **Bei weiterhin auftretenden Problemen**
   - DevTools → Application → Service Workers: Unregister alle SWs
   - Hard Reload (Ctrl+Shift+R / Cmd+Shift+R)
   - Prüfe Network-Tab auf 404/403 auf Assets

## 📁 Geänderte Dateien

- `vercel.json` - Asset-Rewrites + MIME-Type-Header
- `vite.config.ts` - SW-Strategie-Verbesserungen  
- `src/main.tsx` - Asset-Debug-Integration
- `src/lib/debug-assets.ts` - Neue Debug-Utility (neu)

## 📚 Weitere Details

Siehe `PWA_LOAD_FAILURE_AUDIT.md` für vollständigen Audit-Report.
