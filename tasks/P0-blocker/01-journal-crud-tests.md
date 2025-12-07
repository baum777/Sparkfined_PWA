# Journal CRUD Tests Unskippen & Fixen

**Priorität**: 🔴 P0 BLOCKER
**Aufwand**: 1-2 Tage
**Dringlichkeit**: SOFORT
**Abhängigkeiten**: Keine

---

## Problem

Die komplette Journal CRUD Test-Suite ist geskippt (`tests/unit/journal.crud.test.ts`). Es gibt **keine automatisierte Garantie**, dass die IndexedDB-Persistence über Create/Update/Delete-Operationen hinweg verlustfrei funktioniert.

**Betroffene Dateien**:
- `tests/unit/journal.crud.test.ts` (komplett geskippt)
- `src/lib/JournalService.ts` (ungetestet)
- `src/store/journalStore.ts` (CRUD Actions ungetestet)

---

## Risiken ohne Fix

- ✗ Datenverlust bei Journal-Operationen unentdeckt
- ✗ Breaking Changes in Dexie Schema unbemerkt
- ✗ Export/Import-Funktionalität kann brechen
- ✗ Keine Regression-Tests bei Refactorings

---

## Tasks

### 1. Dexie In-Memory Test Setup
```typescript
// Verwende Dexie in-memory adapter für Tests
import Dexie from 'dexie';
import 'dexie-indexeddb-polyfill'; // Für jsdom

beforeEach(async () => {
  // Fresh in-memory DB für jeden Test
  await db.delete();
  await db.open();
});
```

### 2. CRUD Lifecycle Tests
- [x] **Create**: Entry erstellen → Prüfen ob in DB (siehe `tests/unit/journal.crud.test.ts`)
- [x] **Read**: Entries abrufen → Sortierung (newest first)
- [x] **Update**: Notes ändern → Persistenz prüfen
- [x] **Delete**: Entry löschen → Aus DB entfernt

### 3. Edge Cases
- [ ] Leerer Titel → Validation Error (nur E2E abgedeckt, Unit fehlt)
- [ ] Duplicate ID Handling
- [x] Concurrent Updates
- [x] Large Notes (>10KB Text)

### 4. Export/Import Tests
- [x] Export → JSON Format korrekt (inkl. CSV in `journal.crud.test.ts`)
- [ ] Import → Merge vs. Replace Logic
- [ ] Schema Migration (wenn v4 → v5)

---

## Acceptance Criteria

✅ `pnpm vitest --run --testNamePattern="journal"` → ALLE Tests grün, **keine Skips**
✅ Code Coverage für `JournalService.ts` >80%
✅ Alle CRUD-Operationen mit Assertions abgedeckt
✅ Export/Import Round-Trip Test erfolgreich

---

## Implementation Guide

### Schritt 1: Test-Setup (30min)
```typescript
// tests/unit/journal.crud.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/db';
import * as JournalService from '@/lib/JournalService';

describe('Journal CRUD Operations', () => {
  beforeEach(async () => {
    await db.delete(); // Clean slate
    await db.open();
  });

  // Tests hier...
});
```

### Schritt 2: Create Test (1h)
```typescript
it('should create journal entry and persist to IndexedDB', async () => {
  const entry = {
    id: crypto.randomUUID(),
    title: 'Test Trade',
    direction: 'long',
    notes: 'Entered at support',
    createdAt: Date.now()
  };

  const id = await JournalService.createEntry(entry);

  expect(id).toBe(entry.id);

  const saved = await db.journalEntries.get(id);
  expect(saved).toMatchObject(entry);
});
```

### Schritt 3: Update Test (1h)
```typescript
it('should update entry notes and persist changes', async () => {
  const id = await JournalService.createEntry({ title: 'Test' });

  await JournalService.updateEntryNotes(id, 'Updated notes');

  const updated = await db.journalEntries.get(id);
  expect(updated.notes).toBe('Updated notes');
});
```

### Schritt 4: Delete Test (30min)
```typescript
it('should delete entry from IndexedDB', async () => {
  const id = await JournalService.createEntry({ title: 'Test' });

  await JournalService.deleteEntry(id);

  const deleted = await db.journalEntries.get(id);
  expect(deleted).toBeUndefined();
});
```

---

## Validation

```bash
# Run Tests
pnpm vitest --run tests/unit/journal.crud.test.ts

# Check Coverage
pnpm vitest --coverage --testNamePattern="journal"

# Lint
pnpm lint src/lib/JournalService.ts

# TypeCheck
pnpm typecheck
```

---

## Related Issues

- Siehe: `docs/tickets/journal-workspace-todo.md` (F-04)
- Blocker für: Server Sync Tests, AI Attach Flow Tests

---

## Owner

**Zuständig**: Dev Team
**Reviewer**: Tech Lead
**Status**: 🟡 TEILWEISE ERLEDIGT (CRUD/Export-Tests aktiv, Import/Validierungsfälle offen)

---

**Erstellt**: 2025-12-05
**Deadline**: Vor R0 Launch (BLOCKER)
