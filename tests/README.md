# Sparkfined Test-Matrix Playbook

Diese Sammlung enthält die automatisierte Testmatrix für alle Events unter `events/`. Die Artefakte sind:

- `event-test-matrix.csv` — maschinenlesbare Matrix (CI/Analytics)
- `event-test-matrix.md` — menschenlesbare Übersicht
- `cases/<event-id>/` — Vitest- und Playwright-Test-Skeletons pro Event
- `fixtures/` — deterministische Eingabedaten ohne echte Secrets
- `mocks/` — Hilfsserver für AI-Proxys & Vision-Endpunkte (verwenden `// REDACTED_TOKEN` Platzhalter)

## Lokale Ausführung

1. Dependencies installieren: `pnpm install`
2. Vitest-Testfall gezielt ausführen (Beispiel):
   ```bash
   pnpm vitest --run --testNamePattern=ABA-UNIT-001
   ```
3. Playwright-E2E nur mit vorbereiteter Seed-Datenbasis:
   ```bash
   pnpm playwright test --grep ABA-E2E-040 --config=playwright.config.ts
   ```
   - Vision-/Proxy-APIs müssen gemockt sein (siehe unten).

### Secrets & Env Handling

| Secret | Zweck | Lokaler Wert |
|---|---|---|
| `AI_PROXY_SECRET` | Authentifizierung des Edge-Proxys | `// REDACTED_TOKEN` (nur für Tests) |
| `OPENAI_API_KEY` | Vision/Chat Completion | `// REDACTED_TOKEN` (Mock) |
| `GROK_API_KEY` | Alternative Vision Provider | `// REDACTED_TOKEN` |
| `ANTHROPIC_API_KEY` | Proxy/Claude Tests | `// REDACTED_TOKEN` |

> **Hinweis:** Niemals echte Secrets in Fixtures oder Logs speichern. Verwende `vi.stubEnv('<KEY>', '// REDACTED_TOKEN')` in Tests.

### Mock-Server

- `tests/mocks/aiProxyMock.ts`
  ```ts
  const mock = await startAiProxyMock({ expectedSecret: 'Bearer // REDACTED_TOKEN' })
  ```
  Leitet POST `/api/ai/assist` Antworten an Tests zurück.

- `tests/mocks/openaiVisionMock.ts`
  ```ts
  const mock = await startOpenAIVisionMock({ port: 5566 })
  ```
  Stellt OpenAI-kompatible `/v1/chat/completions` Antworten bereit.

Mock-Server können parallel in Tests gestartet werden. Nach Abschluss `await mock.close()` ausführen.

### Ausführungsprofile

| Profil | Beschreibung | Command |
|---|---|---|
| `full` | Alle Vitest-Cases + Playwright E2E | `pnpm vitest --run && pnpm playwright test` |
| `smoke` | Alle Smoke + P0-Unit-Tests | `pnpm vitest --run --testNamePattern="(SMOKE|UNIT-001)"` |
| `perf` | Nur Performance-Gates | `pnpm vitest --run --testNamePattern="PERF"` |

### Flakiness-Mitigation

- Netzwerkmocks nutzen (siehe oben)
- `pnpm vitest --retry=2` für Integrationstests mit externer Abhängigkeit
- Playwright in CI mit `--retries=2 --timeout=60000`

## CI Integration

Optionales GitHub Actions Snippet (`.github/workflows/test-matrix.yml`):

```yaml
name: Test Matrix

on:
  pull_request:
  push:

jobs:
  vitest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - name: Run matrix vitest
        run: pnpm vitest --run --reporter=verbose
        env:
          AI_PROXY_SECRET: // REDACTED_TOKEN
          OPENAI_API_KEY: // REDACTED_TOKEN
          GROK_API_KEY: // REDACTED_TOKEN
          ANTHROPIC_API_KEY: // REDACTED_TOKEN
  playwright:
    runs-on: ubuntu-latest
    needs: vitest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - name: Install browsers
        run: pnpm exec playwright install --with-deps
      - name: Run matrix playwright
        run: pnpm playwright test --grep "(ABA|JCA|TVA)-E2E"
        env:
          AI_PROXY_SECRET: // REDACTED_TOKEN
          OPENAI_API_KEY: // REDACTED_TOKEN
```

## Kosten & Laufzeiten

- **Vitest (unit/integration/security/perf)**: < 5 Minuten bei 4 parallelen Workern
- **Playwright E2E**: ~10 Minuten bei 3 parallelen Workern (inkl. Setup)
- **Gesamtkosten (Mocked)**: Keine externen API-Kosten
- **Live-Ausführung (`--live`)**: Nur nach Freigabe und mit echten Secrets (nicht im Repo speichern)

## Zusammenfassung

- Events: 3
- Testfälle: 18
- Empfohlene Reihenfolge: Unit → Integration → Smoke → Performance → Security → E2E
- `tests/fixtures/` enthalten ausschließlich synthetische Daten
- Alle Secrets sind als `// REDACTED_TOKEN` markiert
