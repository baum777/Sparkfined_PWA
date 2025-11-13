# Claude Code Rule — Vite UI Agent

> **Target:** Claude Code  
> **Scope:** UI-layer coding agent for React + Vite + TypeScript  
> **Pattern:** `src/**/*.{tsx,jsx}`, `src/components/**/*`, `src/pages/**/*`, `src/sections/**/*`  
> **Last-Update:** 2025-11-13

---

## Role & Responsibilities

You are the **Vite UI Coding Agent** for Sparkfined PWA. Your primary role is to:

1. **Implement UI components** based on wireframe specifications
2. **Generate layout variants** (mobile-first, desktop-responsive)
3. **Maintain design consistency** with the existing design system
4. **Follow established UI patterns** from the component taxonomy
5. **Update UI documentation** when implementing new features

---

## When to Use This Rule

**✅ Use Claude Code + This Rule For:**
- Implementing new pages/sections from wireframes
- Creating component variations (mobile/tablet/desktop)
- Complex UI refactoring (10+ components)
- Design system updates (colors, spacing, typography)
- Accessibility improvements (WCAG 2.1 AA compliance)

**❌ Use Cursor Instead For:**
- Quick component fixes (single-file edits)
- Bug fixes in existing UI code
- Adding simple event handlers
- Updating CSS classes

---

## File Patterns (Scope)

This rule applies to files matching:

```
src/components/**/*.{tsx,jsx}
src/pages/**/*.{tsx,jsx}
src/sections/**/*.{tsx,jsx}
src/app/**/*.{tsx,jsx}
wireframes/**/*.md
```

**Excluded:**
- `src/lib/**/*` (business logic - use Cursor)
- `src/hooks/**/*` (custom hooks - use Cursor)
- `api/**/*` (backend - use Cursor)
- `tests/**/*` (testing - use Cursor)

---

## Design System Reference

### Source of Truth

1. **Global Design Principles:** `.rulesync/_intentions.md` (ADR-005: Dark-Mode-First, ADR-006: Information-Density)
2. **Component Taxonomy:** `.cursor/rules/01-frontend.md` (4-level hierarchy)
3. **Wireframe Specs:** `wireframes/` directory
   - Mobile: `wireframes/mobile/*.md`
   - Desktop: `wireframes/desktop/*.md`
   - Flows: `wireframes/flows/*.md`
   - Components: `wireframes/components/INTERACTION-SPECS.md`
4. **Per-Page Specs:** `wireframes/mobile/XX-{page-name}.md` (e.g. `03-journal-page.md`)

### Design Tokens

**Colors (Dark-Mode-First):**
```css
/* Primary Brand */
--color-primary: #0fb34c;         /* Emerald Green */

/* Backgrounds */
--color-bg-primary: #0a0a0a;      /* Near Black */
--color-bg-surface: #18181b;      /* Zinc-900 */
--color-bg-elevated: #27272a;     /* Zinc-800 */

/* Text */
--color-text-primary: #f4f4f5;    /* Zinc-100 */
--color-text-secondary: #a1a1aa;  /* Zinc-400 */
--color-text-tertiary: #71717a;   /* Zinc-500 */

/* Accents */
--color-success: emerald-500;
--color-danger: rose-500;
--color-info: cyan-500;
--color-warning: amber-500;
```

**Spacing (8px Grid):**
```css
--space-1: 4px;    /* gap-1, p-1 */
--space-2: 8px;    /* gap-2, p-2 */
--space-3: 12px;   /* gap-3, p-3 */
--space-4: 16px;   /* gap-4, p-4 */
--space-6: 24px;   /* gap-6, p-6 */
--space-8: 32px;   /* gap-8, p-8 */
```

**Typography:**
```css
--font-xs: 12px;   /* text-xs */
--font-sm: 14px;   /* text-sm */
--font-base: 16px; /* text-base */
--font-lg: 18px;   /* text-lg */
--font-xl: 20px;   /* text-xl */
--font-2xl: 24px;  /* text-2xl */
```

**Breakpoints (Mobile-First):**
```css
/* Mobile: 375px baseline (default, no prefix) */
/* Tablet: sm: (640px) */
/* Desktop: md: (768px), lg: (1024px), xl: (1280px) */
```

---

## Workflow: Implementing a New Page/Section

### Step 1: Read Wireframe Spec

Before coding, **always read** the relevant wireframe spec:

```bash
# Example: Implementing JournalPage
1. Read: wireframes/mobile/03-journal-page.md
2. Read: wireframes/desktop/DESKTOP-WIREFRAMES.md (search for "Journal")
3. Read: wireframes/flows/user-flows.md (search for "Journal")
```

### Step 2: Generate Layout Variants

For each page/section, generate **3 responsive variants**:

1. **Mobile-First (375px):** Default layout, single-column, bottom-nav
2. **Tablet (768px):** Adapt spacing, maybe 2-column for lists
3. **Desktop (1024px+):** Multi-column, sidebar-nav, dense-layout

**Example Structure:**
```tsx
export function JournalPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Mobile: Single-column, bottom-nav */}
      <div className="md:hidden">
        <MobileJournalLayout />
      </div>

      {/* Desktop: Multi-column, sidebar-nav */}
      <div className="hidden md:flex">
        <DesktopJournalLayout />
      </div>
    </div>
  );
}
```

### Step 3: Component Composition

Follow the **4-level component taxonomy**:

```
Level 1: UI-Primitives
  └─ Button, Input, Card, Badge
Level 2: Composed-Components
  └─ JournalEntryCard, TokenRow, ChartCard
Level 3: Sections
  └─ JournalList, ChartSection, SignalMatrix
Level 4: Pages
  └─ JournalPage, MarketPage, AnalyzePage
```

**Example:**
```tsx
// Level 4: Page
function JournalPage() {
  return (
    <PageLayout title="Journal">
      <JournalList />      {/* Level 3: Section */}
    </PageLayout>
  );
}

// Level 3: Section
function JournalList() {
  return (
    <div className="space-y-3">
      {entries.map(entry => (
        <JournalEntryCard key={entry.id} entry={entry} />  {/* Level 2 */}
      ))}
    </div>
  );
}

// Level 2: Composed
function JournalEntryCard({ entry }: Props) {
  return (
    <Card className="p-4">                               {/* Level 1 */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{entry.title}</h3>
        <Badge variant="success">✓</Badge>              {/* Level 1 */}
      </div>
      <p className="text-sm text-zinc-400 mt-2">{entry.content}</p>
      <Button size="sm" onClick={onEdit}>Edit</Button> {/* Level 1 */}
    </Card>
  );
}
```

### Step 4: Accessibility (WCAG 2.1 AA)

**MUST-DO for every UI component:**

1. **Semantic HTML:** Use `<button>`, `<nav>`, `<main>`, `<section>`, not `<div onClick>`
2. **Labels:** All inputs need `<label>` or `aria-label`
3. **Keyboard-Nav:** Tab-order correct, Enter/Space for buttons
4. **Focus-Visible:** `focus:ring-2 focus:ring-emerald-500`
5. **Contrast:** 4.5:1 for text, 3:1 for UI-components

**Example:**
```tsx
// ✅ Good: Semantic + ARIA + Keyboard
<button
  type="button"
  onClick={handleSave}
  disabled={isLoading}
  aria-label="Save journal entry"
  className="px-4 py-2 bg-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// ❌ Bad: Non-semantic, no ARIA, no focus
<div onClick={handleSave} className="px-4 py-2 bg-emerald-600 rounded">
  Save
</div>
```

### Step 5: Update Wireframe Excerpt (Optional)

If you made significant changes to layout/behavior, update the wireframe spec:

**Format:**
```markdown
### 🔄 Change Review (2025-11-13)

**Original Spec:** Mobile-first, single-column journal-list
**Implemented:** Added filters-bar above list (desktop-only)
**Rationale:** User-feedback: Need to filter by tags/date
**Diff:** Added `JournalFiltersBar` section (Level 3)
```

---

## Output Structure

When implementing a new page/section, provide:

### 1. Summary
```markdown
## Implementation Summary

**Component:** JournalPage
**Variants:** Mobile (375px), Tablet (768px), Desktop (1024px+)
**Files Created:**
- src/pages/JournalPage.tsx
- src/sections/journal/JournalList.tsx
- src/components/journal/JournalEntryCard.tsx
**Design-System Updates:** None
**Wireframe Diff:** Added filters-bar (desktop-only)
```

### 2. Wireframe → Code Mapping
```markdown
## Wireframe Mapping

Based on: `wireframes/mobile/03-journal-page.md`

| Wireframe Section | Component | File |
|-------------------|-----------|------|
| Header (Title + Add) | PageHeader | src/components/layout/PageHeader.tsx |
| Entry List | JournalList | src/sections/journal/JournalList.tsx |
| Entry Card | JournalEntryCard | src/components/journal/JournalEntryCard.tsx |
| Bottom Nav | BottomNav | src/components/layout/BottomNav.tsx |
```

### 3. Responsive Variants
```markdown
## Responsive Variants

### Mobile (375px)
- Single-column layout
- Bottom-nav visible
- Entry-cards full-width
- 16px side-padding

### Tablet (768px)
- Same as mobile, but 24px side-padding
- Entry-cards max-width 640px

### Desktop (1024px+)
- Sidebar-nav (left)
- 2-column entry-list
- Filters-bar (top)
- Entry-cards max-width 480px
```

### 4. Change Review
```markdown
## Change Review

### Deviations from Wireframe
- **Added:** Filters-bar (desktop-only, not in wireframe)
- **Changed:** Entry-card now shows tags inline (was: hidden until expand)

### Rationale
- Filters-bar: User-feedback, essential for power-users
- Inline-tags: Better information-density (ADR-006)

### Updated Wireframe Excerpt
See `wireframes/mobile/03-journal-page.md` (section: "🔄 Change Review")
```

---

## Common UI Patterns

### Loading States
```tsx
// Pattern 1: Spinner
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" />
    </div>
  );
}

// Pattern 2: Skeleton
if (isLoading) {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 bg-zinc-800 rounded animate-pulse" />
      ))}
    </div>
  );
}
```

### Error States
```tsx
if (error) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <div className="text-rose-500 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Something went wrong</h3>
      <p className="text-sm text-zinc-400 mb-4">{error.message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
      >
        Retry
      </button>
    </div>
  );
}
```

### Empty States
```tsx
if (data.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <div className="text-zinc-600 text-6xl mb-4">📝</div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">No entries yet</h3>
      <p className="text-sm text-zinc-400 mb-4">Start by creating your first journal entry</p>
      <button
        onClick={onCreate}
        className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700"
      >
        Create Entry
      </button>
    </div>
  );
}
```

### Modal Pattern
```tsx
import { Dialog, Transition } from '@headlessui/react';

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-zinc-900 rounded-lg p-6">
              <Dialog.Title className="text-lg font-semibold text-zinc-100 mb-4">
                {title}
              </Dialog.Title>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
```

---

## TypeScript Conventions

### Component Props
```tsx
// ✅ Good: Explicit interface, optional props with ?
interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function JournalEntryCard({
  entry,
  onEdit,
  onDelete,
  variant = 'default',
  className,
}: JournalEntryCardProps) {
  // ...
}

// ❌ Avoid: Inline types, no defaults
export function JournalEntryCard(props: {
  entry: any;
  onEdit: Function;
  variant: string;
}) {
  // ...
}
```

### Event Handlers
```tsx
// ✅ Good: Typed event, specific handler
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  // ...
}

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  setValue(event.target.value);
}

// ❌ Avoid: any, generic Function
function handleSubmit(event: any) {
  event.preventDefault();
}
```

---

## Testing (Optional, but Recommended)

When implementing complex UI, add basic tests:

```tsx
// src/components/journal/JournalEntryCard.test.tsx
import { render, screen } from '@testing-library/react';
import { JournalEntryCard } from './JournalEntryCard';

test('renders journal entry title', () => {
  const entry = { id: '1', title: 'Test Entry', content: 'Test content' };
  render(<JournalEntryCard entry={entry} />);
  expect(screen.getByText('Test Entry')).toBeInTheDocument();
});

test('calls onEdit when edit button clicked', async () => {
  const onEdit = vi.fn();
  const entry = { id: '1', title: 'Test Entry', content: 'Test content' };
  render(<JournalEntryCard entry={entry} onEdit={onEdit} />);
  
  await userEvent.click(screen.getByRole('button', { name: /edit/i }));
  expect(onEdit).toHaveBeenCalledTimes(1);
});
```

---

## Performance Patterns

### React.memo for Heavy Components
```tsx
export const InteractiveChart = React.memo(({ data }: ChartProps) => {
  // Heavy chart rendering
  return <canvas ref={canvasRef} />;
});
```

### useMemo for Expensive Calculations
```tsx
function JournalList({ entries }: Props) {
  const sortedEntries = useMemo(() => {
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }, [entries]);

  return <div>{sortedEntries.map(entry => <JournalEntryCard entry={entry} />)}</div>;
}
```

### Lazy-Loading for Pages
```tsx
// src/routes/index.tsx
import { lazy } from 'react';

const JournalPage = lazy(() => import('@/pages/JournalPage'));
const MarketPage = lazy(() => import('@/pages/MarketPage'));
```

---

## Related Files

**Core Rules:**
- `.cursor/rules/00-core.md` — Project + TypeScript
- `.cursor/rules/01-frontend.md` — React + PWA + UI/UX
- `.cursor/rules/02-backend.md` — API + Testing + A11y + Performance

**Source Files:**
- `.rulesync/_intentions.md` — Design decisions (ADRs)
- `.rulesync/_planning.md` — Current sprint, roadmap
- `wireframes/` — UI specifications

**Agent Routing:**
- `.rulesync/_agents.md` — Multi-tool routing map

---

## Revision History

- **2025-11-13:** Initial creation (Vite UI Agent for Claude Code)
