# Sparkfined PWA – TypeScript RuleSync & Error Patterns (v1.0)

**Created:** 2025-11-28  
**Purpose:** Document TypeScript compiler configuration, common error patterns, and systematic fix strategies for maintaining type safety across the codebase.

---

## 1. TypeScript Toolchain Overview

### 1.1 Compiler Configuration

**Files:**
- `tsconfig.json` (main config)
- `tsconfig.build.json` (production build, excludes tests)

**Target & Module:**
```json
{
  "target": "ES2022",
  "lib": ["ES2022", "DOM", "DOM.Iterable"],
  "module": "ESNext",
  "moduleResolution": "Bundler",
  "jsx": "react-jsx"
}
```

**Key Features:**
- ✅ Modern ES2022 features (top-level await, class fields, etc.)
- ✅ React 18 JSX transform (no `React` import needed)
- ✅ Path aliases: `@/*` → `src/*`

---

### 1.2 Strictness Settings (MAXIMUM)

**Core Strict Flags:**

```json
{
  "strict": true,                           // ⚠️ Enables ALL strict checks
  "noUncheckedIndexedAccess": true,         // ⚠️ CRITICAL: arr[0] → T | undefined
  "noImplicitOverride": true,               // ⚠️ Requires explicit override keyword
  "noPropertyAccessFromIndexSignature": false
}
```

**What `strict: true` Enables:**

| Flag | Impact |
|------|--------|
| `noImplicitAny` | Every untyped param/var must be explicit |
| `strictNullChecks` | `null` and `undefined` are distinct types |
| `strictFunctionTypes` | Function params are contravariant |
| `strictBindCallApply` | Type-check `.bind()`, `.call()`, `.apply()` |
| `strictPropertyInitialization` | Class properties must be initialized |
| `noImplicitThis` | `this` must be explicitly typed |
| `alwaysStrict` | Emit "use strict" in output |

**Critical Impact of `noUncheckedIndexedAccess`:**

```typescript
// With noUncheckedIndexedAccess: true
const arr = [1, 2, 3]
const first = arr[0]  // Type: number | undefined ⚠️

const obj = { key: 'value' }
const val = obj['key']  // Type: string | undefined ⚠️

// Without this flag:
const first = arr[0]  // Type: number ❌ (unsafe!)
```

**Impact:** Every array/object access requires guards or optional chaining.

---

### 1.3 Type Definitions & External Libraries

**Global Types (from `tsconfig.json`):**

```json
{
  "types": [
    "vitest/globals",           // describe, it, expect
    "@testing-library/jest-dom", // .toBeInTheDocument() (legacy)
    "node"                      // process.env, etc.
  ]
}
```

**React/JSX:**
- `@types/react`, `@types/react-dom` via dependencies
- React 18.3 (strict mode compatible)

**Testing:**
- Vitest (primary) – `.toBeTruthy()`, `.toEqual()`
- Chai (legacy, being phased out) – `.to.exist`, `.to.be.null`
- Testing Library – `screen.getByRole()`, etc.

---

## 2. Top TypeScript Error Categories

### 2.1 Possibly Undefined – Array/Object Access (TS18048 / TS2532)

**TS Error Codes:**
- `TS18048`: 'X' is possibly 'undefined'
- `TS2532`: Object is possibly 'undefined'

**Root Cause:**
- `noUncheckedIndexedAccess: true` flag
- `strictNullChecks: true` flag

**Symptoms:**

```typescript
// ❌ ERROR: TS18048
const entries = [{ id: '1' }, { id: '2' }]
const first = entries[0]
console.log(first.id)  // Error: Object is possibly 'undefined'

// ❌ ERROR: TS2532
const result = await fetchData()
const payload = result.data
const value = payload.insights[0].title  // Error: Object is possibly 'undefined'
```

**Where Found in Codebase:**
- `src/lib/priceAdapter.ts` (4 instances) – API response mapping
- `src/lib/journal/journal-mapping.ts` (2 instances) – `tags[0]`, destructuring
- `src/store/journalStore.ts` (2 instances) – Store entry access
- `tests/unit/*.test.ts` (multiple) – Test assertions on arrays

**Fix Pattern 1: Guard with Early Return/Throw**

```typescript
// ✅ BEFORE ERROR
const first = entries[0]
if (!first) {
  throw new Error('Expected at least one entry')
}
console.log(first.id)  // OK: TypeScript knows first is defined

// ✅ ALTERNATIVE: Early return
function processEntries(entries: Entry[]) {
  const first = entries[0]
  if (!first) {
    return null  // or default value
  }
  return first.id
}
```

**Fix Pattern 2: Optional Chaining**

```typescript
// ✅ For nullable flows
const title = result.data?.insights?.[0]?.title
if (!title) {
  return 'No insights available'
}
```

**Fix Pattern 3: Destructuring with Guard (Tests)**

```typescript
// ✅ BEFORE ERROR (in tests)
const [first, second] = mappedEntries
if (!first || !second) {
  throw new Error('Expected at least two entries')
}

expect(first.id).toBe('entry-1')  // OK: first is narrowed to non-undefined
expect(second.ticker).toBe('BONK')
```

**Fix Pattern 4: Array.prototype.at() (with guard)**

```typescript
// ✅ Using .at() (still returns T | undefined)
const last = entries.at(-1)
if (!last) {
  return  // Handle empty array
}
return last.id
```

**Anti-Patterns (DON'T):**

```typescript
// ❌ Non-null assertion (hides bugs)
const first = entries[0]!
console.log(first.id)  // Compiles, but crashes if empty array

// ❌ Type assertion (unsafe)
const first = entries[0] as Entry
console.log(first.id)  // Compiles, but crashes if empty array

// ❌ any escape hatch
const first = (entries as any)[0]
```

**Do:**
- ✅ Guard all array accesses: `if (!arr[0]) throw/return`
- ✅ Use `.find()` + guard when semantic match matters
- ✅ Optional chaining for nullable flows
- ✅ Destructure + guard pattern in tests

**Don't:**
- ❌ Use `!` (non-null assertion) unless 100% guaranteed + documented
- ❌ Disable `noUncheckedIndexedAccess` (defeats type safety)
- ❌ Cast to `any` to silence errors

---

### 2.2 Store vs Domain Type Mismatch (TS2322)

**TS Error Code:**
- `TS2322`: Type 'X' is not assignable to type 'Y'

**Root Cause:**
- Separation between **Store Types** (UI/State) and **Domain Types** (Business Logic/AI)
- Example: `JournalEntry` (Store) ≠ `JournalEntry` (Domain)

**Type Comparison:**

| Field | Store Type (`@/store/journalStore`) | Domain Type (`@/types/journal`) |
|-------|-------------------------------------|----------------------------------|
| ID | `id: string` | `id: string` ✅ |
| Time | `date: string` (display) | `timestamp: number` (Unix ms) |
| Symbol | ❌ (derived from tags) | `ticker: string` ✅ |
| Address | ❌ (not stored) | `address: string` ✅ |
| Setup | ❌ (not stored) | `setup: SetupTag` ✅ |
| Emotion | ❌ (not stored) | `emotion: EmotionTag` ✅ |
| Notes | `notes?: string` | `thesis?: string` (renamed) |
| PnL | `pnl?: string` (display) | `outcome?: TradeOutcome` (structured) |
| Journey | `journeyMeta?: JournalJourneyMeta` | `journeyMeta?: JournalJourneyMeta` ✅ |

**Symptom:**

```typescript
// ❌ ERROR: TS2322
import type { JournalEntry as StoreEntry } from '@/store/journalStore'
import type { JournalEntry as DomainEntry } from '@/types/journal'

const storeEntry: StoreEntry = { id: '1', title: 'SOL trade', date: 'Mar 14', ... }

// Trying to pass to AI service
const result = await getJournalInsightsForEntries({
  entries: [storeEntry]  // Error: StoreEntry is not assignable to DomainEntry
})
```

**Fix Pattern 1: Centralized Mapping Helper**

```typescript
// ✅ src/lib/journal/journal-mapping.ts
import type { JournalEntry as StoreEntry } from '@/store/journalStore'
import type { JournalEntry as DomainEntry } from '@/types/journal'

export function mapStoreEntryToDomain(entry: StoreEntry): DomainEntry {
  const timestamp = parseStoreDateToTimestamp(entry.date)
  
  return {
    id: entry.id,
    timestamp,
    ticker: deriveTicker(entry),           // Extract from tags or title
    address: 'manual-entry',                // Fallback for UI entries
    setup: 'custom',                        // Fallback
    emotion: 'custom',                      // Fallback
    customTags: entry.tags,
    thesis: entry.notes,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    journeyMeta: entry.journeyMeta,
    // ... other required fields with safe defaults
  }
}

export function mapStoreEntriesToDomain(entries: StoreEntry[]): DomainEntry[] {
  return entries.map(mapStoreEntryToDomain)
}
```

**Usage:**

```typescript
// ✅ In components/services
import { mapStoreEntriesToDomain } from '@/lib/journal/journal-mapping'

const storeEntries = useJournalStore(state => state.entries)
const domainEntries = mapStoreEntriesToDomain(storeEntries)

const result = await getJournalInsightsForEntries({ entries: domainEntries })
```

**Fix Pattern 2: Type-Safe Literal Unions**

**Problem:**

```typescript
// ❌ ERROR: Type 'string' is not assignable to type 'JourneyPhase'
interface JournalJourneyMeta {
  phase: JourneyPhase  // 'DEGEN' | 'SEEKER' | 'WARRIOR' | 'MASTER' | 'SAGE'
  xpTotal: number
  streak: number
  lastEventAt: number
}

const meta = {
  phase: 'SEEKER',  // Error: string is not assignable to JourneyPhase
  xpTotal: 100,
  streak: 3,
  lastEventAt: Date.now()
}
```

**Solution:**

```typescript
// ✅ Option 1: Type assertion (safe if value is literal)
const meta: JournalJourneyMeta = {
  phase: 'SEEKER' as JourneyPhase,
  xpTotal: 100,
  streak: 3,
  lastEventAt: Date.now()
}

// ✅ Option 2: Helper function (type-safe constructor)
function makeJourneyMeta(
  phase: JourneyPhase,
  xpTotal: number,
  streak: number,
  lastEventAt: number
): JournalJourneyMeta {
  return { phase, xpTotal, streak, lastEventAt }
}

const meta = makeJourneyMeta('SEEKER', 100, 3, Date.now())
```

**Do:**
- ✅ Use centralized mapping helpers (`mapStoreEntriesToDomain`)
- ✅ Define helper constructors for complex types (`makeJourneyMeta`)
- ✅ Keep Store types minimal (UI-focused)
- ✅ Keep Domain types complete (business-logic-focused)

**Don't:**
- ❌ Copy-paste mapping logic into components
- ❌ Use `as DomainEntry` without validation
- ❌ Mix Store and Domain types in same module

---

### 2.3 Union Narrowing & Discriminated Unions (TS2339 / TS2367)

**TS Error Codes:**
- `TS2339`: Property 'X' does not exist on type 'Y'
- `TS2367`: This condition will always return 'false'

**Root Cause:**
- Accessing properties on union types without narrowing
- Common in Event/Telemetry systems with multiple payload types

**Example (Event Bus):**

```typescript
// Types
type JournalEvent = 
  | { type: 'JournalEntryCreated'; payload: { entryId: string; snapshot: JournalEntry } }
  | { type: 'JournalReflexionCompleted'; payload: { entryId: string; qualityScore: number } }
  | { type: 'JournalTradeMarkedActive'; payload: { entryId: string; markedAt: number } }

// ❌ ERROR: TS2339
function processEvent(event: JournalEvent) {
  console.log(event.payload.snapshot)  // Error: snapshot doesn't exist on all union members
}
```

**Fix Pattern 1: Type Guard with `type` Field**

```typescript
// ✅ Discriminated union narrowing
function processEvent(event: JournalEvent) {
  if (event.type === 'JournalEntryCreated') {
    console.log(event.payload.snapshot)  // OK: TypeScript knows it's CreatedEvent
  } else if (event.type === 'JournalReflexionCompleted') {
    console.log(event.payload.qualityScore)  // OK: TypeScript knows it's ReflexionEvent
  }
}
```

**Fix Pattern 2: Switch Statement**

```typescript
// ✅ Exhaustive pattern matching
function processEvent(event: JournalEvent) {
  switch (event.type) {
    case 'JournalEntryCreated':
      return handleCreated(event.payload.snapshot)
    case 'JournalReflexionCompleted':
      return handleReflexion(event.payload.qualityScore)
    case 'JournalTradeMarkedActive':
      return handleActive(event.payload.markedAt)
    default:
      const _exhaustive: never = event  // Compiler error if case missing
      throw new Error('Unhandled event type')
  }
}
```

**Fix Pattern 3: `in` Operator for Property Checks**

```typescript
// ✅ Property-based narrowing
function processTelemetry(event: TelemetryEvent) {
  if (event.kind === 'journal_insight' && 'analysisKey' in event.payload) {
    console.log(event.payload.analysisKey)  // OK
  }
}
```

**Example (Telemetry Payloads):**

```typescript
// Domain types
type TelemetryEvent =
  | { kind: 'journal'; payload: TelemetryJournalPayloadV1 }
  | { kind: 'journal_insight'; payload: TelemetryJournalInsightPayloadV1 }
  | { kind: 'system'; payload?: Record<string, unknown> }

// ✅ Type-safe handler
function sendToAnalytics(event: TelemetryEvent) {
  if (event.kind === 'journal_insight') {
    // TypeScript knows: event.payload is TelemetryJournalInsightPayloadV1
    console.log(`Generated ${event.payload.insightCount} insights`)
  }
}
```

**Do:**
- ✅ Use discriminated unions with `type` or `kind` field
- ✅ Narrow with `if (event.type === 'X')` or `switch`
- ✅ Use `in` operator for optional property checks
- ✅ Add `never` check in `default` for exhaustiveness

**Don't:**
- ❌ Access union properties without narrowing
- ❌ Use type assertions to bypass narrowing (`event as SpecificEvent`)
- ❌ Forget to handle all union cases (breaks when adding new types)

---

### 2.4 Test Typing – Helpers & Assertions

**Root Cause:**
- Test code often has complex type flows (mocks, fixtures, assertions)
- Array accesses without guards (from §2.1)
- Mixed Vitest/Chai types

**Symptom:**

```typescript
// ❌ ERROR: TS18048 in tests
const result = await getJournalInsightsForEntries({ entries })
const fomoInsight = result.insights.find(i => i.category === 'BEHAVIOR_LOOP')

expect(fomoInsight.severity).toBe('WARNING')  // Error: fomoInsight possibly undefined
```

**Fix Pattern 1: Guard in Test**

```typescript
// ✅ Explicit guard
const fomoInsight = result.insights.find(i => i.category === 'BEHAVIOR_LOOP')
expect(fomoInsight).toBeTruthy()  // Assertion
if (!fomoInsight) {
  throw new Error('Expected BEHAVIOR_LOOP insight')  // Guard for TS
}

expect(fomoInsight.severity).toBe('WARNING')  // OK: fomoInsight is non-undefined
```

**Fix Pattern 2: Helper Function with Type Narrowing**

```typescript
// ✅ Reusable helper
function getSingleInsight(
  result: JournalInsightResult,
  category: JournalInsightCategory
): JournalInsight {
  const insight = result.insights.find(i => i.category === category)
  if (!insight) {
    throw new Error(`Expected insight with category ${category}`)
  }
  return insight
}

// Usage in test
const fomoInsight = getSingleInsight(result, 'BEHAVIOR_LOOP')
expect(fomoInsight.severity).toBe('WARNING')  // OK: helper throws if undefined
```

**Fix Pattern 3: Destructuring with Guard**

```typescript
// ✅ For array destructuring in tests
const [first, second] = mappedEntries
if (!first || !second) {
  throw new Error('Expected at least two entries')
}

expect(first.id).toBe('entry-1')    // OK
expect(second.ticker).toBe('BONK')  // OK
```

**Fix Pattern 4: Fixture Builders**

```typescript
// ✅ Type-safe fixture helpers
function makeJourneyMeta(
  phase: JourneyPhase,
  xpTotal: number,
  streak: number,
  lastEventAt: number
): JournalJourneyMeta {
  return { phase, xpTotal, streak, lastEventAt }
}

// Usage in fixtures
const REALISTIC_ENTRIES: JournalEntry[] = [
  {
    id: 'trade-1',
    // ...
    journeyMeta: makeJourneyMeta('DEGEN', 900, 0, Date.now())
  }
]
```

**Do:**
- ✅ Create helper functions with built-in guards (`getSingleInsight`)
- ✅ Use fixture builders for complex types (`makeJourneyMeta`)
- ✅ Guard array accesses in assertions
- ✅ Prefer Vitest matchers (`.toBeTruthy()`) over Chai (`.to.exist`)

**Don't:**
- ❌ Access `result.insights[0]` directly in tests without guard
- ❌ Mix Chai and Vitest matchers (type confusion)
- ❌ Use `as` assertions in tests (defeats type checking)

---

### 2.5 API Adapter Typing – External Data (TS7006 / TS2571)

**TS Error Codes:**
- `TS7006`: Parameter 'X' implicitly has an 'any' type
- `TS2571`: Object is of type 'unknown'

**Root Cause:**
- External API responses have unknown/changing schemas
- Defensive parsing requires type flexibility

**Current Pragmatic Approach:**

```typescript
// ✅ ACCEPTABLE: External API with unknown schema
const mapDexPaprikaCandles = (rows: any[]): Candle[] =>
  rows
    .map((row) => ({
      time: Math.floor(new Date(row.timestamp ?? row.time ?? row[0]).getTime() / 1000),
      open: Number(row.open ?? row[1]),
      high: Number(row.high ?? row[2]),
      low: Number(row.low ?? row[3]),
      close: Number(row.close ?? row[4]),
      volume: row.volume != null ? Number(row.volume) : undefined,
    }))
    .filter((candle) => Number.isFinite(candle.time) && Number.isFinite(candle.close))
```

**Improvement Pattern (Optional):**

```typescript
// ✅ BETTER: Minimal interface + index signature
interface DexPaprikaRawCandle {
  timestamp?: string | number
  time?: string | number
  open?: string | number
  high?: string | number
  low?: string | number
  close?: string | number
  volume?: string | number
  [key: string]: unknown  // Flexibility for unknown fields
}

const mapDexPaprikaCandles = (rows: DexPaprikaRawCandle[]): Candle[] =>
  rows.map(row => ({
    // Same defensive logic, but with type hints
    time: Math.floor(new Date(row.timestamp ?? row.time ?? 0).getTime() / 1000),
    open: Number(row.open ?? 0),
    // ...
  }))
```

**Fix Strategy:**

**Short-term (Current):**
- ✅ `any` is acceptable for:
  - External API adapters (DexPaprika, Moralis, Pump.fun)
  - Event payloads from third-party libraries
  - Rapid prototyping (with `// TODO: type this`)

**Long-term (Refinement):**
- Replace with minimal interfaces (known fields + index signature)
- Add runtime validation for critical flows (Zod/Yup if needed)
- Use `unknown` + type guards instead of `any`

**Do:**
- ✅ Isolate `any` in adapter/boundary layers
- ✅ Add TODO comments tracking `any` usage
- ✅ Use defensive parsing (Number(), fallbacks, filters)
- ✅ Test adapter edge cases (null, undefined, wrong types)

**Don't:**
- ❌ Spread `any` types across modules (keep contained)
- ❌ Use `any` in domain/business logic
- ❌ Skip runtime validation for critical data

---

## 3. Best Practices for New Features

### 3.1 Type-First Development

**Process:**

1. **Define Types FIRST** (before implementation)
   ```typescript
   // 1. Define domain types
   export interface FeatureConfig {
     enabled: boolean
     threshold: number
     mode: 'auto' | 'manual'
   }
   
   // 2. Define API contracts
   export interface FeatureRequest {
     userId: string
     config: FeatureConfig
   }
   
   export interface FeatureResponse {
     success: boolean
     data?: FeatureResult
     error?: string
   }
   
   // 3. THEN implement
   ```

2. **Use Strict Return Types** (no implicit returns)
   ```typescript
   // ✅ Explicit return type
   function processFeature(req: FeatureRequest): FeatureResponse {
     // Compiler ensures all code paths return FeatureResponse
   }
   ```

3. **Leverage Type Inference** (where safe)
   ```typescript
   // ✅ Inference for simple cases
   const result = processFeature(request)  // Type inferred as FeatureResponse
   ```

---

### 3.2 Handling External Data

**Pattern for API Responses:**

```typescript
// 1. Define minimal DTO
interface ExternalApiResponse {
  status: string
  data?: unknown
  error?: string
}

// 2. Parse defensively
function parseApiResponse(raw: ExternalApiResponse): Result<Data, Error> {
  if (raw.status !== 'success' || !raw.data) {
    return { success: false, error: new Error(raw.error ?? 'Unknown error') }
  }
  
  // 3. Validate/transform
  const parsed = parseData(raw.data)  // Type-safe parser
  if (!isValid(parsed)) {
    return { success: false, error: new Error('Invalid data shape') }
  }
  
  return { success: true, data: parsed }
}
```

---

### 3.3 Event-Driven Architecture

**Pattern for Telemetry/Events:**

```typescript
// 1. Define discriminated union
type AppEvent =
  | { kind: 'feature_used'; payload: FeatureUsedPayload }
  | { kind: 'error_occurred'; payload: ErrorPayload }

// 2. Versioned payloads
interface FeatureUsedPayload {
  schemaVersion: 1
  featureId: string
  timestamp: string
}

// 3. Type-safe handlers
function handleEvent(event: AppEvent) {
  switch (event.kind) {
    case 'feature_used':
      return trackFeatureUse(event.payload)  // Payload is narrowed
    case 'error_occurred':
      return logError(event.payload)
    default:
      const _never: never = event  // Exhaustiveness check
  }
}
```

---

### 3.4 Testing New Features

**Type-Safe Test Patterns:**

```typescript
// 1. Fixture builders
function makeFeatureConfig(overrides?: Partial<FeatureConfig>): FeatureConfig {
  return {
    enabled: true,
    threshold: 100,
    mode: 'auto',
    ...overrides
  }
}

// 2. Helper assertions
function expectFeatureSuccess(result: FeatureResponse): asserts result is { success: true; data: FeatureResult } {
  expect(result.success).toBe(true)
  if (!result.success) {
    throw new Error('Expected success response')
  }
}

// 3. Usage
const config = makeFeatureConfig({ threshold: 200 })
const result = await processFeature({ userId: '1', config })

expectFeatureSuccess(result)
expect(result.data.score).toBeGreaterThan(150)  // result.data is guaranteed to exist
```

---

## 4. Handoff for Codex – TS Fix Clusters

### 4.1 Cluster 1: Possibly Undefined & Index Access (Priority: HIGH)

**Scope:**
- All array accesses (`[0]`, `[1]`, `.at()`) without guards
- Object property accesses on optional types
- Focus areas:
  - `src/lib/priceAdapter.ts` (4 instances)
  - `src/lib/journal/journal-mapping.ts` (2 instances)
  - `src/store/journalStore.ts` (2 instances)
  - `tests/unit/*.test.ts` (multiple instances)

**Fix Strategy:**

1. **Scan Pattern:**
   ```bash
   grep -rn "\[0\]|\[1\]|\.at(" src/ tests/
   ```

2. **For Each Instance:**
   - Determine context: Is this guaranteed non-empty? Or needs guard?
   - If guaranteed: Add comment explaining why + guard for safety
   - If not guaranteed: Add guard (early return/throw)

3. **Fix Template:**
   ```typescript
   // BEFORE
   const first = arr[0]
   
   // AFTER (guard)
   const first = arr[0]
   if (!first) {
     throw new Error('Expected non-empty array')
   }
   
   // OR (optional chaining + default)
   const value = arr[0]?.property ?? fallbackValue
   ```

**Success Criteria:**
- `pnpm run typecheck` passes (0 TS18048/TS2532 errors)
- No new `!` (non-null assertions) introduced
- All guards are meaningful (not just `if (!x) throw`)

---

### 4.2 Cluster 2: Store ↔ Domain Type Mapping (Priority: MEDIUM)

**Scope:**
- Ensure all Store → Domain conversions use `mapStoreEntriesToDomain`
- Fix any remaining `phase: string` → `JourneyPhase` issues
- Consolidate mapping logic

**Fix Strategy:**

1. **Audit Pattern:**
   ```bash
   grep -rn "JournalEntry.*Domain\|StoreJournalEntry" src/
   ```

2. **For Each Usage:**
   - Replace inline mapping with `mapStoreEntriesToDomain()`
   - Use `makeJourneyMeta()` for JourneyMeta construction
   - Ensure literal types for unions (`'DEGEN'` not `string`)

3. **Fix Template:**
   ```typescript
   // BEFORE
   const domainEntries = storeEntries.map(e => ({
     id: e.id,
     ticker: e.tags?.[0] ?? 'MANUAL',
     // ... manual mapping
   }))
   
   // AFTER
   import { mapStoreEntriesToDomain } from '@/lib/journal/journal-mapping'
   const domainEntries = mapStoreEntriesToDomain(storeEntries)
   ```

**Success Criteria:**
- All Store → Domain conversions use centralized helper
- No inline mapping logic in components/pages
- Zero TS2322 errors related to JournalEntry types

---

### 4.3 Cluster 3: Test Typing & Helpers (Priority: LOW)

**Scope:**
- Add type-safe test helpers where needed
- Ensure all test assertions have guards
- Complete Chai → Vitest migration

**Fix Strategy:**

1. **Create Helpers:**
   ```typescript
   // tests/helpers/assertions.ts
   export function getSingleInsight(
     result: JournalInsightResult,
     category: JournalInsightCategory
   ): JournalInsight {
     const insight = result.insights.find(i => i.category === category)
     if (!insight) {
       throw new Error(`Expected insight with category ${category}`)
     }
     return insight
   }
   ```

2. **Update Tests:**
   - Replace direct array access with helpers
   - Add guards for destructuring
   - Use Vitest matchers consistently

**Success Criteria:**
- All test files use helpers for common patterns
- No TS errors in test files
- Test coverage maintained or improved

---

### 4.4 General Working Guidelines for Codex

**When Encountering New TS Errors:**

1. **Identify Error Category** (use this doc's §2 sections)
2. **Apply Corresponding Fix Pattern** (from §2.X "Fix Pattern")
3. **Verify No Regressions:**
   ```bash
   pnpm run typecheck
   pnpm run lint
   pnpm run test
   ```
4. **Document Non-Obvious Fixes** (inline comments)

**Never:**
- ❌ Disable TS flags to fix errors (`strict: false`, `noUncheckedIndexedAccess: false`)
- ❌ Add `@ts-ignore` / `@ts-expect-error` without explanation
- ❌ Use `any` outside of adapter layers
- ❌ Use `!` (non-null assertion) without guard + comment

**Always:**
- ✅ Fix the code, not the compiler
- ✅ Add guards for undefined/null checks
- ✅ Use centralized helpers (mapping, fixtures)
- ✅ Test after every change

---

## 5. Appendix

### 5.1 Quick Reference – Error Code Lookup

| Error Code | Meaning | Fix Strategy |
|------------|---------|--------------|
| TS18048 | 'X' is possibly 'undefined' | Add guard or optional chaining (§2.1) |
| TS2532 | Object is possibly 'undefined' | Same as TS18048 |
| TS2322 | Type 'X' not assignable to 'Y' | Check Store vs Domain (§2.2) |
| TS2339 | Property 'X' does not exist | Union narrowing (§2.3) |
| TS2367 | Condition always false | Check union narrowing logic |
| TS7006 | Implicitly has 'any' type | Add explicit type or define interface |
| TS2571 | Object is of type 'unknown' | Use type guard or assertion |

---

### 5.2 TypeScript Compiler Flags Summary

**Ultra-Strict (Enabled):**
- ✅ `strict: true` (all strict checks)
- ✅ `noUncheckedIndexedAccess: true` (every `[index]` → `T | undefined`)
- ✅ `noImplicitOverride: true`

**Not Enabled (Reasonable):**
- ⚠️ `noPropertyAccessFromIndexSignature: false` (allow `obj[key]`)

**Philosophy:**
- Catch bugs at compile time, not runtime
- Explicit is better than implicit
- Type safety >> convenience

---

### 5.3 Common Patterns Quick Reference

**Array Access:**
```typescript
// ❌ Unsafe
const x = arr[0].value

// ✅ Safe
const first = arr[0]
if (!first) return
const x = first.value
```

**Union Narrowing:**
```typescript
// ❌ Unsafe
const value = event.payload.specificField

// ✅ Safe
if (event.type === 'SpecificEvent') {
  const value = event.payload.specificField
}
```

**Store → Domain:**
```typescript
// ❌ Manual
const domain = { id: store.id, ticker: store.tags?.[0] ?? 'MANUAL', ... }

// ✅ Helper
const domain = mapStoreEntryToDomain(store)
```

**Test Assertions:**
```typescript
// ❌ Unsafe
expect(result.insights[0].title).toBe('X')

// ✅ Safe
const insight = getSingleInsight(result, 'BEHAVIOR_LOOP')
expect(insight.title).toBe('X')
```

---

## 6. Summary & Current State

**Current TypeScript Health (2025-11-28):**

| Metric | Status |
|--------|--------|
| `pnpm run typecheck` | ✅ 0 errors |
| Strict mode | ✅ Enabled |
| noUncheckedIndexedAccess | ✅ Enabled |
| Array accesses | ⚠️ 59 instances (review needed) |
| Store/Domain mapping | ✅ Centralized helper exists |
| Test typing | ✅ Helper patterns emerging |

**Top 3 Proactive Improvements:**

1. **Guard all array accesses** (59 instances) → Cluster 1
2. **Audit Store → Domain conversions** → Cluster 2  
3. **Standardize test helpers** → Cluster 3

**Philosophy:**
> "TypeScript errors are not obstacles – they're guardrails preventing runtime bugs. Fix code to satisfy types, never weaken types to satisfy code."

---

**End of Document**

**Next Action:** Codex begins systematic fixes, starting with Cluster 1 (Possibly Undefined).
