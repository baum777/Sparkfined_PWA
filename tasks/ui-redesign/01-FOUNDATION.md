# Foundation — Design System + UI Primitives

## Objective
Create a small internal UI kit that matches Sparkfined’s dark terminal style while supporting light mode.

## Deliverables
### A) Design Tokens (CSS variables)
- spacing scale (4/8/12/16/24/32)
- radii, borders
- foreground/background layers (bg0/bg1/bg2)
- text levels (text0/text1/text2)
- semantic tokens: accent, danger, warning, success

### B) Layout Primitives (React components)
Create/align these primitives (names can be adapted to existing code style):
- `<PageHeader title subtitle actions />`
- `<Container maxWidth="xl" />` (centers content, sets max-width)
- `<Card />`, `<CardHeader />`, `<CardBody />`, `<CardFooter />`
- `<SectionNav />` (optional, sticky anchor list for Settings)
- `<ListRow />` (compact rows with left content + right actions)
- `<Badge variant="armed|triggered|paused|long|short|info" />`
- `<KpiTile />` (Dashboard)
- `<MetricCard />` (Journal results)
- `<InlineBanner variant="error|info|warning" />`
- `<Skeleton />` (loading)
- `<EmptyState />` (empty lists)

### C) Overlay System
Implement ONE consistent overlay system:
- Right Sheet (preferred): 420px, slide-in from right, scroll-lock background
- Modal (for Danger Zone confirms): aria-modal, focus trap, ESC close, inert background

### D) Form Rows
Standardize forms:
- `<FormRow label help control />`
- Replace ON/OFF dropdowns with switches where possible.
- Add compact stepper for numeric fields (min/max, validation text).

## Implementation Steps (Codex)
1) Find current styling approach (tailwind? css modules? global css layers?) and follow it.
2) Add tokens to existing global stylesheet (likely src/styles/*).
3) Create primitives under src/components/ui/* (or existing folder).
4) Ensure primitives look correct in dark theme and don’t break light theme.
5) Add minimal story/demo route OR render primitives in an existing dev page if available.

## Acceptance Criteria
- Container enforces max-width and readable spacing.
- Cards replace table-like “thin line boxes” without losing terminal vibe.
- Right Sheet overlays do not overlap underlying page text and lock scroll.
- Modal confirm has focus management and keyboard support.
- No new dependencies required.

## Tests
- Add unit tests for:
  - RightSheet open/close + ESC
  - Modal focus trap basic behavior
  - Badge variants render
