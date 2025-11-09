# 🔐 Production Environment Variables für Vercel

**Last Updated:** 2025-11-09  
**Status:** Aktuelle Keys basierend auf Code-Analyse  

---

## ⚠️ Wichtiger Hinweis

**Vercel Warnung: "VITE_ might expose sensitive information"**

Diese Warnung ist **berechtigt**! Alle Variablen mit `VITE_` Prefix werden im Browser-Bundle eingebettet und sind **öffentlich einsehbar**. 

**Regel:** Niemals API Keys oder Secrets mit `VITE_` Prefix verwenden!

---

## 🔴 Pflicht-Keys (Required)

Diese Keys MÜSSEN gesetzt werden, sonst funktioniert die App nicht:

```bash
# App Version (OK für Frontend)
VITE_APP_VERSION=1.0.0-beta

# Data Provider - MINDESTENS EINER erforderlich!

# Option A: Moralis (Backend Only!)
MORALIS_API_KEY=your_moralis_api_key_here
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2

# Option B: DexPaprika (Backend Only!)
DEXPAPRIKA_API_KEY=your_dexpaprika_api_key_here
DEXPAPRIKA_BASE=https://api.dexpaprika.com

# Base URLs (Frontend - OK, keine Secrets)
VITE_MORALIS_BASE=https://deep-index.moralis.io/api/v2.2
VITE_DEXPAPRIKA_BASE=https://api.dexpaprika.com

# Data Provider Config (Frontend - OK)
VITE_DATA_PRIMARY=dexpaprika
VITE_DATA_SECONDARY=moralis
VITE_DATA_FALLBACKS=dexscreener,pumpfun
```

**Wo beziehen:**
- Moralis: https://admin.moralis.io/
- DexPaprika: https://www.dexpaprika.com/api

---

## 🟡 Empfohlen (Recommended)

Diese Keys sind für erweiterte Features empfohlen:

```bash
# AI Features (Backend Only!)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
AI_MAX_COST_USD=0.25
AI_CACHE_TTL_SEC=3600

# AI Provider Config (Frontend - OK, keine Secrets)
VITE_ANALYSIS_AI_PROVIDER=openai
ANALYSIS_AI_PROVIDER=openai

# Push Notifications
VITE_VAPID_PUBLIC_KEY=BNxxx...xxx
VAPID_PUBLIC_KEY=BNxxx...xxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxx
VAPID_SUBJECT=mailto:admin@sparkfined.com
VAPID_CONTACT=mailto:admin@sparkfined.com
```

**Wo beziehen:**
- OpenAI: https://platform.openai.com/api-keys
- VAPID Keys: `npx web-push generate-vapid-keys`

---

## 🟢 Optional

Diese Keys sind für spezielle Features optional:

```bash
# Alternative AI Providers (Backend Only!)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
XAI_API_KEY=xxxxxxxxxxxxx
GROK_API_KEY=xxxxxxxxxxxxx
XAI_BASE_URL=https://api.x.ai/v1

# Redis/KV Store für Alerts (Backend Only!)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxx

# Webhooks & Cron (Backend Only!)
CRON_SECRET=xxxxxxxxxxxxx
MORALIS_WEBHOOK_SECRET=xxxxxxxxxxxxx
MONITORED_WALLET=YourSolanaWalletAddress

# Feature Flags (Frontend - OK)
VITE_ENABLE_AI_TEASER=false
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_METRICS=true
VITE_ENABLE_DEBUG=false
VITE_DEBUG=false
VITE_ORDERFLOW_PROVIDER=none
VITE_WALLETFLOW_PROVIDER=none

# External API Config (Frontend - OK, keine Secrets)
DEX_API_BASE=https://api.dexscreener.com
DEX_API_TIMEOUT=5000
PUMPFUN_API_BASE=https://api.pump.fun
PUMPFUN_API_TIMEOUT=5000

# Performance Budgets (Backend - OK)
PERF_BUDGET_START_MS=1000
PERF_BUDGET_API_MEDIAN_MS=500
PERF_BUDGET_AI_TEASER_P95_MS=2000
PERF_BUDGET_REPLAY_OPEN_P95_MS=350
PERF_BUDGET_JOURNAL_SAVE_MS=60
PERF_BUDGET_JOURNAL_GRID_MS=250
PERF_BUDGET_EXPORT_ZIP_P95_MS=800
```

**Wo beziehen:**
- Anthropic: https://console.anthropic.com/
- xAI/Grok: Contact xAI team
- Upstash Redis: https://upstash.com/

---

## ⚪ Auto-Set (Von Vercel)

Diese Variablen werden automatisch von Vercel gesetzt - **NICHT manuell hinzufügen!**

```bash
VERCEL=1
VERCEL_ENV=production
VERCEL_URL=your-app.vercel.app
VERCEL_GIT_COMMIT_SHA=abc123...
```

---

## ❌ NIEMALS setzen (Security Risk!)

Diese Keys sollten **NIEMALS** mit `VITE_` Prefix gesetzt werden:

```bash
# ❌ FALSCH - Exposes API Key!
VITE_MORALIS_API_KEY=xxxxx
VITE_OPENAI_API_KEY=xxxxx
VITE_DEXPAPRIKA_API_KEY=xxxxx
VITE_API_KEY=xxxxx

# ✅ RICHTIG - Backend Only!
MORALIS_API_KEY=xxxxx
OPENAI_API_KEY=xxxxx
DEXPAPRIKA_API_KEY=xxxxx
```

---

## 📋 Vercel Setup Checkliste

### 1. In Vercel Dashboard navigieren
```
Projekt auswählen → Settings → Environment Variables
```

### 2. Minimum Keys hinzufügen (MVP)
- [ ] `VITE_APP_VERSION` = `1.0.0-beta`
- [ ] `MORALIS_API_KEY` = (Dein Moralis Key)
- [ ] `MORALIS_BASE` = `https://deep-index.moralis.io/api/v2.2`
- [ ] `VITE_MORALIS_BASE` = `https://deep-index.moralis.io/api/v2.2`
- [ ] `VITE_DATA_PRIMARY` = `moralis`
- [ ] `VITE_DATA_SECONDARY` = `none`
- [ ] `VITE_DATA_FALLBACKS` = `dexscreener,pumpfun`

### 3. Empfohlene Keys hinzufügen
- [ ] `OPENAI_API_KEY` = (Dein OpenAI Key)
- [ ] `VITE_ANALYSIS_AI_PROVIDER` = `openai`
- [ ] `ANALYSIS_AI_PROVIDER` = `openai`
- [ ] `AI_MAX_COST_USD` = `0.25`
- [ ] `AI_CACHE_TTL_SEC` = `3600`

### 4. Environment auswählen
Für jeden Key auswählen:
- ✅ Production
- ✅ Preview
- ⚠️ Development (optional, meist lokal via .env.local)

### 5. Deployment auslösen
Nach dem Hinzufügen der Keys:
```bash
# Neues Deployment triggern
git commit --allow-empty -m "trigger deployment"
git push
```

### 6. Health Check verifizieren
Nach Deployment prüfen:
```bash
curl https://your-app.vercel.app/api/health
```

Erwartete Response:
```json
{
  "ok": true,
  "status": "healthy",
  "checks": {
    "env": {
      "dexpaprika": true,
      "openai": true,
      "vapid": true,
      "vapidPrivate": true
    }
  }
}
```

---

## 🔍 Troubleshooting

### Problem: "Warnung VITE_ might expose sensitive information"

**Ursache:** Ein API Key verwendet den `VITE_` Prefix

**Lösung:**
1. Prüfe welche `VITE_*_API_KEY` Variablen gesetzt sind
2. Entferne sie aus Vercel
3. Setze sie ohne `VITE_` Prefix als Backend-Variable
4. Prüfe dass der Code Backend-Proxies verwendet

### Problem: "MORALIS_API_KEY not configured"

**Ursache:** Key nicht in Vercel gesetzt oder falscher Name

**Lösung:**
1. Gehe zu Vercel Dashboard → Settings → Environment Variables
2. Füge `MORALIS_API_KEY` hinzu (ohne VITE_ !)
3. Wähle "Production" Environment
4. Neues Deployment triggern

### Problem: Health Check zeigt "degraded"

**Ursache:** Eine oder mehrere ENV-Variablen fehlen

**Lösung:**
1. Prüfe die Response: `curl https://your-app.vercel.app/api/health`
2. Schaue welche Checks `false` sind
3. Füge die entsprechenden Keys in Vercel hinzu
4. Deployment triggern

---

## 📊 Zusammenfassung

| Kategorie | Anzahl Keys | Status |
|-----------|-------------|--------|
| 🔴 Pflicht (Frontend) | 7 | Required |
| 🔴 Pflicht (Backend) | 4 | Required |
| 🟡 Empfohlen | 10 | Recommended |
| 🟢 Optional | 25+ | Optional |
| ⚪ Auto-Set | 4 | Automatic |
| **TOTAL** | **~50** | - |

### Minimum für MVP
- **11 Keys** (App Version + 1 Data Provider + Config)

### Empfohlene Production Config
- **21 Keys** (MVP + AI + Push Notifications)

### Vollständige Config
- **~50 Keys** (Alle Features aktiviert)

---

## 🔗 Nützliche Links

- **Vercel Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Moralis API Keys:** https://admin.moralis.io/
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **Upstash Redis:** https://upstash.com/
- **VAPID Key Generator:** https://web-push-codelab.glitch.me/

---

## 📝 Notizen

- Alle Backend-Keys werden NUR server-side verwendet
- Frontend-Keys (VITE_*) werden im Bundle eingebettet - nur public URLs/Flags!
- Keys sollten alle 90 Tage rotiert werden
- Dev/Staging/Prod sollten unterschiedliche Keys verwenden
- Nie Keys in Git committen (`.env.local` ist in `.gitignore`)

---

**Erstellt:** 2025-11-09  
**Basierend auf:** Vollständige Code-Analyse + .env.example  
**Status:** ✅ Ready for Production (nach Behebung der Security Issues)
