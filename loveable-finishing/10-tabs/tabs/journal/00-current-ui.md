## Journal — 00 Current UI (as implemented)

### What the user sees

- **Page shell**
  - Wrapped in `DashboardShell` with:
    - **Title**: “Journal”
    - **Description**: “Behavioral pipeline with offline persistence and immediate archetype insights.”
  - Page container: `data-testid="journal-page"`.

- **Primary layout**
  - A responsive grid (`journal-shell__grid`):
    - **Desktop (≥1280px)**: 2 columns (capture form ~2fr, insights/history ~1fr).
    - **Smaller screens**: stacked sections.

- **Left / main column: “Journal capture”**
  - A single “capture” card: `data-testid="journal-v2-form"` (glass variant).
  - Header content:
    - “Journal” badge (brand)
    - Title: “Capture your trading state”
    - Subtitle: “Map emotions, conviction, and context before you enter.”
    - Small “Offline-first” indicator (dot + label)
  - Optional **trade context banner** (when prefilled from an on-chain trade):
    - Container: `data-testid="journal-trade-context"`
    - Shows side + asset, UTC timestamp, shortened tx hash.
    - Optional “Clear” button (removes trade context).
  - Form body (3 main sections):
    - **Templates** (top, lazy-loaded)
      - Template picker with:
        - Manage button: `data-testid="journal-template-manage"`
        - Select control: `data-testid="journal-template-select"`
        - Apply template button: `data-testid="journal-template-apply"`
      - Template manager sheet exists (create/update/duplicate/delete custom templates).
    - **1. Emotional State (Required)**: `data-testid="journal-section-state"`
      - Emotional state selector + sliders (confidence, conviction, pattern quality).
    - **2. Context (Optional accordion)**: `data-testid="journal-section-context"`
      - Collapsible “Market context” area with a “Self reflection” textarea: `data-testid="journal-v2-reflection"`
    - **3. Thesis (Required)**: `data-testid="journal-section-thesis"`
      - Reasoning + expectation inputs (required; validation shown after touch/submit).
      - Thesis tags input: `data-testid="journal-tag-input"` (enter or comma to add; backspace removes last tag when empty).
      - Screenshot references (add/remove).
      - AI notes generator section: `data-testid="journal-ai-generator"`
        - “Generate AI notes” button
        - Notes textarea output (editable)

  - Sticky action bar at bottom of the card:
    - Container: `data-testid="journal-action-bar"`
    - Autosave status text: `data-testid="journal-autosave-status"`
    - Reset button: `data-testid="journal-v2-reset"`
    - Primary submit button: `data-testid="journal-v2-submit"` labeled “Run Journal” (or “Analyzing…” while running).

- **Right / secondary column: insights + history**
  - **Top card**:
    - If a result exists: `JournalCard` containing:
      - (Mobile-only) “Templates” CTA: `data-testid="journal-template-trigger"` opening a bottom sheet:
        - Sheet: `data-testid="journal-template-sheet"`
        - Apply mode toggles: `data-testid="template-apply-mode-fill-empty"` / `data-testid="template-apply-mode-overwrite-all"`
        - Apply: `data-testid="journal-template-apply"`, Cancel: `data-testid="journal-template-cancel"`
      - Result view: `data-testid="journal-v2-result"` with:
        - Archetype title + score out of 100
        - Metric grid: `data-testid="journal-metrics-grid"` (2×2)
        - Insights section: `data-testid="journal-insights-section"` (“What next?” cards)
    - If no result yet: an `EmptyState` (“Run your first journal entry”).
  - **Recent entries history card**: `data-testid="journal-v2-history"`
    - Header “Recent entries” + badge with total saved count (if >0).
    - Body:
      - Loading skeleton rows (3)
      - Empty state (“No entries yet”)
      - Otherwise, up to 5 recent entries rendered as `ListRow` with:
        - “#<id> Archetype”
        - Timestamp subtitle
        - Score badge (e.g., 72/100)
        - Row test id: `data-testid="journal-history-row"`
      - If more than 5: “+N more entries” footer text.

### States

- **Page error banner**
  - If the journal pipeline or history load fails: `ErrorBanner` is shown at top of page.

- **History states**
  - Loading: pulse skeleton rows.
  - Empty: empty state inside history card.
  - Loaded: list rows + count badge.

- **Result states**
  - No result yet: empty state prompt (“Run your first journal entry”).
  - Result available: archetype + score + metrics + “What next?” insights.

- **Form validation states**
  - Required fields enforced:
    - Reasoning required
    - Expectation required
  - Errors only appear after fields are “touched” or after submit attempt.
  - Submit button is disabled when validation fails or while submitting.

- **Autosave states**
  - Draft persists to local storage under a dedicated key and reports:
    - “Draft will auto-save every 30s”
    - “Saving draft…”
    - “Saved at …”

- **AI notes generation states**
  - Idle / generating.
  - If thesis is empty: generation errors (“Enter thesis text…”).
  - Can show an “offline / deterministic mock” message and a Retry action.
  - May show a “demo” banner when a demo mode result is returned.

- **Trade context state**
  - When present, the form pre-fills several fields (reasoning/expectation/self-reflection; bumps conviction for BUY).
  - Clearing trade context removes the banner and stops further prefill.
  - After successful submit, trade context is cleared (if it existed).

### Primary user interactions

- **Capture flow**
  - Select emotional state and adjust sliders.
  - Expand/collapse market context accordion and fill reflection.
  - Fill required thesis fields (reasoning + expectation).
  - Add/remove tags via keyboard (Enter/comma) or suggestions buttons.
  - Add/remove screenshot references.
  - Optionally generate AI notes from thesis + tags.
  - Press “Run Journal” to analyze + persist.

- **Templates**
  - Desktop-ish flow: select template, then “Apply template” (explicit apply; doesn’t auto-overwrite).
  - Manage templates via “Manage” (template CRUD in a sheet).
  - Mobile flow (when result present): open “Templates” bottom sheet, choose apply mode, apply.

- **Reset**
  - Resets all fields to defaults, clears stored draft, and clears trade context (if present).

- **Keyboard**
  - Tag input supports Enter/comma to add tags, Backspace to remove last tag when empty.
  - Template sheets/bottom sheets are interactive overlays with close/cancel actions.

### Information scent (obvious vs hidden)

- **Obvious**
  - “Capture your trading state” framing, section numbering (1/2/3), and “Run Journal” CTA.
  - Offline-first indicator and autosave status suggest durability.
  - Result surface: archetype + score + “What next?”.

- **Less obvious / conditional**
  - Templates management and overwrite semantics (fill-empty vs overwrite-all) live inside sheets.
  - Trade context prefill appears only when arriving with a trade context from elsewhere (e.g., dashboard log entry inbox).
  - AI notes generator can be “demo/offline” depending on availability.

### Performance touchpoints

- **Local persistence + timers**
  - Draft auto-save uses:
    - a short debounce save after changes (~800ms)
    - an interval-based flush (~30s)
  - History load reads from IndexedDB on mount.

- **Submit work**
  - Running the pipeline is synchronous (analysis) and then persists to IndexedDB.
  - Additional async side effects may run after submit (shadow trade log, trade confirmation) without blocking UI.

- **Lazy loading**
  - Templates section is `React.lazy()` loaded (rendered inside `Suspense`).

- **Network-adjacent**
  - AI notes generation can call an AI helper (`generateJournalNotes`), with fallback behavior when offline.

