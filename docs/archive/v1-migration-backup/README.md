# V1 Migration Backup

This archive preserves the remaining Sparkfined V1 pages, layouts, and sections that were removed from the active `src/` tree during Section 6A. The goal is to keep a short-term backup while V2 stabilizes.

## Contents
- `pages/` – legacy V1 page components (Journal, Chart, Analyze)
- `layout/` – legacy layout shell and header
- `sections-chart/`, `sections-journal/`, `sections-analyze/` – V1 section implementations referenced by the archived pages

## Retention Policy
- Keep until **2 months after the Stable V2 launch** or until Claude confirms the archive can be purged.
- If no regressions are reported during that window, the archive can be deleted to reduce repository weight.

## Restore Instructions
1. Move the needed file(s) back into the `src/` tree (matching their original relative paths).
2. Update imports and routes to point to the restored files.
3. Run `pnpm typecheck` and `pnpm run build` to ensure the restored code compiles.

## Notes
- Dev-only pages (Home, FontTest) were removed instead of archived because they were test noise.
- No active routes should reference these archived files; restoring them requires re-adding routes explicitly.
