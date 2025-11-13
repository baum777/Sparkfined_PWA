---
mode: SYSTEM
id: "08-performance"
priority: 3
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode"]
globs: ["vite.config.ts", "src/**/*.ts", "src/**/*.tsx", "api/**/*.ts"]
description: "Performance standards: bundle budgets, runtime optimization, Lighthouse targets, and PWA metrics for Sparkfined"
---

# 08 – Performance

## 1. Goals & Budgets

Sparkfined optimiert für **Perceived-Performance** (schnelle Initial-Load + sofortige Interaktionen) und **Real-User-Performance** (stabile Frame-Rates, keine Jank):

### Performance-Ziele (Lighthouse)

**Target-Scores (Lighthouse 10+):**
- **Performance:** ≥ 90 (Desktop), ≥ 85 (Mobile)
- **PWA:** ≥ 95
- **Best-Practices:** ≥ 95
- **Accessibility:** ≥ 90
- **SEO:** ≥ 90

**Aktuelle Scores (2025-11-12):**
- Performance: ~92 (Desktop), ~87 (Mobile) ✅
- PWA: ~98 ✅
- Best-Practices: ~96 ✅
- A11y: ~88 (Verbesserung nötig)
- SEO: ~93 ✅

### Bundle-Budgets

**Current State (2025-11-12):**
- **Main-Bundle:** ~428KB gzipped
- **Vendor-Chunks:** React (~135KB), Workbox (~45KB), Dexie (~38KB)
- **Total-Precache:** ~428KB (66 Entries)

**Short-Term-Target (Q1 2025):**
- **Main-Bundle:** <400KB gzipped
- **Total-Precache:** <500KB

**Mid-Term-Target (Q2 2025):**
- **Main-Bundle:** <300KB gzipped
- **Total-Precache:** <400KB

**Optimization-Strategies:**
- Code-Splitting für Chart/Analyze-Pages (derzeit monolithisch)
- Tree-Shaking für lucide-react (nur verwendete Icons importieren)
- Lazy-Loading für non-critical Sections

---

## 2. Bundle Performance

### Build-Config (vite.config.ts)

**Aktuelle Optimierungen:**

```ts
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),  // Vendor-Code in separate Chunks
  ],
  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: true,  // Für Debugging, aber erhöht Bundle-Size
    minify: 'esbuild',  // Schneller als Terser, ähnliche Compression
    chunkSizeWarningLimit: 900,  // Warning bei >900KB Chunks
    
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor-Splitting
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('workbox')) return 'vendor-workbox';
            if (id.includes('dexie')) return 'vendor-dexie';
            return 'vendor';
          }
          
          // Feature-Splitting
          if (id.includes('/sections/chart/')) return 'chart';
          if (id.includes('/sections/analyze/')) return 'analyze';
        },
      },
    },
  },
});
```

### Code-Splitting-Patterns

**[SHOULD]** Lazy-Load Route-Level-Pages

```tsx
// ✅ Good: Lazy-Loading für Routen
import { lazy, Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const ChartPage = lazy(() => import('@/pages/ChartPage'));
const AnalyzePage = lazy(() => import('@/pages/AnalyzePage'));
const ReplayPage = lazy(() => import('@/pages/ReplayPage'));

<Routes>
  <Route path="/chart" element={
    <Suspense fallback={<LoadingSkeleton />}>
      <ChartPage />
    </Suspense>
  } />
</Routes>
```

**[SHOULD]** Lazy-Load Heavy-Components (Charts, PDF-Viewers, etc.)

```tsx
// ✅ Good: Lazy-Component mit Fallback
const ChartCanvas = lazy(() => import('@/sections/chart/ChartCanvas'));

function ChartPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
      <ChartCanvas data={ohlcData} />
    </Suspense>
  );
}
```

**[MUST NOT]** Lazy-Load kritische UI (Logo, Header, Navigation)

```tsx
// ❌ Bad: Lazy-Load für kritische UI
const Header = lazy(() => import('@/components/Header'));  // Flash of Empty!
```

### Icon-Optimization

**[SHOULD]** Nutze selective Imports für Icon-Libraries

```tsx
// ✅ Good: Nur verwendete Icons importieren
import { ChartLineIcon, SettingsIcon } from 'lucide-react';

// ❌ Avoid: Entire Library
import * as Icons from 'lucide-react';  // Importiert alle 1000+ Icons!
```

**[MAY]** Nutze Icon-Sprites für häufig verwendete Icons (geplant)

### Tree-Shaking

**[MUST]** Nutze ESM-Imports (automatisch via Vite)

```tsx
// ✅ Good: Named-Import (tree-shakeable)
import { useState, useEffect } from 'react';

// ❌ Avoid: Namespace-Import
import * as React from 'react';  // Schwerer zu tree-shaken
```

---

## 3. Runtime Performance

### React-Optimization-Patterns

**[SHOULD]** Nutze `React.memo` für teure Components

```tsx
// ✅ Good: Memo für KPITile (re-rendert oft)
export const KPITile = React.memo(function KPITile({ data }: KPITileProps) {
  return (
    <div>
      {data.label}: {data.value}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom-Comparison (optional)
  return prevProps.data.value === nextProps.data.value;
});
```

**[SHOULD]** Nutze `useMemo` für teure Berechnungen

```tsx
// ✅ Good: Memoize Chart-Indicators
function ChartPage({ ohlcData }: { ohlcData: OHLCData[] }) {
  const indicators = useMemo(() => {
    return {
      sma: calculateSMA(ohlcData, 20),
      ema: calculateEMA(ohlcData, 50),
      rsi: calculateRSI(ohlcData.map(d => d.close), 14),
    };
  }, [ohlcData]);  // Nur neu berechnen bei OHLC-Änderung

  return <ChartCanvas data={ohlcData} indicators={indicators} />;
}

// ❌ Avoid: Berechnung in Render
function ChartPage({ ohlcData }: { ohlcData: OHLCData[] }) {
  const indicators = {
    sma: calculateSMA(ohlcData, 20),  // Berechnet bei jedem Render!
    ema: calculateEMA(ohlcData, 50),
    rsi: calculateRSI(ohlcData.map(d => d.close), 14),
  };
}
```

**[SHOULD]** Nutze `useCallback` für Event-Handlers

```tsx
// ✅ Good: Stable-Callback für Child-Components
function JournalList({ entries, onDelete }: Props) {
  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  return entries.map(entry => (
    <JournalEntry key={entry.id} entry={entry} onDelete={handleDelete} />
  ));
}

// ❌ Avoid: Inline-Function (neue Instanz bei jedem Render)
function JournalList({ entries, onDelete }: Props) {
  return entries.map(entry => (
    <JournalEntry
      key={entry.id}
      entry={entry}
      onDelete={(id) => onDelete(id)}  // Neue Function-Instanz!
    />
  ));
}
```

### List-Virtualization

**[MAY]** Nutze Virtual-Scrolling für lange Listen (>100 Items)

```tsx
// Geplant: react-window oder @tanstack/react-virtual für Journal-Listen
import { useVirtualizer } from '@tanstack/react-virtual';

function JournalList({ entries }: { entries: JournalEntry[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,  // Estimated row-height
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <JournalEntry entry={entries[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Debounce & Throttle

**[SHOULD]** Debounce Search-Inputs

```tsx
// ✅ Good: Debounce für Search
import { useMemo } from 'react';
import { debounce } from '@/lib/debounce';

function TokenSearch() {
  const [query, setQuery] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        const results = await searchTokens(searchQuery);
        setResults(results);
      }, 500),
    []
  );

  return (
    <input
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}
```

**[SHOULD]** Throttle Scroll/Resize-Events

```tsx
// ✅ Good: Throttle für Chart-Resize
useEffect(() => {
  const handleResize = throttle(() => {
    resizeChart();
  }, 100);  // Max 10x pro Sekunde

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 4. API-Performance

### Caching-Strategies

**[MUST]** Nutze SWR-Pattern für häufig abgefragte Daten

```tsx
// ✅ Good: SWR-Hook mit Cache
function useTokenPrice(address: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    // 1. Load from Cache
    const cached = priceCache.get(address);
    if (cached && Date.now() - cached.timestamp < 60000) {
      setPrice(cached.price);
      setIsStale(false);
      return;
    }

    // 2. Fetch fresh data
    setIsStale(true);
    fetchPrice(address).then((freshPrice) => {
      setPrice(freshPrice);
      setIsStale(false);
      priceCache.set(address, { price: freshPrice, timestamp: Date.now() });
    });
  }, [address]);

  return { price, isStale };
}
```

### Request-Deduplication

**[SHOULD]** Verhindere parallele identische Requests

```tsx
// ✅ Good: Request-Deduplication
const pendingRequests = new Map<string, Promise<any>>();

async function fetchWithDedup(key: string, fetchFn: () => Promise<any>) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);  // Return existing Promise
  }

  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);  // Cleanup after resolve/reject
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Usage
const data1 = await fetchWithDedup('token-123', () => fetchToken('123'));
const data2 = await fetchWithDedup('token-123', () => fetchToken('123'));  // Nutzt selbe Promise!
```

---

## 5. Monitoring

### Core-Web-Vitals (LCP, FID, CLS)

**Target-Werte:**
- **LCP (Largest-Contentful-Paint):** <2.5s (Good), <4s (Needs-Improvement)
- **FID (First-Input-Delay):** <100ms (Good), <300ms (Needs-Improvement)
- **CLS (Cumulative-Layout-Shift):** <0.1 (Good), <0.25 (Needs-Improvement)

**Aktuelle Werte (2025-11-12, Desktop):**
- LCP: ~1.8s ✅
- FID: ~50ms ✅
- CLS: ~0.05 ✅

**[SHOULD]** Tracke Core-Web-Vitals in Production

```tsx
// src/lib/perf.ts
import { onCLS, onFID, onLCP } from 'web-vitals';

export function initWebVitals() {
  onCLS((metric) => {
    console.log('[Perf] CLS:', metric.value);
    // Send to analytics
  });

  onFID((metric) => {
    console.log('[Perf] FID:', metric.value);
  });

  onLCP((metric) => {
    console.log('[Perf] LCP:', metric.value);
  });
}

// src/main.tsx
if (import.meta.env.PROD) {
  initWebVitals();
}
```

### Custom-Performance-Marks

**[MAY]** Nutze Performance-API für Custom-Timings

```tsx
// ✅ Good: Custom-Performance-Marks
export async function fetchOhlc(address: string) {
  performance.mark('ohlc-fetch-start');

  const data = await fetch(`/api/ohlc?address=${address}`);

  performance.mark('ohlc-fetch-end');
  performance.measure('ohlc-fetch', 'ohlc-fetch-start', 'ohlc-fetch-end');

  const measure = performance.getEntriesByName('ohlc-fetch')[0];
  console.log(`[Perf] OHLC-Fetch took ${measure.duration}ms`);

  return data;
}
```

### Lighthouse-CI (Geplant)

**[FUTURE]** Lighthouse-CI in GitHub-Actions für Performance-Regression-Detection

```yaml
# .github/workflows/lighthouse-ci.yml (geplant)
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --upload.target=temporary-public-storage
```

---

## 6. Patterns & Anti-Patterns

### ✅ Good – Optimized Component

```tsx
// Optimized KPI-Dashboard
import { memo, useMemo } from 'react';

interface KPIDashboardProps {
  kpis: KPIData[];
  onRefresh: () => void;
}

export const KPIDashboard = memo(function KPIDashboard({
  kpis,
  onRefresh,
}: KPIDashboardProps) {
  // Memoize sorted KPIs
  const sortedKPIs = useMemo(() => {
    return [...kpis].sort((a, b) => a.priority - b.priority);
  }, [kpis]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {sortedKPIs.map((kpi) => (
        <KPITile key={kpi.id} data={kpi} />
      ))}
      <button onClick={onRefresh}>Refresh</button>
    </div>
  );
});
```

### ❌ Avoid – Performance-Kills

```tsx
// ❌ Bad: Teure Berechnung in Render
function Dashboard({ data }: { data: KPIData[] }) {
  const sorted = data.sort((a, b) => a.value - b.value);  // Bei jedem Render!
  const filtered = sorted.filter(d => d.value > 100);
  const mapped = filtered.map(d => ({ ...d, formatted: format(d.value) }));

  return <div>{mapped.map(...)}</div>;
}

// ❌ Bad: Inline-Object/Array in Props (re-rendert Child)
<KPITile data={{ label: 'Test', value: 123 }} />  // Neue Object-Instanz!

// ❌ Bad: Anonymous-Function in useEffect-Deps
useEffect(() => {
  fetchData();
}, [() => console.log('test')]);  // Neue Function bei jedem Render!

// ❌ Bad: Nicht-Memoized API-Call in Component
function TokenPrice({ address }: { address: string }) {
  const [price, setPrice] = useState(0);
  
  fetch(`/api/price/${address}`)  // Bei jedem Render!
    .then(r => r.json())
    .then(setPrice);
  
  return <div>{price}</div>;
}
```

---

## 7. Optimization-Checklist

### Build-Time-Optimizations

```
☐ Bundle-Splitting aktiviert (splitVendorChunkPlugin)
☐ Tree-Shaking funktioniert (ESM-Imports)
☐ Minification aktiviert (esbuild)
☐ Source-Maps nur in Dev (oder compressed in Prod)
☐ Asset-Hashing für Cache-Busting
☐ Unused-Code eliminiert (Dead-Code-Elimination)
☐ Bundle-Analyzer regelmäßig checken (pnpm analyze)
```

### Runtime-Optimizations

```
☐ React.memo für teure Components
☐ useMemo für teure Berechnungen
☐ useCallback für stable Callbacks
☐ Lazy-Loading für non-critical Routes
☐ Virtual-Scrolling für lange Listen (>100 Items)
☐ Debounce für Search-Inputs
☐ Throttle für Scroll/Resize-Events
☐ Image-Optimization (WebP, Lazy-Load)
```

### Network-Optimizations

```
☐ PWA-Precache für kritische Assets
☐ SWR-Pattern für API-Calls
☐ Request-Deduplication
☐ HTTP/2 Server-Push (Vercel automatisch)
☐ Compression (Gzip/Brotli via Vercel)
☐ CDN für Static-Assets
```

---

## Related

- `00-project-core.md` – Performance als Core-Principle
- `03-pwa-conventions.md` – Caching-Strategien für Offline-Performance
- `05-api-integration.md` – API-Call-Optimization
- `vite.config.ts` – Build-Config & Bundle-Splitting
- `src/lib/perf.ts` – Performance-Monitoring-Utils

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 3 (Bundle-Budgets, Runtime-Optimization, Core-Web-Vitals)
