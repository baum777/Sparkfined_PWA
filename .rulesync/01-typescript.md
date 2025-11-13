---
mode: SYSTEM
id: "01-typescript"
priority: 1
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode"]
globs: ["src/**/*.ts", "src/**/*.tsx", "api/**/*.ts", "ai/**/*.ts"]
description: "TypeScript strict-mode configuration, type patterns, and project-specific conventions for Sparkfined PWA"
---

# 01 – TypeScript Rules & Patterns

## 1. Philosophy

Sparkfined nutzt **TypeScript als Safety-Layer und Documentation-Tool**, nicht als Hindernis für schnelle Iteration. Unsere TS-Nutzung balanciert:

* **Strict-Mode-Safety:** Verhindert Runtime-Fehler durch Compiler-Checks
* **Type-Driven-Design:** Typen dokumentieren API-Contracts und Data-Flows
* **Pragmatischer Any-Use:** `any` ist erlaubt, wenn Type-Inference unmöglich oder unverhältnismäßig aufwändig ist
* **Developer-Experience:** Type-Hints beschleunigen Entwicklung (Autocomplete, Refactoring)

**Kernprinzip:** *„Types sollten Code lesbarer machen, nicht obfuscaten."*

---

## 2. Compiler & Config

### tsconfig.json (Core-Settings)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    
    "strict": true,                           // ✅ MUST
    "noUncheckedIndexedAccess": true,        // ✅ MUST
    "noImplicitOverride": true,              // ✅ MUST
    "noPropertyAccessFromIndexSignature": false,  // Relaxed für Legacy-Code
    
    "skipLibCheck": true,                     // Performance
    "noEmit": true,                           // Vite handhabt Build
    
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]                        // Path-Alias für Imports
    }
  }
}
```

### ESLint TypeScript Rules (Projekt-Spezifisch)

Sparkfined relaxiert bewusst einige TS-ESLint-Regeln für pragmatische Entwicklung:

```js
// eslint.config.js (Auszug)
rules: {
  "@typescript-eslint/no-explicit-any": "off",           // any erlaubt
  "@typescript-eslint/no-unsafe-assignment": "off",      // any-Assignments ok
  "@typescript-eslint/no-unsafe-member-access": "off",   // any-Access ok
  "@typescript-eslint/no-unsafe-call": "off",            // any-Calls ok
  "@typescript-eslint/no-unused-vars": ["warn", { 
    "argsIgnorePattern": "^_"                            // _prefix ignoriert
  }]
}
```

**Rationale:** APIs von Third-Party-Libraries (Moralis, Solana) haben teils schwache Typen. Perfekte Typisierung würde >50% Dev-Zeit kosten bei <5% Nutzen.

---

## 3. Allowed vs. Forbidden Patterns

### Any-Regeln

**[SHOULD]** Vermeide `any`, wo Type-Inference möglich ist

```tsx
// ❌ Avoid
const data: any = await fetchOhlc(address);

// ✅ Good
const data = await fetchOhlc(address);  // Type-Inference
```

**[MAY]** Nutze `any` bei Third-Party-APIs ohne Typen

```tsx
// ✅ Good: Moralis-Response hat keine offizielle Typisierung
const response: any = await moralisClient.call('/token/price');
const price = response.usdPrice as number;  // Cast nach Validation
```

**[MUST]** Kommentiere `any`, wenn es nicht offensichtlich ist

```tsx
// ✅ Good
// any: Solana-Transaction-Format ist dynamisch & versioniert
const tx: any = await connection.getTransaction(signature);
```

### Unknown vs. Any

**[SHOULD]** Bevorzuge `unknown` über `any` für externe Input-Daten

```tsx
// ✅ Good: API-Response validieren
async function parseApiResponse(data: unknown): Promise<OHLCData> {
  if (!isValidOHLC(data)) {
    throw new Error('Invalid OHLC data');
  }
  return data as OHLCData;
}
```

### Null & Undefined

**[MUST]** Nutze explizite `| null` / `| undefined` für optionale Werte

```tsx
// ✅ Good
interface JournalEntry {
  id: string;
  content: string;
  aiSummary: string | null;  // Explizit nullable
  tags?: string[];            // Optional (undefined möglich)
}
```

**[MUST NOT]** Nutze `null` und `undefined` austauschbar

```tsx
// ❌ Avoid: Inkonsistent
function getPrice(token: string): number | null | undefined { ... }

// ✅ Good: Eine Semantik
function getPrice(token: string): number | null { ... }  // null = nicht verfügbar
```

### Enums vs. Union-Types

**[SHOULD]** Bevorzuge Union-Types über Enums (tree-shakeable, simpler)

```tsx
// ✅ Good
type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

// ❌ Avoid (nur wenn enum-Logik nötig)
enum Timeframe {
  OneMin = '1m',
  FiveMin = '5m',
  // ...
}
```

---

## 4. Project-Specific Patterns

### Result-Types für API-Calls

**[SHOULD]** Nutze `Result<T, E>`-Pattern für Fehler-Handling

```tsx
// src/types/index.ts
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// ✅ Good Usage
async function fetchTokenData(address: string): Promise<Result<TokenData>> {
  try {
    const data = await adapter.fetch(address);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Consumer
const result = await fetchTokenData(address);
if (result.success) {
  console.log(result.data.price);  // Type-safe
} else {
  console.error(result.error.message);
}
```

### Discriminated Unions

**[MUST]** Nutze Discriminated Unions für Variants

```tsx
// ✅ Good: ViewState-Pattern
type ViewState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderView<T>(state: ViewState<T>) {
  switch (state.status) {
    case 'loading':
      return <LoadingSkeleton />;
    case 'success':
      return <DataView data={state.data} />;  // Type-safe
    case 'error':
      return <ErrorState message={state.error.message} />;
    default:
      return null;
  }
}
```

### API-Response-Typen

**[MUST]** Definiere Types für alle API-Responses in `src/types/`

```tsx
// src/types/market.ts
export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  marketCap: number | null;
  holders: number | null;
}
```

**[SHOULD]** Nutze Zod/Validator für Runtime-Validation (geplant, noch nicht implementiert)

### Barrel-Exports

**[MUST]** Importiere Types aus Barrel-Exports (`src/types/index.ts`)

```tsx
// ✅ Good
import type { JournalEntry, KPIData, OHLCData } from '@/types';

// ❌ Avoid: Direkte File-Imports
import type { JournalEntry } from '@/types/journal';
import type { KPIData } from '@/types/analysis';
```

**Rationale:** Einfachere Refactorings, zentrale Type-Verwaltung

### Generics für Wiederverwendbare Komponenten

**[SHOULD]** Nutze Generics für Data-Komponenten

```tsx
// ✅ Good: Generic Table-Component
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

export function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
  return (
    <table>
      {data.map((row, i) => (
        <tr key={i} onClick={() => onRowClick?.(row)}>
          {columns.map(col => <td key={col.key}>{col.render(row)}</td>)}
        </tr>
      ))}
    </table>
  );
}
```

### Utility-Types

**[SHOULD]** Nutze TS Utility-Types für DRY-Typen

```tsx
// ✅ Good
interface JournalEntry {
  id: string;
  content: string;
  timestamp: number;
  tags: string[];
  aiSummary: string | null;
}

type JournalEntryCreate = Omit<JournalEntry, 'id' | 'timestamp'>;
type JournalEntryUpdate = Partial<JournalEntryCreate> & { id: string };

// Usage
async function createEntry(data: JournalEntryCreate): Promise<JournalEntry> {
  const entry: JournalEntry = {
    id: generateId(),
    timestamp: Date.now(),
    ...data,
  };
  await db.entries.add(entry);
  return entry;
}
```

---

## 5. Examples

### ✅ Good – Complete Type-Safety

```tsx
// src/lib/adapters/MoralisAdapter.ts
import type { TokenMetadata, Result } from '@/types';

export class MoralisAdapter {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async fetchTokenMetadata(address: string): Promise<Result<TokenMetadata>> {
    try {
      const response = await fetch(`${this.baseUrl}/token/${address}`, {
        headers: { 'X-API-Key': this.apiKey },
      });

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      const data: any = await response.json();  // any ok: external API
      
      // Runtime-Validation
      if (!data.address || typeof data.symbol !== 'string') {
        throw new Error('Invalid token data structure');
      }

      const metadata: TokenMetadata = {
        address: data.address,
        symbol: data.symbol,
        name: data.name || 'Unknown',
        decimals: data.decimals || 9,
        marketCap: data.market_cap ?? null,
        holders: data.holders ?? null,
      };

      return { success: true, data: metadata };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
```

### ❌ Avoid – Type-Safety-Violations

```tsx
// ❌ Bad: Fehlende Type-Definitionen
export function fetchData(address) {  // Implizit any
  return fetch(`/api/data/${address}`).then(r => r.json());
}

// ❌ Bad: Unsafe Type-Assertions
const data = response as TokenData;  // Keine Runtime-Validation!

// ❌ Bad: Inkonsistente Null-Semantik
function getUser(id: string): User | null | undefined {
  // null UND undefined? Unklar, was was bedeutet
}

// ❌ Bad: Ungenutzte Generics
function identity<T>(value: any): any {  // Generic bringt nichts
  return value;
}
```

### ✅ Good – Discriminated Union mit Type-Guards

```tsx
// src/types/viewState.ts
export type ViewState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Type-Guards
export function isSuccess<T>(state: ViewState<T>): state is { status: 'success'; data: T } {
  return state.status === 'success';
}

export function isError<T>(state: ViewState<T>): state is { status: 'error'; error: Error } {
  return state.status === 'error';
}

// Usage in Component
function KPITile({ state }: { state: ViewState<KPIData> }) {
  if (state.status === 'loading') return <Skeleton />;
  if (isError(state)) return <Error message={state.error.message} />;
  if (isSuccess(state)) {
    return <div>{state.data.label}: {state.data.value}</div>;  // Type-safe!
  }
  return null;
}
```

---

## 6. Linting & Tooling

### ESLint Integration

**TypeScript-ESLint nutzt `tsconfig.json` für Type-Aware-Linting:**

```js
// eslint.config.js
languageOptions: {
  parserOptions: {
    project: "./tsconfig.json"  // Type-Info für Linter
  }
}
```

**Wichtige aktivierte Regeln:**
- `@typescript-eslint/no-unused-vars` → Warnung (nicht Error, wegen _prefix)
- Standard-ESLint-Regeln (no-undef, no-const-assign, etc.)

**Wichtige deaktivierte Regeln (Projekt-spezifisch):**
- `@typescript-eslint/no-explicit-any` → off (pragmatischer any-Use erlaubt)
- `@typescript-eslint/no-unsafe-*` → off (Third-Party-API-Kompatibilität)
- `@typescript-eslint/no-floating-promises` → off (async ohne await erlaubt)

### Type-Checking in CI/CD

**[MUST]** Run TypeScript-Check vor jedem Deploy

```bash
# package.json
"scripts": {
  "typecheck": "tsc --noEmit",
  "prebuild": "pnpm typecheck"
}
```

**[SHOULD]** Nutze `tsc --watch` im Dev-Mode für Echtzeit-Feedback

### Path-Alias (@/*) Setup

**Konfiguration für Imports:**

```json
// tsconfig.json
"paths": {
  "@/*": ["src/*"]
}

// vite.config.ts
resolve: {
  alias: {
    '@': '/src'
  }
}
```

**Usage:**

```tsx
// ✅ Good: Path-Alias
import { fetchOhlc } from '@/lib/adapters/ohlc';
import type { KPIData } from '@/types';

// ❌ Avoid: Relative Paths über 2+ Ebenen
import { fetchOhlc } from '../../../lib/adapters/ohlc';
```

---

## 7. Common Pitfalls & Solutions

### Pitfall 1: Index-Access ohne Check

```tsx
// ❌ Bad: noUncheckedIndexedAccess aktiviert → Type ist T | undefined
const prices = { BTC: 50000, ETH: 3000 };
const btcPrice = prices['BTC'];  // Type: number | undefined
console.log(btcPrice.toFixed(2));  // Error! Might be undefined

// ✅ Good: Explizite Checks
const btcPrice = prices['BTC'];
if (btcPrice !== undefined) {
  console.log(btcPrice.toFixed(2));
}

// ✅ Alternative: Nullish-Coalescing
const btcPrice = prices['BTC'] ?? 0;
console.log(btcPrice.toFixed(2));
```

### Pitfall 2: Async ohne Await (Silent Failures)

```tsx
// ❌ Bad: Promise wird nicht behandelt
function saveEntry(entry: JournalEntry) {
  db.entries.add(entry);  // Promise wird ignoriert!
}

// ✅ Good: Explizites await oder void
async function saveEntry(entry: JournalEntry) {
  await db.entries.add(entry);
}

// ✅ Alternative: Fire-and-Forget mit void (bewusst)
function saveEntry(entry: JournalEntry) {
  void db.entries.add(entry).catch(console.error);
}
```

### Pitfall 3: Type-Assertion ohne Validation

```tsx
// ❌ Bad: Blind-Assertion
const data = await response.json() as TokenData;

// ✅ Good: Validate before cast
const data: unknown = await response.json();
if (isValidTokenData(data)) {
  const tokenData = data as TokenData;
  // ...
}
```

---

## Related

- `00-project-core.md` – Projekt-Übersicht und Tech-Stack
- `02-frontend-arch.md` – Datei-Organisation und Imports
- `05-api-integration.md` – API-Response-Typen und Adapters
- `src/types/` – Zentrale Type-Definitionen

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 1 (strict-mode patterns + pragmatic any-use)
