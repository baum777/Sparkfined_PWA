## Settings — 00 Current UI (as implemented)

### What the user sees

- **Route/page wrapper**
  - `/settings` renders a `PageLayout` with `PageContent`, which mounts `features/settings/SettingsPage`.

- **Settings “hero” header**
  - Kicker: “Control Center”
  - Title: “Settings” with a pill “Beta Shell”
  - Subtitle describing the settings surface as lightweight/tokenized until services are connected.
  - A pill row with items like:
    - “Offline-ready PWA”
    - “Design tokens enforced”
    - “Cards stack on mobile”
  - Header actions:
    - “Export workspace” (stub)
    - “Reset defaults” (stub)

- **Card stack (vertical list)**
  - A single-column stack of settings cards (each card is a “listitem”):
    - Token usage card
    - Wallet monitoring card
    - Appearance card
    - Preferences card
    - Workspace & preferences (placeholder list)
    - Data export card
    - Data import card
    - PWA update card
    - Danger zone accordion (destructive actions)

- **Data export card**
  - Title: “Data export”
  - Subtitle indicates export is a “portable backup stub” while backend is offline.
  - Buttons:
    - Export JSON
    - Export Markdown
    - Backup stub
  - “Snapshot summary” panel: `data-testid="export-summary"` (generated time, counts).
  - A message line updates after export attempt.

- **Danger zone accordion**
  - Collapsible titled “Destructive actions” with a caution pill.
  - Two actions (stubbed) requiring a double-click within 5 seconds:
    - Factory reset workspace
    - Clear offline cache
  - Confirmation state changes button label “Prepare” → “Confirm”.
  - A hint line: actions are mocked; no real data deleted.

### States

- **Export**
  - No exports yet (default message).
  - After a successful download attempt: message updates (e.g., exported filename).
  - If download fails: message indicates failure.

- **Danger zone**
  - Idle: “Dangerous actions are gated behind confirmation.”
  - Confirming: “Click again within 5 seconds to confirm.”
  - Expired: “Confirmation expired…”

- **Responsive behavior**
  - Mobile: hero stacks vertically; many grids collapse to 1 column; card padding reduces.

### Primary user interactions

- **Settings cards**
  - Users scroll vertically through cards.
  - Cards contain buttons/controls depending on the card type.

- **Exports**
  - Clicking export buttons triggers a browser download via Blob URL.

- **Danger zone**
  - Two-step confirmation (Prepare → Confirm) with a timeout.

### Information scent (obvious vs hidden)

- **Obvious**
  - “Control Center” framing and card-based organization.
  - Export/backup and “destructive actions” are clearly labeled.

- **Less obvious / conditional**
  - Many actions are explicitly stubbed (copy communicates backend not connected).
  - Some settings behavior exists in other implementations (there is also a `SettingsContent` page variant in `root/src/pages/SettingsContent.tsx` used by other routes/flows).

### Performance touchpoints

- **Downloads**
  - Export uses in-memory Blob creation and triggers browser download (no server round trip).

- **Timers**
  - Danger zone uses a short timeout to expire confirmation state.

