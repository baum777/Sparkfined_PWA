# Responsive Layout Guidelines

These conventions keep Sparkfined mobile-first and predictable across breakpoints.

## Breakpoints

| Token | Width | Usage |
|-------|-------|-------|
| `sm`  | 640px | Small phones → compact enhancements (stack to table). |
| `md`  | 768px | Tablets / landscape phones → enable dual columns and sticky filters. |
| `lg`  | 1024px | Desktop dashboards, multi-panel layouts. |
| `xl`  | 1280px | Large screens; add breathing room only when needed. |

Always author mobile styles first, then layer `sm:` / `md:` classes for enhancements.

## Tables & Data Lists

Use the `ResponsiveTable` wrapper from `src/components/layout/ResponsiveTable.tsx` to provide safe horizontal overflow.

```tsx
<ResponsiveTable innerClassName="sm:min-w-[720px]">
  <table className="w-full text-left">
    {/* headers + rows */}
  </table>
</ResponsiveTable>
```

Patterns:
- Mobile (`< sm`): stack each row into cards; show column labels using small uppercase text.
- `sm` and up: display the traditional table, ensuring `min-w` is set so columns do not collapse.
- Never hide essential columns; instead, re-order or label them clearly in the stacked view.

## KPI Strips & Dashboards

KPI strips should support both horizontal scroll and grid layouts:

```tsx
<section className="-mx-4 flex snap-x gap-3 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4">
  <article className="min-w-[min(240px,80vw)] snap-start md:min-w-0">…</article>
</section>
```

- Mobile: enable `snap-x snap-mandatory` so cards glide between touches.
- `md`: convert to a grid (2 columns). `lg`: increase to 4 columns.
- Maintain at least 44px touch targets for tap areas.

## Journal & Watchlist Layouts

Two-panel pages share the same formula:

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.4fr)]">
  {/* list panel */}
  {/* detail panel */}
</div>
```

Guidelines:
- Single column by default for small screens.
- Activate split layouts at `md` (tablet) to avoid waiting until desktop.
- Use `lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]` on Watchlist to give the table more width than the detail panel.

## Mobile Tables → Card Stack

When collapsing tables: 
- Keep the semantic `<table>` when possible; otherwise, wrap row content in `<article role="row">` with labeled sections.
- Prepend each value with a `text-xs uppercase` label that is only visible on mobile (`sm:hidden`).
- Preserve click/focus affordances by using `focus-visible` classes on each card.

## Touch & Scroll Areas

- Apply `overflow-x-auto overscroll-x-contain` to scroll regions.
- Add padding (`px-4`) and gradient fades (like `bg-gradient-to-l`) to indicate overflow.
- Use `scrollbar-gutter: stable` via Tailwind plugin if available; otherwise keep containers tall enough to avoid layout jumps.

## Testing Checklist

- **≤360px:** No horizontal overflow except inside designated scroll wrappers.
- **Tablet:** Journal/Watchlist show two columns, filter chips are readable, tables remain legible.
- **Desktop:** KPI strips align to the grid, detail panels retain their width ratios.
- **Keyboard/Screen reader:** Focus order follows reading order; stacked card labels remain visible.

## Skip Link & Main Content Landmark

- The global skip link (`<a href="#main-content">`) lives near the top of `src/App.tsx`. It becomes visible on focus and jumps straight to the main region.
- Every routed page renders inside the single `<main id="main-content" tabIndex={-1}>` declared in `App.tsx`. Nested layouts (DashboardShell, JournalLayout, etc.) should use `<section>` or `<div>` instead of defining their own `<main>`.
- When creating new layout shells, ensure they sit inside the existing main element; if you need focus management, rely on the `tabIndex={-1}` already set on the canonical main.
