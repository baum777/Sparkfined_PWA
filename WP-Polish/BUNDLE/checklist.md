# Bundle Baseline (2025-12-??)

## CI size command
- `pnpm run check:size` (also invoked by `pnpm build:ci`)
- Script: `scripts/check-bundle-size.mjs`
- Current budgets (KB, approx gzip estimate):
  - vendor-react: 115
  - vendor-dexie: 30
  - vendor-icons: 20
  - vendor-charts: 60
  - vendor-state: 5 (optional)
  - vendor-ocr: 35 (optional)
  - vendor-onboarding: 25 (optional)
  - index: 30
  - AnalysisPage: 15 (missing chunk)
  - chartTelemetry: 15
  - chartLinks: 5
  - chunk-ai: 25
  - chunk-journal-components: 12 (missing chunk)
  - Total JS budget: 880 KB (uncompressed)
  - Critical-path bundle budget: 330 KB (index + vendor-react + vendor-dexie)

## Local baseline (before optimizations)
- `pnpm build` → **pass**, but PWA precache = **73 entries / ~3242.5 KiB** (ANALYZE build shows similar).
- `pnpm run check:size` → **FAIL** (Total 886 KB > 880 KB)
  - Warnings: missing `AnalysisPage*` and `chunk-journal-components*` chunks.
  - Passes (size/threshold, approx gzip KB):
    - vendor-react-B6lC1D_0.js: 49/115 (168 KB raw)
    - vendor-dexie-2jmnBxhj.js: 22/30 (74 KB raw)
    - vendor-icons-DneoMYLa.js: 5/20 (17 KB raw)
    - vendor-charts-Bk8T08OE.js: 48/60 (163 KB raw)
    - index-ejpRrLt9.js: 13/30 (45 KB raw)
    - chartTelemetry-BtI1RTlx.js: 10/15 (33 KB raw)
    - chartLinks-Dt-z_1w1.js: 1/5 (2.5 KB raw)
    - chunk-ai-Am2552HK.js: 8/25 (26.5 KB raw)
  - Failure: total JS 886 KB / budget 880 KB (critical bundle 218 KB / 330 KB OK)

## Top offenders
- **vendor-react** (168 KB raw) – unavoidable core
- **vendor-charts** (163 KB raw) – should be truly route-lazy and not pre-cached
- **vendor-dexie** (74 KB raw) – core storage
- **chartTelemetry** (33 KB raw) – should load only with chart feature
- PWA **precache payload ~3.2 MB** includes optional chart/replay assets
