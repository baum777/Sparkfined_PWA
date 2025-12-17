---
title: "Environment & Datenprovider Setup"
summary: "Konfiguration von API-Keys, Umgebungsvariablen und Datenquellen (Moralis/DexPaprika)."
sources:
  - docs/archive/raw/2025-11-12/API_KEYS.md
  - docs/archive/raw/2025-11-12/ENVIRONMENT_VARIABLES.md
  - docs/archive/raw/2025-11-12/ENV_USAGE_OVERVIEW.md
  - docs/archive/raw/2025-11-12/SETUP_DEXPAPRIKA_MORALIS.md
  - docs/archive/raw/2025-11-12/DEXPAPRIKA_MORALIS_CHECKLIST.md
---

<!-- merged_from: docs/archive/raw/2025-11-12/API_KEYS.md; docs/archive/raw/2025-11-12/ENVIRONMENT_VARIABLES.md; docs/archive/raw/2025-11-12/ENV_USAGE_OVERVIEW.md; docs/archive/raw/2025-11-12/SETUP_DEXPAPRIKA_MORALIS.md; docs/archive/raw/2025-11-12/DEXPAPRIKA_MORALIS_CHECKLIST.md -->

## Mindestkonfiguration
| Variable | Zweck | Quelle |
| --- | --- | --- |
| `VITE_APP_VERSION` | Build-Metadaten im Frontend anzeigen. | Manuell setzen. |
| `MORALIS_API_KEY` | Primäre Marktdaten (Backend). | [admin.moralis.io](https://admin.moralis.io/) |
| `MORALIS_BASE` | Basis-URL Moralis (Backend). | Standard `https://deep-index.moralis.io/api/v2.2` |
| `DEXPAPRIKA_API_KEY` | Alternativer Datenprovider. | Kontakt DexPaprika. |
| `DEXPAPRIKA_BASE` | Basis-URL DexPaprika. | `https://api.dexpaprika.com` |
| `VITE_DATA_PRIMARY` / `VITE_DATA_SECONDARY` | Provider-Priorität (Frontend). | `dexpaprika` / `moralis`. |
| `HELIUS_API_KEY` | Solana DAS `getAssetsByOwner` (Server: `/api/wallet/assets`). | [helius.dev](https://www.helius.dev/) |

> Mindestens ein Datenprovider (Moralis oder DexPaprika) muss aktiv sein.

## Empfohlene Erweiterungen
- **AI**: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, optional `XAI_API_KEY`; konfiguriert via `/api/ai/assist` Proxy mit `ANALYSIS_AI_PROVIDER`, `AI_MAX_COST_USD`, `AI_CACHE_TTL_SEC`.
- **Push**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (Backend only). Frontend erhält nur `VITE_VAPID_PUBLIC_KEY`.
- **Solana Access**: `VITE_SOLANA_NETWORK`, `VITE_SOLANA_RPC_URL`, `SOLANA_RPC_URL`, `SOLANA_KEYPAIR_JSON`, `ACCESS_OG_SYMBOL`, `ACCESS_TOKEN_MINT` (derzeit deaktiviert, für OG Pass vorgesehen).

## `.env` Struktur (Beispiel)
```
# Core
VITE_APP_VERSION=1.0.0-beta
MORALIS_API_KEY=...
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2
DEXPAPRIKA_API_KEY=...
DEXPAPRIKA_BASE=https://api.dexpaprika.com
VITE_DATA_PRIMARY=dexpaprika
VITE_DATA_SECONDARY=moralis

# AI
ANALYSIS_AI_PROVIDER=openai
OPENAI_API_KEY=...
AI_MAX_COST_USD=0.25
AI_CACHE_TTL_SEC=3600

# Optional
VITE_ENABLE_AI_TEASER=false
VITE_ENABLE_ANALYTICS=false

# Solana Wallet Holdings (Server-only)
HELIUS_API_KEY=...
```

## Provider-spezifische Schritte
1. **Moralis**
   - API-Key anfordern → `.env` setzen → `scripts/setup-moralis.ts` (siehe Original-Checkliste) ausführen.
   - Rate Limits beachten; Fallback definieren (`VITE_DATA_SECONDARY`).
2. **DexPaprika**
   - Key anfordern, im Backend & Frontend eintragen.
   - Health-Check Endpoint: `/api/data/health` (liefert Provider-Status).
   - Verwaltet OHLC, Token-Metadata, Heatmap-Kacheln.
3. **Helius (Solana Assets)**
   - Server-Only Key: `HELIUS_API_KEY`
   - Endpoint: `https://mainnet.helius-rpc.com/?api-key=...` mit RPC-Methode `getAssetsByOwner`
   - Intern genutzt von `/api/wallet/assets?owner=<pubkey>` für Dashboard-Holdings (SOL + SPL fungibles).
4. **Fallback-Logik**
   - `ENV_USAGE_OVERVIEW` beschreibt, welche Module welche Variablen benötigen (Chart, Analyze, Journal, Serverless APIs).
   - Empfohlen: Monitoring über Telemetrie, wenn Provider-Switch ausgelöst wird.

## Checkliste vor Deployment
- [ ] `.env` lokal & auf Vercel gepflegt.
- [ ] Secrets nie als `VITE_` setzen, wenn sie nicht im Browser benötigt werden.
- [ ] Test-Call `/api/data/ohlc?address=...` + `/api/journal` lokal.
- [ ] Fallback-Pfade (`VITE_DATA_FALLBACKS`) gepflegt.
