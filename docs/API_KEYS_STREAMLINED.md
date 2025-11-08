# 🔑 API-Keys Streamlined Configuration

**Stand:** 2025-11-07  
**Zweck:** Reduzierte API-Key-Konfiguration auf essenzielle Services

---

## ✅ AKTIVE Services

### Core App
- ✅ `VITE_APP_VERSION` - App-Versionsnummer

### Data Provider
- ✅ `VITE_MORALIS_API_KEY` + `MORALIS_API_KEY` - Moralis API für Marktdaten
- ✅ `VITE_MORALIS_BASE` + `MORALIS_BASE` - Moralis Base URL
- ✅ `DEXPAPRIKA_API_KEY` - DexPaprika API für Marktdaten
- ✅ `VITE_DEXPAPRIKA_BASE` + `DEXPAPRIKA_BASE` - DexPaprika Base URL
- ✅ `VITE_DATA_PRIMARY` - Primärer Provider (dexpaprika/moralis)
- ✅ `VITE_DATA_SECONDARY` - Fallback Provider
- ✅ `VITE_DATA_FALLBACKS` - Weitere Fallbacks

### AI Features
- ✅ `OPENAI_API_KEY` - OpenAI GPT für AI-Analyse
- ✅ `XAI_API_KEY` - Grok/xAI für AI-Analyse
- ✅ `ANALYSIS_AI_PROVIDER` - Aktiver AI-Provider
- ✅ `AI_MAX_COST_USD` - Cost-Limiting
- ✅ `AI_CACHE_TTL_SEC` - Cache-TTL

---

## ❌ DEAKTIVIERTE Services

### AI (Alternative Provider)
- ❌ `ANTHROPIC_API_KEY` - Claude AI (nicht benötigt)

### Push Notifications
- ❌ `VITE_VAPID_PUBLIC_KEY` - Web Push Public Key
- ❌ `VAPID_PUBLIC_KEY` - Web Push Public Key (Backend)
- ❌ `VAPID_PRIVATE_KEY` - Web Push Private Key
- ❌ `VAPID_SUBJECT` - Contact Email
- ❌ `VAPID_CONTACT` - Contact Email

### Blockchain / Solana
- ❌ `VITE_SOLANA_NETWORK` - Solana Network
- ❌ `VITE_SOLANA_RPC_URL` - Solana RPC (Frontend)
- ❌ `SOLANA_RPC_URL` - Solana RPC (Backend)
- ❌ `SOLANA_KEYPAIR_JSON` - Server Keypair
- ❌ `ACCESS_OG_SYMBOL` - OG Pass Symbol
- ❌ `ACCESS_TOKEN_MINT` - Access Token Mint

### External APIs
- ❌ `DEX_API_BASE` - DexScreener API
- ❌ `DEX_API_TIMEOUT` - DexScreener Timeout
- ❌ `PUMPFUN_API_BASE` - PumpFun API
- ❌ `PUMPFUN_API_TIMEOUT` - PumpFun Timeout

### Performance Monitoring
- ❌ `PERF_BUDGET_START_MS` - Start-Performance Budget
- ❌ `PERF_BUDGET_API_MEDIAN_MS` - API-Performance Budget
- ❌ `PERF_BUDGET_AI_TEASER_P95_MS` - AI Teaser Budget
- ❌ `PERF_BUDGET_REPLAY_OPEN_P95_MS` - Replay Budget
- ❌ `PERF_BUDGET_JOURNAL_SAVE_MS` - Journal Save Budget
- ❌ `PERF_BUDGET_JOURNAL_GRID_MS` - Journal Grid Budget
- ❌ `PERF_BUDGET_EXPORT_ZIP_P95_MS` - Export Budget

### Development
- ❌ `DEV_API_URL` - Local Mock Server
- ❌ `DEV_SKIP_HTTPS` - HTTPS Skip

---

## 🗄️ Database-Nutzung Übersicht

### IndexedDB: `sparkfined-ta-pwa` (db.ts)

**Verwendung:**
1. **Journal** - Trade-Einträge speichern
   - Token, Preis, Timestamp, Status (Taken/Planned)
   - Screenshots (Base64)
   - Notes
   
2. **Session Events** - User-Aktivitäten tracken
   - Screenshot-Drops
   - Save-Clicks
   - Export-Actions

3. **Metrics** - Telemetrie (Privacy-First)
   - Event-Counts (z.B. "drop_to_result")
   - Last-Updated Timestamps
   - Keine PII!

4. **Feedback** - User-Feedback Queue
   - Bug-Reports
   - Feature-Ideas
   - Export-Status

### IndexedDB: `sparkfined-signals` (signalDb.ts)

**Verwendung:**
1. **Signals** - Trading-Signale
2. **Trade Plans** - Geplante Trades
3. **Action Nodes** - Event-Sourcing Graph
4. **Lessons** - Learned Patterns
5. **Trade Outcomes** - Trade-Ergebnisse

### ⚠️ NICHT in der Database:

- ❌ **Replay** - Läuft komplett im Frontend-State (React)
- ❌ **Live Market Data** - Kommt von APIs (Moralis/DexPaprika)
- ❌ **User Settings** - LocalStorage

---

## 📋 Schnellstart-Checkliste

### Minimum Setup (App funktioniert)

```bash
# 1. App Version
VITE_APP_VERSION=1.0.0-beta

# 2. Mindestens EIN Data Provider
MORALIS_API_KEY=eyJ...
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2

# ODER
DEXPAPRIKA_API_KEY=dpx_...
DEXPAPRIKA_BASE=https://api.dexpaprika.com

# 3. Provider Config
VITE_DATA_PRIMARY=dexpaprika
VITE_DATA_SECONDARY=moralis
```

### Empfohlen (mit AI)

```bash
# Alle oben PLUS:

# AI-Provider (mindestens einer)
OPENAI_API_KEY=sk-...
# ODER
XAI_API_KEY=xai-...

# AI Config
ANALYSIS_AI_PROVIDER=openai
AI_MAX_COST_USD=0.25
```

---

## 🔗 API-Key Quellen

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **Moralis** | [admin.moralis.io](https://admin.moralis.io/) | Blockchain Data |
| **DexPaprika** | Kontakt DexPaprika Team | Alternative Data Source |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | AI Analysis |
| **xAI/Grok** | Kontakt xAI Team | Alternative AI |

---

## 🎯 Vorteile der Reduktion

### ✅ Weniger Komplexität
- 8 statt 51 aktive ENV-Variablen
- Keine Push-Notification-Infrastruktur
- Keine Blockchain-Dependencies
- Keine Performance-Monitoring-Overhead

### ✅ Schnelleres Setup
- Nur 2-3 API-Keys erforderlich
- Keine VAPID-Key-Generierung
- Kein Solana-Keypair-Setup

### ✅ Reduzierte Kosten
- Keine Solana RPC-Kosten
- Keine Anthropic-API-Kosten
- Fokus auf 1-2 AI-Provider

### ✅ Wartbarkeit
- Weniger Moving Parts
- Einfacheres Debugging
- Klarere Verantwortlichkeiten

---

## 📊 Vergleich: Vorher vs. Nachher

| Kategorie | Vorher | Nachher | Reduktion |
|-----------|--------|---------|-----------|
| **Gesamt ENV-Vars** | 51 | 15 | -71% |
| **Zwingend erforderlich** | 2-3 | 2-3 | 0% |
| **AI-Provider** | 3 | 2 | -33% |
| **Data Provider** | 2 | 2 | 0% |
| **Push Notifications** | 5 | 0 | -100% |
| **Blockchain** | 5 | 0 | -100% |
| **External APIs** | 4 | 0 | -100% |
| **Performance** | 7 | 0 | -100% |
| **Debug/Dev** | 4 | 2 | -50% |

---

## ⚠️ Wichtige Hinweise

### Re-Aktivierung möglich
Alle deaktivierten Services sind **auskommentiert** in `.env.example` und können bei Bedarf reaktiviert werden durch:
1. Kommentar entfernen
2. API-Key eintragen
3. Code ist bereits vorhanden - keine Änderungen nötig

### Backup vorhanden
- Original `.env.example` gesichert als `.env.example.backup`
- Vollständige Historie in Git

### Code bleibt unverändert
- Keine Code-Änderungen erforderlich
- Graceful Degradation bei fehlenden Keys
- Features deaktivieren sich automatisch

---

**Erstellt am:** 2025-11-07  
**Änderungen:** Streamlining auf essenzielle Services  
**Backup:** `.env.example.backup` verfügbar
