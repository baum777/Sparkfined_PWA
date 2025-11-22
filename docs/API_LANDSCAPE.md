# API Landscape — Sparkfined PWA

**Branch:** `claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f`

**Datum:** 2025-11-22

**Zweck:** Vollständige Übersicht über alle API-Routen, deren Runtimes (Edge vs. Node), Dependencies (@vercel/kv, schwere SDKs) und erforderliche Anpassungen für Deploy-Stabilität.

---

## 📋 Einleitung & Entscheidungsregeln

### Wann Edge-Runtime verwenden?

✅ **Edge ist geeignet, wenn:**
- API ist **stateless** (keine DB/KV-Zugriffe)
- Nur **leichte HTTP-Fetches** zu externen APIs
- Keine **schweren Node-Libraries** (Moralis, Web3, komplexe Crypto-SDKs)
- **Einfache Datenverarbeitung** (JSON-Transformation, Simple Aggregation)
- **Schnelle Response** ist kritisch (globale Edge-Network-Verteilung)

**Beispiele:**
- Health-Check-Endpoints
- Einfache Proxy-Routen (ohne Caching)
- Stateless Utilities

---

### Wann Node-Runtime erforderlich?

🔴 **Node ist ZWINGEND, wenn:**
- API verwendet **@vercel/kv** (direkt oder indirekt über Imports)
- API verwendet **schwere SDKs** (Moralis, Solana Web3, komplexe Libraries)
- API führt **mehrstufige IO-Pipelines** aus (mehrere externe APIs + KV/DB)
- API hat **komplexe Aggregationen** oder **lange Laufzeiten** (>10 Sekunden)
- API nutzt **Node-spezifische Modules** (fs, crypto mit heavy algorithms)

**Beispiele:**
- GrokPulse-Backbone (KV-intensive, Multi-API-Aggregation)
- Moralis-Proxy (schwere SDK-Calls)
- Journal/Ideas-Export (KV-Reads für Daten)
- Alert-Dispatch (KV für Alert-State)

---

### Kategorien

**Kategorie A — Heavy Analysis & GrokPulse-Backbone (Node required)**
- Verwendet @vercel/kv intensiv
- Multi-API-Aggregation (Dexscreener + Birdeye + Grok + Social)
- Komplexe Business-Logik
- **Runtime:** Node

**Kategorie B — Cached/Read-Only Pulse Views (Edge-Kandidat, wenn KV-frei)**
- Liest fertige Daten von Node-APIs (via HTTP)
- Keine eigene KV-Nutzung
- Stateless
- **Runtime:** Edge (theoretisch, aber aktuell kaum vorhanden)

**Kategorie C — UI/Feature-Hilfs-APIs (Mixed, je nach Dependencies)**
- Journal, Ideas, Alerts, Push-Notifications
- **Wenn KV genutzt:** Node
- **Wenn nur HTTP-Proxies:** Edge

**Kategorie D — Infra/Admin/Cron-Routen (Node required)**
- Cron-Jobs (GrokPulse-Ingestion)
- Heavy Computation
- KV-intensive Operationen
- **Runtime:** Node

---

## 🗺️ API-Landschaft — Komplette Übersicht

### Tabelle: Alle API-Routen

| # | Path | Aktuelle Runtime | Uses KV | Uses Heavy SDKs | Kategorie | Status | Notes |
|---|------|------------------|---------|-----------------|-----------|--------|-------|
| 1 | `api/grok-pulse/sentiment.ts` | edge | ✅ | ✅ (Grok, Dex, Birdeye) | A | 🔴 **BROKEN** | Muss Node werden (KV-Imports) |
| 2 | `api/grok-pulse/cron.ts` | edge | ✅ | ✅ (Grok, Dex, Birdeye) | D | 🔴 **BROKEN** | Muss Node werden (engine.ts → KV) |
| 3 | `api/grok-pulse/state.ts` | edge | ✅ | ❌ | A | 🔴 **BROKEN** | Muss Node werden (KV-Reads) |
| 4 | `api/grok-pulse/context.ts` | edge | ✅ | ✅ (Dex, Birdeye) | A | 🔴 **BROKEN** | Muss Node werden (KV-Cache) |
| 5 | `api/ai/analyze-market.ts` | edge | ❌ | ⚠️ (depends on libs) | C | ⚠️ **CHECK** | Prüfen ob indirekte KV-Nutzung |
| 6 | `api/ai/assist.ts` | edge | ❌ | ⚠️ (AI-SDKs) | C | ⚠️ **CHECK** | Prüfen Dependencies |
| 7 | `api/ai/grok-context.ts` | edge | ❌ | ✅ (Grok, Dex) | C | ⚠️ **CHECK** | Prüfen Dependencies |
| 8 | `api/ideas/index.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 9 | `api/ideas/export.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 10 | `api/ideas/export-pack.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 11 | `api/ideas/attach-trigger.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 12 | `api/ideas/close.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 13 | `api/journal/index.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 14 | `api/journal/export.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 15 | `api/alerts/dispatch.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 16 | `api/alerts/worker.ts` | implicit-node | ⚠️ | ❌ | C | ✅ **OK** | Node (implicit), verifizieren |
| 17 | `api/push/subscribe.ts` | edge | ✅ | ⚠️ (web-push) | C | 🔴 **BROKEN** | Muss Node werden (KV + web-push) |
| 18 | `api/push/unsubscribe.ts` | edge | ✅ | ❌ | C | 🔴 **BROKEN** | Muss Node werden (KV) |
| 19 | `api/push/test-send.ts` | implicit-node | ⚠️ | ⚠️ (web-push) | C | ✅ **OK** | Node (implicit), verifizieren |
| 20 | `api/rules/index.ts` | implicit-node | ✅ | ❌ | C | ⚠️ **CHECK** | KV-Nutzung verifizieren, ggf. explizit Node |
| 21 | `api/rules/eval.ts` | implicit-node | ⚠️ | ❌ | C | ⚠️ **CHECK** | Runtime verifizieren |
| 22 | `api/rules/eval-cron.ts` | implicit-node | ⚠️ | ❌ | D | ⚠️ **CHECK** | Runtime verifizieren |
| 23 | `api/moralis/[...path].ts` | implicit-node | ❌ | ✅ (Moralis SDK) | C | ✅ **OK** | Node via VercelRequest/Response |
| 24 | `api/data/ohlc.ts` | edge | ❌ | ⚠️ | C | ⚠️ **CHECK** | Leichter Proxy? |
| 25 | `api/market/ohlc.ts` | implicit-node | ❌ | ⚠️ | C | ✅ **OK** | Node (implicit), verifizieren |
| 26 | `api/dexpaprika/tokens/[address].ts` | implicit-node | ❌ | ⚠️ | C | ✅ **OK** | Proxy, Node OK |
| 27 | `api/backtest.ts` | edge | ❌ | ⚠️ | C | ⚠️ **CHECK** | Heavy computation? |
| 28 | `api/health.ts` | edge | ❌ | ❌ | C | ✅ **OK** | Stateless, Edge OK |
| 29 | `api/telemetry.ts` | edge | ❌ | ❌ | C | ⚠️ **CHECK** | Stateless? |
| 30 | `api/shortlink.ts` | edge | ❌ | ❌ | C | ⚠️ **CHECK** | Stateless? |
| 31 | `api/board/kpis.ts` | implicit-node | ⚠️ | ❌ | C | ⚠️ **CHECK** | KV-Nutzung verifizieren |
| 32 | `api/board/feed.ts` | implicit-node | ⚠️ | ❌ | C | ⚠️ **CHECK** | KV-Nutzung verifizieren |
| 33 | `api/wallet/webhook.ts` | implicit-node | ⚠️ | ⚠️ | C | ⚠️ **CHECK** | Runtime verifizieren |
| 34 | `api/mcap.ts` | implicit-node | ❌ | ⚠️ | C | ✅ **OK** | Proxy, Node OK |
| 35 | `api/cron/cleanup-temp-entries.ts` | implicit-node | ⚠️ | ❌ | D | ⚠️ **CHECK** | Cron → wahrscheinlich KV |

---

### Status-Legende

- 🔴 **BROKEN** — Edge-Runtime + KV-Import → Deployment wird FEHLSCHLAGEN
- ⚠️ **CHECK** — Runtime/Dependencies unklar, muss geprüft werden
- ✅ **OK** — Runtime korrekt konfiguriert

---

## 🚨 Kritische Probleme

### Problem 1: 14+ APIs mit Edge-Runtime + KV-Imports

**Betroffene APIs:**
1. `api/grok-pulse/sentiment.ts`
2. `api/grok-pulse/cron.ts`
3. `api/grok-pulse/state.ts`
4. `api/grok-pulse/context.ts`
5. `api/ideas/index.ts`
6. `api/ideas/export.ts`
7. `api/ideas/export-pack.ts`
8. `api/ideas/attach-trigger.ts`
9. `api/ideas/close.ts`
10. `api/journal/index.ts`
11. `api/journal/export.ts`
12. `api/alerts/dispatch.ts`
13. `api/push/subscribe.ts`
14. `api/push/unsubscribe.ts`

**Warum broken:**
```typescript
// Beispiel: api/grok-pulse/sentiment.ts
export const config = { runtime: "edge" };  // ❌ Edge-Runtime

import {
  getWatchlistTokens,  // ← Importiert von kv.ts
  getCurrentSnapshot,  // ← Importiert von kv.ts
  // ...
} from "../../src/lib/grokPulse/kv";

// kv.ts enthält:
import { kv } from "@vercel/kv";  // ← Funktioniert NUR in Node!
```

**Impact:**
- Edge-Runtime kann `@vercel/kv` NICHT importieren
- Deployment schlägt fehl oder Runtime-Error bei ersten KV-Call
- **Alle diese APIs müssen auf Node umgestellt werden**

---

### Problem 2: Implizite Node-Runtime (nicht explizit deklariert)

**Betroffene APIs:**
- `api/moralis/[...path].ts` (via `VercelRequest/Response` → Node)
- `api/market/ohlc.ts`
- `api/alerts/worker.ts`
- `api/push/test-send.ts`
- `api/rules/**/*.ts`
- `api/board/**/*.ts`
- `api/wallet/webhook.ts`
- `api/mcap.ts`
- `api/dexpaprika/**/*.ts`
- `api/cron/**/*.ts`

**Warum problematisch:**
- Vercel default ist Node, ABER nicht explizit deklariert
- Kann zu Verwirrung führen
- Best Practice: Explizit `export const runtime = "nodejs"` setzen

---

### Problem 3: Unklare Heavy-SDK-Nutzung

**APIs mit potentiell schweren Dependencies:**
- `api/ai/analyze-market.ts` — Prüfen ob AI-SDKs (OpenAI, Grok) schwer sind
- `api/ai/assist.ts`
- `api/ai/grok-context.ts`
- `api/backtest.ts` — Komplexe Berechnungen?
- `api/push/subscribe.ts` — web-push library schwer?

**Action:** Code-Review für jede API, ob schwere SDKs importiert werden

---

## 📊 Empfohlene Runtimes je Route

### Kategorie A — GrokPulse-Backbone (MUSS Node sein)

| API | Aktuell | Empfohlen | Grund |
|-----|---------|-----------|-------|
| `api/grok-pulse/sentiment.ts` | edge | **nodejs** | KV + Dex/Birdeye/Grok APIs |
| `api/grok-pulse/cron.ts` | edge | **nodejs** | KV + engine.ts (Heavy Ingestion) |
| `api/grok-pulse/state.ts` | edge | **nodejs** | KV-Reads (Snapshot, History) |
| `api/grok-pulse/context.ts` | edge | **nodejs** | KV-Cache + Dex/Birdeye APIs |

**Fix:**
```typescript
// In jeder dieser Dateien:
export const config = { runtime: "nodejs" };  // ✅ Statt "edge"
```

---

### Kategorie C — Ideas, Journal, Alerts, Push (MUSS Node sein wegen KV)

| API | Aktuell | Empfohlen | Grund |
|-----|---------|-----------|-------|
| `api/ideas/index.ts` | edge | **nodejs** | KV für Ideas-Verwaltung |
| `api/ideas/export.ts` | edge | **nodejs** | KV-Reads |
| `api/ideas/export-pack.ts` | edge | **nodejs** | KV-Reads |
| `api/ideas/attach-trigger.ts` | edge | **nodejs** | KV-Writes |
| `api/ideas/close.ts` | edge | **nodejs** | KV-Writes |
| `api/journal/index.ts` | edge | **nodejs** | KV für Journal-Einträge |
| `api/journal/export.ts` | edge | **nodejs** | KV-Reads |
| `api/alerts/dispatch.ts` | edge | **nodejs** | KV für Alert-State |
| `api/push/subscribe.ts` | edge | **nodejs** | KV + web-push SDK |
| `api/push/unsubscribe.ts` | edge | **nodejs** | KV |

**Fix:** Gleich wie oben, `runtime: "nodejs"` setzen

---

### Kategorie C — Implizit Node (SOLLTE explizit sein)

| API | Aktuell | Empfohlen | Grund |
|-----|---------|-----------|-------|
| `api/moralis/[...path].ts` | implicit-node | **nodejs (explizit)** | Moralis SDK, VercelRequest/Response |
| `api/market/ohlc.ts` | implicit-node | **nodejs (explizit)** | Konsistenz |
| `api/alerts/worker.ts` | implicit-node | **nodejs (explizit)** | Verifizieren + explizit machen |
| `api/push/test-send.ts` | implicit-node | **nodejs (explizit)** | web-push SDK |
| `api/rules/**/*.ts` | implicit-node | **nodejs (explizit)** | Falls KV genutzt |
| `api/board/**/*.ts` | implicit-node | **nodejs (explizit)** | Falls KV genutzt |
| `api/dexpaprika/**/*.ts` | implicit-node | **nodejs (explizit)** | Proxy, explizit machen |
| `api/mcap.ts` | implicit-node | **nodejs (explizit)** | Proxy, explizit machen |
| `api/cron/cleanup-temp-entries.ts` | implicit-node | **nodejs (explizit)** | Cron, wahrscheinlich KV |
| `api/wallet/webhook.ts` | implicit-node | **nodejs (explizit)** | Webhook, verifizieren |

**Fix:**
```typescript
// Am Anfang jeder Datei hinzufügen:
export const runtime = "nodejs";
```

---

### Kategorie C — Potentiell Edge (nach Verifizierung)

| API | Aktuell | Empfohlen | Bedingung |
|-----|---------|-----------|-----------|
| `api/health.ts` | edge | **edge (OK)** | Stateless, kein KV |
| `api/data/ohlc.ts` | edge | **edge (OK)** | Falls nur HTTP-Proxy |
| `api/telemetry.ts` | edge | **Prüfen** | Falls stateless → edge OK |
| `api/shortlink.ts` | edge | **Prüfen** | Falls stateless → edge OK |
| `api/backtest.ts` | edge | **Prüfen** | Falls keine schwere Berechnung → edge, sonst node |

**Action:** Code-Review für jede API

---

### Kategorie B — Edge-View-Routen (Zukünftig)

**Aktuell nicht vorhanden, aber empfohlen:**
- `api/pulse/summary/route.ts` (Edge) — Holt fertige Daten von `api/grok-pulse/state.ts` (Node) via HTTP
- `api/pulse/trending/route.ts` (Edge) — Lightweight Read-View

**Pattern:**
```typescript
// Edge-Route (kein KV, nur HTTP-Fetch zu Node-APIs)
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  // Hole fertige Daten von Node-API
  const response = await fetch('https://sparkfined-pwa.vercel.app/api/grok-pulse/state?addresses=...');
  const data = await response.json();

  // Simple Transformation
  return new Response(JSON.stringify({ summary: data }), {
    headers: { "content-type": "application/json" },
  });
}
```

**Vorteil:** Edge-Verteilung für Read-Heavy-Views, Node-Backbone für Write/KV-Heavy-Ops

---

## 🔧 Import-Boundaries & Modularisierung

### Aktuelles Problem

**kv.ts ist "giftig" für Edge:**
```typescript
// src/lib/grokPulse/kv.ts
import { kv } from "@vercel/kv";  // ← Node-only!

export async function getCurrentSnapshot(...) {
  const snapshot = await kv.get(...);
  return snapshot;
}
```

**Jede API die kv.ts importiert, MUSS Node sein!**

---

### Empfohlene Struktur

**Option A — Klare Trennung (Empfohlen):**

```
src/lib/grokPulse/
├── kv.ts                  // Node-only (KV-Funktionen)
├── engine.ts              // Node-only (Heavy Ingestion)
├── contextBuilder.ts      // Node-only (Multi-API-Aggregation)
├── grokClient.ts          // Node-only (Grok API-Calls)
├── sentimentFallback.ts   // Edge-safe (Pure Functions)
├── sources.ts             // Node-only (Dex/Birdeye-Calls + KV)
├── types.ts               // Edge-safe (nur Types)
└── edge-safe/             // Neues Verzeichnis
    ├── types.ts           // Re-export von ../types.ts
    ├── utils.ts           // Pure Functions (keine KV, keine Heavy SDKs)
    └── schemas.ts         // Zod-Schemas etc.
```

**Option B — Runtime-Marker (Alternativ):**
```typescript
// src/lib/grokPulse/kv.ts
/**
 * ⚠️ NODE-ONLY MODULE
 * Dieses Modul importiert @vercel/kv und kann NICHT in Edge-Runtime verwendet werden.
 * Nur in Node-APIs importieren!
 */
export const RUNTIME = "nodejs";  // Marker
import { kv } from "@vercel/kv";
// ...
```

---

## 📝 Konkrete Aufgaben für Codex — TODO-Backlog

### Phase 4A — Kritische Runtime-Fixes (14 APIs)

**Priorität: P0 — MUSS vor Deploy behoben werden**

**Task 4A.1 — GrokPulse-APIs auf Node umstellen:**

1. **`api/grok-pulse/sentiment.ts`**
   ```typescript
   // Zeile 1: Ändern von:
   export const config = { runtime: "edge" };
   // Auf:
   export const config = { runtime: "nodejs" };
   ```

2. **`api/grok-pulse/cron.ts`**
   - Gleiche Änderung (Zeile 1)

3. **`api/grok-pulse/state.ts`**
   - Gleiche Änderung (Zeile 1)

4. **`api/grok-pulse/context.ts`**
   - Gleiche Änderung (Zeile 1)

---

**Task 4A.2 — Ideas-APIs auf Node umstellen:**

5. **`api/ideas/index.ts`** — `runtime: "nodejs"`
6. **`api/ideas/export.ts`** — `runtime: "nodejs"`
7. **`api/ideas/export-pack.ts`** — `runtime: "nodejs"`
8. **`api/ideas/attach-trigger.ts`** — `runtime: "nodejs"`
9. **`api/ideas/close.ts`** — `runtime: "nodejs"`

---

**Task 4A.3 — Journal-APIs auf Node umstellen:**

10. **`api/journal/index.ts`** — `runtime: "nodejs"`
11. **`api/journal/export.ts`** — `runtime: "nodejs"`

---

**Task 4A.4 — Alerts/Push-APIs auf Node umstellen:**

12. **`api/alerts/dispatch.ts`** — `runtime: "nodejs"`
13. **`api/push/subscribe.ts`** — `runtime: "nodejs"`
14. **`api/push/unsubscribe.ts`** — `runtime: "nodejs"`

---

### Phase 4B — Explizite Runtime-Deklaration (10+ APIs)

**Priorität: P1 — Best Practice, sollte behoben werden**

**Task 4B.1 — Implizite Node-APIs explizit machen:**

Füge `export const runtime = "nodejs";` am Anfang hinzu:

1. **`api/moralis/[...path].ts`** (Zeile 1, vor imports)
2. **`api/market/ohlc.ts`**
3. **`api/alerts/worker.ts`**
4. **`api/push/test-send.ts`**
5. **`api/rules/index.ts`**
6. **`api/rules/eval.ts`**
7. **`api/rules/eval-cron.ts`**
8. **`api/board/kpis.ts`**
9. **`api/board/feed.ts`**
10. **`api/dexpaprika/tokens/[address].ts`**
11. **`api/mcap.ts`**
12. **`api/cron/cleanup-temp-entries.ts`**
13. **`api/wallet/webhook.ts`**

---

### Phase 4C — API-Review & Verifizierung (5+ APIs)

**Priorität: P2 — Sollte geprüft werden**

**Task 4C.1 — Code-Review durchführen:**

Prüfe für jede API:
- Wird KV genutzt? → Node
- Werden schwere SDKs importiert? → Node
- Ist API stateless + leicht? → Edge OK

**APIs zu prüfen:**
1. **`api/ai/analyze-market.ts`**
   - Aktuell: edge
   - Prüfen: Werden AI-SDKs (OpenAI, Grok) importiert?
   - Falls ja → Node, falls nein → Edge OK

2. **`api/ai/assist.ts`**
   - Aktuell: edge
   - Prüfen: AI-SDK-Nutzung?

3. **`api/ai/grok-context.ts`**
   - Aktuell: edge
   - Prüfen: Grok-SDK-Nutzung? Dex/Birdeye-Calls?

4. **`api/backtest.ts`**
   - Aktuell: edge
   - Prüfen: Heavy Computation? Timeouts?
   - Falls heavy → Node, falls light → Edge OK

5. **`api/telemetry.ts`**
   - Aktuell: edge
   - Prüfen: Stateless? KV?

6. **`api/shortlink.ts`**
   - Aktuell: edge
   - Prüfen: Stateless? KV?

7. **`api/data/ohlc.ts`**
   - Aktuell: edge
   - Prüfen: Nur HTTP-Proxy? → Edge OK

**Output:** Für jede API Entscheidung dokumentieren (Edge OK oder → Node)

---

### Phase 4D — Modularisierung (Optional, Post-Fix)

**Priorität: P3 — Nice-to-Have, später**

**Task 4D.1 — Edge-Safe-Module erstellen:**

```bash
# Neues Verzeichnis
mkdir -p src/lib/grokPulse/edge-safe
```

**Dateien:**
- `src/lib/grokPulse/edge-safe/types.ts` — Re-export von `../types.ts`
- `src/lib/grokPulse/edge-safe/utils.ts` — Pure Functions (keine KV, keine heavy SDKs)
- `src/lib/grokPulse/edge-safe/schemas.ts` — Zod-Schemas

**Ziel:** Edge-APIs können aus `edge-safe/` importieren, ohne KV zu ziehen

---

**Task 4D.2 — Runtime-Marker hinzufügen:**

```typescript
// In src/lib/grokPulse/kv.ts (Zeile 1)
/**
 * ⚠️ NODE-ONLY MODULE
 * Dieses Modul importiert @vercel/kv und kann NICHT in Edge-Runtime verwendet werden.
 * Nur in Node-APIs importieren!
 */
export const RUNTIME_REQUIRED = "nodejs";
```

Gleich für:
- `src/lib/grokPulse/engine.ts`
- `src/lib/grokPulse/contextBuilder.ts`
- `src/lib/grokPulse/grokClient.ts`
- `src/lib/grokPulse/sources.ts`

---

## 📊 Zusammenfassung — Aufwandsschätzung

| Phase | Tasks | Dateien | Geschätzte Dauer | Priorität |
|-------|-------|---------|------------------|-----------|
| **4A** | Runtime-Fixes (edge → nodejs) | 14 APIs | 15-20 Min | P0 (KRITISCH) |
| **4B** | Explizite Runtime (implicit → nodejs) | 10-13 APIs | 10-15 Min | P1 (Empfohlen) |
| **4C** | Code-Review & Verifizierung | 7 APIs | 30-45 Min | P2 (Sollte) |
| **4D** | Modularisierung (edge-safe) | 3-5 Dateien | 30-60 Min | P3 (Optional) |
| **Total** | — | 34-39 Dateien | **1.5-2.5 Std** | — |

---

## ✅ Akzeptanzkriterien — Phase 4 Complete

Nach Codex-Implementierung:

### Minimale Success-Kriterien (Phase 4A+B)
- ✅ Alle KV-nutzenden APIs haben `runtime: "nodejs"`
- ✅ Keine Edge-Runtime + KV-Import-Kombination mehr vorhanden
- ✅ Alle impliziten Node-APIs haben explizite Runtime-Deklaration
- ✅ Deployment schlägt NICHT mehr wegen Edge/KV-Konflikt fehl

### Verifikation
```bash
# Sollte 0 Treffer liefern (kein Edge + KV):
grep -l 'runtime.*edge' api/**/*.ts | xargs grep -l 'from.*kv'

# Sollte 14 Treffer liefern (alle KV-APIs sind jetzt Node):
grep -l 'from.*kv' api/**/*.ts | xargs grep -l 'runtime.*nodejs'
```

### Erweiterte Success-Kriterien (Phase 4C+D)
- ✅ Alle AI-/Heavy-APIs geprüft und korrekt klassifiziert
- ✅ Edge-Safe-Module erstellt (optional)
- ✅ Runtime-Marker in Node-only-Libraries (optional)

---

## 🔗 Referenzen

- **Vercel Edge Runtime Docs:** https://vercel.com/docs/functions/edge-functions
- **@vercel/kv Docs:** https://vercel.com/docs/storage/vercel-kv
- **Next.js Route Handlers:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Sparkfined CI-Pläne:**
  - Phase 1: `docs/CI_FIX_PHASE_1_WORKFLOW.md`
  - Phase 2: `docs/TS_FIX_PLAN.md`
  - Phase 3: `docs/CI_FIX_PHASE_3_HEAVY_STEPS.md`

---

## 📌 Nächste Schritte

1. **Codex:** Phase 4A umsetzen (14 Runtime-Fixes)
2. **Codex:** Phase 4B umsetzen (10+ explizite Runtime-Deklarationen)
3. **Claude/Codex:** Phase 4C Code-Review durchführen
4. **Deployment:** Vercel-Deploy testen, KV-Funktionalität verifizieren
5. **Monitoring:** Vercel-Logs prüfen, keine Edge/KV-Errors mehr

---

**Status:** ✅ API-Landschaft vollständig analysiert | Bereit für Codex-Implementierung (Phase 4)
