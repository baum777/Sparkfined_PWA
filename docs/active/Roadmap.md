# 🗺️ Improvement Roadmap — Sparkfined PWA

**Vision:** Best-in-class PWA for crypto trading analysis, local-first, AI-powered, mobile-optimized.

**Phases:** R0 (Private Teaser) → R1 (Public Beta) → R2 (Production Alpha)

---

## 🎯 R0: Private Teaser (Weeks 1-2)

**Goal:** Deploy internally + OG holders for feedback and validation.

**Target:** 50 DAU, 90% PWA installability, <1% crash rate

### Features

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Board command center (11 KPIs) | ✅ Built | P0 | Needs API keys to show real data |
| Chart viewer (OHLC + 5 indicators) | ✅ Built | P0 | Canvas renderer, 60fps |
| Journal (CRUD, screenshots) | ✅ Built | P0 | IndexedDB storage, no AI yet |
| Settings (theme, layout) | ✅ Built | P1 | Toggle switches functional |
| Access gating (OG NFT check) | ✅ Built | P0 | Solana wallet integration |
| PWA installability | ✅ Built | P0 | Manifest + SW configured |
| Offline mode | ✅ Built | P1 | Fallback to cached data |

### Technical Debt to Fix

| Item | Severity | Effort | Owner |
|------|----------|--------|-------|
| Remove `strictNullChecks: false` from build | 🔴 BLOCKER | 2h | Dev Lead |
| Fix 22 TypeScript errors | 🔴 BLOCKER | 4h | Dev Team |
| Add E2E tests to CI | 🔴 BLOCKER | 30min | DevOps |
| Runtime env validator | 🟠 HIGH | 1h | Dev Lead |
| Deploy checklist doc | 🟠 HIGH | 30min | Product |
| Wrap console.log statements | 🟡 MEDIUM | 1h | Dev |
| Bundle size CI check | 🟡 MEDIUM | 1h | DevOps |

### Done Criteria (R0 Launch Checklist)

- [x] Code builds without errors (`pnpm build`)
- [x] TypeScript strict mode enabled in production config
- [ ] All 22 type errors fixed (**BLOCKER**)
- [ ] E2E tests pass in CI (**BLOCKER**)
- [ ] Lighthouse PWA score >90
- [ ] API keys configured in Vercel (Moralis + OpenAI)
- [ ] Deployed to Vercel staging (preview URL)
- [ ] Manual smoke test on iOS + Android
- [ ] Access gating tested with OG NFT holder
- [ ] Feedback collection mechanism live (modal)

### Success Metrics (Week 2)

- 50+ active OG holders testing
- <1% crash rate (Sentry)
- >80% PWA install rate (mobile users)
- >50% return visit rate (D1 retention)
- 0 critical bugs reported

---

## 🚀 R1: Public Beta (Weeks 3-6)

**Goal:** Open to community, scale to 500 DAU, optimize for performance.

**Target:** 500 DAU, <2s LCP, 50% unit test coverage, <0.1% error rate

### New Features

| Feature | Description | Priority | Effort | Sprint |
|---------|-------------|----------|--------|--------|
| **Chart Replay Mode** | Backtest strategies on historical data | P0 | 3d | S1 |
| **Alert System** | Rule wizard + server-side cron evaluation | P0 | 5d | S1-S2 |
| **AI Teaser (Full)** | Screenshot → bullet-point analysis (OpenAI/Claude) | P0 | 3d | S2 |
| **Push Notifications** | VAPID-based alerts for price/volume triggers | P1 | 2d | S2 |
| **Export to JSON/MD** | Journal + trades exportable | P1 | 1d | S3 |
| **Leaderboard** | OG holder ranking by activity/trades | P2 | 2d | S3 |
| **Custom Install Prompt** | `beforeinstallprompt` handler for iOS/Android | P1 | 1d | S3 |
| **Background Sync** | Queue API calls when offline, sync on reconnect | P1 | 3d | S3 |

### Performance Improvements

| Item | Target | Effort | Sprint |
|------|--------|--------|--------|
| Lazy-load Tesseract.js (OCR) | Reduce main bundle by 2MB | 1d | S1 |
| Add Web Vitals tracking | LCP <1.5s, FID <50ms, CLS <0.1 | 1d | S1 |
| Font subsetting (Latin-only) | Reduce font load by 50% | 2h | S2 |
| Image optimization (WebP) | Convert screenshots to WebP | 1d | S2 |
| Lighthouse CI | Enforce PWA score >90 | 1d | S1 |

### Testing & Quality

| Item | Target | Effort | Sprint |
|------|--------|--------|--------|
| Unit test coverage | 50% (lib/ + adapters/) | 3d | S1-S2 |
| E2E test suite | 15 specs (all user flows) | 3d | S1-S2 |
| A11y compliance | WCAG 2.1 AA (automated checks) | 2d | S2 |
| Error monitoring | Sentry configured, <0.1% error rate | 1d | S1 |
| API monitoring | Uptime checks for Moralis/DexPaprika | 1d | S2 |

### Done Criteria (R1 Launch Checklist)

- [ ] All R0 blockers resolved
- [ ] 50% unit test coverage achieved
- [ ] 15 E2E specs passing in CI
- [ ] Lighthouse score >90 (PWA, Performance, A11y)
- [ ] LCP <2s on 4G (95th percentile)
- [ ] Error rate <0.1% (7-day rolling average)
- [ ] Push notifications working on iOS + Android
- [ ] Chart replay mode tested by 20+ users
- [ ] AI teaser accuracy >80% (user feedback)
- [ ] Deployed to production (custom domain)

### Success Metrics (Week 6)

- 500+ DAU
- 60%+ D7 retention
- <2s LCP (95th percentile)
- <0.1% error rate
- 100+ alert rules created by users
- 50+ trades logged in journal
- 4.5+ star rating (user feedback)

---

## 🏆 R2: Production Alpha (Weeks 7-12)

**Goal:** Stable, monetizable MVP with advanced features and analytics.

**Target:** 2000 DAU, <1.5s LCP, 80% test coverage, self-sustaining community

### Advanced Features

| Feature | Description | Priority | Effort | Sprint |
|---------|-------------|----------|--------|--------|
| **20+ Indicators** | Full TA suite (Ichimoku, Stochastic, ATR, etc.) | P0 | 5d | S4-S5 |
| **AI Journal Compression** | Summarize weekly trades into key insights | P0 | 3d | S4 |
| **Multi-Chart Layout** | 2x2 grid for comparing tokens | P1 | 3d | S5 |
| **Backtesting Engine** | Simulate rule performance on historical data | P0 | 5d | S5-S6 |
| **Webhook Integrations** | TradingView alerts → Sparkfined | P1 | 3d | S6 |
| **Discord Bot** | Post alerts to Discord channels | P2 | 2d | S6 |
| **Token Locking Tiers** | Unlock features based on token holdings | P0 | 3d | S6 |
| **Subscription Flow** | Stripe integration for non-holders | P1 | 3d | S6 |

### Performance & Scale

| Item | Target | Effort | Sprint |
|------|--------|--------|--------|
| IndexedDB → Cloud Sync | Optional backend sync for journal/trades | 5d | S4-S5 |
| Redis Caching (Backend) | Cache API responses for 5min | 2d | S4 |
| CDN for Static Assets | Serve fonts/icons from CDN | 1d | S5 |
| Code Splitting (Route-Level) | Reduce initial bundle by 30% | 2d | S5 |
| Service Worker Precaching | Cache top 100 tokens for offline | 2d | S6 |

### Analytics & Monitoring

| Item | Target | Effort | Sprint |
|------|--------|--------|--------|
| User analytics (Umami) | Track pageviews, feature usage | 1d | S4 |
| Funnel analysis | Measure conversion (landing → install → trade) | 2d | S4 |
| Cohort retention | Track weekly cohorts (D1, D7, D30) | 2d | S5 |
| Revenue dashboard | Track subscriptions + token locks | 2d | S6 |
| API cost tracking | Monitor OpenAI/Moralis spend | 1d | S6 |

### Documentation

| Item | Target | Effort | Sprint |
|------|--------|--------|--------|
| User Guide | Step-by-step for all features | 3d | S5-S6 |
| API Documentation | OpenAPI spec for backend routes | 2d | S5 |
| Developer Setup | Contribution guide (CONTRIBUTING.md) | 1d | S6 |
| Changelog | Auto-generated from commits | 1d | S6 |

### Done Criteria (R2 Launch Checklist)

- [ ] All R1 features stable + no P0 bugs
- [ ] 80% unit test coverage
- [ ] 25 E2E specs passing in CI
- [ ] LCP <1.5s, FID <50ms (95th percentile)
- [ ] Error rate <0.05% (30-day rolling average)
- [ ] Mobile-first UX polished (iOS + Android)
- [ ] User guide + API docs complete
- [ ] Token locking tiers functional
- [ ] Subscription flow tested (test Stripe)
- [ ] Deployed to production with custom domain + SSL

### Success Metrics (Week 12)

- 2000+ DAU
- 70%+ D7 retention, 50%+ D30 retention
- <1.5s LCP (95th percentile)
- <0.05% error rate
- 500+ alert rules active
- 200+ trades logged per week
- $5K+ MRR (subscriptions + token locks)
- 10+ active contributors (open-source community)

---

## 🔮 Post-R2: Future Enhancements (Q1 2026+)

### Phase 3: Enterprise Features

- White-label deployments for trading firms
- Multi-user workspaces (team collaboration)
- Custom indicator scripting (Pine Script-like)
- Advanced backtesting (Monte Carlo, walk-forward)
- API access for programmatic trading

### Phase 4: Mobile Native Apps

- React Native port for iOS/Android
- Native notifications (APNs, FCM)
- Biometric authentication (Face ID, fingerprint)
- Widgets for home screen (iOS 14+, Android 12+)

### Phase 5: AI Co-Pilot

- Voice commands ("Show me BTC chart on 4H")
- Predictive alerts (ML-based price forecasting)
- Sentiment analysis from social media
- Automated trade journaling (OCR → structured data)

---

## 📈 Metrics Dashboard

**Track these KPIs weekly:**

| Metric | R0 Target | R1 Target | R2 Target |
|--------|-----------|-----------|-----------|
| **DAU** | 50 | 500 | 2000 |
| **D7 Retention** | 50% | 60% | 70% |
| **LCP (P95)** | <3s | <2s | <1.5s |
| **Error Rate** | <1% | <0.1% | <0.05% |
| **PWA Install Rate** | 80% | 85% | 90% |
| **Test Coverage** | 20% | 50% | 80% |
| **Lighthouse PWA** | 90 | 95 | 98 |
| **MRR** | $0 | $1K | $5K |

---

## 🛠️ Sprint Planning Template

**Sprint Duration:** 2 weeks  
**Team Size:** 2 devs + 1 designer + 1 PM

### Sprint Rituals

- **Monday:** Sprint planning (2h) — Review roadmap, assign tickets
- **Daily:** Standup (15min) — Blockers, progress, help needed
- **Friday:** Demo + Retro (1h) — Show progress, gather feedback

### Sprint Backlog Structure

1. **P0 Blockers** (must-fix this sprint)
2. **P1 Features** (planned work)
3. **P2 Nice-to-Have** (time permitting)
4. **Tech Debt** (allocated 20% sprint capacity)

### Definition of Done

- [ ] Code reviewed + approved by 1+ team member
- [ ] Unit tests written (>80% coverage for new code)
- [ ] E2E test added for user-facing changes
- [ ] Linter + TypeScript checks pass
- [ ] Deployed to staging + smoke tested
- [ ] Docs updated (if public API change)

---

## 🔗 Dependencies & Risks

### External Dependencies

- **Moralis API** — Chart data depends on uptime (99.9% SLA)
- **OpenAI API** — AI features depend on rate limits (Tier 3+ recommended)
- **Vercel** — Deployment platform (zero-downtime assumed)
- **Solana RPC** — Access gating depends on blockchain availability

### Mitigation

- Multi-provider fallback (Moralis → DexPaprika → Dexscreener)
- AI heuristic fallback (local analysis if API fails)
- CDN for static assets (no Vercel dependency)
- Cached RPC responses for access checks

### Risk: Scope Creep

**Symptom:** Sprint overruns, feature bloat, delayed launch  
**Mitigation:** Strict prioritization (P0 only in sprint), defer P2 to backlog

### Risk: API Cost Overrun

**Symptom:** Moralis/OpenAI bills exceed budget  
**Mitigation:** Set hard caps in `.env`, monitor daily spend, cache aggressively

---

## 🎯 OKRs (Objectives & Key Results)

### Q4 2025: R0 → R1

**Objective:** Launch public beta with 500 DAU and <1% crash rate.

**Key Results:**
- KR1: 500 DAU by end of Q4 (Week 6)
- KR2: <1% crash rate (Sentry)
- KR3: 60% D7 retention
- KR4: Lighthouse PWA score >90

### Q1 2026: R1 → R2

**Objective:** Scale to 2000 DAU and achieve $5K MRR.

**Key Results:**
- KR1: 2000 DAU by end of Q1 (Week 12)
- KR2: $5K MRR (subscriptions + token locks)
- KR3: 70% D7 retention, 50% D30 retention
- KR4: 80% unit test coverage

---

## 📞 Contact & Ownership

**Product Owner:** [Your Name]  
**Tech Lead:** [Dev Lead Name]  
**Designer:** [Designer Name]  

**Questions?** Ping in #sparkfined-dev on Discord or open a GitHub issue.

---

**Last Updated:** 2025-11-07  
**Next Review:** 2025-11-14 (Weekly Sprint Planning)
