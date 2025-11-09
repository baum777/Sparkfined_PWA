# 🔑 API Keys & Environment Variables Guide

**Stand:** 2025-11-09 (Konsolidiert aus API_KEYS_LIST.md + API_KEYS_STREAMLINED.md)  
**Zweck:** Vollständige Übersicht aller API-Keys und deren Verwendung

---

## 🚨 Mindestanforderungen (MVP - App startet)

### ✅ Zwingend erforderlich

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **App Version** | `VITE_APP_VERSION` | Versionsnummer (z.B. `1.0.0-beta`) | Manuell setzen |
| **Moralis API Key** | `MORALIS_API_KEY` | Backend-Key für Marktdaten (OHLC, Token-Info) | [admin.moralis.io](https://admin.moralis.io/) |
| **Moralis Base URL** | `MORALIS_BASE` | API-Basis-URL | Standard: `https://deep-index.moralis.io/api/v2.2` |

**Alternative zu Moralis:**

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **DexPaprika API Key** | `DEXPAPRIKA_API_KEY` | Alternative Datenquelle | Kontakt: DexPaprika Team |
| **DexPaprika Base URL** | `DEXPAPRIKA_BASE` | API-Basis-URL | Standard: `https://api.dexpaprika.com` |

**Data Provider Configuration:**

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `VITE_DATA_PRIMARY` | Primärer Datenprovider | `dexpaprika` |
| `VITE_DATA_SECONDARY` | Sekundärer Fallback | `moralis` |
| `VITE_DATA_FALLBACKS` | Weitere Fallbacks | - |

> **Hinweis:** Mindestens **einer** der beiden Datenprovider (Moralis ODER DexPaprika) ist erforderlich.

---

## 🎯 Empfohlen (für volle Funktionalität)

### AI-Features (optional, aber empfohlen)

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **OpenAI API Key** | `OPENAI_API_KEY` | Für AI-Analysen und Zusammenfassungen | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **xAI/Grok API Key** | `XAI_API_KEY` | Alternative AI-Provider (Grok) | Kontakt: xAI Team |

**AI Configuration:**

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `ANALYSIS_AI_PROVIDER` | Aktiver AI-Provider | `openai` |
| `AI_MAX_COST_USD` | Cost-Limiting pro Request | `0.25` |
| `AI_CACHE_TTL_SEC` | Cache-TTL | `3600` |

> **Hinweis:** Mindestens **einer** AI-Provider ist für AI-Features erforderlich. Die App funktioniert auch ohne AI-Keys, aber AI-Features sind dann deaktiviert.

---

## 🔧 Optional (für erweiterte Features)

### Push-Benachrichtigungen (DEAKTIVIERT)

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **VAPID Public Key** | `VITE_VAPID_PUBLIC_KEY` | Öffentlicher Key für Web Push (Frontend) | `npx web-push generate-vapid-keys` |
| **VAPID Public Key** | `VAPID_PUBLIC_KEY` | Öffentlicher Key (Backend) | Gleicher Befehl |
| **VAPID Private Key** | `VAPID_PRIVATE_KEY` | Privater Key (Backend, NIEMALS im Frontend!) | Gleicher Befehl |
| **VAPID Subject** | `VAPID_SUBJECT` | Kontakt-E-Mail (z.B. `mailto:admin@example.com`) | Manuell setzen |

> **Status:** Derzeit deaktiviert (Fokus auf Core-Features). Kann bei Bedarf reaktiviert werden.

### Blockchain / Solana (DEAKTIVIERT)

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **Solana Network** | `VITE_SOLANA_NETWORK` | Solana-Netzwerk | `mainnet-beta` / `devnet` |
| **Solana RPC URL** | `VITE_SOLANA_RPC_URL` | Solana RPC-Endpoint (Frontend) | [Helius](https://helius.xyz/), [QuickNode](https://www.quicknode.com/) |
| **Solana RPC URL** | `SOLANA_RPC_URL` | Solana RPC-Endpoint (Backend) | Gleiche Anbieter |
| **Solana Keypair JSON** | `SOLANA_KEYPAIR_JSON` | Server-Keypair für Signing | Generieren mit Solana CLI |
| **Access OG Symbol** | `ACCESS_OG_SYMBOL` | OG Pass Symbol | Manuell setzen |
| **Access Token Mint** | `ACCESS_TOKEN_MINT` | Access Token Mint Address | Solana Explorer |

> **Status:** Derzeit deaktiviert. Kann bei Bedarf reaktiviert werden für Access-System.

---

## 📝 Frontend-spezifische Keys (VITE_*)

Alle Frontend-Variablen müssen mit `VITE_` beginnen, damit sie im Browser verfügbar sind:

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `VITE_APP_VERSION` | App-Version | `1.0.0-beta` |
| `VITE_MORALIS_API_KEY` | Moralis-Key (Frontend, optional) | - |
| `VITE_MORALIS_BASE` | Moralis-Basis-URL (Frontend) | `https://deep-index.moralis.io/api/v2.2` |
| `VITE_DEXPAPRIKA_BASE` | DexPaprika-Basis-URL (Frontend) | `https://api.dexpaprika.com` |
| `VITE_DATA_PRIMARY` | Primärer Datenprovider | `dexpaprika` |
| `VITE_DATA_SECONDARY` | Sekundärer Fallback | `moralis` |
| `VITE_SOLANA_NETWORK` | Solana-Netzwerk | `mainnet-beta` |
| `VITE_ENABLE_AI_TEASER` | AI-Teaser aktivieren | `false` |
| `VITE_ENABLE_ANALYTICS` | Analytics aktivieren | `false` |
| `VITE_ENABLE_DEBUG` | Debug-Modus | `false` |

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

### LocalStorage

**Verwendung:**
- User Settings (`sparkfined.settings.v1`)
- Watchlist (`sparkfined.watchlist.v1`)
- Alert Rules (`sparkfined.alerts.v1`)
- Bookmarks (`sparkfined.bookmarks.v1`)
- Drawings (`sparkfined.draw.v1`)

---

## 🚀 Schnellstart-Checkliste

### Minimum (App startet, aber eingeschränkt)

```bash
# 1. App-Version
VITE_APP_VERSION=1.0.0-beta

# 2. Mindestens EIN Datenprovider (wähle eine Option):

# Option A: Moralis (empfohlen)
MORALIS_API_KEY=your_moralis_key_here
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2
VITE_MORALIS_BASE=https://deep-index.moralis.io/api/v2.2

# ODER Option B: DexPaprika
DEXPAPRIKA_API_KEY=your_dexpaprika_key_here
DEXPAPRIKA_BASE=https://api.dexpaprika.com
VITE_DEXPAPRIKA_BASE=https://api.dexpaprika.com

# 3. Provider Config
VITE_DATA_PRIMARY=dexpaprika
VITE_DATA_SECONDARY=moralis
```

### Empfohlen (volle Funktionalität)

```bash
# Alle Mindestanforderungen PLUS:

# AI-Features (mindestens einer)
OPENAI_API_KEY=sk-...
# ODER
XAI_API_KEY=xai-...

# AI Config
ANALYSIS_AI_PROVIDER=openai
AI_MAX_COST_USD=0.25
AI_CACHE_TTL_SEC=3600
```

### Optional (erweiterte Features)

```bash
# Alle oben genannten PLUS:

# Push-Benachrichtigungen (falls aktiviert)
VAPID_PUBLIC_KEY=BNF7...
VAPID_PRIVATE_KEY=...
VITE_VAPID_PUBLIC_KEY=BNF7...  # Gleicher Wert wie VAPID_PUBLIC_KEY
VAPID_SUBJECT=mailto:admin@example.com

# Solana (falls aktiviert)
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_KEYPAIR_JSON=[...]
```

---

## 🔗 Links zu API-Key-Quellen

| Service | Link | Beschreibung |
|---------|------|--------------|
| **Moralis** | [admin.moralis.io](https://admin.moralis.io/) | Blockchain-Daten-API |
| **DexPaprika** | Kontakt DexPaprika Team | Alternative Datenquelle |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | AI-API |
| **xAI/Grok** | Kontakt xAI Team | Alternative AI |
| **Helius** | [helius.xyz](https://helius.xyz/) | Solana RPC |
| **QuickNode** | [quicknode.com](https://www.quicknode.com/) | Solana RPC |

---

## 📊 Priorisierung & Reduktion

### Tier 1 (Zwingend erforderlich) - 3 Keys
- `VITE_APP_VERSION`
- `MORALIS_API_KEY` ODER `DEXPAPRIKA_API_KEY`
- `MORALIS_BASE` / `DEXPAPRIKA_BASE`

### Tier 2 (Empfohlen) - 2-3 Keys
- `OPENAI_API_KEY` ODER `XAI_API_KEY` (für AI-Features)
- `ANALYSIS_AI_PROVIDER`

### Tier 3 (Optional) - 0+ Keys
- Push Notifications (5 Keys) - **DEAKTIVIERT**
- Solana Blockchain (6 Keys) - **DEAKTIVIERT**

**Vergleich:**

| Kategorie | Vorher (Full) | Nachher (Streamlined) | Reduktion |
|-----------|---------------|----------------------|-----------|
| **Gesamt ENV-Vars** | 51 | 15 | -71% |
| **Zwingend** | 2-3 | 2-3 | 0% |
| **AI-Provider** | 3 (OpenAI, Anthropic, xAI) | 2 (OpenAI, xAI) | -33% |
| **Push Notifications** | 5 | 0 | -100% |
| **Blockchain** | 6 | 0 | -100% |

---

## ⚠️ Wichtige Hinweise

### Sicherheit

- ✅ **NIEMALS** API-Keys in Git committen
- ✅ `.env.local` ist bereits in `.gitignore`
- ✅ Frontend-Keys (`VITE_*`) sind im Browser sichtbar → nur öffentliche Keys verwenden
- ✅ Backend-Keys (`MORALIS_API_KEY`, `OPENAI_API_KEY`, etc.) sind sicher und nicht im Browser sichtbar

### Vercel Deployment

1. Gehe zu: **Project Settings → Environment Variables**
2. Füge alle Keys hinzu (siehe Tabellen oben)
3. Wähle Umgebungen:
   - ✅ Production
   - ✅ Preview
   - ⚠️ Development (optional)

### Key-Validierung

Die App prüft automatisch, welche Keys gesetzt sind:

```bash
# Health-Check-Endpoint
curl https://your-app.vercel.app/api/health

# Antwort:
{
  "ok": true,
  "checks": {
    "env": {
      "dexpaprika": true,
      "openai": true,
      "vapid": false,
      "vapidPrivate": false
    }
  }
}
```

### Re-Aktivierung deaktivierter Features

Alle deaktivierten Services sind **auskommentiert** in `.env.example` und können bei Bedarf reaktiviert werden durch:
1. Kommentar in `.env.example` entfernen
2. API-Key eintragen in `.env.local`
3. Code ist bereits vorhanden - keine Änderungen nötig
4. Features aktivieren sich automatisch bei vorhandenen Keys

### Graceful Degradation

Die App verhält sich intelligent bei fehlenden Keys:
- ✅ Ohne AI-Keys: AI-Features disabled, Rest funktioniert
- ✅ Ohne Push-Keys: Keine Push-Notifications, Rest funktioniert
- ✅ Ohne Solana-Keys: Access-System disabled, Rest funktioniert
- ❌ Ohne Data-Provider: App startet nicht (kritisch!)

---

## 🎯 Vorteile der Streamlined Configuration

### ✅ Weniger Komplexität
- 15 statt 51 aktive ENV-Variablen (71% Reduktion)
- Fokus auf essenzielle Services
- Keine unnötigen Dependencies

### ✅ Schnelleres Setup
- Nur 2-3 API-Keys erforderlich für MVP
- Keine VAPID-Key-Generierung nötig
- Kein Solana-Keypair-Setup erforderlich

### ✅ Reduzierte Kosten
- Keine Solana RPC-Kosten
- Keine Anthropic-API-Kosten (falls nicht benötigt)
- Fokus auf 1-2 AI-Provider

### ✅ Wartbarkeit
- Weniger Moving Parts
- Einfacheres Debugging
- Klarere Verantwortlichkeiten

---

## 📚 Weitere Dokumentation

- **Deployment:** Siehe `DEPLOY_GUIDE.md`
- **Environment Variables:** Siehe `ENVIRONMENT_VARIABLES.md`
- **Build Scripts:** Siehe `BUILD_SCRIPTS_EXPLAINED.md`

---

**Erstellt:** 2025-11-09 (Konsolidiert)  
**Letzte Aktualisierung:** 2025-11-09  
**Basierend auf:** `API_KEYS_LIST.md` (2025-01-06) + `API_KEYS_STREAMLINED.md` (2025-11-07)  
**Status:** ✅ Aktiv & Vollständig
