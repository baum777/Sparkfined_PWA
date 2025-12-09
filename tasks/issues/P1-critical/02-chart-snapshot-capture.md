# Chart Snapshot Capture Implementation

**Priorität**: 🟠 P1 CRITICAL
**Aufwand**: 2 Tage
**Dringlichkeit**: R1 Beta Feature
**Abhängigkeiten**: Chart System

---

## Problem

Chart Snapshot Capture ist **stubbed** (TODO im Code):
- Canvas → Image Konvertierung nicht implementiert
- Journal Entries können keine Chart Screenshots speichern
- Social Preview für Trades fehlt

**Betroffene Files**:
- `src/lib/chart/snapshot.ts` - Canvas capture logic NOT implemented
- `src/lib/JournalService.ts` - Screenshot storage vorbereitet, aber ungenutzt
- `src/components/journal/JournalSocialPreview.tsx` - Zeigt Placeholder

**Aktueller Code**:
```typescript
// src/lib/chart/snapshot.ts
export async function captureChartSnapshot(chartRef: HTMLElement): Promise<string> {
  // TODO: Implement canvas → image capture (P1)
  return 'data:image/png;base64,...'; // ❌ Placeholder
}
```

---

## Ziel

Implementiere **Canvas-to-Image Snapshot Capture**:
- Chart-Canvas → PNG Blob
- Speicherung in IndexedDB (Journal Entry)
- Anzeige in Social Preview
- Export für Sharing

## Audit 2025-12-08 (Codex)

- Status: Snapshot-Funktion ist weiterhin stubbed (`captureChartSnapshot` gibt `undefined` zurück), Journal-Integration fehlt.
- Kategorie A – Bereits erfüllt
  - [ ] Keine Punkte abgeschlossen; weder Capture-API noch Journal-Speicherung sind aktiv im Code.
- Kategorie B – Kleine, fokussierte Tasks
  - [ ] HTMLCanvas-Capture (z.B. via `canvas.toBlob`) implementieren und mit unit test absichern, ohne UI-Umbau.
- Kategorie C – Große / Epische Themen (offen)
  - [ ] Vollständige Journal-Integration inkl. Screenshot-Feld und Social Preview.
  - [ ] UI-Flow "Save to Journal" inkl. Routing/Redirects und Datenvalidierung.
  - [ ] Performance/Compression-Pfad und Lazy Loading für größere Screenshots.

---

## Tasks

### Phase 1: Canvas Capture Implementation (1 Tag)

#### 1.1 HTML Canvas → PNG Blob
```typescript
// src/lib/chart/snapshot.ts
export async function captureChartSnapshot(
  chartElement: HTMLElement,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<Blob> {
  const { width = 1200, height = 800, quality = 0.9 } = options;

  // Find canvas element (lightweight-charts renders to canvas)
  const canvas = chartElement.querySelector('canvas');
  if (!canvas) {
    throw new Error('No canvas found in chart element');
  }

  // Create offscreen canvas for resizing
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;

  const ctx = offscreenCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw chart canvas to offscreen canvas (scaled)
  ctx.drawImage(canvas, 0, 0, width, height);

  // Convert to blob
  return new Promise((resolve, reject) => {
    offscreenCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      'image/png',
      quality
    );
  });
}
```

#### 1.2 Blob → Base64 Data URL (für IndexedDB)
```typescript
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

#### 1.3 Combined Snapshot Function
```typescript
export async function captureChartAsDataURL(
  chartElement: HTMLElement,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): Promise<string> {
  const blob = await captureChartSnapshot(chartElement, options);
  return blobToDataURL(blob);
}
```

---

### Phase 2: Journal Integration (4h)

#### 2.1 Update JournalEntry Type
```typescript
// src/types/journal.ts
export interface JournalEntry {
  id: string;
  title: string;
  direction: 'long' | 'short' | 'neutral';
  notes: string;
  screenshot?: string; // ✅ Base64 data URL
  screenshotCapturedAt?: number; // Timestamp
  tags: string[];
  createdAt: number;
  updatedAt: number;
  // ... other fields
}
```

#### 2.2 Add Screenshot to Journal Entry
```typescript
// src/lib/JournalService.ts
export async function addScreenshotToEntry(
  entryId: string,
  screenshotDataURL: string
): Promise<void> {
  const entry = await db.journalEntries.get(entryId);

  if (!entry) {
    throw new Error(`Journal entry ${entryId} not found`);
  }

  await db.journalEntries.update(entryId, {
    screenshot: screenshotDataURL,
    screenshotCapturedAt: Date.now(),
    updatedAt: Date.now()
  });

  console.log(`[Journal] Screenshot added to entry ${entryId}`);
}
```

#### 2.3 Create Entry from Chart Context
```typescript
// src/lib/journal/createFromChart.ts
import { captureChartAsDataURL } from '@/lib/chart/snapshot';

export async function createJournalEntryFromChart(
  chartRef: React.RefObject<HTMLElement>,
  metadata: {
    symbol: string;
    timeframe: string;
    price: number;
    direction: 'long' | 'short';
  }
): Promise<string> {
  // Capture screenshot
  const screenshot = await captureChartAsDataURL(chartRef.current!, {
    width: 1200,
    height: 800,
    quality: 0.85
  });

  // Create journal entry
  const entry: Partial<JournalEntry> = {
    title: `${metadata.symbol} ${metadata.direction.toUpperCase()}`,
    direction: metadata.direction,
    notes: `Entry at $${metadata.price} on ${metadata.timeframe}`,
    screenshot,
    screenshotCapturedAt: Date.now(),
    tags: ['from-chart', metadata.symbol.toLowerCase()],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const entryId = await createEntry(entry);

  console.log(`[Journal] Created entry ${entryId} from chart`);

  return entryId;
}
```

---

### Phase 3: UI Integration (4h)

#### 3.1 Capture Button in ChartPage
```typescript
// src/pages/ChartPageV2.tsx
import { captureChartAsDataURL } from '@/lib/chart/snapshot';
import { createJournalEntryFromChart } from '@/lib/journal/createFromChart';
import { useRef, useState } from 'react';

export function ChartPageV2() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const handleCaptureToJournal = async () => {
    if (!chartRef.current) return;

    setCapturing(true);

    try {
      const entryId = await createJournalEntryFromChart(chartRef, {
        symbol: 'SOL',
        timeframe: '4h',
        price: 101.5,
        direction: 'long'
      });

      // Redirect to journal with entry selected
      window.location.href = `/journal-v2?entry=${entryId}`;
    } catch (error) {
      console.error('Failed to capture chart:', error);
      alert('Chart capture failed');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div>
      <div ref={chartRef}>
        {/* Chart component */}
      </div>

      <button onClick={handleCaptureToJournal} disabled={capturing}>
        {capturing ? 'Capturing...' : 'Save to Journal'}
      </button>
    </div>
  );
}
```

#### 3.2 Display Screenshot in Journal Detail
```typescript
// src/components/journal/JournalDetailPanel.tsx
export function JournalDetailPanel({ entry }: { entry: JournalEntry }) {
  return (
    <div>
      <h2>{entry.title}</h2>

      {entry.screenshot && (
        <div className="screenshot-preview">
          <img
            src={entry.screenshot}
            alt="Chart screenshot"
            className="w-full rounded-lg border border-slate-700"
          />
          <p className="text-xs text-slate-400 mt-2">
            Captured {new Date(entry.screenshotCapturedAt).toLocaleString()}
          </p>
        </div>
      )}

      <div className="notes">
        {entry.notes}
      </div>
    </div>
  );
}
```

#### 3.3 Social Preview with Screenshot
```typescript
// src/components/journal/JournalSocialPreview.tsx
export function JournalSocialPreview({ entry }: { entry: JournalEntry }) {
  if (!entry.screenshot) {
    return <EmptyState message="No screenshot available" />;
  }

  const shareUrl = `https://sparkfined.app/journal/${entry.id}`;

  return (
    <div className="social-preview">
      <h3>Share this trade</h3>

      <div className="preview-card">
        <img src={entry.screenshot} alt="Trade chart" />
        <p>{entry.title}</p>
        <p>{entry.direction.toUpperCase()} • {formatDate(entry.createdAt)}</p>
      </div>

      <button onClick={() => copyToClipboard(shareUrl)}>
        Copy Share Link
      </button>

      <button onClick={() => downloadScreenshot(entry.screenshot, entry.title)}>
        Download Screenshot
      </button>
    </div>
  );
}

function downloadScreenshot(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `${filename.replace(/\s+/g, '-')}.png`;
  link.click();
}
```

---

### Phase 4: Optimization (2h)

#### 4.1 Screenshot Compression
```typescript
// src/lib/imageUtils.ts
export async function compressImage(
  dataURL: string,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const compressed = await blobToDataURL(blob);
            resolve(compressed);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        'image/jpeg', // JPEG for better compression
        quality
      );
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}
```

#### 4.2 Lazy Loading Screenshots
```typescript
// Only load screenshot when detail panel is visible
export function JournalDetailPanel({ entry }: { entry: JournalEntry }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div>
      {entry.screenshot && !imageLoaded && (
        <div className="skeleton h-96 bg-slate-800 animate-pulse" />
      )}

      {entry.screenshot && (
        <img
          src={entry.screenshot}
          alt="Chart screenshot"
          onLoad={() => setImageLoaded(true)}
          className={imageLoaded ? 'opacity-100' : 'opacity-0'}
        />
      )}
    </div>
  );
}
```

---

## Testing

### Unit Tests: Snapshot Capture (2h)
```typescript
// tests/lib/chartSnapshot.test.ts
import { describe, it, expect, vi } from 'vitest';
import { captureChartSnapshot, blobToDataURL } from '@/lib/chart/snapshot';

describe('Chart Snapshot Capture', () => {
  it('should capture canvas to PNG blob', async () => {
    // Create mock canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext('2d');
    ctx?.fillRect(0, 0, 800, 600); // Draw something

    // Mock chart element
    const chartElement = document.createElement('div');
    chartElement.appendChild(canvas);

    const blob = await captureChartSnapshot(chartElement, {
      width: 1200,
      height: 800
    });

    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should convert blob to data URL', async () => {
    const blob = new Blob(['test'], { type: 'image/png' });
    const dataURL = await blobToDataURL(blob);

    expect(dataURL).toMatch(/^data:image\/png;base64,/);
  });

  it('should throw error if no canvas found', async () => {
    const emptyDiv = document.createElement('div');

    await expect(
      captureChartSnapshot(emptyDiv)
    ).rejects.toThrow('No canvas found');
  });
});
```

### Integration Test: Journal Screenshot Storage (1h)
```typescript
// tests/integration/journalScreenshot.test.ts
it('should store screenshot in journal entry', async () => {
  const mockScreenshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...';

  const entryId = await createEntry({
    title: 'Test Entry',
    direction: 'long',
    notes: 'Test notes'
  });

  await addScreenshotToEntry(entryId, mockScreenshot);

  const updated = await db.journalEntries.get(entryId);

  expect(updated.screenshot).toBe(mockScreenshot);
  expect(updated.screenshotCapturedAt).toBeDefined();
});
```

---

## Acceptance Criteria

✅ Canvas Capture: PNG Blob Generation funktioniert
✅ Data URL Konvertierung implementiert
✅ Journal Entry speichert Screenshot in IndexedDB
✅ Chart Page: "Save to Journal" Button funktional
✅ Journal Detail: Screenshot wird angezeigt
✅ Social Preview: Download & Share funktioniert
✅ Compression: Screenshots <500 KB
✅ Unit Tests: >80% Coverage
✅ E2E Test: Chart → Journal → Screenshot Visibility

---

## Validation

```bash
# Unit Tests
pnpm vitest --run tests/lib/chartSnapshot.test.ts

# Integration Tests
pnpm vitest --run tests/integration/journalScreenshot.test.ts

# Manual Test
pnpm dev
# → Open /chart-v2
# → Click "Save to Journal"
# → Navigate to /journal-v2?entry=<id>
# → Verify screenshot displayed
```

---

## Performance Considerations

- **Screenshot Size**: Target <500 KB per screenshot (JPEG 85% quality)
- **IndexedDB Limit**: ~50 MB per domain (monitor usage)
- **Lazy Loading**: Only load screenshots when detail panel visible
- **Cleanup**: Consider auto-deleting screenshots older than 90 days

---

## Related

- Siehe: `src/lib/chart/snapshot.ts` (TODO P1)
- Siehe: `docs/tickets/journal-workspace-todo.md` (F-04)
- Feature Request: Export to PNG/JPG (Issue #11)

---

**Owner**: Frontend Team
**Status**: 🔴 OFFEN – Snapshot-Stub aktiv; siehe Audit 2025-12-08
**Deadline**: Woche 3-4 (Sprint 3)
