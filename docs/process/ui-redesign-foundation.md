# UI Redesign – Phase 00/01 Notes

## Phase 00: Route & Page Inventory

| Route | Page / Feature | Target Module |
| --- | --- | --- |
| `/landing` | Landing (standalone) | Phase 08 – Additional |
| `/dashboard` | Dashboard | Phase 03 |
| `/chart`, `/analysis`, `/analyze` (redirect) | Chart / Analysis | Phase 04 |
| `/journal` | Journal | Phase 05 |
| `/alerts` | Alerts | Phase 06 |
| `/settings` | Settings | Phase 07 |
| `/watchlist` | Watchlist | Phase 08 – Additional |
| `/replay`, `/replay/:sessionId` | Replay Lab | Phase 08 – Additional |
| `/notifications` | Notifications | Phase 08 – Additional |
| `/signals` | Signals | Phase 08 – Additional |
| `/lessons` | Lessons | Phase 08 – Additional |
| `/oracle` | Oracle / Reports | Phase 08 – Additional |
| `/icons` | Icon Showcase | Phase 08 – Additional |
| `/styles` (DEV) | Style Showcase | Phase 08 – Additional |
| `/ux` (DEV) | UX Showcase | Phase 08 – Additional |

Redirects: `/board`, `/dashboard-v2`, `/watchlist-v2`, `/analysis-v2`, `/journal-v2`, `/alerts-v2`, `/chart-v2`, `/settings-v2` all point to the canonical routes above.

## Phase 01: Foundation – Primitives & Overlay System (implemented)

- **Design tokens:** Added spacing scale, semantic aliases, and layout tokens to `tokens.css` for consistent padding, radii, backgrounds, and text layers.
- **Layout primitives:** New `Container`, `PageHeader`, `SectionNav`, `ListRow`, `KpiTile`, and `MetricCard` components to standardize page scaffolding.
- **Feedback primitives:** `InlineBanner` variants for error/info/warning states (friendly, no raw stack traces) and `FormRow` for labeled settings inputs with help/error text.
- **Badge variants:** Extended badge styles for alert/journal contexts (armed, triggered, paused, long, short, info).
- **Overlay system:** New `RightSheet` (420px slide-in, scroll-lock, escape + overlay close, focus trap) and hardened `Modal` focus handling; both render through the shared overlay portal.

## Notes / Follow-ups
- Phase 02 (App Shell) should attach sheets/modals to the global overlay portal and ensure skip-link + stacking contexts remain correct.
- Additional routes (Landing, Replay, Notifications, Signals, Lessons, Watchlist, Oracle, Icons, dev showcases) are scoped to Phase 08 for polish/a11y alignment with the new primitives.
