# Cursor Rules — Core (Project + TypeScript)

> **Source:** `.rulesync/00-project-core.md` + `.rulesync/01-typescript.md`
>
> **Purpose:** High-level project context and TypeScript conventions for daily coding.

---

## Project: Sparkfined PWA

**What:** Offline-first Trading Command Center (PWA) for crypto market research, journaling, and alerts.

**Tech-Stack:** React 18.3, TypeScript 5.6, Vite 5.4, TailwindCSS 4.1, Zustand, Dexie (IndexedDB), Vercel Edge Functions, OpenAI + xAI Grok

**Architecture:** 5-Layer Model (UI → State → Persistence → Backend → External Services)

**Key-Features:** PWA-Offline-Mode, AI-Powered-Journal-Condense, Interactive-Charts, Signal-Matrix, Real-Time-Alerts (planned)

---

## TypeScript Conventions

### Compiler-Config
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`
- ESLint: `@typescript-eslint/no-explicit-any: off` (pragmatic, but track via TODO)

### Type-Patterns

**Result<T, E> for Error-Handling:**
```ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
async function fetchTokenData(address: string): Promise<Result<TokenData>> {
  try {
    const response = await fetch(`/api/token/${address}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

**Discriminated-Unions for State:**
```ts
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

**API-Response-Types (always validate):**
```ts
interface TokenResponse {
  address: string;
  symbol: string;
  price: number;
  volume24h: number;
}

// Validate at runtime (Zod planned, manual for now)
function validateTokenResponse(data: unknown): Result<TokenResponse> {
  if (!data || typeof data !== 'object') {
    return { success: false, error: new Error('Invalid response') };
  }
  // ... validation
}
```

### Allowed vs. Forbidden

✅ **Allowed:**
- `any` for quick-prototyping (but add TODO to replace)
- `null` for intentional-absence (e.g. `chart: HTMLElement | null`)
- Union-Types (e.g. `type Status = 'idle' | 'loading' | 'success'`)

❌ **Avoid:**
- `unknown` without type-guard (prefer `any` with TODO)
- `undefined` for function-params (use optional `?` or default-values)
- Enums (prefer Union-Types for small sets)

---

## Coding-Principles

1. **Type-First:** Define types before implementation
2. **Barrel-Exports:** Use `index.ts` for clean imports (`@/lib/fetch`)
3. **Pragmatic-Any:** Use `any` for quick-prototyping, but track via TODO
4. **Result-Pattern:** Prefer `Result<T,E>` over throwing errors in API-calls

---

## Related

- Full rules: `.rulesync/00-project-core.md`, `.rulesync/01-typescript.md`
