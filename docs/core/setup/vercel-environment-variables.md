# Vercel Environment Variables – API & Data Provider Setup

## Übersicht
Diese Tabelle listet alle API- und Datenanbieter auf, die in Vercel als Environment Variables konfiguriert werden müssen/sollten.

---

## 🔴 Pflicht-Konfiguration (REQUIRED)

| Provider / API | Funktion | Variable(n) | Beschreibung | Wo beziehen? |
|---|---|---|---|---|
| **App Version** | Build-Metadaten | `VITE_APP_VERSION` | Versionsnummer die im UI angezeigt wird (z.B. "1.0.0-beta") | Manuell setzen |
| **Moralis** | Primäre Marktdaten | `MORALIS_API_KEY` | Server-only Secret für Moralis Deep Index API (Token-Preise, Transaktionen, Wallet-Daten) | [admin.moralis.io](https://admin.moralis.io/) |
| **Moralis** | API Base URL | `MORALIS_BASE_URL` | Basis-URL für Moralis API (default: `https://deep-index.moralis.io/api/v2.2`) | Standard-Wert |
| **Moralis** | Frontend Proxy | `VITE_MORALIS_BASE` | Client-seitige Proxy-URL für Moralis-Requests | `/api/moralis` (Proxy) |

---

## 🟠 Empfohlene Konfiguration (RECOMMENDED)

### Datenanbieter (Market Data)

| Provider / API | Funktion | Variable(n) | Beschreibung | Wo beziehen? |
|---|---|---|---|---|
| **DexPaprika** | Alternative Marktdaten | `DEXPAPRIKA_API_KEY` | API-Key für DexPaprika (Token-Preise, OHLC-Daten, Heatmaps) | Kontakt DexPaprika Team |
| **DexPaprika** | API Base URL | `DEXPAPRIKA_BASE` | Basis-URL für DexPaprika (default: `https://api.dexpaprika.com`) | Standard-Wert |
| **DexPaprika** | Frontend Base | `VITE_DEXPAPRIKA_BASE` | Client-seitige Base URL für direkte Requests | `https://api.dexpaprika.com` |
| **Data Provider Priority** | Orchestrator-Konfiguration | `VITE_DATA_PRIMARY`<br>`VITE_DATA_SECONDARY`<br>`VITE_DATA_FALLBACKS` | Primärer Provider: `dexpaprika` oder `moralis`<br>Sekundärer Fallback: `moralis` oder `none`<br>Weitere Fallbacks: `dexscreener,pumpfun` | Config-Entscheidung |
| **Data Proxy Secret** | Proxy-Authentifizierung | `DATA_PROXY_SECRET` | Secret für `/api/data/*` Proxy-Endpoints (verhindert direkten Zugriff) | Selbst generieren (z.B. UUID) |

### AI/LLM Provider

| Provider / API | Funktion | Variable(n) | Beschreibung | Wo beziehen? |
|---|---|---|---|---|
| **OpenAI** | AI-Analyse & Insights | `OPENAI_API_KEY` | API-Key für GPT-4/3.5 (Journal-Analyse, Market-Insights, Trade-Empfehlungen) | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **xAI/Grok** | Alternative AI | `XAI_API_KEY` | API-Key für Grok (Alternative zu OpenAI) | xAI Team kontaktieren |
| **AI Config** | AI-Kostenkontrolle | `AI_MAX_COST_USD`<br>`AI_CACHE_TTL_SEC`<br>`AI_PROXY_SECRET` | Maximale Kosten pro Request ($0.25 empfohlen)<br>Cache-Dauer für AI-Responses (3600s = 1h)<br>Secret für `/api/ai/*` Endpoints | Config-Entscheidung |
| **AI Provider Selection** | Provider-Auswahl | `ANALYSIS_AI_PROVIDER`<br>`VITE_ANALYSIS_AI_PROVIDER` | Backend: `openai` oder `xai`<br>Frontend: Gleicher Wert für UI-Anzeige | Config-Entscheidung |

### Serverless API Secrets

| Provider / API | Funktion | Variable(n) | Beschreibung | Wo beziehen? |
|---|---|---|---|---|
| **Oracle Cron** | Tägliche Intelligence | `ORACLE_CRON_SECRET` | Secret für `/api/oracle` Endpoint (Cron-Job für Market-Updates) | Selbst generieren |
| **Moralis Webhook** | Blockchain Events | `MORALIS_WEBHOOK_SECRET` | Secret für Moralis Webhook-Callbacks (Wallet-Events) | Moralis Dashboard |
| **Moralis Proxy TTL** | Cache-Steuerung | `MORALIS_PROXY_TTL_MS` | Cache-Dauer für Moralis-Proxy (60000ms = 1min empfohlen) | Config-Entscheidung |

---

## 🟡 Optionale Konfiguration (OPTIONAL)

### Feature Flags

| Provider / API | Funktion | Variable(n) | Beschreibung | Default |
|---|---|---|---|---|
| **Debug Mode** | Entwickler-Logging | `VITE_DEBUG`<br>`VITE_ENABLE_DEBUG` | Aktiviert Console-Logs in Production | `false` |
| **Analytics** | Nutzungs-Tracking | `VITE_ENABLE_ANALYTICS` | Aktiviert Analytics-Tracking (aktuell deaktiviert) | `false` |
| **Metrics** | Performance-Tracking | `VITE_ENABLE_METRICS` | Aktiviert lokale Performance-Metriken | `true` |
| **AI Teaser** | AI-Feature Preview | `VITE_ENABLE_AI_TEASER` | Zeigt AI-Features im Teaser-Modus | `false` |

### Live Data (v1 - Optional)

| Provider / API | Funktion | Variable(n) | Beschreibung | Default |
|---|---|---|---|---|
| **Live Data v1** | Echtzeit-Updates | `VITE_LIVE_V1_ENABLED`<br>`VITE_LIVE_DATA_MODE`<br>`VITE_LIVE_POLL_INTERVAL_MS`<br>`VITE_LIVE_PASSIVE_INTERVAL_MS` | Aktiviert Live-Daten<br>Modus: `auto`, `active`, `passive`<br>Polling-Intervall (aktiv): 3000ms<br>Polling-Intervall (passiv): 15000ms | `false` |
| **Solana WebSocket** | Blockchain-Stream | `VITE_SOLANA_WS_URL` | WebSocket-URL für Solana-Updates | `wss://api.mainnet-beta.solana.com` |
| **Orderflow Provider** | Orderflow-Daten | `VITE_ORDERFLOW_PROVIDER` | Provider für Orderflow-Analyse (`none` wenn deaktiviert) | `none` |
| **Walletflow Provider** | Wallet-Tracking | `VITE_WALLETFLOW_PROVIDER` | Provider für Wallet-Flow-Analyse (`none` wenn deaktiviert) | `none` |

---

## ❌ Deaktivierte Services (DISABLED)

Diese Services sind aktuell **nicht aktiv** und müssen **nicht** konfiguriert werden:

| Provider / API | Status | Variable(n) | Grund |
|---|---|---|---|
| **Anthropic/Claude** | Deaktiviert | `ANTHROPIC_API_KEY` | OpenAI ist primärer AI-Provider |
| **Web Push Notifications** | Deaktiviert | `VITE_VAPID_PUBLIC_KEY`<br>`VAPID_PUBLIC_KEY`<br>`VAPID_PRIVATE_KEY`<br>`VAPID_SUBJECT` | Feature aktuell nicht in Nutzung |
| **Solana Blockchain** | Deaktiviert | `VITE_SOLANA_NETWORK`<br>`VITE_SOLANA_RPC_URL`<br>`SOLANA_RPC_URL` | NFT Access Gating entfernt |
| **External APIs** | Deaktiviert | `DEX_API_BASE`<br>`PUMPFUN_API_BASE` | Über Adapter/Proxies abgedeckt |

---

## 🎯 Quick Setup – Minimal-Konfiguration

**Für MVP deployment benötigst du minimal:**

```bash
# 1. App Version
VITE_APP_VERSION=1.0.0-beta

# 2. Ein Datenanbieter (wähle eine Option):
# Option A: Moralis (empfohlen)
MORALIS_API_KEY=your_moralis_api_key_here
MORALIS_BASE_URL=https://deep-index.moralis.io/api/v2.2
VITE_MORALIS_BASE=/api/moralis
VITE_DATA_PRIMARY=moralis

# Option B: DexPaprika
DEXPAPRIKA_API_KEY=your_dexpaprika_key_here
DEXPAPRIKA_BASE=https://api.dexpaprika.com
VITE_DEXPAPRIKA_BASE=https://api.dexpaprika.com
VITE_DATA_PRIMARY=dexpaprika

# 3. (Optional aber empfohlen) AI für Insights
OPENAI_API_KEY=your_openai_key_here
ANALYSIS_AI_PROVIDER=openai
AI_MAX_COST_USD=0.25
```

---

## 🚀 Setup-Schritte für Vercel

### 1. Secrets hinzufügen
Gehe zu **Vercel Dashboard** → **Project Settings** → **Environment Variables**

### 2. Wichtige Regeln
- ❗ **Server-only Secrets**: NIE mit `VITE_` prefix (werden sonst im Bundle exposed)
- ✅ **Client-safe Variables**: Mit `VITE_` prefix (für Frontend zugänglich)
- 🔐 **Secrets generieren**: UUIDs für `DATA_PROXY_SECRET`, `ORACLE_CRON_SECRET`, etc.

### 3. Environment-spezifische Werte
- **Production**: Alle echten API-Keys setzen
- **Preview**: Kann gleiche Keys nutzen oder separate Test-Keys
- **Development**: Lokale `.env.local` Datei (nicht committen!)

---

## 📖 Weitere Ressourcen

- **Vollständige Env-Vorlage**: `.env.example` im Projekt-Root
- **Env-Inventar**: `docs/core/setup/env_inventory.md`
- **Provider-Setup**: `docs/core/setup/environment-and-providers.md`
- **Vercel Deploy Checklist**: `docs/core/setup/vercel-deploy-checklist.md`

---

## 🔍 Validierung

Nach dem Setup teste folgende Endpoints:

```bash
# Health Check (zeigt Provider-Status)
curl https://your-app.vercel.app/api/health

# Market Data (prüft Moralis/DexPaprika)
curl https://your-app.vercel.app/api/data/ohlc?address=YOUR_TOKEN_ADDRESS

# Journal API (prüft Backend-Funktionen)
curl https://your-app.vercel.app/api/journal
```

---

**Last updated**: 2025-12-15
**Maintained by**: Sparkfined Team
**Status**: Aktiv (basierend auf `.env.example` v1.0.0-beta)
