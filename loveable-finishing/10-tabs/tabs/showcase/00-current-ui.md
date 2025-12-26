## Showcase — 00 Current UI (as implemented)

The “Showcase” route in `manifest.yml` currently points at `/icons`, but the implementation surface is actually three separate pages:
- **Icons**: `src/pages/IconShowcase.tsx`
- **Style**: `src/pages/StyleShowcasePage.tsx`
- **UX**: `src/pages/UXShowcasePage.tsx`

These pages function as internal “labs” for verifying PWA assets and demonstrating design system / UX patterns.

### Icons — what the user sees (`IconShowcase`)

- Full-page, standalone layout (not `DashboardShell`)
  - Root: `data-testid="icon-showcase-page"`
  - Large H1 “PWA Icon Showcase” + short explainer (“maskable”)
- **Icon grid**
  - Responsive grid: 1 → 2 → 3 → 4 columns.
  - Card per icon size with:
    - Preview (image rendered from `/icons/<name>`)
    - Label “{size}x{size}” + file name (mono)
  - Small icons (`<=96`) use `imageRendering: 'pixelated'`.
- **Maskable info card**
  - Explains manifest `"purpose": "any maskable"` and safe zone guidance (80% center).
- **Additional assets card**
  - Shows `/favicon.ico` and `/apple-touch-icon.png` thumbnails + short meta.
- **Testing info**
  - Ordered list describing how to verify/install via Chrome DevTools.

### Style — what the user sees (`StyleShowcasePage`)

- Wrapped in `DashboardShell` with:
  - Title: “Style Showcase”
  - Description: “Neue Design-System Komponenten & Utilities”
  - Root: `data-testid="style-showcase-page"`
- A long, scrollable stack of sections that demonstrate CSS utility classes / patterns:
  - Glass variants (`glass`, `glass-subtle`, `glass-heavy`)
  - Card variants (`card`, `card-elevated`, `card-glass`, `card-bordered`, `card-glow`, `card-interactive`)
  - Button variants and sizes (uses `btn ...` classes, not the `Button` component)
  - Microinteractions (`hover-lift`, `hover-glow`, `hover-scale`, `pulse-live`, `shimmer`)
  - Typography + gradients (fluid text + gradient text)
  - Border glows (brand/success/danger)
  - Elevation levels (low/medium/high/float)
  - A “complete example” card combining multiple effects
  - Scrollbar demos (`scrollbar-custom`, `scrollbar-hide`)

### UX — what the user sees (`UXShowcasePage`)

- Full-page, standalone layout (not `DashboardShell`)
  - Root: `data-testid="ux-showcase-page"`
  - Header shows “UX Showcase” and a hint: press `?` for shortcuts.
  - Back button uses `window.history.back()`.
- “Quick actions” row triggers demo toasts and modal/shortcuts dialog.
- Main content is a 2-column grid (desktop) of 10 “Section” cards showing patterns:
  1) Skeleton loaders
  2) Actionable empty state
  3) Error banners / inline errors / dismissible error state
  4) Toast notifications
  5) Tooltips + info/help tooltip variants
  6) Keyboard shortcuts overview + dialog
  7) Form validation primitives (`FormField`, `ValidatedInput`, `CharacterCounter`)
  8) Progressive disclosure (`Collapsible`, `ShowMore`, `ExpandableText`)
  9) Focus management demo (tab navigation)
  10) Page transitions + modal demo
- Modal demo
  - Backdrop click closes modal; ESC shortcut closes.
  - Focus trap via `useFocusTrap(true)`.
  - Container uses `ScaleTransition`.

### Key states

- These pages are mostly static demos; interactive state is local-only:
  - UX: toast calls, shortcuts dialog, modal open/close, controlled inputs for validation.
  - No loading/error/empty states that depend on network data.

### Primary user interactions

- Icons: scroll + visually inspect asset fidelity.
- Style: scroll + visually inspect class variants and motion effects.
- UX:
  - Trigger toast types (success/error/warning/info).
  - Open shortcuts dialog (`?` also opens it).
  - Open/close modal (click backdrop, click “Close”, press Esc).
  - Interact with tooltips, validation input, collapsibles, and focus order.

### Information scent (what’s obvious vs. hidden)

- Obvious: these are internal validation/demo pages (titles + “showcase” framing).
- Less obvious:
  - Whether these pages are intended for production users or dev-only routing.
  - How the showcased primitives map to canonical guidance in `docs/` (style guide, tokens, responsive rules).

### Performance touchpoints

- Icons page may load many images at once; no explicit lazy-loading.
- Style/UX pages render many components; mostly fine but can be scroll-heavy on low-end devices.
- UX page registers keyboard shortcuts (e.g. `?`, `cmd+k`)—ensure no collision if accessible from production navigation.

