# Baseline Metrics (Pre-Styling)

**Date:** 2025-11-26  
**Branch:** main (after Loops A–C)  
**Base URL:** https://sparkfined-pwa.vercel.app

> 📝 **Source:** `.lhci-report/manifest.json` (Lighthouse CI run from 2025-11-26 11:59 UTC)

## Lighthouse Scores

| Page / Route   | Performance | Accessibility | Best Practices | SEO | PWA | Notes |
|----------------|-------------|---------------|----------------|-----|-----|-------|
| `/` (Root) | **0.67** | **0.92** ✅ | **1.0** ✅ | **0.9** ✅ | **1.0** ✅ | Below perf target (0.75) |
| `/dashboard-v2` | **0.66** | **0.92** ✅ | **1.0** ✅ | **0.9** ✅ | **1.0** ✅ | Below perf target (0.75) |
| `/journal-v2` | **0.73** | **0.94** ✅ | **0.96** ✅ | **0.9** ✅ | **1.0** ✅ | Closest to perf target |

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