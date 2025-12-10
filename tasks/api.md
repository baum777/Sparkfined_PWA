# keys config etc


Wichtigste Links (zur Prüfung / vollständigen Referenz)
- API keys overview (docs): https://github.com/baum777/Sparkfined_PWA/blob/c989558135e403c4a100a86dab71f1b81cce2a82/docs/archive/raw/2025-11-12/API_KEYS.md
- Environment / providers doc: https://github.com/baum777/Sparkfined_PWA/blob/c989558135e403c4a100a86dab71f1b81cce2a82/docs/core/setup/environment-and-providers.md
- Env inventory: https://github.com/baum777/Sparkfined_PWA/blob/c989558135e403c4a100a86dab71f1b81cce2a82/docs/core/setup/env_inventory.md
- Repo root: https://github.com/baum777/Sparkfined_PWA

Übersicht — API-Keys für einen Test-Run (Gruppiert)

1) Minimal / zwingend (für normale Testläufe / Build-Scripts)
- MORALIS_API_KEY (server-only secret) — primärer Moralis-Proxy-Key; scripts/check-env verlangt diesen als REQUIRED_SERVER_VARS.
- VITE_APP_VERSION (nicht geheim, aber nötig / wird erwartet)

Hinweis: Die Codebasis erlaubt alternativ DexPaprika als Datenprovider; wenn du DexPaprika statt Moralis nutzen willst, ersetze MORALIS durch DexPaprika-Varianten (siehe unten). In CI/Prod prüft scripts/check-env aktuell explizit MORALIS_API_KEY.

2) Alternative Datenprovider (wähle mindestens eine Option)
- DEXPAPRIKA_API_KEY (alternativ zu MORALIS_API_KEY)
- MORALIS_BASE oder DEXPAPRIKA_BASE (Basis-URLs; nicht geheime Endpunkte, aber konfiguriert)

3) Empfohlen / für AI-Features / Tests mit AI
- OPENAI_API_KEY (OpenAI)
- XAI_API_KEY oder GROK_API_KEY (xAI / Grok) — mehrere Stellen referenzieren XAI_API_KEY / GROK_API_KEY
- ANALYSIS_AI_PROVIDER (Konfiguration, z. B. openai / grok) — nicht secret, aber relevant
- AI_MAX_COST_USD, AI_CACHE_TTL_SEC (Konfigurations-Keys, optional)

4) Optional / erweiterte Features (nur falls getestet)
- VAPID_PUBLIC_KEY (Backend public)
- VAPID_PRIVATE_KEY (Backend, NEVER expose)
- VITE_VAPID_PUBLIC_KEY (Frontend-safe public key)
- VAPID_SUBJECT (Kontakt-Mail für VAPID)

- Solana / Blockchain (derzeit deaktiviert, nur falls du Blockchain-Tests laufen lässt)
  - VITE_SOLANA_NETWORK
  - VITE_SOLANA_RPC_URL (frontend)
  - SOLANA_RPC_URL (backend)
  - SOLANA_KEYPAIR_JSON (server signing keypair)
  - ACCESS_OG_SYMBOL, ACCESS_TOKEN_MINT

5) Frontend (nicht-sekrete VITE_* Variablen, für UI/tests)
- VITE_API_BASE_URL
- VITE_API_KEY (optional, public)
- VITE_DATA_PRIMARY / VITE_DATA_SECONDARY / VITE_DATA_FALLBACKS
- VITE_ENABLE_ANALYTICS, VITE_ENABLE_DEBUG, VITE_ENABLE_AI_TEASER
- VITE_DEXPAPRIKA_BASE, VITE_MORALIS_BASE (frontend base URLs)

6) Sonstige Monitoring / Integrations (optional)
- Sentry DSN (wenn Sentry-Tests laufen) — wird als ENV in tasks/docs erwähnt, Name nicht exakt angegeben in gesuchten Stellen (prüfen)
- Weitere provider-keys (Anthropic: VITE_ANTHROPIC_API_KEY oder ANTHROPIC_API_KEY) — in Docs referenziert

Kurz‑Anleitung / Hinweise zum Testen
- Wenn du lokal ohne echte Provider testen willst: setze DEV_USE_MOCKS=true — mehrere Docs/Smoke-Tests erwähnen das als Option, um echte Moralis/OpenAI-Calls zu vermeiden.
- Vor CI/Build: pnpm run check-env (scripts/check-env.js) prüft aktuell MORALIS_API_KEY und verhindert Build in striktem CI/Prod-Kontext, falls fehlend.
- Server-secrets dürfen NIE mit VITE_ prefix gesetzt werden (Frontend würde sie exposen).

Wenn du möchtest, erstelle ich dir:
- eine beispielhafte .env.local Vorlage mit den minimal notwendigen Variablen (und Kommentaren), oder
- eine Checkliste genau für deinen Test-Run (z. B. Unit-/Integration-/E2E), welche Keys in welcher Umgebung gesetzt werden müssen.

Noch ein Hinweis: die oben gelisteten Keys basieren auf den Repository‑Dokumenten und Quelle(n) — prüfe bitte die verlinkten Dateien für vollständige Details oder sag mir, welche Art von Test-Run (lokal / CI / e2e / AI-enabled) du genau planst, dann bereite ich die passende .env-Vorlage.
