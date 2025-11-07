# 📋 Liste aller benötigten API-Keys

**Stand:** 2025-01-06  
**Zweck:** Vollständige Übersicht aller API-Keys, die zum Starten der App benötigt werden

---

## 🚨 Mindestanforderungen (MVP - App startet)

### ✅ Zwingend erforderlich

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **Moralis API Key** | `MORALIS_API_KEY` | Backend-Key für Marktdaten (OHLC, Token-Info) | [admin.moralis.io](https://admin.moralis.io/) |
| **Moralis Base URL** | `MORALIS_BASE` | API-Basis-URL (Standard: `https://deep-index.moralis.io/api/v2.2`) | - |
| **App Version** | `VITE_APP_VERSION` | Versionsnummer (z.B. `1.0.0-beta`) | Manuell setzen |

**Alternative zu Moralis:**
| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **DexPaprika API Key** | `DEXPAPRIKA_API_KEY` | Alternative Datenquelle | Kontakt: DexPaprika |
| **DexPaprika Base URL** | `DEXPAPRIKA_BASE` | API-Basis-URL (Standard: `https://api.dexpaprika.com`) | - |

> **Hinweis:** Mindestens **einer** der beiden Datenprovider (Moralis ODER DexPaprika) ist erforderlich.

---

## 🎯 Empfohlen (für volle Funktionalität)

### AI-Features (optional, aber empfohlen)

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **OpenAI API Key** | `OPENAI_API_KEY` | Für AI-Analysen und Zusammenfassungen | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Anthropic API Key** | `ANTHROPIC_API_KEY` | Alternative AI-Provider (Claude) | [console.anthropic.com](https://console.anthropic.com/) |
| **xAI/Grok API Key** | `XAI_API_KEY` | Alternative AI-Provider (Grok) | Kontakt: xAI |

> **Hinweis:** Mindestens **einer** AI-Provider ist für AI-Features erforderlich. Die App funktioniert auch ohne AI-Keys, aber AI-Features sind dann deaktiviert.

### Push-Benachrichtigungen

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **VAPID Public Key** | `VITE_VAPID_PUBLIC_KEY` | Öffentlicher Key für Web Push (Frontend) | `npx web-push generate-vapid-keys` |
| **VAPID Public Key** | `VAPID_PUBLIC_KEY` | Öffentlicher Key (Backend) | Gleicher Befehl |
| **VAPID Private Key** | `VAPID_PRIVATE_KEY` | Privater Key (Backend, NIEMALS im Frontend!) | Gleicher Befehl |
| **VAPID Subject** | `VAPID_SUBJECT` | Kontakt-E-Mail (z.B. `mailto:admin@example.com`) | Manuell setzen |
| **VAPID Contact** | `VAPID_CONTACT` | Alternative Kontakt-E-Mail | Gleiche wie Subject |

> **Generierung:** Führe `npx web-push generate-vapid-keys` aus und kopiere die Keys.

---

## 🔧 Optional (für erweiterte Features)

### Alert-System (Redis)

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **Upstash Redis REST URL** | `UPSTASH_REDIS_REST_URL` | Redis-REST-URL für Alert-Worker | [upstash.com](https://upstash.com/) |
| **Upstash Redis REST Token** | `UPSTASH_REDIS_REST_TOKEN` | Redis-REST-Token | Gleiches Dashboard |

### Blockchain (Solana)

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **Solana RPC URL** | `VITE_SOLANA_RPC_URL` | Solana RPC-Endpoint (Frontend) | [Helius](https://helius.xyz/), [QuickNode](https://www.quicknode.com/) |
| **Solana RPC URL** | `SOLANA_RPC_URL` | Solana RPC-Endpoint (Backend) | Gleiche Anbieter |
| **Solana Keypair JSON** | `SOLANA_KEYPAIR_JSON` | Server-Keypair für Signing | Generieren mit Solana CLI |

### Token Vesting (StreamFlow)

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **StreamFlow API Key** | `STREAMFLOW_API_KEY` | API-Key für Token-Vesting | [streamflow.finance](https://streamflow.finance) |
| **StreamFlow API Base** | `STREAMFLOW_API_BASE` | API-Basis-URL (Standard: `https://api.streamflow.finance`) | - |

### Datenbank (optional)

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **Database URL** | `DATABASE_URL` | PostgreSQL-Verbindungsstring | Vercel Postgres, Neon, Supabase |
| **Supabase URL** | `SUPABASE_URL` | Supabase-Projekt-URL | [supabase.com](https://supabase.com/) |
| **Supabase Service Key** | `SUPABASE_SERVICE_KEY` | Supabase Service-Role-Key | Gleiches Dashboard |

### Analytics & Monitoring

| API-Key | Umgebungsvariable | Beschreibung | Wo bekommen? |
|---------|-------------------|--------------|--------------|
| **Sentry DSN** | `VITE_SENTRY_DSN` | Sentry DSN für Error-Tracking (Frontend) | [sentry.io](https://sentry.io/) |
| **Sentry Auth Token** | `SENTRY_AUTH_TOKEN` | Sentry Auth-Token | Gleiches Dashboard |
| **Sentry Org** | `SENTRY_ORG` | Sentry-Organisations-Slug | Gleiches Dashboard |
| **Sentry Project** | `SENTRY_PROJECT` | Sentry-Projekt-Slug | Gleiches Dashboard |
| **Umami Website ID** | `VITE_UMAMI_WEBSITE_ID` | Umami-Website-ID für Analytics | [umami.is](https://umami.is/) |
| **Umami Script URL** | `VITE_UMAMI_SRC` | Umami-Script-URL (self-hosted) | Eigene Umami-Instanz |

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

## 🚀 Schnellstart-Checkliste

### Minimum (App startet, aber eingeschränkt)

```bash
# 1. App-Version
VITE_APP_VERSION=1.0.0-beta

# 2. Mindestens EIN Datenprovider (wähle eine Option):

# Option A: Moralis (empfohlen)
MORALIS_API_KEY=your_moralis_key_here
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2

# ODER Option B: DexPaprika
DEXPAPRIKA_API_KEY=your_dexpaprika_key_here
DEXPAPRIKA_BASE=https://api.dexpaprika.com
```

### Empfohlen (volle Funktionalität)

```bash
# Alle Mindestanforderungen PLUS:

# AI-Features (mindestens einer)
OPENAI_API_KEY=sk-...
# ODER
ANTHROPIC_API_KEY=sk-ant-...
# ODER
XAI_API_KEY=xai-...

# Push-Benachrichtigungen
VAPID_PUBLIC_KEY=BNF7...
VAPID_PRIVATE_KEY=...
VITE_VAPID_PUBLIC_KEY=BNF7...  # Gleicher Wert wie VAPID_PUBLIC_KEY
VAPID_SUBJECT=mailto:admin@example.com
VAPID_CONTACT=mailto:admin@example.com
```

### Vollständig (alle Features)

```bash
# Alle oben genannten PLUS:

# Alert-System
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Solana (für Access-System)
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Analytics
VITE_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

---

## 🔗 Links zu API-Key-Quellen

| Service | Link | Beschreibung |
|---------|------|--------------|
| **Moralis** | [admin.moralis.io](https://admin.moralis.io/) | Blockchain-Daten-API |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | AI-API |
| **Anthropic** | [console.anthropic.com](https://console.anthropic.com/) | Claude AI-API |
| **Upstash Redis** | [upstash.com](https://upstash.com/) | Redis für Alerts |
| **Sentry** | [sentry.io](https://sentry.io/) | Error-Tracking |
| **Helius** | [helius.xyz](https://helius.xyz/) | Solana RPC |
| **QuickNode** | [quicknode.com](https://www.quicknode.com/) | Solana RPC |
| **Supabase** | [supabase.com](https://supabase.com/) | Datenbank |
| **Umami** | [umami.is](https://umami.is/) | Analytics (self-hosted) |

---

## ⚠️ Wichtige Hinweise

### Sicherheit

- ✅ **NIEMALS** API-Keys in Git committen
- ✅ `.env.local` ist bereits in `.gitignore`
- ✅ Frontend-Keys (`VITE_*`) sind im Browser sichtbar → nur öffentliche Keys verwenden
- ✅ Backend-Keys (`MORALIS_API_KEY`, `OPENAI_API_KEY`, etc.) sind sicher und nicht im Browser sichtbar

### Vercel Deployment

1. Gehe zu: **Project Settings → Environment Variables**
2. Füge alle Keys hinzu (siehe Tabelle oben)
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
      "vapid": true,
      "vapidPrivate": true
    }
  }
}
```

---

## 📊 Priorisierung

### Tier 1 (Zwingend erforderlich)
- `VITE_APP_VERSION`
- `MORALIS_API_KEY` ODER `DEXPAPRIKA_API_KEY`

### Tier 2 (Empfohlen)
- `OPENAI_API_KEY` (für AI-Features)
- `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` (für Push)

### Tier 3 (Optional)
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (für Alerts)
- `VITE_SENTRY_DSN` (für Error-Tracking)
- `SOLANA_RPC_URL` (für Blockchain-Features)

---

**Letzte Aktualisierung:** 2025-01-06  
**Basierend auf:** `.env.example`, `docs/ENVIRONMENT_VARIABLES.md`, Code-Analyse
