## Alerts — 00 Current UI (as implemented)

### What the user sees

- **Page container**
  - `data-testid="alerts-page"`.
  - A header section with:
    - Title “Alerts”
    - Subtitle “Monitor price levels, conditions, and automated triggers.”
    - Primary CTA button: “New alert” (`data-testid="alerts-new-alert-button"`)

- **Filters bar**
  - Region labeled “Alert filters”.
  - **Status segmented buttons** (All/Armed/Paused/Triggered) with `aria-pressed`.
  - **Type select** (All types / Price above / Price below).
  - **Symbol search input** (type=search), debounced update.

- **Alerts list area**
  - A central list region that can show:
    - Loading state text: “Loading alerts…”
    - Error state block with retry button (“Retry loading”)
    - Empty states:
      - “No alerts yet…” when there are zero alerts total
      - “No alerts match your filters.”
    - Action feedback banner (e.g., “Alert created and armed.”)
  - When there are results:
    - `data-testid="alerts-list"`
    - Each item wrapper: `data-testid="alerts-list-item"` with attributes:
      - `data-alert-id`
      - `data-alert-status`
      - `data-alert-type`
    - Item rendering is responsive:
      - Mobile uses `MobileAlertRow`
      - Desktop uses `AlertCard`

- **New alert creation sheet**
  - A right-side sheet opens for creation:
    - Dialog test id: `data-testid="alert-create-dialog"`
    - Form container: `data-testid="alert-create-form"`
    - Cancel: `data-testid="alert-cancel-button"`
    - Submit: `data-testid="alert-submit-button"`
  - Form fields:
    - Symbol autocomplete: `data-testid="alert-symbol-input"`
    - Type select trigger: `data-testid="alert-type-select"`
    - Threshold input: `data-testid="alert-threshold-input"` (+ error test id `alert-threshold-error`)
    - Condition input: `data-testid="alert-condition-input"` (+ error test id `alert-condition-error`)
    - Timeframe select trigger: `data-testid="alert-timeframe-select"`
  - Templates section at top (apply templates; may prompt confirm if overwriting non-empty fields).

### States

- **Loading**
  - Page initially loads alerts from API and shows “Loading alerts…”.

- **Error**
  - Shows an error message (“We couldn't load alerts just yet…”) and a retry control that reloads.

- **Empty (no alerts)**
  - Text-only empty message: “No alerts yet. Create one from the dashboard or chart tools.”

- **Empty (filters)**
  - Text-only message: “No alerts match your filters.”

- **Action feedback**
  - A banner-like message appears for outcomes (created, failed toggle, failed delete, etc.).

- **Create sheet validation**
  - Requires:
    - symbol
    - condition (≥5 chars)
    - threshold (valid number)
  - Errors are stored per field and shown via component `error` props.
  - Submission failure shows a form-level error: “We couldn't save that alert…”

- **Prefill behavior**
  - If the URL contains prefill parameters, the page opens the “New alert” sheet once and then strips the prefill params from the URL (replace).

### Primary user interactions

- **Create alert**
  - Click “New alert” → fill fields → “Save alert”.
  - On success: new alert is added to top of list and a success action message is shown.

- **Filter/search**
  - Toggle status segment, change type select, and use debounced symbol search.
  - List updates to match filters.

- **Toggle pause/resume**
  - Per alert item: Pause/Resume toggles status optimistically; reverts and shows action message on failure.

- **Delete**
  - Per alert item: Delete removes optimistically; re-inserts and shows action message on failure.

- **Keyboard**
  - Filters controls are focusable; alert card is focusable via `tabIndex={0}` and includes focus-ring on action buttons.

### Information scent (obvious vs hidden)

- **Obvious**
  - Primary “New alert” CTA.
  - Status filter segmented buttons and type dropdown.
  - Alert rows expose symbol + condition prominently.

- **Less obvious / conditional**
  - Prefill flows from other surfaces (dashboard/chart) auto-open the create sheet and then remove params.
  - Templates exist within the create sheet and may overwrite fields (confirmed via `window.confirm`).

### Performance touchpoints

- **Debounced search**
  - Filter query updates after a short debounce (200ms), reducing churn.

- **Optimistic updates**
  - Toggle/delete update the list immediately and revert on error.

- **Mobile media query listener**
  - Uses `matchMedia` subscription to switch between mobile and desktop item components.

