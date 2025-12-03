# Journal System – Domain Rules

## 🎯 **Domain Scope**

The Journal System is a **Hero's Journey-based trading journal** with:
- Offline-first architecture (Dexie/IndexedDB)
- AI-powered insights and sentiment analysis
- Gamification through journey phases (Degen → Sage)
- Social preview for sharing trades
- Auto-tagging from trend events

**Key Components**:
- **Page**: `JournalPageV2.tsx` (main layout)
- **State**: `src/store/journalStore.ts` (Zustand)
- **Service**: `src/lib/JournalService.ts` (Dexie wrapper)
- **UI**: `src/components/journal/` (9 components)

---

## 🧭 **Domain Principles**

### 1. **Offline-First**
- All journal operations must work without network
- IndexedDB via Dexie is the source of truth
- No API calls for CRUD operations (create/read/update/delete)

### 2. **Event-Driven**
- Journal entries can be auto-created from:
  - Chart analysis (`ChartCreationContext`)
  - Trend signals (`SolanaMemeTrendEvent`)
- Use `src/store/eventBus.ts` for cross-component communication

### 3. **URL State Sync**
- Selected entry ID synced to query param: `/journal-v2?entry=<id>`
- Deep-linkable for sharing specific entries
- Must respect preselected entry on load (see E2E test)

### 4. **Hero's Journey Metaphor**
- Entries have `journeyMeta` for gamification
- XP earned per entry, badges, and journey phases
- UI reflects progress (see `JournalJourneyBanner`)

---

## 🚨 **Journal-Specific Guardrails**

### 1. **Data Integrity**
- ✅ **DO**: Validate entry title is non-empty before save
- ✅ **DO**: Generate unique IDs (UUID or timestamp-based)
- ❌ **DON'T**: Allow duplicate entries without user intent
- ❌ **DON'T**: Silently fail on Dexie errors (surface to user)

### 2. **State Management**
- ✅ **DO**: Use `journalStore` for all state (don't create local state)
- ✅ **DO**: Update `activeId` when selecting an entry
- ❌ **DON'T**: Mutate `entries` array directly (use Zustand actions)
- ❌ **DON'T**: Create new stores for journal features

### 3. **Component Structure**
```
JournalPageV2 (top-level orchestration)
├── JournalHeaderActions (filters, new entry button)
├── JournalList (scrollable entry list)
│   └── [entry items] → onClick sets activeId
├── JournalDetailPanel (right panel showing active entry)
│   ├── JournalInsightsPanel (AI analysis)
│   ├── JournalJourneyBanner (XP/journey progress)
│   └── JournalSocialPreview (share preview)
└── JournalNewEntryDialog (modal for creation)
```

- ✅ **DO**: Follow this structure when adding features
- ❌ **DON'T**: Create parallel UI patterns

---

## 🧪 **Testing Expectations**

### Unit Tests (Vitest)
- **Location**: `tests/components/Journal*.test.tsx`
- **Coverage**: Component rendering, prop handling, edge cases
- **Mock**: Dexie operations, store actions

### E2E Tests (Playwright)
- **Location**: `tests/e2e/journal/journal.flows.spec.ts`
- **Critical Flows**:
  1. Create entry → appears at top of list
  2. Edit notes → persists changes
  3. Direction filter → filters list correctly
  4. Query param → preselects entry on load
  5. Validation → prevents empty title save

### Common Pitfalls (Avoid These!)

#### ❌ **Flaky Locators**
```typescript
// BAD: Fragile CSS selector
await page.locator('.journal-item:first-child').click();

// GOOD: Stable data-testid
await page.getByTestId('journal-list-item').first().click();
```

#### ❌ **Timing Issues**
```typescript
// BAD: Hard wait
await page.waitForTimeout(500);

// GOOD: Wait for specific state
await expect(page.getByTestId('journal-new-entry-dialog')).not.toBeVisible();
```

#### ❌ **Dialog Overflow Issues**
- **Problem**: Save button below viewport in dialog
- **Solution**: Always `scrollIntoViewIfNeeded()` before clicking
```typescript
const saveButton = page.getByTestId('journal-save-entry-button');
await saveButton.scrollIntoViewIfNeeded();
await saveButton.click();
```

#### ❌ **State Pollution**
- Ensure E2E tests start with clean IndexedDB state
- Use `beforeEach` to reset or seed data consistently

---

## 📐 **Architecture Patterns**

### Store Pattern (Zustand)
```typescript
// src/store/journalStore.ts
interface JournalState {
  entries: JournalEntry[];       // All entries (sorted newest first)
  activeId?: string;             // Currently selected entry ID
  isLoading: boolean;            // Loading state for async ops
  error: string | null;          // Last error message

  // Actions
  setEntries: (entries: JournalEntry[]) => void;
  setActiveId: (id?: string) => void;
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (entry: JournalEntry) => void;
  removeEntry: (id: string) => Promise<void>;
}
```

- ✅ **DO**: Keep store flat and simple
- ❌ **DON'T**: Add computed state (use selectors in components)

### Service Layer Pattern (Dexie)
```typescript
// src/lib/JournalService.ts
export async function createEntry(entry: JournalEntry): Promise<string>
export async function queryEntries(): Promise<JournalEntry[]>
export async function updateEntryNotes(id: string, notes: string): Promise<void>
export async function deleteEntry(id: string): Promise<void>
```

- ✅ **DO**: Keep service functions pure (no store coupling)
- ✅ **DO**: Return Promises (async operations)
- ❌ **DON'T**: Mix UI logic with persistence logic

### URL Sync Pattern
```typescript
// Component level (useEffect)
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const entryId = params.get('entry');
  if (entryId) journalStore.setActiveId(entryId);
}, [location.search]);

// On entry selection
const handleEntryClick = (id: string) => {
  journalStore.setActiveId(id);
  navigate(`/journal-v2?entry=${id}`, { replace: true });
};
```

- ✅ **DO**: Use `replace: true` to avoid polluting history
- ❌ **DON'T**: Create infinite loops (check if ID changed before updating)

---

## 🎨 **UI/UX Constraints**

### List Behavior
- Newest entries at the top (sort by date DESC)
- Active entry highlighted with `data-active="true"`
- Scroll position preserved on re-render

### Detail Panel
- Empty state when no entry selected
- Edit mode toggles for notes (not inline editing)
- AI insights lazily loaded (don't block render)

### Dialog (New Entry)
- Must validate title before allowing save
- Show error inline (`journal-new-entry-error` testid)
- Clear form after successful creation

### Responsive
- Mobile: Stack list above detail panel (vertical)
- Desktop: Side-by-side layout (list left, detail right)

---

## 🔗 **Integration Points**

### Chart System
- Journal can be created from chart via `createDraftFromChart()`
- Context includes: symbol, timeframe, price, annotations
- See `ChartCreationContext` type in `src/domain/chart.ts`

### AI Insights
- Sentiment analysis from `src/lib/journal/ai/`
- Auto-tagging from trend events (`autoTagFromTrendEvent()`)
- Behavioral insights shown in `JournalInsightsPanel`

### Gamification
- XP earned per entry (tracked in `journeyMeta`)
- Journey phase progression (Degen → Seeker → Warrior → Master → Sage)
- Badges for milestones (see `JournalJourneyBanner`)

---

## 🚀 **Adding New Journal Features**

### Checklist
1. **Read existing code first**
   - `src/store/journalStore.ts` (state shape)
   - `src/lib/JournalService.ts` (persistence API)
   - `src/components/journal/` (component patterns)

2. **Update types**
   - Add new fields to `JournalEntry` in `src/types/journal.ts`
   - Update Dexie schema if needed (`src/db/`)

3. **Implement feature**
   - Add store actions if state changes
   - Add service functions if persistence changes
   - Update UI components

4. **Write tests**
   - Unit test: Component logic
   - E2E test: User flow

5. **Update docs**
   - Update `docs/core/journal/` with new behavior
   - Update this rule file if patterns change

---

## 📖 **Related Documentation**

- **Overview**: See `.rulesync/rules/overview.md` for global guardrails
- **Design specs**: `docs/design/wireframes/journal.md`
- **Architecture**: `docs/architecture/` (if applicable)
- **Tickets**: `docs/tickets/journal-workspace-todo.md`

---

**Last updated**: 2025-12-03
**Domain owner**: Journal Team
**Test coverage**: 5 E2E flows, 4 unit tests
