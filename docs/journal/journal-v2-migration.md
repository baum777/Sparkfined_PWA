# Journal 2.0 – Migration Guide

## Kontext
Journal 2.0 läuft als neue Pipeline unter `/journal` (alte `/journal/v2`/`/journal-v2` leiten um) mit Dexie-Storage
(`sparkfined-journal-v2`). Einträge bestehen aus dem Rohinput (`JournalRawInput`) und dem berechneten Output
(`JournalOutput`).

## Schema
- DB: `JournalV2DB` (`src/features/journal-v2/db/journal-v2-schema.ts`)
- Table: `journal` mit Feldern `{ id, raw, output, createdAt, version }`
- Version: `2` (neue Pipeline)

## Migration von Journal 1.0
Die Migration ist vorbereitet, wird aber nicht automatisch ausgeführt.

**Funktion:** `migrateJournalV1ToV2` in `src/features/journal-v2/migration/journal-v2-migration.ts`

**Ablauf:**
1. Lade Legacy-Einträge via `queryEntries({ status: 'all', sortBy: 'timestamp', sortOrder: 'desc' })`.
2. Mappe jeden Eintrag auf `JournalRawInput` (Emotion/Setup → Label; emotionale Position als `emotionalScore` 0–100).
3. `runJournalPipeline(raw)` erzeugt den Output.
4. Speichere `{ raw, output, createdAt, version: 2 }` per `saveJournalEntries` in Dexie.

**Beispiel (manuell triggern):**
```ts
import { migrateJournalV1ToV2 } from '@/features/journal-v2/migration/journal-v2-migration'

async function runMigration() {
  const migrated = await migrateJournalV1ToV2()
  console.info(`Journal V2 migration complete: ${migrated} entries`)
}

void runMigration()
```

> Hinweis: Migration bewusst nur über Admin/Debug-Aufruf, kein Auto-Start beim App-Load.

## UI / Hook
- Route: `/journal/v2` (siehe `RoutesRoot.tsx`)
- Hook: `useJournalV2` kapselt Pipeline + Persistenz
- Components: `JournalInputForm`, `JournalResultView`

## Journal Templates (Client-only)
- Built-ins + Custom Templates werden **lokal** gespeichert (IndexedDB/Dexie).
- Einstieg: **Templates**-Row oben in `JournalInputForm` (Apply ist immer manuell; Standard: nur leere Felder füllen).

## Backup & Export (Journal 1.x)
- **Versionierte Bundles:** `src/lib/export/exportTypes.ts` definiert `JournalExportBundle` (Version `1.0.0`).
- **Export:** `exportJournalToJSON` und `exportJournalToMarkdown` erzeugen JSON- bzw. Markdown-Dumps (inkl. Download-Helper).
- **Import:** `importJournalFromJSON`/`handleJournalImport` verstehen Merge- und Replace-Strategien; inkompatible Versionen werfen `JournalImportVersionError`.
- **UI-Einstieg:** Die Settings-Seite bindet `JournalDataControls` (Buttons für JSON/Markdown-Export, All-App-Backup sowie File-Upload mit Moduswahl).
