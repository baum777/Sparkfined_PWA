# CI Hardening Report

## Updated Scope
- Node/PNPM versions aligned to Node 20.10.x and pnpm 9 via `package.json` and CI workflow.
- OpenAI client SDK removed from the client bundle path; AI teaser adapter now uses fetch-based calls.
- Vendor chunking hardened through explicit Rollup `manualChunks` groups.
- Bundle-size guardrails tightened with realistic limits and optional patterns for feature-gated chunks.
- CI workflow refreshed for reproducible installs and full `build:ci` enforcement.

## Changed Files
- `package.json`, `pnpm-lock.yaml`
- `vite.config.ts`
- `scripts/check-bundle-size.mjs`
- `scripts/check-env.js`
- `.github/workflows/ci.yml`
- `ci_hardening_section.md`
- `docs/ci-hardening-report.md`

## Vendor / Chunk Sizes (gzip)
- `vendor-react`: **45KB**
- `vendor`: **34KB**
- `vendor-router`: **2KB**
- `vendor-state`: **1KB**
- `vendor-icons`: **3KB**
- `index`: **22KB**
- `chartLinks`: **0KB**
- `chartTelemetry`: **6KB**
- Total JS budget: **704KB / 950KB (74%)**

## Latest `pnpm run check:size`
```
📦 Bundle Size Check
Checking 26 JavaScript files in dist/assets/
✓ Passed (8)
⚠ Warnings (3)
📊 Total Bundle Size
  ✓ Total: 704KB / 950KB (74%)
Top 5 bundles (by gzip size):
  • lightweight-charts.production-CDATe9vz.js → 49KB gzip / 150KB raw
  • vendor-react-d4cfecKK.js → 45KB gzip / 139KB raw
  • vendor-B95KkByl.js → 34KB gzip / 99KB raw
  • index-IP50p-Ok.js → 22KB gzip / 70KB raw
  • AnalysisPageV2-Bp0GWjIs.js → 8KB gzip / 28KB raw
✓ All bundles within size limits!
```

## Rationale for Limits
- `vendor-react` headroom targets React 19 migration without regressions.
- Router/State/Icon/Workbox caps sized to current usage with ~2x slack for new routes or icon sets.
- Optional patterns (`vendor-workbox`, `vendor-ocr`, `vendor-onboarding`, `analyze`) avoid false negatives when the related features are toggled or tree-shaken.
- `TOTAL_BUDGET` 950KB preserves space for future telemetry and offline helpers while keeping PWA startup lean.
