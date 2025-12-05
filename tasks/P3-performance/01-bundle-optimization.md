# Bundle Size Optimization

**Priorität**: 🟢 P3 PERFORMANCE
**Aufwand**: 2 Tage
**Target**: <500 KB main bundle

---

## Problem

- Tesseract.js nicht lazy-loaded (2 MB Impact)
- Chart Library nicht code-split
- Schwere Dependencies im Main Bundle

---

## Tasks

- [ ] Lazy Load Tesseract.js (Vision Analysis)
- [ ] Code Split Chart Library
- [ ] Dynamic Imports für Heavy Components
- [ ] Tree Shaking Audit
- [ ] Bundle Analyzer Review
- [ ] CI Check: Bundle Size <500 KB

**Owner**: Frontend Team
**Deadline**: Woche 5 (Sprint 5)
