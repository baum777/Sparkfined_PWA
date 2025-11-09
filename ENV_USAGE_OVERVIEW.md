# 🔧 ENV-Variablen Verwendungszweck

Alle aktiv genutzten Umgebungsvariablen mit jeweils einer Satzbeschreibung.

---

## ✅ Core App (2)

| Variable | Verwendungszweck |
|----------|------------------|
| `VITE_APP_VERSION` | Zeigt die App-Version in den Settings und im Footer an. |
| `VITE_VERCEL_ENV` | Erkennt die Deployment-Umgebung (production/preview/development) für Environment-spezifische Logik. |

---

## 📊 Data Providers (8)

| Variable | Verwendungszweck |
|----------|------------------|
| `VITE_MORALIS_API_KEY` | Frontend-Zugriff auf Moralis für Token-Daten und Blockchain-Informationen. |
| `VITE_MORALIS_BASE` | Basis-URL für Moralis API-Calls vom Frontend. |
| `MORALIS_API_KEY` | Backend-Zugriff auf Moralis für Server-seitige API-Calls. |
| `MORALIS_BASE` | Basis-URL für Moralis API-Calls vom Backend. |
| `VITE_DEXPAPRIKA_BASE` | Frontend-Zugriff auf DexPaprika API (alternative Datenquelle). |
| `DEXPAPRIKA_API_KEY` | Backend-Zugriff auf DexPaprika API mit Authentifizierung. |
| `DEXPAPRIKA_BASE` | Basis-URL für DexPaprika API-Calls vom Backend. |
| `VITE_DATA_PRIMARY` | Definiert den primären Datenanbieter (dexpaprika/moralis/mock). |
| `VITE_DATA_SECONDARY` | Definiert den Fallback-Datenanbieter wenn Primary fehlschlägt. |
| `VITE_DATA_FALLBACKS` | Komma-separierte Liste zusätzlicher Fallback-Datenquellen. |
| `DATA_PROXY_SECRET` | Autorisiert interne Requests an Moralis/DexPaprika-Proxys. |

---

## 🔗 External APIs (4)

| Variable | Verwendungszweck |
|----------|------------------|
| `DEX_API_BASE` | Basis-URL für DexScreener API-Calls. |
| `DEX_API_TIMEOUT` | Timeout in Millisekunden für DexScreener API-Requests. |
| `PUMPFUN_API_BASE` | Basis-URL für Pump.fun API-Calls. |
| `PUMPFUN_API_TIMEOUT` | Timeout in Millisekunden für Pump.fun API-Requests. |

---

## 🔗 Blockchain / Solana (5)

| Variable | Verwendungszweck |
|----------|------------------|
| `VITE_SOLANA_NETWORK` | Definiert das Solana-Netzwerk (mainnet-beta/devnet) für Wallet-Connections. |
| `VITE_SOLANA_RPC_URL` | Frontend RPC-Endpoint für Solana-Blockchain-Zugriffe. |
| `SOLANA_RPC_URL` | Backend RPC-Endpoint für Server-seitige Solana-Transaktionen. |
| `SOLANA_KEYPAIR_JSON` | Server-Keypair im JSON-Format für Signieren von Transaktionen (z.B. NFT-Minting). |
| `ACCESS_OG_SYMBOL` | Symbol für OG Access Pass NFTs (z.B. "OGPASS"). |
| `ACCESS_TOKEN_MINT` | Token Mint Address für Access System Halte-Anforderungen. |

---

## 🤖 AI Features (7)

| Variable | Verwendungszweck |
|----------|------------------|
| `OPENAI_API_KEY` | Backend-Zugriff auf OpenAI GPT-Modelle für AI-Analyse. |
| `ANTHROPIC_API_KEY` | Backend-Zugriff auf Claude AI als alternative AI-Engine. |
| `XAI_API_KEY` | Backend-Zugriff auf xAI/Grok als alternative AI-Engine. |
| `AI_MAX_COST_USD` | Maximale Kosten pro AI-Request in USD zur Kostenkontrolle. |
| `AI_CACHE_TTL_SEC` | Time-to-Live für AI-Response-Cache in Sekunden. |
| `AI_PROXY_SECRET` | Gemeinsames Secret zur Authentifizierung der internen AI-Proxy-Endpunkte. |
| `ANALYSIS_AI_PROVIDER` | Wählt den aktiven AI-Provider (openai/anthropic/xai/none). |

---

## 🔔 Push Notifications (5)

| Variable | Verwendungszweck |
|----------|------------------|
| `VITE_VAPID_PUBLIC_KEY` | Öffentlicher VAPID-Key für Web Push im Frontend (Browser-sichtbar). |
| `VAPID_PUBLIC_KEY` | Öffentlicher VAPID-Key für Backend Web Push Service. |
| `VAPID_PRIVATE_KEY` | Privater VAPID-Key für Backend zum Signieren von Push-Nachrichten. |
| `VAPID_SUBJECT` | Kontakt-Email im mailto-Format für VAPID-Authentifizierung. |
| `VAPID_CONTACT` | Alternative Kontakt-Email für VAPID-Service. |

---

## 🎛️ Feature Flags (5)

| Variable | Verwendungszweck |
|----------|------------------|
| `VITE_ENABLE_AI_TEASER` | Aktiviert/deaktiviert AI-Teaser-Feature im Frontend. |
| `VITE_ENABLE_ANALYTICS` | Aktiviert/deaktiviert Analytics-Tracking im Frontend. |
| `VITE_ENABLE_METRICS` | Aktiviert/deaktiviert Performance-Metriken-Sammlung. |
| `VITE_ORDERFLOW_PROVIDER` | Definiert Provider für Orderflow-Daten (none/provider-name). |
| `VITE_WALLETFLOW_PROVIDER` | Definiert Provider für Walletflow-Daten (none/provider-name). |

---

## ⚡ Performance Budgets (7)

| Variable | Verwendungszweck |
|----------|------------------|
| `PERF_BUDGET_START_MS` | Performance-Budget für App-Start in Millisekunden. |
| `PERF_BUDGET_API_MEDIAN_MS` | Median-Performance-Budget für API-Calls. |
| `PERF_BUDGET_AI_TEASER_P95_MS` | 95%-Perzentil-Budget für AI-Teaser-Rendering. |
| `PERF_BUDGET_REPLAY_OPEN_P95_MS` | 95%-Perzentil-Budget für Replay-Modal-Öffnen. |
| `PERF_BUDGET_JOURNAL_SAVE_MS` | Performance-Budget für Journal-Save-Operation. |
| `PERF_BUDGET_JOURNAL_GRID_MS` | Performance-Budget für Journal-Grid-Rendering. |
| `PERF_BUDGET_EXPORT_ZIP_P95_MS` | 95%-Perzentil-Budget für ZIP-Export-Operation. |

---

## 🛠️ Development & Debug (4)

| Variable | Verwendungszweck |
|----------|------------------|
| `VITE_DEBUG` | Aktiviert erweiterte Console-Logs auch in Production. |
| `VITE_ENABLE_DEBUG` | Alternative Debug-Flag für detailliertes Logging. |
| `DEV_API_URL` | Lokaler Mock-Server-URL für Development (z.B. http://localhost:8787). |
| `DEV_SKIP_HTTPS` | Überspringt HTTPS-Redirect für lokales Testing. |

---

## 📦 Deployment (Auto-konfiguriert)

Diese Variablen werden automatisch von Vercel gesetzt:

| Variable | Verwendungszweck |
|----------|------------------|
| `VERCEL` | Flag (1) zeigt an, dass App auf Vercel läuft. |
| `VERCEL_ENV` | Deployment-Environment (production/preview/development). |
| `VERCEL_URL` | Auto-generierte Preview-URL für das Deployment. |
| `VERCEL_GIT_COMMIT_SHA` | Git-Commit-Hash für Deployment-Tracking. |

---

## 📊 Zusammenfassung

 - **Total:** 53 ENV-Variablen
 - **Zwingend erforderlich:** 2 (VITE_APP_VERSION + mind. 1 Datenanbieter)
 - **Empfohlen:** 13 (AI, Data Proxies & Push Notifications)
 - **Optional:** 38 (Blockchain, Performance, Debug, etc.)
- **Auto-konfiguriert:** 4 (Vercel)

---

**Generiert am:** 2025-11-07  
**Basierend auf:** Aktiver Code-Analyse + `.env.example`
