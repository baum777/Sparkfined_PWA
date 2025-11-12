# Testmatrix — Übersicht

| Event ID | Test Case | Type | Priority | Est. Runtime | Mock Required | Quick Pass Criteria |
|---|---:|---|---:|---:|---:|---|
| events/analyze-bullets-ai | ABA-UNIT-001 | unit | P0 | short | no | fetch called once with templateId |
| events/analyze-bullets-ai | ABA-INTEG-010 | integration | P0 | short | yes | response.text contains Mocked bullet |
| events/analyze-bullets-ai | ABA-SMOKE-020 | smoke | P1 | short | no | hook result.ok === true |
| events/analyze-bullets-ai | ABA-E2E-040 | e2e | P1 | long | yes | toast visible within 30s |
| events/analyze-bullets-ai | ABA-PERF-050 | performance | P1 | short | no | elapsed < 300ms |
| events/analyze-bullets-ai | ABA-SEC-060 | security | P0 | short | no | sanitized payload lacks email |
| events/journal-condense-ai | JCA-UNIT-001 | unit | P0 | short | no | body.system equals expected |
| events/journal-condense-ai | JCA-INTEG-010 | integration | P0 | short | yes | text contains Kontext |
| events/journal-condense-ai | JCA-SMOKE-020 | smoke | P1 | short | no | hook text contains Kontext |
| events/journal-condense-ai | JCA-E2E-040 | e2e | P1 | long | yes | AI Verdichtung toast visible |
| events/journal-condense-ai | JCA-PERF-050 | performance | P1 | short | no | elapsed < 350ms |
| events/journal-condense-ai | JCA-SEC-060 | security | P0 | short | no | payload contains [redacted-phone] |
| events/teaser-vision-analysis | TVA-UNIT-001 | unit | P1 | short | no | provider equals heuristic |
| events/teaser-vision-analysis | TVA-INTEG-010 | integration | P1 | medium | yes | sr_levels[0].label === S1 |
| events/teaser-vision-analysis | TVA-SMOKE-020 | smoke | P2 | short | no | provider downgraded to heuristic |
| events/teaser-vision-analysis | TVA-E2E-040 | e2e | P2 | long | yes | Teaser analysis text visible |
| events/teaser-vision-analysis | TVA-PERF-050 | performance | P2 | short | no | elapsed < 400ms |
| events/teaser-vision-analysis | TVA-SEC-060 | security | P1 | short | no | wallet masked as wallet://REDACTED |

---

## Event: events/analyze-bullets-ai

### ABA-UNIT-001 — Unit — P0
**Beschreibung:** Verifiziert, dass `aiAssist` den Template-Body korrekt zusammenstellt.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=ABA-UNIT-001`
**Input Fixture:** `tests/fixtures/analyze-bullets-ai/sample-vars.json`
**Expected Output Schema:** `{ ok: boolean, text?: string }`
**Run Command:** `pnpm vitest --run --testNamePattern=ABA-UNIT-001`
**Pass Criteria:** Fetch-Aufruf einmalig mit `templateId === 'v1/analyze_bullets'`.

### ABA-INTEG-010 — Integration — P0
**Beschreibung:** Testet den Proxy-Fluss mit `tests/mocks/aiProxyMock.ts`.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=ABA-INTEG-010`
**Input Fixture:** `tests/fixtures/analyze-bullets-ai/sample-vars.json`
**Expected Output Schema:** `{ ok: true, provider: string, text: string }`
**Run Command:** `pnpm vitest --run --testNamePattern=ABA-INTEG-010`
**Pass Criteria:** Antworttext enthält "Mocked bullet".

### ABA-SMOKE-020 — Smoke — P1
**Beschreibung:** Hook `useAssist` speichert Antworten im Zustand.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=ABA-SMOKE-020`
**Input Fixture:** `tests/fixtures/analyze-bullets-ai/sample-vars.json`
**Expected Output Schema:** `AssistResult`
**Run Command:** `pnpm vitest --run --testNamePattern=ABA-SMOKE-020`
**Pass Criteria:** `result.current.result?.ok === true`.

### ABA-E2E-040 — E2E — P1
**Beschreibung:** Playwright-Szenario über das Analyze-Dashboard.
**Setup Steps:**
1. `pnpm install`
2. `pnpm playwright test --grep ABA-E2E-040`
**Input Fixture:** `tests/fixtures/analyze-bullets-ai/sample-vars.json`
**Expected Output Schema:** UI-Toast mit AI-Ergebnis sichtbar.
**Run Command:** `pnpm playwright test --grep ABA-E2E-040`
**Pass Criteria:** Toast erscheint binnen 30s (Mock/Seed erforderlich).

### ABA-PERF-050 — Performance — P1
**Beschreibung:** Stellt sicher, dass gecachte Antworten <300ms dauern.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=ABA-PERF-050`
**Input Fixture:** `tests/fixtures/analyze-bullets-ai/sample-vars.json`
**Expected Output Schema:** `AssistResult`
**Run Command:** `pnpm vitest --run --testNamePattern=ABA-PERF-050`
**Pass Criteria:** Gemessene Laufzeit < 300ms.

### ABA-SEC-060 — Security — P0
**Beschreibung:** Prüft E-Mail-Redaktion vor AI-Calls.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=ABA-SEC-060`
**Input Fixture:** `tests/fixtures/analyze-bullets-ai/sample-vars.json`
**Expected Output Schema:** `string`
**Run Command:** `pnpm vitest --run --testNamePattern=ABA-SEC-060`
**Pass Criteria:** Keine Roh-E-Mail-Adressen im Payload.

---

## Event: events/journal-condense-ai

### JCA-UNIT-001 — Unit — P0
**Beschreibung:** Sicherstellung, dass System-/User-Prompts an den Proxy durchgereicht werden.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=JCA-UNIT-001`
**Input Fixture:** `tests/fixtures/journal-condense-ai/draft.json`
**Expected Output Schema:** `{ system: string, user: string }`
**Run Command:** `pnpm vitest --run --testNamePattern=JCA-UNIT-001`
**Pass Criteria:** Body enthält korrekten System-String.

### JCA-INTEG-010 — Integration — P0
**Beschreibung:** Mocked Proxy liefert kondensierte Bullets.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=JCA-INTEG-010`
**Input Fixture:** `tests/fixtures/journal-condense-ai/draft.json`
**Expected Output Schema:** `{ ok: true, text: string }`
**Run Command:** `pnpm vitest --run --testNamePattern=JCA-INTEG-010`
**Pass Criteria:** Antwort enthält "Kontext".

### JCA-SMOKE-020 — Smoke — P1
**Beschreibung:** Hook `run()` aktualisiert Zustand mit Verdichtung.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=JCA-SMOKE-020`
**Input Fixture:** `tests/fixtures/journal-condense-ai/draft.json`
**Expected Output Schema:** `AssistResult`
**Run Command:** `pnpm vitest --run --testNamePattern=JCA-SMOKE-020`
**Pass Criteria:** Text enthält "Kontext".

### JCA-E2E-040 — E2E — P1
**Beschreibung:** Playwright-Skript klickt „Verdichten“ und wartet auf Toast.
**Setup Steps:**
1. `pnpm install`
2. `pnpm playwright test --grep JCA-E2E-040`
**Input Fixture:** `tests/fixtures/journal-condense-ai/draft.json`
**Expected Output Schema:** UI Toast sichtbar.
**Run Command:** `pnpm playwright test --grep JCA-E2E-040`
**Pass Criteria:** Toast „AI Verdichtung" erscheint in 30s.

### JCA-PERF-050 — Performance — P1
**Beschreibung:** Mock-Latenz <350ms.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=JCA-PERF-050`
**Input Fixture:** `tests/fixtures/journal-condense-ai/draft.json`
**Expected Output Schema:** `AssistResult`
**Run Command:** `pnpm vitest --run --testNamePattern=JCA-PERF-050`
**Pass Criteria:** Laufzeit unter 350ms.

### JCA-SEC-060 — Security — P0
**Beschreibung:** Telefonnummern werden vor Versand redaktioniert.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=JCA-SEC-060`
**Input Fixture:** `tests/fixtures/journal-condense-ai/draft.json`
**Expected Output Schema:** `string`
**Run Command:** `pnpm vitest --run --testNamePattern=JCA-SEC-060`
**Pass Criteria:** Text enthält `[redacted-phone]` statt Klartext.

---

## Event: events/teaser-vision-analysis

### TVA-UNIT-001 — Unit — P1
**Beschreibung:** Prüft Heuristik-Fallback (`provider === 'heuristic'`).
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=TVA-UNIT-001`
**Input Fixture:** `tests/fixtures/teaser-vision-analysis/payload.json`
**Expected Output Schema:** `AITeaserAnalysis`
**Run Command:** `pnpm vitest --run --testNamePattern=TVA-UNIT-001`
**Pass Criteria:** `provider` wird auf `heuristic` gesetzt.

### TVA-INTEG-010 — Integration — P1
**Beschreibung:** Nutzt `tests/mocks/openaiVisionMock.ts`, um JSON-Schema zu verifizieren.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=TVA-INTEG-010`
**Input Fixture:** `tests/fixtures/teaser-vision-analysis/payload.json`
**Expected Output Schema:** `AITeaserAnalysis`
**Run Command:** `pnpm vitest --run --testNamePattern=TVA-INTEG-010`
**Pass Criteria:** `sr_levels[0].label === 'S1'`.

### TVA-SMOKE-020 — Smoke — P2
**Beschreibung:** Fehlende Secrets führen zum Heuristik-Fallback.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=TVA-SMOKE-020`
**Input Fixture:** `tests/fixtures/teaser-vision-analysis/payload.json`
**Expected Output Schema:** `AITeaserAnalysis`
**Run Command:** `pnpm vitest --run --testNamePattern=TVA-SMOKE-020`
**Pass Criteria:** `provider` bleibt `heuristic`.

### TVA-E2E-040 — E2E — P2
**Beschreibung:** Playwright-Szenario für Vision-Analyse.
**Setup Steps:**
1. `pnpm install`
2. `pnpm playwright test --grep TVA-E2E-040`
**Input Fixture:** `tests/fixtures/teaser-vision-analysis/payload.json`
**Expected Output Schema:** UI-Abschnitt "Teaser analysis" sichtbar.
**Run Command:** `pnpm playwright test --grep TVA-E2E-040`
**Pass Criteria:** Sichtbarer Teaser-Text binnen 45s.

### TVA-PERF-050 — Performance — P2
**Beschreibung:** Mocked Vision-Flow bleibt unter 400ms.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=TVA-PERF-050`
**Input Fixture:** `tests/fixtures/teaser-vision-analysis/payload.json`
**Expected Output Schema:** `AITeaserAnalysis`
**Run Command:** `pnpm vitest --run --testNamePattern=TVA-PERF-050`
**Pass Criteria:** Laufzeit < 400ms.

### TVA-SEC-060 — Security — P1
**Beschreibung:** Wallet-Adressen werden vor Logging maskiert.
**Setup Steps:**
1. `pnpm install`
2. `pnpm vitest --run --testNamePattern=TVA-SEC-060`
**Input Fixture:** `tests/fixtures/teaser-vision-analysis/payload.json`
**Expected Output Schema:** `string`
**Run Command:** `pnpm vitest --run --testNamePattern=TVA-SEC-060`
**Pass Criteria:** Log-String enthält `wallet://REDACTED`.

---

## Zusammenfassung

- **Events erkannt:** 3
- **Testfälle gesamt:** 18
- **Geschätzte Gesamtlaufzeit (parallelisiert, pnpm test + playwright):** ~25 Minuten (15 min Vitest <short/medium> + 10 min Playwright e2e bei Rauchtests)
- **Empfohlene Parallelität:** Vitest (maxWorkers=4), Playwright (workers=3, reuse context)
- **Flakiness-Mitigations:**
  - Netzwerkmocks über `tests/mocks/aiProxyMock.ts` & `tests/mocks/openaiVisionMock.ts`
  - Playwright-Tests nur in CI mit Seed-Daten (`test.skip` Guard)
  - Retries `--retries=2` für CI auf Netzwerktests
