# A11y + Consistency Polish (All Pages) + Additional Routes

## Objective
Final pass to ensure:
- consistent typography & spacing
- keyboard and screen reader support
- consistent copy (avoid DE/EN mix per page)
- additional routes not covered get aligned with primitives

## Global Checklist
- Focus rings visible for all interactives.
- Dialogs/Sheets: aria-modal, labelledby, esc close, focus trap.
- Lists: proper semantics, buttons not divs.
- Error states:
  - friendly message + retry + optional details
  - never show raw stack traces or JSON parse errors
- Empty states:
  - clear instructions + CTA (create first alert, connect wallet, etc)
- Responsive:
  - dashboard 2-col -> 1-col
  - sheets full-screen on mobile

## Copy & Language
Pick ONE language per page (recommended EN for now, or DE consistently).
- Fix known typo: "Scapler" -> "Scalper"
- Ensure labels are consistent (e.g., "Triggered" vs "Ausgelöst" not mixed)

## Additional Routes Audit
Codex must:
1) Enumerate all routes discovered in 00-PLAN Phase 0.
2) For any route not covered by modules 03–07:
   - refactor layout using <Container>, <PageHeader>, <Card>, <ListRow>, <EmptyState>
   - document the changes in this file under "Additional Routes Done"

### Additional Routes (from Phase 0)
- Landing (/landing)
- Watchlist (/watchlist)
- Replay (/replay, /replay/:sessionId)
- Notifications (/notifications)
- Signals (/signals)
- Lessons (/lessons)
- Oracle (/oracle)
- Icon Showcase (/icons)
- Dev-only showcases (/styles, /ux)

## Tests
- Run pnpm typecheck, pnpm lint, unit tests.
- Add 1–2 lightweight tests asserting:
  - dialogs have aria attributes
  - sheet is keyboard closable
