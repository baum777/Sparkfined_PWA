# 🛡️ Risk Register — Sparkfined PWA

**Last Updated:** 2025-11-07  
**Review Cadence:** Weekly during R0/R1, Monthly in R2

---

## Risk Categories

- **Technical Risk (T)** — Code quality, architecture, dependencies
- **Operational Risk (O)** — Deployment, monitoring, incident response
- **Business Risk (B)** — User adoption, monetization, legal
- **Security Risk (S)** — Authentication, data privacy, exploits

---

## Risk Matrix

| Risk ID | Risk | Category | Impact | Likelihood | Severity | Mitigation | Owner | Status |
|---------|------|----------|--------|------------|----------|------------|-------|--------|
| **T-001** | Production crashes due to null/undefined access (22 TypeScript errors suppressed) | Technical | 🔴 High | 🟠 Medium | **CRITICAL** | Remove `strictNullChecks: false` from tsconfig.build.json, fix all type errors | Dev Lead | 🔴 OPEN |
| **T-002** | Regression introduced without detection (no E2E in CI) | Technical | 🟠 Medium | 🔴 High | **HIGH** | Add `pnpm test:e2e` to build pipeline, configure Playwright in Vercel | DevOps | 🔴 OPEN |
| **T-003** | Bundle size bloat from future dependencies | Technical | 🟡 Low | 🟠 Medium | **MEDIUM** | Add `bundlesize` CI check, monitor bundle analyzer | Dev Lead | 🟡 PLANNED |
| **T-004** | Performance degradation (no LCP/FID monitoring) | Technical | 🟡 Low | 🟠 Medium | **MEDIUM** | Add Lighthouse CI + Web Vitals tracking | DevOps | 🟡 PLANNED |
| **T-005** | Memory leak from console log pollution (104 logs in prod) | Technical | 🟡 Low | 🟢 Low | **LOW** | Wrap console statements in logger with env check | Dev | 🟡 PLANNED |
| **T-006** | Tesseract.js blocking main thread (2MB lib) | Technical | 🟡 Low | 🟠 Medium | **MEDIUM** | Lazy-load OCR module, use Web Worker | Dev | 🟢 BACKLOG |
| **O-007** | Broken deploy due to missing API keys | Operational | 🔴 High | 🟠 Medium | **HIGH** | Add runtime env validator, show UI banner if keys missing | Dev Lead | 🔴 OPEN |
| **O-008** | No incident response plan for API provider outages | Operational | 🟠 Medium | 🟠 Medium | **MEDIUM** | Document provider fallback chain, add status page | Product | 🟡 PLANNED |
| **O-009** | Unmonitored error rate (no Sentry/logging) | Operational | 🟠 Medium | 🟠 Medium | **MEDIUM** | Configure Sentry, set alert thresholds (<0.1% error rate) | DevOps | 🟡 PLANNED |
| **O-010** | iOS PWA install issues (Safari quirks) | Operational | 🟡 Low | 🟠 Medium | **MEDIUM** | Test on iOS 15-17, add custom install prompt | QA | 🟢 BACKLOG |
| **B-011** | Low user retention if data providers fail | Business | 🟠 Medium | 🟠 Medium | **MEDIUM** | Mock data mode for demo, pre-cache popular tokens | Product | 🟡 PLANNED |
| **B-012** | OG NFT holders churn due to missing features | Business | 🟠 Medium | 🟢 Low | **LOW** | Prioritize feature parity with competitors, gather feedback | Product | 🟢 BACKLOG |
| **B-013** | Legal risk from using exchange API data (ToS) | Business | 🟡 Low | 🟢 Low | **LOW** | Review Moralis/DexPaprika ToS, ensure compliance | Legal | 🟢 BACKLOG |
| **S-014** | API keys exposed in frontend code | Security | 🟡 Low | 🟠 Medium | **MEDIUM** | Document IP restrictions, consider backend proxy | Security | 🟢 ACCEPTED |
| **S-015** | XSS via user-generated content (journal notes) | Security | 🟡 Low | 🟢 Low | **LOW** | React escapes by default, audit rich-text editor | Security | 🟢 ACCEPTED |
| **S-016** | DDoS on API routes (no rate limiting live) | Security | 🟠 Medium | 🟡 Low | **MEDIUM** | Enable Vercel WAF, configure rate limits per IP | DevOps | 🟡 PLANNED |
| **S-017** | IndexedDB data loss (no backup) | Security | 🟡 Low | 🟠 Medium | **LOW** | Add export/import for journal + trades | Dev | 🟢 BACKLOG |

---

## Risk Definitions

### Impact Scale

- 🔴 **High:** App unusable, data loss, security breach, legal liability
- 🟠 **Medium:** Feature broken, degraded UX, minor data loss
- 🟡 **Low:** Minor inconvenience, aesthetic issue, no user impact

### Likelihood Scale

- 🔴 **High:** >50% chance in next 3 months
- 🟠 **Medium:** 20-50% chance in next 3 months
- 🟢 **Low:** <20% chance in next 3 months

### Severity Calculation

`Severity = Impact × Likelihood`

- **CRITICAL:** High impact × Medium+ likelihood → Blocks deploy
- **HIGH:** High impact × Low likelihood OR Medium impact × High likelihood → Fix in Sprint 1
- **MEDIUM:** Medium impact × Medium likelihood → Fix in Sprint 2-3
- **LOW:** Low impact × Any likelihood → Backlog

### Status

- 🔴 **OPEN:** Active risk, mitigation not started
- 🟡 **PLANNED:** Mitigation planned, in backlog
- 🟢 **BACKLOG:** Low priority, deferred to future sprint
- ✅ **CLOSED:** Mitigation complete, risk resolved
- 🟢 **ACCEPTED:** Risk acknowledged, no mitigation planned (cost > benefit)

---

## Mitigation Actions

### Immediate (This Week)

1. **T-001:** Remove `strictNullChecks: false` from tsconfig.build.json (2h)
2. **O-007:** Add runtime env validator + UI banner (1h)
3. **T-002:** Add E2E tests to Vercel build (30min)

### Short-Term (Sprint 1-2)

4. **T-004:** Lighthouse CI + Web Vitals tracking (2 days)
5. **O-009:** Sentry integration (1 day)
6. **S-016:** Vercel WAF + rate limiting (1 day)
7. **T-005:** Logger abstraction (1h)

### Medium-Term (Sprint 3-6)

8. **O-008:** Provider fallback documentation + status page (2 days)
9. **B-011:** Mock data mode for demos (1 day)
10. **T-003:** Bundle size CI checks (1 day)

### Long-Term (R2+)

11. **T-006:** OCR Web Worker implementation (3 days)
12. **O-010:** iOS Safari PWA testing (2 days)
13. **S-017:** Export/import for IndexedDB (2 days)

---

## Review Process

**Weekly Review (R0/R1):**
- Update status for OPEN/PLANNED risks
- Add new risks as identified
- Escalate CRITICAL risks to Product Lead

**Monthly Review (R2):**
- Archive CLOSED risks
- Re-assess likelihood based on production metrics
- Adjust mitigation priorities

---

## Escalation Criteria

Escalate to Product Lead if:
- New CRITICAL risk identified
- HIGH risk remains OPEN for >2 weeks
- Multiple MEDIUM risks converge into HIGH

Escalate to CTO if:
- CRITICAL risk cannot be mitigated within 1 week
- Security breach occurs
- Deployment blocked by risk

---

**Owner:** Engineering Team  
**Last Review:** 2025-11-07  
**Next Review:** 2025-11-14
