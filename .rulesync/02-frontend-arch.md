---
mode: SYSTEM
id: "02-frontend-arch"
priority: 1
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode"]
globs: ["src/**/*.tsx", "src/**/*.ts", "src/pages/**/*", "src/sections/**/*", "src/components/**/*"]
description: "Frontend architecture patterns: 5-layer model, file conventions, routing, state management for Sparkfined PWA"
---

# 02 – Frontend Architecture

## 1. Layering (5-Layer-Modell)

Sparkfined folgt einer **strikten 5-Layer-Architektur**, um Separation-of-Concerns und Testbarkeit sicherzustellen:

```
┌─────────────────────────────────────────────────────────┐
│ Layer 5: UI (Pages, Sections, Components)              │
│   Pages:      Route-Level-Entry-Points                 │
│   Sections:   Feature-spezifische Module               │
│   Components: Wiederverwendbare UI-Bausteine           │
│   UI:         Design-System-Primitives                 │
├─────────────────────────────────────────────────────────┤
│ Layer 4: State & Hooks                                 │
│   Zustand:    Global Stores (Access, etc.)             │
│   Context:    React Context (Settings, Telemetry, AI)  │
│   Hooks:      Custom Hooks (useJournal, useSignals)    │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Persistence                                   │
│   Dexie:      IndexedDB (Board, Journal, Signals)      │
│   Storage:    localStorage, sessionStorage             │
│   Cache:      SWR-Pattern via Service-Worker           │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Backend (Serverless APIs)                     │
│   api/**:     Vercel Edge Functions                    │
│   Adapters:   src/lib/adapters/* (External-API-Calls)  │
├─────────────────────────────────────────────────────────┤
│ Layer 1: External Services                             │
│   Moralis, DexPaprika, Solana RPC, OpenAI, Grok        │
└─────────────────────────────────────────────────────────┘
```

### Layer-Interaktions-Regeln

**[MUST]** Layer N darf nur mit Layer N-1 kommunizieren (keine Sprünge)

```tsx
// ✅ Good: Page → Hook → Adapter → API
function AnalyzePage() {
  const { data, isLoading } = useTokenData(address);  // Layer 5 → 4
  // useTokenData intern: Hook → Adapter (Layer 4 → 2)
}

// ❌ Avoid: Page direkt zu API (Skip Layer 4)
function AnalyzePage() {
  const [data, setData] = useState();
  useEffect(() => {
    fetch('/api/data/ohlc').then(r => setData(r));  // Skip Hook-Layer!
  }, []);
}
```

**[SHOULD]** Pages haben keine Business-Logik (nur Orchestration)

```tsx
// ✅ Good: Page orchestriert, Hook enthält Logik
function JournalPage() {
  const { entries, addEntry, deleteEntry, isLoading } = useJournal();
  return <JournalList entries={entries} onAdd={addEntry} />;
}

// ❌ Avoid: Business-Logik in Page
function JournalPage() {
  const [entries, setEntries] = useState([]);
  const addEntry = async (content: string) => {
    const entry = { id: uuid(), content, timestamp: Date.now() };
    await db.entries.add(entry);  // Persistence-Logic in UI-Layer!
    setEntries([...entries, entry]);
  };
}
```

---

## 2. Routing & Navigation

### React Router v6 Setup

**App-Structure:**

```tsx
// src/App.tsx
import { TelemetryProvider } from './state/telemetry';
import { SettingsProvider } from './state/settings';
import { AIProviderState } from './state/ai';
import RoutesRoot from './routes/RoutesRoot';

function App() {
  return (
    <TelemetryProvider>
      <SettingsProvider>
        <AIProviderState>
          <RoutesRoot />  {/* React Router BrowserRouter */}
        </AIProviderState>
      </SettingsProvider>
    </TelemetryProvider>
  );
}
```

**Routes Definition:**

```tsx
// src/routes/RoutesRoot.tsx
import { Routes, Route } from 'react-router-dom';

export default function RoutesRoot() {
  return (
    <Routes>
      <Route path="/" element={<BoardPage />} />
      <Route path="/analyze" element={<AnalyzePage />} />
      <Route path="/chart" element={<ChartPage />} />
      <Route path="/journal" element={<JournalPage />} />
      <Route path="/signals" element={<SignalsPage />} />
      <Route path="/replay" element={<ReplayPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/access" element={<AccessPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

### Route-Naming-Conventions

**[MUST]** Nutze lowercase kebab-case für Routes

```tsx
// ✅ Good
<Route path="/journal" />
<Route path="/analyze" />
<Route path="/board-settings" />  // Multi-Word

// ❌ Avoid
<Route path="/Journal" />  // Uppercase
<Route path="/analyzeToken" />  // camelCase
```

**[SHOULD]** Nutze Query-Params für Filter/State, nicht Route-Params

```tsx
// ✅ Good: Filter via Query-Params
/journal?tag=setup&sort=date

// ❌ Avoid: Filter in Route (nicht skalierbar)
/journal/setup/date
```

**[MAY]** Nutze Route-Params für IDs/Entities

```tsx
// ✅ Good: Entity-ID in Route
/replay/:sessionId
/chart/:tokenAddress

// Implementation
<Route path="/chart/:tokenAddress" element={<ChartPage />} />

// Usage in Component
function ChartPage() {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  // ...
}
```

### Navigation-Patterns

**[SHOULD]** Nutze `useNavigate` für programmatische Navigation

```tsx
import { useNavigate } from 'react-router-dom';

function SaveTradeModal({ trade }: { trade: Trade }) {
  const navigate = useNavigate();

  const handleSave = async () => {
    await saveTrade(trade);
    navigate('/journal', { state: { newEntryId: trade.id } });
  };

  return <button onClick={handleSave}>Save & Go to Journal</button>;
}
```

**[MUST]** Nutze `<Link>` für deklarative Navigation (bessere a11y)

```tsx
import { Link } from 'react-router-dom';

// ✅ Good
<Link to="/analyze" className="nav-link">
  Analyze
</Link>

// ❌ Avoid: onClick-Navigation (schlechte a11y)
<div onClick={() => navigate('/analyze')}>
  Analyze
</div>
```

---

## 3. File & Folder Conventions

### Directory-Struktur

```
src/
├── pages/               # Route-Level-Entry-Points
│   ├── BoardPage.tsx
│   ├── AnalyzePage.tsx
│   ├── ChartPage.tsx
│   └── ...
├── sections/            # Feature-spezifische Module
│   ├── chart/
│   │   ├── ChartCanvas.tsx
│   │   ├── ChartControls.tsx
│   │   ├── indicators/
│   │   └── utils/
│   ├── journal/
│   │   ├── JournalEditor.tsx
│   │   ├── JournalList.tsx
│   │   └── ...
│   └── analyze/
├── components/          # Wiederverwendbare UI-Komponenten
│   ├── board/           # Domain-spezifische Components
│   │   ├── KPITile.tsx
│   │   ├── FeedItem.tsx
│   │   └── ...
│   ├── ui/              # Design-System-Primitives
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── onboarding/
│   ├── signals/
│   └── ...
├── hooks/               # Custom React Hooks
│   ├── useJournal.ts
│   ├── useSignals.ts
│   ├── useBoardKPIs.ts
│   └── ...
├── lib/                 # Business-Logic & Utils
│   ├── adapters/        # External-API-Abstraction
│   ├── data/            # Data-Orchestrators
│   ├── ai/              # AI-Client-Logic
│   ├── analysis/        # KPI-Calculations
│   └── ...
├── state/               # Global State (Context-Providers)
│   ├── settings.tsx
│   ├── telemetry.tsx
│   └── ai.tsx
├── store/               # Zustand Stores
│   └── accessStore.ts
├── types/               # TypeScript Type-Definitions
│   ├── index.ts         # Barrel-Export
│   ├── journal.ts
│   ├── market.ts
│   └── ...
└── styles/              # Global CSS
    ├── App.css
    ├── index.css
    └── ...
```

### Naming-Conventions

**Pages:**
- Format: `{Feature}Page.tsx` (PascalCase + Page-Suffix)
- Beispiele: `BoardPage.tsx`, `AnalyzePage.tsx`, `JournalPage.tsx`

**Sections:**
- Format: `{Feature}{Component}.tsx` (PascalCase, no suffix)
- Beispiele: `ChartCanvas.tsx`, `JournalEditor.tsx`, `AnalyzeKPIGrid.tsx`

**Components:**
- Format: `{Name}.tsx` (PascalCase, beschreibend)
- Beispiele: `KPITile.tsx`, `FeedItem.tsx`, `Button.tsx`, `Modal.tsx`

**Hooks:**
- Format: `use{Feature}.ts` (camelCase + use-Prefix)
- Beispiele: `useJournal.ts`, `useSignals.ts`, `useBoardKPIs.ts`

**Lib/Utils:**
- Format: `{feature}.ts` (camelCase)
- Beispiele: `journal.ts`, `priceAdapter.ts`, `kpiCalculator.ts`

### Import-Conventions

**[MUST]** Nutze Path-Alias `@/*` für alle src/-Imports

```tsx
// ✅ Good
import { fetchOhlc } from '@/lib/adapters/ohlc';
import { KPITile } from '@/components/board/KPITile';
import type { JournalEntry } from '@/types';

// ❌ Avoid: Relative Paths
import { fetchOhlc } from '../../../lib/adapters/ohlc';
```

**[SHOULD]** Gruppiere Imports: React → Third-Party → Local → Types

```tsx
// ✅ Good
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { KPITile } from '@/components/board/KPITile';
import { useBoardKPIs } from '@/hooks/useBoardKPIs';

import type { KPIData } from '@/types';
```

**[SHOULD]** Nutze Barrel-Exports für Components/Types

```tsx
// src/components/ui/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export { Input } from './Input';

// Usage
import { Button, Modal, Input } from '@/components/ui';
```

---

## 4. State Management

### State-Hierarchie

Sparkfined nutzt **drei State-Management-Patterns** je nach Scope:

| Pattern | Use Case | Beispiel |
|---------|----------|----------|
| **Local State (`useState`)** | Component-intern, UI-State | Modal open/closed, Input-Value |
| **Context (React Context)** | Cross-Tree-State, Config | Settings, Telemetry, AI-Provider |
| **Global Store (Zustand)** | Cross-Component-State, Cache | Access-Status, Offline-Cache |

### When to use what?

```tsx
// ✅ Local State: Component-internal
function Modal({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);  // Nur für diese Component
  return isOpen ? <div>{children}</div> : null;
}

// ✅ Context: App-wide Config/Services
function App() {
  return (
    <SettingsProvider>  {/* theme, defaults, etc. */}
      <TelemetryProvider>  {/* metrics, events */}
        <Routes />
      </TelemetryProvider>
    </SettingsProvider>
  );
}

// ✅ Zustand: Cross-Component-Cache
const useAccessStore = create<AccessState>((set) => ({
  status: null,
  checkAccess: async () => {
    const status = await fetchAccessStatus();
    set({ status });
  },
}));
```

### Context-Pattern

**[MUST]** Nutze Context für Global-Config, nicht für häufig ändernde Daten

```tsx
// ✅ Good: Settings (ändern sich selten)
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// ❌ Avoid: Real-Time-Price-Data in Context (zu viele Re-Renders)
export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Prices>({});
  // Updates every second → alle Consumer re-rendern!
}
```

### Zustand-Pattern

**[SHOULD]** Nutze Zustand für Cross-Component-Cache & Actions

```tsx
// src/store/accessStore.ts
import { create } from 'zustand';

interface AccessState {
  status: AccessStatus | null;
  isLoading: boolean;
  checkAccess: () => Promise<void>;
  clearCache: () => void;
}

export const useAccessStore = create<AccessState>((set, get) => ({
  status: null,
  isLoading: false,

  checkAccess: async () => {
    set({ isLoading: true });
    try {
      const status = await fetchAccessStatus();
      set({ status, isLoading: false });
    } catch (error) {
      console.error('Access check failed', error);
      set({ isLoading: false });
    }
  },

  clearCache: () => set({ status: null }),
}));
```

**Usage:**

```tsx
function AccessPage() {
  const { status, isLoading, checkAccess } = useAccessStore();

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  if (isLoading) return <LoadingSkeleton />;
  return <AccessStatusCard status={status} />;
}
```

---

## 5. Cross-Cutting Concerns

### Error-Boundaries

**[MUST]** Nutze Error-Boundaries für Fehler-Isolation

```tsx
// src/app/AppErrorBoundary.tsx
export class AppErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('ErrorBoundary', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage in main.tsx
<AppErrorBoundary>
  <App />
</AppErrorBoundary>
```

### Logging

**[SHOULD]** Nutze `src/lib/logger.ts` für strukturiertes Logging

```tsx
// src/lib/logger.ts
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(`[INFO] ${message}`, meta);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  // ...
};

// Usage
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: 123 });
logger.error('API call failed', new Error('Timeout'));
```

**[MUST NOT]** Nutze `console.log` direkt in Production-Code

```tsx
// ❌ Avoid
console.log('Debug info:', data);  // Wird in Production-Bundle bleiben!

// ✅ Good
if (import.meta.env.DEV) {
  logger.info('Debug info:', data);
}
```

### Theming (Dark/Light-Mode)

**[MUST]** Nutze Settings-Context für Theme-State

```tsx
// src/state/settings.tsx
export type ThemeMode = 'system' | 'dark' | 'light';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ theme: 'system' });

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);
    
    root.classList.toggle('dark', dark);
  }, [settings.theme]);

  // ...
}
```

**[SHOULD]** Nutze Tailwind `dark:` Modifier für Theme-Styles

```tsx
// ✅ Good: Tailwind Dark-Mode
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Content
</div>

// ❌ Avoid: Inline-Styles basierend auf Theme
<div style={{ background: theme === 'dark' ? '#1a1a1a' : '#fff' }}>
  Content
</div>
```

---

## 6. Examples

### ✅ Good – Complete Page-Component

```tsx
// src/pages/JournalPage.tsx
import { useState } from 'react';
import { JournalList } from '@/sections/journal/JournalList';
import { JournalEditor } from '@/sections/journal/JournalEditor';
import { Button } from '@/components/ui/Button';
import { useJournal } from '@/hooks/useJournal';
import type { JournalEntry } from '@/types';

export function JournalPage() {
  const { entries, addEntry, deleteEntry, isLoading } = useJournal();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleSave = async (content: string, tags: string[]) => {
    await addEntry({ content, tags });
    setIsEditorOpen(false);
  };

  if (isLoading) {
    return <div className="p-4">Loading journal...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trading Journal</h1>
        <Button onClick={() => setIsEditorOpen(true)}>
          New Entry
        </Button>
      </header>

      <JournalList 
        entries={entries} 
        onDelete={deleteEntry}
      />

      {isEditorOpen && (
        <JournalEditor
          onSave={handleSave}
          onCancel={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
```

### ❌ Avoid – Anti-Patterns

```tsx
// ❌ Bad: Business-Logic in Page
function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // ❌ Direct DB-Access in Page (skip Layer 4)
  useEffect(() => {
    db.entries.toArray().then(setEntries);
  }, []);

  // ❌ Persistence-Logic in UI-Layer
  const addEntry = async (content: string) => {
    const entry = { id: uuid(), content, timestamp: Date.now() };
    await db.entries.add(entry);
    setEntries([...entries, entry]);
  };

  // ❌ Inline-Styles statt Tailwind
  return (
    <div style={{ padding: '16px', backgroundColor: '#fff' }}>
      {entries.map(e => <div key={e.id}>{e.content}</div>)}
    </div>
  );
}

// ❌ Bad: Fehlende Error-Handling
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();  // Kann fehlschlagen!
  return data;
}

// ❌ Bad: Relative Imports über mehrere Ebenen
import { KPITile } from '../../../components/board/KPITile';
```

---

## 7. Performance-Best-Practices

**[SHOULD]** Nutze `React.memo` für teure Components

```tsx
export const KPITile = React.memo(function KPITile({ data }: KPITileProps) {
  return <div>{data.label}: {data.value}</div>;
});
```

**[SHOULD]** Nutze `useMemo` für teure Berechnungen

```tsx
function ChartPage({ ohlcData }: { ohlcData: OHLCData[] }) {
  const indicators = useMemo(() => {
    return calculateIndicators(ohlcData);  // Teuer, nur bei ohlcData-Änderung
  }, [ohlcData]);

  return <ChartCanvas data={ohlcData} indicators={indicators} />;
}
```

**[SHOULD]** Nutze `useCallback` für Event-Handlers

```tsx
function JournalList({ entries, onDelete }: Props) {
  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  return entries.map(e => (
    <JournalEntry key={e.id} entry={e} onDelete={handleDelete} />
  ));
}
```

---

## Related

- `00-project-core.md` – Projekt-Vision & Domain-Map
- `01-typescript.md` – Type-Patterns & Conventions
- `04-ui-ux-components.md` – Component-Design-Patterns
- `05-api-integration.md` – Backend-Integration-Patterns
- `_planning-architecture.md` – Detaillierte Architektur-Diagramme

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 1 (5-layer architecture, routing, state management)
