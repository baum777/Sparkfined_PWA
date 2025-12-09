# Export Pipeline (Journal → JSON/Markdown)

**Priorität**: 🟠 P1 CRITICAL
**Aufwand**: 1-2 Tage
**Dringlichkeit**: R1 Beta Feature
**Abhängigkeiten**: Journal System

---

## Problem

Export-Funktionalität ist **stubbed** (TODO im Code):
- Journal Entries können nicht exportiert werden
- Kein Backup/Restore Mechanismus
- User Lock-In (Daten nur in IndexedDB)

**Betroffene Files**:
- `src/lib/ExportService.ts` - Export bundle pipeline NOT implemented (Issue #11)
- UI für Export fehlt

**Aktueller Code**:
```typescript
// src/lib/ExportService.ts
export async function exportJournalToJSON(): Promise<string> {
  // TODO: Implement export bundle pipeline (P1) - Issue #11
  return '{}'; // ❌ Placeholder
}
```

---

## Ziel

Implementiere **vollständige Export/Import Pipeline**:
- Export: Journal → JSON (strukturiert)
- Export: Journal → Markdown (human-readable)
- Import: JSON → Journal (restore backup)
- Bulk Export: Alle Daten (Journal + Alerts + Settings)

## Audit 2025-12-08 (Codex)

- Status: `ExportService` enthält weiterhin nur Platzhalter und wirft "Not implemented"; keine UI-Hooks vorhanden.
- Kategorie A – Bereits erfüllt
  - [ ] Kein Teil der Pipeline ist derzeit produktiv; kein JSON/Markdown-Export implementiert.
- Kategorie B – Kleine, fokussierte Tasks
  - [ ] Minimaler JSON-Export (ohne ZIP/Share-Cards) aus `db.journalEntries` implementieren und download helper anbinden.
- Kategorie C – Große / Epische Themen (offen)
  - [ ] Vollständige Export/Import-Pipeline inkl. Markdown/ZIP/Share-Cards und Schema-Validierung.
  - [ ] Settings/Alerts/Watchlist in Bulk-Export integrieren und UI-Schalter auf SettingsPageV2 anbinden.

---

## Tasks

### Phase 1: JSON Export (4h)

#### 1.1 Export All Journal Entries
```typescript
// src/lib/ExportService.ts
import { db } from '@/db/db';
import type { JournalEntry } from '@/types/journal';

export interface JournalExportBundle {
  version: string; // Schema version (e.g., "1.0")
  exportedAt: number; // Timestamp
  entriesCount: number;
  entries: JournalEntry[];
}

export async function exportJournalToJSON(): Promise<string> {
  const entries = await db.journalEntries.toArray();

  const bundle: JournalExportBundle = {
    version: '1.0',
    exportedAt: Date.now(),
    entriesCount: entries.length,
    entries
  };

  return JSON.stringify(bundle, null, 2);
}
```

#### 1.2 Download as File
```typescript
export async function downloadJournalAsJSON(): Promise<void> {
  const json = await exportJournalToJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `sparkfined-journal-${timestamp}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);

  console.log(`[Export] Downloaded journal as ${filename}`);
}
```

---

### Phase 2: Markdown Export (4h)

#### 2.1 Convert Entry to Markdown
```typescript
function entryToMarkdown(entry: JournalEntry): string {
  const date = new Date(entry.createdAt).toISOString().split('T')[0];
  const direction = entry.direction.toUpperCase();

  let md = `# ${entry.title}\n\n`;
  md += `**Date**: ${date}\n`;
  md += `**Direction**: ${direction}\n`;
  md += `**Tags**: ${entry.tags.join(', ')}\n\n`;
  md += `## Notes\n\n${entry.notes}\n\n`;

  if (entry.journeyMeta) {
    md += `## Journey Progress\n\n`;
    md += `- **Phase**: ${entry.journeyMeta.phase}\n`;
    md += `- **XP Earned**: ${entry.journeyMeta.xpEarned}\n\n`;
  }

  if (entry.screenshot) {
    md += `## Screenshot\n\n`;
    md += `![Chart Screenshot](${entry.screenshot})\n\n`;
  }

  md += `---\n\n`;

  return md;
}
```

#### 2.2 Export All Entries to Markdown
```typescript
export async function exportJournalToMarkdown(): Promise<string> {
  const entries = await db.journalEntries
    .orderBy('createdAt')
    .reverse()
    .toArray();

  let markdown = `# Sparkfined Trading Journal\n\n`;
  markdown += `**Exported**: ${new Date().toLocaleDateString()}\n`;
  markdown += `**Total Entries**: ${entries.length}\n\n`;
  markdown += `---\n\n`;

  for (const entry of entries) {
    markdown += entryToMarkdown(entry);
  }

  return markdown;
}

export async function downloadJournalAsMarkdown(): Promise<void> {
  const markdown = await exportJournalToMarkdown();
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `sparkfined-journal-${timestamp}.md`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);

  console.log(`[Export] Downloaded journal as ${filename}`);
}
```

---

### Phase 3: Import from JSON (4h)

#### 3.1 Import Journal Bundle
```typescript
export async function importJournalFromJSON(jsonString: string): Promise<number> {
  let bundle: JournalExportBundle;

  try {
    bundle = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  // Validate schema version
  if (bundle.version !== '1.0') {
    throw new Error(`Unsupported schema version: ${bundle.version}`);
  }

  // Validate entries
  if (!Array.isArray(bundle.entries)) {
    throw new Error('Invalid entries array');
  }

  // Import strategy: Merge or Replace?
  const strategy = 'merge'; // Or 'replace'

  if (strategy === 'replace') {
    // Clear existing entries
    await db.journalEntries.clear();
  }

  // Bulk insert with conflict resolution
  const imported = [];

  for (const entry of bundle.entries) {
    const existing = await db.journalEntries.get(entry.id);

    if (existing && strategy === 'merge') {
      // Skip duplicate
      console.log(`[Import] Skipping duplicate entry ${entry.id}`);
      continue;
    }

    imported.push(entry);
  }

  await db.journalEntries.bulkAdd(imported);

  console.log(`[Import] Imported ${imported.length} entries`);

  return imported.length;
}
```

#### 3.2 File Upload Handler
```typescript
export async function handleJournalImport(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const jsonString = e.target?.result as string;
        const count = await importJournalFromJSON(jsonString);
        resolve(count);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
}
```

---

### Phase 4: Bulk Export (All Data) (2h)

#### 4.1 Export All App Data
```typescript
export interface AppDataExportBundle {
  version: string;
  exportedAt: number;
  journal: JournalExportBundle;
  alerts: Alert[];
  settings: UserSettings;
  watchlist: WatchlistToken[];
}

export async function exportAllAppData(): Promise<string> {
  const [journal, alerts, settings, watchlist] = await Promise.all([
    exportJournalToJSON().then(JSON.parse),
    db.alerts.toArray(),
    db.settings.toArray(),
    db.watchlist.toArray()
  ]);

  const bundle: AppDataExportBundle = {
    version: '1.0',
    exportedAt: Date.now(),
    journal,
    alerts,
    settings: settings[0] || {},
    watchlist
  };

  return JSON.stringify(bundle, null, 2);
}

export async function downloadAllAppData(): Promise<void> {
  const json = await exportAllAppData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `sparkfined-backup-${timestamp}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);

  console.log(`[Export] Downloaded full backup as ${filename}`);
}
```

---

### Phase 5: UI Integration (2h)

#### 5.1 Export Buttons in Settings Page
```typescript
// src/pages/SettingsPageV2.tsx
import { downloadJournalAsJSON, downloadJournalAsMarkdown, downloadAllAppData } from '@/lib/ExportService';

export function SettingsPageV2() {
  return (
    <div>
      <h2>Data Export</h2>

      <div className="export-actions">
        <button onClick={downloadJournalAsJSON}>
          Export Journal (JSON)
        </button>

        <button onClick={downloadJournalAsMarkdown}>
          Export Journal (Markdown)
        </button>

        <button onClick={downloadAllAppData}>
          Export All Data (Full Backup)
        </button>
      </div>

      <h2>Import Data</h2>

      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleJournalImport(file).then((count) => {
              alert(`Imported ${count} entries`);
            });
          }
        }}
      />
    </div>
  );
}
```

#### 5.2 Export Button in Journal Page
```typescript
// src/pages/JournalPageV2.tsx
export function JournalPageV2() {
  return (
    <div>
      <JournalHeaderActions>
        <button onClick={downloadJournalAsJSON}>
          Export Journal
        </button>
      </JournalHeaderActions>

      {/* Rest of journal UI */}
    </div>
  );
}
```

---

## Testing

### Unit Tests: Export Service (2h)
```typescript
// tests/lib/ExportService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { exportJournalToJSON, importJournalFromJSON } from '@/lib/ExportService';
import { db } from '@/db/db';

describe('Export Service', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('should export journal entries as JSON', async () => {
    // Seed entries
    await db.journalEntries.bulkAdd([
      { id: '1', title: 'Entry 1', direction: 'long', notes: 'Test', createdAt: Date.now() },
      { id: '2', title: 'Entry 2', direction: 'short', notes: 'Test', createdAt: Date.now() }
    ]);

    const json = await exportJournalToJSON();
    const bundle = JSON.parse(json);

    expect(bundle.version).toBe('1.0');
    expect(bundle.entriesCount).toBe(2);
    expect(bundle.entries).toHaveLength(2);
  });

  it('should import journal entries from JSON', async () => {
    const json = JSON.stringify({
      version: '1.0',
      exportedAt: Date.now(),
      entriesCount: 2,
      entries: [
        { id: '1', title: 'Imported 1', direction: 'long', notes: 'Test', createdAt: Date.now() },
        { id: '2', title: 'Imported 2', direction: 'short', notes: 'Test', createdAt: Date.now() }
      ]
    });

    const count = await importJournalFromJSON(json);

    expect(count).toBe(2);

    const entries = await db.journalEntries.toArray();
    expect(entries).toHaveLength(2);
  });

  it('should reject invalid JSON', async () => {
    await expect(
      importJournalFromJSON('invalid json')
    ).rejects.toThrow('Invalid JSON format');
  });

  it('should reject unsupported schema version', async () => {
    const json = JSON.stringify({ version: '99.0', entries: [] });

    await expect(
      importJournalFromJSON(json)
    ).rejects.toThrow('Unsupported schema version');
  });
});
```

### Integration Test: Round-Trip (1h)
```typescript
it('should export and import without data loss', async () => {
  // Seed original data
  const original = [
    { id: '1', title: 'Test', direction: 'long', notes: 'Original', createdAt: 1000 }
  ];
  await db.journalEntries.bulkAdd(original);

  // Export
  const json = await exportJournalToJSON();

  // Clear DB
  await db.journalEntries.clear();

  // Import
  await importJournalFromJSON(json);

  // Verify
  const restored = await db.journalEntries.toArray();
  expect(restored).toEqual(original);
});
```

---

## Acceptance Criteria

✅ Export Journal → JSON funktioniert
✅ Export Journal → Markdown funktioniert
✅ Import Journal from JSON funktioniert
✅ Bulk Export (All Data) funktioniert
✅ Download Triggers in UI
✅ Import File Upload Handler funktioniert
✅ Round-Trip Test: Export → Import → No Data Loss
✅ Schema Validation für Import
✅ Conflict Resolution (Merge vs. Replace)
✅ Unit Tests: >80% Coverage

---

## Validation

```bash
# Unit Tests
pnpm vitest --run tests/lib/ExportService.test.ts

# Manual Test
pnpm dev
# → Open /settings-v2
# → Click "Export Journal (JSON)"
# → Verify file downloaded
# → Click "Import Data"
# → Upload exported file
# → Verify entries restored
```

---

## File Format Examples

### JSON Export
```json
{
  "version": "1.0",
  "exportedAt": 1701388800000,
  "entriesCount": 2,
  "entries": [
    {
      "id": "abc123",
      "title": "SOL Long Trade",
      "direction": "long",
      "notes": "Entry at $95, target $105",
      "tags": ["breakout", "trend"],
      "createdAt": 1701388800000,
      "updatedAt": 1701388900000
    }
  ]
}
```

### Markdown Export
```markdown
# Sparkfined Trading Journal

**Exported**: 2024-12-05
**Total Entries**: 2

---

# SOL Long Trade

**Date**: 2024-11-30
**Direction**: LONG
**Tags**: breakout, trend

## Notes

Entry at $95, target $105. Strong volume confirmation.

## Journey Progress

- **Phase**: Seeker
- **XP Earned**: 50

---
```

---

## Related

- Siehe: `src/lib/ExportService.ts` (TODO P1, Issue #11)
- Feature Request: CSV Export (Future)
- Integration mit Cloud Sync (R2 Feature)

---

**Owner**: Frontend Team
**Status**: 🔴 OFFEN – ExportService weiter placeholder; siehe Audit 2025-12-08
**Deadline**: Woche 4 (Sprint 4)
