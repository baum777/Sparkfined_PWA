# Vercel Deployment Fehlerbehebung

**Stand:** 2025-11-04  
**Status:** Lokal ✅ | Vercel ❌

---

## ✅ Lokale Diagnose

- Build funktioniert: ✅
- Node Version: v22.21.1 ✅
- Output Directory: dist/ ✅
- Alle kritischen Dateien vorhanden ✅

---

## 🔧 Vercel Fixes (Schritt für Schritt)

### FIX 1: Environment Variables ⚠️ **HÖCHSTE PRIORITÄT**

Ohne diese Variables schlagen API-Aufrufe fehl:

1. **Gehe zu:** https://vercel.com/dashboard
2. **Wähle:** Dein Projekt
3. **Klicke:** Settings → Environment Variables
4. **Füge hinzu:**

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MORALIS_API_KEY` | dein_key | Production, Preview, Development |
| `MORALIS_BASE` | https://deep-index.moralis.io/api/v2.2 | Production, Preview, Development |
| `DEXPAPRIKA_API_KEY` | dein_key | Production, Preview, Development |
| `DEXPAPRIKA_BASE` | https://api.dexpaprika.com | Production, Preview, Development |
| `OPENAI_API_KEY` | dein_key | Production, Preview, Development |
| `VITE_VAPID_PUBLIC_KEY` | dein_public_key | Production, Preview, Development |
| `VAPID_PRIVATE_KEY` | dein_private_key | Production, Preview, Development |

5. **Nach dem Speichern:** Vercel deployt automatisch neu

**VAPID Keys generieren (falls noch nicht vorhanden):**
```bash
npx web-push generate-vapid-keys
```

---

### FIX 2: Node.js Version

1. **Gehe zu:** Settings → General
2. **Scrolle zu:** "Node.js Version"
3. **Wähle:** 20.x (empfohlen)
4. **Save**

---

### FIX 3: Build Settings (falls Auto-Detect fehlschlägt)

1. **Gehe zu:** Settings → Build & Development Settings
2. **Override:** Ja
3. **Setze:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Save**

---

### FIX 4: Vercel CLI Test (optional)

Falls du Vercel CLI installiert hast:

```bash
# Login
vercel login

# Test Deployment (Preview)
vercel

# Production Deployment
vercel --prod
```

---

## 📊 Erwartete Vercel Build Logs (Erfolg)

```
[timestamp] Installing dependencies...
[timestamp] Running "npm install"
[timestamp] npm install completed in Xs
[timestamp] 
[timestamp] Running "npm run build"
[timestamp] > extracted@0.1.0 build
[timestamp] > tsc -b tsconfig.build.json && vite build
[timestamp] vite v5.4.21 building for production...
[timestamp] transforming...
[timestamp] ✓ 2097 modules transformed.
[timestamp] rendering chunks...
[timestamp] dist/index.html (1.64 kB)
[timestamp] dist/assets/... (mehrere Chunks)
[timestamp] ✓ built in Xs
[timestamp] 
[timestamp] PWA v0.20.5
[timestamp] mode generateSW
[timestamp] precache 34 entries (380.24 KiB)
[timestamp] 
[timestamp] Build Completed
```

---

## ❌ Fehlermeldungen entschlüsseln

### "Module not found: Can't resolve..."
**Ursache:** Dependencies nicht installiert  
**Fix:** Install Command prüfen (`npm install`)

### "Type error: TS18048..."
**Ursache:** strictNullChecks Problem  
**Fix:** Sollte durch `tsconfig.build.json` behoben sein (hat `strictNullChecks: false`)

### "Environment variable not found"
**Ursache:** API-Keys fehlen  
**Fix:** FIX 1 anwenden (Environment Variables setzen)

### "Build exceeded maximum duration"
**Ursache:** Build zu langsam (Vercel Hobby: 45s Limit)  
**Fix:** Upgrade zu Vercel Pro ODER Dependencies reduzieren

### "Internal Function Error"
**Ursache:** API-Routen crashen beim Runtime  
**Fix:** 
1. Environment Variables prüfen
2. Vercel Logs checken: Dashboard → Deployments → Functions → Logs

---

## 🔍 Debugging-Schritte

### 1. Build Logs anschauen
```
Vercel Dashboard → Deployments → [Dein Deployment] → Building
```

Suche nach:
- ❌ Error-Meldungen (rot)
- ⚠️ Warnings (gelb)
- Exit Code (sollte 0 sein)

### 2. Function Logs checken (nach erfolgreichem Build)
```
Vercel Dashboard → Deployments → [Dein Deployment] → Functions
```

Teste:
- `/api/health` - Health Check
- `/api/board/kpis` - Board KPIs
- `/api/board/feed` - Board Feed

### 3. Runtime Logs (Real-time)
```
Vercel Dashboard → [Dein Projekt] → Logs → Real-time Logs
```

Besuche deine App und schaue auf Fehler.

---

## 🚀 Nach erfolgreichem Deployment

### Health Check
```bash
curl https://your-app.vercel.app/api/health
```

**Erwartete Response:**
```json
{
  "ok": true,
  "status": "healthy",
  "checks": {
    "timestamp": "2025-11-04T...",
    "env": {
      "dexpaprika": true,
      "openai": true,
      "vapid": true,
      "vapidPrivate": true
    },
    "runtime": "edge",
    "version": "1.0.0"
  },
  "warnings": []
}
```

### Test Checklist
- [ ] Homepage lädt (/)
- [ ] Board-Seite funktioniert (/board)
- [ ] API Health Check OK (/api/health)
- [ ] PWA installierbar (Mobile)
- [ ] Service Worker aktiv (DevTools → Application)
- [ ] Keine Console Errors

---

## 📞 Support

Falls weiterhin Probleme bestehen:

1. **Kopiere die Vercel Build Logs** (vollständig)
2. **Sende mir:**
   - Build Logs
   - Error-Meldungen
   - Function Logs (falls Runtime-Fehler)

Dann kann ich gezielt helfen!

---

## ✅ Quick Wins

**Die 3 häufigsten Fixes:**
1. ✅ Environment Variables setzen (90% der Fälle)
2. ✅ Node.js 20.x wählen (5% der Fälle)
3. ✅ Build Command manuell setzen (3% der Fälle)

**Probiere zuerst FIX 1!** 🔑

---

**Generiert:** 2025-11-04  
**Lokaler Build:** ✅ Erfolgreich  
**Vercel Deployment:** ⏳ Warte auf Fix
