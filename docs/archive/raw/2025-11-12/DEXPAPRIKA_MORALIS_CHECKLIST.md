# DexPaprika ↔ Moralis Integration — Detaillierte Prüfungs-Checkliste

**Zweck:** Diese Canvas-Datei enthält eine ausführliche, schritt-weise Checkliste, die ein AI-Agent (Claude/Codex) oder ein Reviewer ausführen kann, um die neue Architektur (DexPaprika-first Adapter + Moralis-Proxy) zu verifizieren, abzusichern und für Produktion/CI freizugeben.

---

## Schnellbefehle (zum Start)

```bash
pnpm install
pnpm test          # erwartet: ✅ tests green
pnpm lint          # erwartet: ✅ lint OK (only non-blocking legacy warnings)
pnpm build         # erwartet: ✅ build success
rg "priceAdapter|resetAdapterState|Candle" -S
```

---

# Checkliste (angepasst an die vorgenommenen Änderungen)

> Jedes Item enthält: **Was zu prüfen**, **wie zu prüfen (konkrete Befehle / Code-Snippets)**, **Akzeptanzkriterien** und **Remediation-Beispiele**.

## 1) Sanity: Build & Tests

**Was zu prüfen**

* Projekt baut, Tests laufen stabil.

**Wie zu prüfen**

* `pnpm test` → alle Tests sollen grün sein.
* `pnpm build` → Produktions-Build erfolgreich.
* `pnpm lint` → keine blocking errors.

**Akzeptanzkriterien**

* `pnpm test` ✅, `pnpm build` ✅, `pnpm lint` ✅ (nur nicht-blockende Warnings zulässig).

**Remediation**

* Fehler in Tests: prüfe Mocks, setze `resetAdapterState()` im `beforeEach`. Fix fehlende Exporte/Typfehler.

---

## 2) File-Locations / Namenskonventionen

**Was zu prüfen**

* Existenz und Pfade:

  * `src/lib/priceAdapter.ts`
  * `api/moralis/[...path].ts`
  * `src/types/candles.ts` oder `src/lib/types.ts` (exportiert `Candle`)
  * `.env.example` enthält `MORALIS_PROXY_TTL_MS`, `VITE_DEXPAPRIKA_BASE`, `MORALIS_BASE` usw.
  * `docs/SETUP_DEXPAPRIKA_MORALIS.md` vorhanden

**Wie zu prüfen**

```bash
rg "priceAdapter.ts|api/moralis/\\[...path\\].ts|MORALIS_PROXY_TTL_MS|Candle" -S
```

**Akzeptanzkriterien**

* Alle oben genannten Dateien vorhanden und nicht leer.

---

## 3) Adapter: DexPaprika-first Logik & Fallback

**Was zu prüfen**

* `priceAdapter` versucht zuerst DexPaprika.
* Kontrollierte Retries mit exponentiellem Backoff vorhanden.
* Provider-Cooldown bei wiederholten 429/5xx implementiert.
* Bei endgültigem Fehler ruft Adapter den Moralis-Fallback (`/api/moralis/token`) auf (Catch-all Proxy Route).

**Wie zu prüfen**

* Öffne `src/lib/priceAdapter.ts` und suche nach `VITE_DEXPAPRIKA_BASE`, `fetchWithRetry`/`backoff`, `cooldown`, `resetAdapterState()` und Fallback-Aufruf an `/api/moralis/token`.
* Tests prüfen: Mock 429/5xx → Adapter setzt Cooldown → Adapter nutzt Proxy.

**Akzeptanzkriterien**

* Implizite retry/backoff (z. B. sleep + `Math.pow(2, attempt)`) vorhanden.
* Threshold-basierter Cooldown aktiv.
* Tests verifizieren Cooldown + Fallback.

**Remediation**

* Implementiere cooldownMap/flags; exportiere `resetAdapterState()`; pflege Fallback-Call.

---

## 4) Retries / Backoff / Cooldown Behavior (konkret)

**Was zu prüfen**

* MaxRetries (z. B. 3) & exponentielles Backoff.
* Cooldown-Mechanismus mit config Timeout.
* `resetAdapterState()` setzt internen State.

**Wie zu prüfen**

* Suche im Adapter nach `MAX_RETRIES`, `BASE_DELAY_MS`, `sleep(...)`, `cooldownMap`.
* Verifiziere Unit-Test für `resetAdapterState()`.

**Akzeptanzkriterien**

* Exponentielles Backoff & Cooldown vorhanden; reset helper setzt Maps/flags zurück.

---

## 5) Moralis Proxy (server-side): Funktionalität & Sicherheit

**Was zu prüfen**

* `api/moralis/[...path].ts` nutzt `process.env.MORALIS_API_KEY` (server-only), NICHT `VITE_`.
* TTL-InMemory-Cache verwendet `MORALIS_PROXY_TTL_MS` (oder default).
* `Cache-Control` Header gesetzt (`s-maxage`, `stale-while-revalidate`).
* Keine Secrets in Logs/Responses.

**Wie zu prüfen**

* Öffne `api/moralis/[...path].ts`:

  * `const KEY = process.env.MORALIS_API_KEY`
  * `const TTL = Number(process.env.MORALIS_PROXY_TTL_MS) || 10000`
  * `res.setHeader('Cache-Control', 'public, max-age=..., s-maxage=..., stale-while-revalidate=...')`
* Smoke-test lokal:

```bash
curl -i "http://localhost:3000/api/moralis/token?network=ethereum&address=0x..."
# Expect 200 + Cache-Control header
```

**Akzeptanzkriterien**

* Proxy verwendet server-env und setzt ordentlich Cache-Header; TTL cache hits arbeiten.

**Remediation**

* Rename env var if needed, remove accidental `VITE_` usage, add `.env.example` entry.

---

## 6) Env Files & `.env.example`

**Was zu prüfen**

* `.env.example` enthält:

  * `VITE_DEXPAPRIKA_BASE=https://api.dexpaprika.com`
  * `VITE_DATA_PRIMARY=dexpaprika`
  * `MORALIS_BASE=https://deep-index.moralis.io/api/v2`
  * `MORALIS_API_KEY=` (placeholder)
  * `MORALIS_PROXY_TTL_MS=10000`

**Wie zu prüfen**

* `cat .env.example` oder `rg "MORALIS_PROXY_TTL_MS|VITE_DEXPAPRIKA_BASE" -n`

**Akzeptanzkriterien**

* `.env.example` synchron mit README (docs/SETUP_...).

---

## 7) Typen: `Candle` Export & Verwendung

**Was zu prüfen**

* `Candle` Typ exportiert und überall wiederverwendet.
* Keine `any` / unsichere casts in Mappern.
* Normalisiertes Objekt: `{ time:number, open:number, high:number, low:number, close:number, volume?:number }`.

**Wie zu prüfen**

* Suche `export type Candle` oder `interface Candle`.
* Prüfe `mapDexPaprikaCandles()` / `mapMoralisCandles()`.

**Akzeptanzkriterien**

* `Candle` exportiert & importiert; TS-Compiler wirft keine Fehler in Chart-Code.

---

## 8) Tests: `resetAdapterState()` & Test-Stabilität

**Was zu prüfen**

* Tests nutzen `resetAdapterState()` in `beforeEach`.
* Tests decken:

  * DexPaprika success path
  * DexPaprika 429/5xx → fallback to Moralis
  * Moralis proxy basic validation (X-API-Key header + TTL)

**Wie zu prüfen**

* Öffne Tests und prüfe Mocks; ensure `beforeEach(() => resetAdapterState())` vorhanden.
* `pnpm test -- -u`

**Akzeptanzkriterien**

* Tests stabil lokal & CI; `pnpm test` grün.

**Remediation**

* Bei Flakiness: prüfe asynchrone `await`-Nutzung, entferne global mutable state, setze reset helper.

---

## 9) Data Shape Normalisierung (DexPaprika ↔ Moralis)

**Was zu prüfen**

* Adapter normalisiert beide Provider zu `Candle[]`.
* Zeitformat konsistent (z. B. epoch seconds).

**Wie zu prüfen**

* Prüfe Mapper: `Math.floor(new Date(...).getTime()/1000)` etc.
* Chart-Consumer: welche Zeitunit erwartet wird.

**Akzeptanzkriterien**

* Chart rendert korrekt bei Daten beider Provider.

---

## 10) Rate-Limits, Retries & Circuit Breaker Telemetry

**Was zu prüfen**

* Retries limit vorhanden.
* Circuit breaker/cooldown toggles provider für N Sekunden nach threshold.
* Telemetry increments fallback counters (ohne Secrets).

**Wie zu prüfen**

* Suche `fallbackCounter`, `metrics.increment`, `Sentry.captureMessage`.
* Unit test: simuliere 429s und prüfe `metrics` oder console log.

**Akzeptanzkriterien**

* Counters/logs existieren; circuit breaker verhindert sofortige retries.

---

## 11) Lint / Safe Casting / Removed Unsafe Assertions

**Was zu prüfen**

* Keine `as any` oder unnötige `!` Assertions in den geänderten Bereichen.
* `pnpm lint` keine blocking errors.

**Wie zu prüfen**

```bash
rg "as any|!\)|// @ts-ignore" -S src | sed -n '1,200p'
pnpm lint
```

**Akzeptanzkriterien**

* Nur dokumentierte Legacy-Warnings bleiben.

---

## 12) Journal / Temp Cleanup Hardened

**Was zu prüfen**

* `TempEntry` Typ deklariert; Lösch-Schleifen sicher (`for...of` + `await`).
* Keine object→string coercions in API-Handler oder Client-Sanitizer.

**Wie zu prüfen**

* Inspect Journal Module, suche `TempEntry`, `forEach` mit async.

**Akzeptanzkriterien**

* Typsichere Lösch-Loops; TS-Warnings entfernt.

---

## 13) Docs / README / PR Artifacts

**Was zu prüfen**

* `docs/SETUP_DEXPAPRIKA_MORALIS.md` aktuell (Moralis v2.2 base URL).
* `.env.example` & README sind synchron.
* PR Canvas/CHANGELOG/PR-Body Artefakte vorhanden.

**Wie zu prüfen**

* Öffne die Docs und vergleiche die URLs / Env-Namen mit Code.

**Akzeptanzkriterien**

* Docs sind konsistent und verständlich für DevOps / Reviewer.

---

## 14) Smoke Tests (Manual)

**Was zu prüfen / How to run**

* DexPaprika direct:

```bash
curl -s "https://api.dexpaprika.com/networks/ethereum/tokens/0x...ADDRESS" | jq '.summary.price_usd'
```

* Local Moralis proxy:

```bash
curl -i "http://localhost:3000/api/moralis/token?network=ethereum&address=0x...ADDRESS"
# check: HTTP/1.1 200 OK and Cache-Control header
```

* Adapter fallback run (simulate DexPaprika down by mocking fetch): assert adapter uses `/api/moralis/token`.

**Akzeptanzkriterien**

* Valid JSON from DexPaprika; proxy returns 200 + cache headers; adapter fallback works.

---

## 15) CI / Vercel Env Checks

**Was zu prüfen**

* CI verwendet richtige Env-Konfiguration. Vercel Settings enthalten:

  * `VITE_DEXPAPRIKA_BASE` -> Preview + Production
  * `MORALIS_API_KEY`, `MORALIS_BASE` -> server-only
  * `MORALIS_PROXY_TTL_MS`

**Wie zu prüfen**

* Prüfe `.github/workflows` für `pnpm build` steps; prüfe Vercel UI (manuell).

**Akzeptanzkriterien**

* Deploys succeed in Preview & Prod after envs set.

---

## 16) Observability & Alerts

**Was zu prüfen**

* Fallback ratio metric & threshold alert plan vorhanden.
* Errors emitted to Sentry/monitoring (no secrets logged).

**Wie zu prüfen**

* Suche `metrics.` / `Sentry` / `fallbackCounter`.

**Akzeptanzkriterien**

* Team kann alerted werden, wenn fallback rate spikes.

---

## Final Sign-Off (Markiere grün wenn alle erfüllt)

* [ ] `pnpm test` ✅ (stable)
* [ ] `pnpm build` ✅
* [ ] `pnpm lint` ✅ (only non-blocking warnings)
* [ ] `src/lib/priceAdapter.ts` DexPaprika-first + backoff + cooldown + fallback ✅
* [ ] `/api/moralis/token` uses `process.env.MORALIS_API_KEY`, TTL from `MORALIS_PROXY_TTL_MS`, sets `Cache-Control` ✅
* [ ] `Candle` type exported and used ✅
* [ ] `resetAdapterState()` present and used by tests ✅
* [ ] `.env.example` + `docs/SETUP_DEXPAPRIKA_MORALIS.md` synced ✅
* [ ] Tests cover success + fallback + proxy validation ✅
* [ ] No secrets in repo / `VITE_` usage only for client-safe values ✅
* [ ] Telemetry / metrics for fallback in place (or PR to add) ✅

---

## Optional: Automatisierbare Artefakte

Wenn du möchtest, kann ich aus dieser Canvas direkt generieren (paste-ready):

1. `verify_integration.sh` (Shell-Script mit `rg`, `curl`, `pnpm` checks)
2. PR-ready Reviewer-Checklist (Markdown block) zum Copy-Pasten in PR Body

Sag mir welches Artefakt du möchtest — ich generiere es hier im Canvas als separate Datei/Snippet.

---

*Ende der Canvas.*
