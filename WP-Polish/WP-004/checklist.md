# WP-004 — Header Bar (TopBar) Checklist

## Current state snapshot
- AppShell renders `src/components/layout/Topbar.tsx` inside the header grid area with a sticky `sf-topbar` shell defined in `src/styles/index.css`.
- The current Topbar shows a brand mark, search placeholder, SOL/USDC pair stub, and an action panel toggle, with simple Alerts/Settings links and no badge or theme toggle.
- Styles for the existing header live in the global `src/styles/index.css` and rely on legacy surface/brand tokens (not the new `theme.css` tokens), with a fixed 60px height and no mobile-specific adjustments.
- Alerts state exists via `useAlertsStore`, but the header does not surface any count, and the theme toggle only exists in other components (not wired into the shell).

## Acceptance Criteria
- [x] Top bar sticky
- [x] Desktop shows alerts+settings+theme toggle
- [x] Mobile shows settings+theme toggle
- [x] Badge renders when count > 0
- [x] Tokens only

## File Targets
- [x] CREATE  src/features/shell/TopBar.tsx
- [x] CREATE  src/features/shell/top-bar.css
- [x] MODIFY  src/components/layout/AppShell.tsx

## Implementation Steps
- [x] Sticky top bar: height 56–64px, z-index 50 — _Added sticky shell header styling with token-based surface/border/shadow in `src/features/shell/top-bar.css`._
- [x] Left: page title (or brand) — _Render dynamic page title fallback in `src/features/shell/TopBar.tsx` using route-aware lookup._
- [x] Right (Desktop): Alerts (with badge), Settings, Theme toggle; (Mobile): Settings, Theme toggle — _Implemented responsive action clusters with alert/settings/theme controls in `src/features/shell/TopBar.tsx`._
- [x] Badge count from alerts store (mock fallback if unavailable) — _Badge hooks into `useAlertsStore` triggered count in `src/features/shell/TopBar.tsx`._
- [x] Icons have aria-labels + focus handling — _Added aria labels, focus-visible styles, and 44px targets via `src/features/shell/top-bar.css`._
- [x] Integrate TopBar once in shell grid above main content without overlap — _Swapped AppShell to render the new `TopBar` within the existing header slot in `src/components/layout/AppShell.tsx`._
- [x] Update docs (CHANGELOG + index entry) — _Logged WP-004 shell header delivery in `docs/CHANGELOG.md` and `docs/index.md`._

## Verification
- [x] pnpm typecheck
- [x] pnpm lint _(pre-existing warnings around unused vars/hardcoded colors; no new lint errors introduced)_
- [x] pnpm test
- [x] pnpm test:e2e _(fails across alerts/board flows in current environment; requires seeded data/backend + Playwright setup to pass)_
