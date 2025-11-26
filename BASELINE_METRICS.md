# Baseline Metrics (Pre-Styling)

**Date:** _Pending (fill after first rerun)_  
**Branch:** _Pending_  
**Base URL:** _Pending_

> 📝 **How to update:** Run `Lighthouse CI` workflow (manual dispatch), download the HTML/JSON artifacts, and copy the median scores into the table below. Keep the table sorted by page priority.

## Lighthouse Scores

| Page / Route   | Performance | Accessibility | Best Practices | SEO | Notes |
|----------------|-------------|---------------|----------------|-----|-------|
| `/` (Dashboard) | TBD | TBD | TBD | TBD | Reference run ID: _TBD_ |
| `/dashboard-v2` | TBD | TBD | TBD | TBD |  |
| `/journal-v2` | TBD | TBD | TBD | TBD |  |

## Bundle Size Snapshot

- Target: **≤ 800 KB** total (current limit enforced in `build:ci`)
- Latest reported total: _703 KB (from CI hardening report)_
- Update this section if bundle limits change or when Lighthouse budget warnings appear.

## Core Web Vitals Targets

| Metric | Target | Latest Observed |
|--------|--------|-----------------|
| LCP    | < 2.5s | TBD |
| FID/INP | < 100ms | TBD |
| CLS    | < 0.1 | TBD |

## Reporting Checklist

1. Run `Lighthouse CI` workflow (manual dispatch) against production or preview URL.
2. Download artifacts → store raw HTML report in ticket if needed.
3. Update the table + targets above with the new scores.
4. Add a short note to the Pull Request summarizing deltas vs. previous baseline.

_Last prepared for Loop A · CI & Workflow Cleanup (2025-11-26)._