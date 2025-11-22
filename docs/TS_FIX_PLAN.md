# TypeScript & Error Fix Plan — Phase 2

**Branch:** `claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f`

**Datum:** 2025-11-22

**Status:** Ready for Codex Implementation

---

## Overview

Nach erfolgreicher Behebung der Workflow-Setup-Probleme (Phase 1) blockieren aktuell **TypeScript-Fehler**, **Test-Failures** und **Lint-Errors** den CI-Durchlauf.

**Fehlerklassen im Überblick:**

| Kategorie | Anzahl | Kritisch? | Datei(en) |
|-----------|--------|-----------|-----------|
| **TypeScript (A)** | 10 Fehler | ✅ JA | contextBuilder.ts, grokPulse.e2e.test.tsx |
| **Tests (B)** | 2 Failures | ✅ JA | grokPulse.api.test.ts |
| **Lint (C)** | 2 Errors + 1 Warning | ⚠️ MEDIUM | sentiment.ts, sources.test.ts |

**Gesamtstrategie:**
1. Block A (TS-Fixes) zuerst → `pnpm typecheck` muss grün werden
2. Block B (Test-Fixes) danach → `pnpm test` muss grün werden
3. Block C (Lint) zum Schluss → `pnpm lint` muss grün werden

---

## Block A — TypeScript-Fixes (10 Fehler)

### A1: PulseGlobalToken Export/Import (TS2459)

**Fehler:**
```
src/lib/grokPulse/contextBuilder.ts(2,38): error TS2459: Module '"./sources"' declares 'PulseGlobalToken' locally, but it is not exported.
```

**Datei:** `src/lib/grokPulse/contextBuilder.ts` (Zeile 2)

**Aktueller Code:**
```typescript
import type { GlobalTokenSourceArgs, PulseGlobalToken } from "./sources";
```

**Problem:**
`PulseGlobalToken` wird in `sources.ts` nicht exportiert, ist aber in `types.ts` definiert und exportiert.

**Fix für Codex:**
```typescript
// In src/lib/grokPulse/contextBuilder.ts (Zeile 2)
// ❌ FALSCH:
import type { GlobalTokenSourceArgs, PulseGlobalToken } from "./sources";

// ✅ KORREKT:
import type { GlobalTokenSourceArgs } from "./sources";
import type { PulseGlobalToken } from "./types";
```

**Begründung:**
`PulseGlobalToken` ist bereits in `types.ts` exportiert (Zeile 39-42). Import sollte von dort erfolgen, nicht aus `sources.ts`.

---

### A2: Implizite any-Parameter in contextBuilder (TS7006)

**Fehler:**
```
src/lib/grokPulse/contextBuilder.ts(168,35): error TS7006: Parameter 'best' implicitly has an 'any' type.
src/lib/grokPulse/contextBuilder.ts(168,41): error TS7006: Parameter 'current' implicitly has an 'any' type.
src/lib/grokPulse/contextBuilder.ts(266,16): error TS7006: Parameter 'entry' implicitly has an 'any' type.
src/lib/grokPulse/contextBuilder.ts(308,16): error TS7006: Parameter 'entry' implicitly has an 'any' type.
```

**Dateien:**
- `src/lib/grokPulse/contextBuilder.ts` (Zeile 168, 266, 308)

**Problem:**
Callback-Parameter haben implizit `any`-Typ wegen strict TypeScript-Config.

**Fix für Codex:**

**Zeile 168 (best, current):**
```typescript
// Context: Wahrscheinlich Array.reduce() oder ähnlich
// Ohne den vollen Code zu sehen, typischer Fix:

// ❌ FALSCH:
.reduce((best, current) => ...)

// ✅ KORREKT (Beispiel für SocialContextEntry):
.reduce((best: SocialContextEntry, current: SocialContextEntry) => ...)
```

**Zeile 266 & 308 (entry):**
```typescript
// Context: Wahrscheinlich Array.map() oder Array.filter()

// ❌ FALSCH:
entries.map((entry) => ...)

// ✅ KORREKT:
entries.map((entry: SocialContextEntry) => ...)
```

**Action für Codex:**
1. Öffne `src/lib/grokPulse/contextBuilder.ts`
2. Navigiere zu Zeile 168, 266, 308
3. Füge explizite Typen zu den Callback-Parametern hinzu
4. Verwende passende Typen basierend auf Kontext (wahrscheinlich `SocialContextEntry` oder `OnchainSnapshot`)

---

### A3: Test-Fakes für GrokPulse (TS2322 — String Literals)

**Fehler:**
```
tests/grokPulse/grokPulse.e2e.test.tsx(67,5): error TS2322: Type '"human"' is not assignable to type 'GrokAuthorType'.
tests/grokPulse/grokPulse.e2e.test.tsx(96,5): error TS2322: Type '"high"' is not assignable to type 'TrendHypeLevel | undefined'.
tests/grokPulse/grokPulse.e2e.test.tsx(99,5): error TS2322: Type '"high"' is not assignable to type 'TrendHypeLevel | undefined'.
tests/grokPulse/grokPulse.e2e.test.tsx(100,5): error TS2322: Type '"buy"' is not assignable to type 'TrendCallToAction | undefined'.
tests/grokPulse/grokPulse.e2e.test.tsx(105,5): error TS2322: Type '"buy"' is not assignable to type 'TrendCallToAction | undefined'.
```

**Datei:** `tests/grokPulse/grokPulse.e2e.test.tsx` (Zeile 67, 96, 99, 100, 105)

**Problem:**
Test-Daten verwenden String-Literals (`"human"`, `"high"`, `"buy"`), die nicht den Union-Typen entsprechen.

**Wo sind die Typen definiert?**
Diese Typen müssen in `src/types/` definiert sein. Codex muss die Typen-Definitionen prüfen.

**Fix für Codex:**

**Schritt 1:** Finde die Typ-Definitionen
```bash
# Codex sollte suchen nach:
grep -r "GrokAuthorType" src/types/
grep -r "TrendHypeLevel" src/types/
grep -r "TrendCallToAction" src/types/
```

**Schritt 2:** Prüfe erlaubte Werte
```typescript
// Beispiel (vermutete Definitionen):
export type GrokAuthorType = "ai" | "bot" | "influencer" | "verified" | "anonymous";
export type TrendHypeLevel = "low" | "medium" | "extreme";
export type TrendCallToAction = "hold" | "sell" | "research";
```

**Schritt 3:** Korrigiere Test-Daten in `tests/grokPulse/grokPulse.e2e.test.tsx`

**Zeile 67 (authorType):**
```typescript
// ❌ FALSCH:
author: {
  handle: "tester",
  authorType: "human",  // ← "human" ist nicht im Typ
  followers: 42000,
  verified: true,
}

// ✅ KORREKT (Beispiel):
author: {
  handle: "tester",
  authorType: "verified",  // ← Verwende gültigen Wert aus Union-Typ
  followers: 42000,
  verified: true,
}
```

**Zeile 96, 99 (hypeLevel):**
```typescript
// ❌ FALSCH:
sentiment: {
  label: "bullish",
  score: 0.82,
  confidence: 0.9,
  hypeLevel: "high",  // ← "high" ist nicht im Typ
}

// ✅ KORREKT (Beispiel):
sentiment: {
  label: "bullish",
  score: 0.82,
  confidence: 0.9,
  hypeLevel: "extreme",  // ← Verwende gültigen Wert
}
```

**Zeile 100, 105 (callToAction):**
```typescript
// ❌ FALSCH:
trading: {
  hypeLevel: "high",
  callToAction: "buy",  // ← "buy" ist nicht im Typ
}

// ✅ KORREKT (Beispiel):
trading: {
  hypeLevel: "extreme",
  callToAction: "hold",  // ← Verwende gültigen Wert
}
```

**WICHTIG für Codex:**
- Prüfe die exakten Union-Typ-Definitionen in `src/types/events.ts` oder `src/types/`
- Verwende nur Werte, die im Typ erlaubt sind
- Konsistenz: Wenn `hypeLevel` geändert wird, an allen Stellen (Zeile 96, 99) gleich machen

---

### A4: | undefined-Probleme (TS2322)

**Fehler:**
```
tests/grokPulse/grokPulse.e2e.test.tsx(221,59): error TS2322: Type 'PulseGlobalToken | undefined' is not assignable to type 'PulseGlobalToken'.
  Type 'undefined' is not assignable to type 'PulseGlobalToken'.
```

**Datei:** `tests/grokPulse/grokPulse.e2e.test.tsx` (Zeile 221)

**Problem:**
Eine Variable ist `PulseGlobalToken | undefined`, wird aber als `PulseGlobalToken` erwartet.

**Fix für Codex:**

**Option A — Non-null Assertion (!):**
```typescript
// Wenn sicher ist, dass Wert existiert:
const token: PulseGlobalToken = someVariable!;
```

**Option B — Null-Check:**
```typescript
// Sicherer, aber mehr Code:
const maybeToken = someVariable;
if (!maybeToken) throw new Error("Token required");
const token: PulseGlobalToken = maybeToken;
```

**Option C — Optional Chaining:**
```typescript
// Wenn Funktion optional ist:
someFunction(maybeToken ?? { address: "fallback", symbol: "FALLBACK" });
```

**Action für Codex:**
1. Navigiere zu Zeile 221 in `tests/grokPulse/grokPulse.e2e.test.tsx`
2. Analysiere Kontext (Test-Setup, sampleTokens, etc.)
3. Wenn Test-Daten immer definiert sein sollten: Verwende `!` (Non-null Assertion)
4. Andernfalls: Null-Check hinzufügen

---

## Block B — Test-Fixes (2 Failures)

### B1: getWatchlistTokens() ist undefined (API Test)

**Fehler:**
```
FAIL  tests/grokPulse/grokPulse.api.test.ts > sentiment handler stores grok snapshot
TypeError: Cannot read properties of undefined (reading 'catch')
 ❯ Module.handler api/grok-pulse/sentiment.ts:58:52
     56|   } as const;
     57|
     58|   const watchlistTokens = await getWatchlistTokens().catch(() => []);
       |                                                    ^
```

**Dateien:**
- Test: `tests/grokPulse/grokPulse.api.test.ts` (Zeile 77, 103)
- Handler: `api/grok-pulse/sentiment.ts` (Zeile 58)

**Problem:**
`getWatchlistTokens()` ist in Test-Mocks falsch definiert. Mock gibt keine Funktion zurück, sondern einen direkten Wert.

**Aktueller Mock (FALSCH):**
```typescript
// In tests/grokPulse/grokPulse.api.test.ts (Zeile 11)
vi.mock("../../src/lib/grokPulse/kv", () => {
  const getWatchlistTokens = vi.fn().mockResolvedValue([]);
  // ... weitere Mocks
  return {
    getWatchlistTokens,
    // ...
  };
});
```

**Problem-Analyse:**
Der Mock wird einmal erstellt, aber bei mehreren Test-Runs kann die Funktion undefined werden. Außerdem fehlt das Return-Value-Handling für Edge-Runtime.

**Fix für Codex:**

**Schritt 1:** Mock korrigieren in `tests/grokPulse/grokPulse.api.test.ts`
```typescript
// ❌ FALSCH (aktuell):
vi.mock("../../src/lib/grokPulse/kv", () => {
  const getWatchlistTokens = vi.fn().mockResolvedValue([]);
  // ...
  return { getWatchlistTokens, ... };
});

// ✅ KORREKT:
vi.mock("../../src/lib/grokPulse/kv", () => ({
  getPulseGlobalList: vi.fn().mockResolvedValue([]),
  getWatchlistTokens: vi.fn().mockResolvedValue([]),
  getCachedTokenContext: vi.fn().mockResolvedValue(null),
  cacheTokenContext: vi.fn().mockResolvedValue(undefined),
  appendHistory: vi.fn().mockResolvedValue(undefined),
  setCurrentSnapshot: vi.fn().mockResolvedValue(undefined),
  getCurrentSnapshot: vi.fn().mockResolvedValue(null),
  getHistory: vi.fn().mockResolvedValue([]),
}));
```

**Schritt 2:** Sicherstellen, dass Mock vor jedem Test zurückgesetzt wird
```typescript
// In beforeEach oder test setup:
beforeEach(() => {
  vi.clearAllMocks();
});
```

**Begründung:**
- Arrow-Function-Return `() => ({...})` ist stabiler als Variable-Deklaration
- Alle Mock-Funktionen müssen `.mockResolvedValue()` verwenden für async-Funktionen
- `clearAllMocks()` verhindert State-Probleme zwischen Tests

---

## Block C — Lint-Fixes (2 Errors + 1 Warning)

### C1: Unused Variable 'error' (Warning)

**Fehler:**
```
api/grok-pulse/sentiment.ts:32:12  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars
```

**Datei:** `api/grok-pulse/sentiment.ts` (Zeile 32)

**Problem:**
Variable `error` wird in catch-Block definiert, aber nicht verwendet.

**Fix für Codex:**
```typescript
// ❌ FALSCH (aktuell):
try {
  payload = await req.json();
} catch (error) {
  return json({ ok: false, error: "Invalid JSON" }, 400);
}

// ✅ KORREKT (Option A — Prefix mit _):
try {
  payload = await req.json();
} catch (_error) {
  return json({ ok: false, error: "Invalid JSON" }, 400);
}

// ✅ KORREKT (Option B — Keine Variable):
try {
  payload = await req.json();
} catch {
  return json({ ok: false, error: "Invalid JSON" }, 400);
}
```

**Empfehlung:** Option B (keine Variable), da Error nicht geloggt wird.

---

### C2: Object-to-String Conversion in Tests (2 Errors)

**Fehler:**
```
src/lib/grokPulse/__tests__/sources.test.ts:31:27  error  'url' may use Object's default stringification format ('[object Object]') when stringified
src/lib/grokPulse/__tests__/sources.test.ts:114:27  error  'url' may use Object's default stringification format ('[object Object]') when stringified
```

**Datei:** `src/lib/grokPulse/__tests__/sources.test.ts` (Zeile 31, 114)

**Problem:**
`RequestInfo`-Typ wird mit `String(url)` konvertiert, ESLint warnt vor potenziellem `[object Object]`.

**Aktueller Code (Zeile 30-31):**
```typescript
test("buildGlobalTokenList dedupes across sources and respects maxUnique", async () => {
  const mockFetch = vi.fn((url: RequestInfo) => {
    const href = String(url);  // ← Fehler: url kann URL-Objekt sein
    if (href.includes("dexscreener.com") && href.includes("gainers")) {
      // ...
    }
  });
});
```

**Fix für Codex:**
```typescript
// ❌ FALSCH:
const mockFetch = vi.fn((url: RequestInfo) => {
  const href = String(url);
  // ...
});

// ✅ KORREKT:
const mockFetch = vi.fn((url: RequestInfo | URL) => {
  const href = url instanceof URL ? url.href : String(url);
  // ...
});

// ODER (noch sicherer):
const mockFetch = vi.fn((url: RequestInfo | URL) => {
  const href = typeof url === 'string' ? url : url instanceof URL ? url.href : String(url);
  // ...
});
```

**Action für Codex:**
1. Öffne `src/lib/grokPulse/__tests__/sources.test.ts`
2. Finde Zeile 31 und 114
3. Ersetze `String(url)` durch sichere Konvertierung (siehe oben)
4. Run `pnpm lint` zum Testen

---

## Priorisierung & Reihenfolge für Codex

### Phase 2.1 — TypeScript-Fixes (KRITISCH)

**Reihenfolge:**
1. **A1 — PulseGlobalToken Import** (1 Fehler, einfach)
   - `contextBuilder.ts` Zeile 2
   - Erwartete Dauer: 30 Sekunden

2. **A2 — Implizite any-Parameter** (4 Fehler, medium)
   - `contextBuilder.ts` Zeile 168, 266, 308
   - Erwartete Dauer: 3-5 Minuten (Code-Analyse nötig)

3. **A3 — Test-Fakes String Literals** (5 Fehler, medium)
   - `grokPulse.e2e.test.tsx` Zeile 67, 96, 99, 100, 105
   - Erwartete Dauer: 5-10 Minuten (Typ-Definitionen prüfen nötig)

4. **A4 — | undefined Problem** (1 Fehler, einfach)
   - `grokPulse.e2e.test.tsx` Zeile 221
   - Erwartete Dauer: 1 Minute

**Zwischencheck:** `pnpm typecheck` → sollte 0 Fehler zeigen

---

### Phase 2.2 — Test-Fixes (KRITISCH)

**Reihenfolge:**
1. **B1 — getWatchlistTokens Mock** (2 Test-Failures)
   - `grokPulse.api.test.ts` Mock-Definition
   - Erwartete Dauer: 5 Minuten

**Zwischencheck:** `pnpm test` → sollte 0 Failures zeigen (2 Failed → 0 Failed)

---

### Phase 2.3 — Lint-Fixes (MEDIUM)

**Reihenfolge:**
1. **C1 — Unused Variable** (1 Warning)
   - `sentiment.ts` Zeile 32
   - Erwartete Dauer: 30 Sekunden

2. **C2 — Object-to-String** (2 Errors)
   - `sources.test.ts` Zeile 31, 114
   - Erwartete Dauer: 2 Minuten

**Zwischencheck:** `pnpm lint` → sollte 0 Errors/Warnings zeigen

---

## Akzeptanzkriterien — Phase 2 Abschluss

### ✅ Typecheck grün
```bash
pnpm typecheck
# Expected: 0 errors
```

### ✅ Tests grün
```bash
pnpm test
# Expected: 0 failed tests
# Allowed: Skipped tests OK (z.B. journal.crud.test.ts)
```

### ✅ Lint grün
```bash
pnpm lint
# Expected: 0 errors, 0 warnings
```

### ✅ CI-Ready
Nach Phase 2:
- Workflow `ci-analyze.yml` kann auf Status "SUCCESS" gehen
- Alle Core-Steps (Typecheck, Lint, Test) sollten grün sein
- Build-Step (falls aktiviert) sollte durchlaufen

---

## Rollback-Plan (falls Phase 2 fehlschlägt)

### Wenn TypeScript-Fixes neue Fehler erzeugen:
```bash
git diff src/lib/grokPulse/contextBuilder.ts
# Review changes, revert if necessary:
git checkout HEAD -- src/lib/grokPulse/contextBuilder.ts
```

### Wenn Test-Fixes Tests kaputt machen:
```bash
# Run single test file:
pnpm test tests/grokPulse/grokPulse.api.test.ts

# Debug output:
pnpm test --reporter=verbose
```

### Wenn Lint-Fixes ESLint-Probleme verursachen:
```bash
# Check specific file:
pnpm lint src/lib/grokPulse/__tests__/sources.test.ts

# Auto-fix (mit Vorsicht):
pnpm lint --fix
```

---

## Security / Secrets — Status (Block C)

### ✅ Keine kritischen Security-Issues gefunden

**Geprüft:**
- `.env` Files: Nur `.env.example` vorhanden (korrekt)
- API-Keys in Code: Keine Secrets im Bundle (korrekt in Serverless-Handlers)
- VITE_ Prefixes: Keine gefährlichen Client-Side-Secrets

**Secrets-Verwendung (korrekt):**
```typescript
// ✅ Server-Side Only (api/grok-pulse/sentiment.ts)
const sourceArgs = {
  dexscreenerApiKey: process.env.DEXSCREENER_API_KEY?.trim(),
  birdeyeApiKey: process.env.BIRDEYE_API_KEY?.trim(),
  // ...
};
```

**Keine Action nötig in Phase 2.**

---

## Zusammenfassung — Fix-Checklist für Codex

### Block A — TypeScript (10 Fixes)
- [ ] A1: `contextBuilder.ts` Import korrigieren (Zeile 2)
- [ ] A2: `contextBuilder.ts` any-Parameter typisieren (Zeile 168, 266, 308)
- [ ] A3: `grokPulse.e2e.test.tsx` String-Literals korrigieren (Zeile 67, 96, 99, 100, 105)
- [ ] A4: `grokPulse.e2e.test.tsx` undefined-Check (Zeile 221)

### Block B — Tests (1 Fix, 2 Failures)
- [ ] B1: `grokPulse.api.test.ts` Mock korrigieren (getWatchlistTokens)

### Block C — Lint (3 Fixes)
- [ ] C1: `sentiment.ts` Unused variable (Zeile 32)
- [ ] C2: `sources.test.ts` Object-to-String (Zeile 31, 114)

### Validation
- [ ] `pnpm typecheck` → 0 errors
- [ ] `pnpm test` → 0 failed tests
- [ ] `pnpm lint` → 0 errors/warnings

---

## Nächster Schritt nach Phase 2

**Phase 3:** Build + E2E (schwere Steps reaktivieren)
- `if: false` aus `ci-analyze.yml` entfernen
- Build-Step grün bekommen
- Playwright-Tests grün bekommen

**Dokumentation:** Separate Datei `docs/CI_FIX_PHASE_3_BUILD.md` (noch nicht erstellt)

---

**Status:** ✅ Bereit für Codex-Implementierung

**Erwartete Gesamt-Dauer:** 20-30 Minuten (ohne Build/E2E)
