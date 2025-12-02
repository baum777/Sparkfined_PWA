# Incident Response Workflow – Best Practice
## React Error #185 AnalysisPageV2

> **Ziel:** Systematischer Umgang mit Production-Incidents von Detection bis Prevention

---

## Phase 1: Triage & Kommunikation (0-2h)

### ✅ Schritt 1.1: Severity Assessment

**Fragen:**
- Wie viele User sind betroffen? → **Alle, die /analysis_v2 aufrufen**
- Ist das Feature kritisch für Business? → **Ja, Core-Feature**
- Gibt es Workarounds? → **Nein**
- Datenverlust-Risiko? → **Nein**

**Ergebnis:** **P1 (High Severity)** – Fix innerhalb 24h

---

### ✅ Schritt 1.2: Stakeholder-Kommunikation

**Template für Status-Update:**

```markdown
🔴 INCIDENT ALERT – AnalysisPageV2 Down

**Status:** Investigating
**Severity:** P1 (High)
**Impact:** Analysis V2 page unavailable (React Error #185)
**Affected Routes:** /analysis_v2
**User Impact:** ~100% of users accessing Analysis features
**ETA for Fix:** 4-6 hours (diagnostic build) → 24h (full fix)

**What we're doing:**
1. [Now] Deploying diagnostic build to identify root cause
2. [2h] Implementing hotfix (import/export fix)
3. [4h] Testing on Preview
4. [6h] Deploy to Production

**Workaround:** Users can use legacy Market page for basic analysis

**Next Update:** In 2 hours or when hotfix deployed

---
Report: /AGENT_FILES/INCIDENT_REPORT_REACT_ERROR_185_ANALYSISPAGEV2.md
Incident Commander: [Your Name]
```

**Verteile an:**
- Tech Lead
- Product Owner
- DevOps/On-Call
- (Optional) User-Support, wenn Tickets eingehen

---

### ✅ Schritt 1.3: Rollback Decision

**Checklist:**

- [ ] **Kann ich schnell zur letzten funktionierenden Version rollbacken?**
  - ✅ Ja → Vercel: "Promote previous deployment"
  - ❌ Nein → Weiter zu Phase 2 (Investigation)

- [ ] **Verliere ich wichtige neue Features beim Rollback?**
  - Wenn ja → Nur rollbacken, wenn Incident Critical (P0)
  - Wenn nein → **Sofort rollbacken**

**Für diesen Fall:**
- Rollback zu Commit **vor `1ade0fe`** (Design Token Migration)
- Alternativ: Rollback zu Commit **vor `0187d4f`** (Layout Refactor)

**Vercel Rollback:**
```bash
# Via Dashboard:
# 1. Vercel Dashboard → Deployments
# 2. Finde letztes "erfolgreiche" Deployment (vor 1-2 Wochen)
# 3. Click "..." → "Promote to Production"

# Via CLI:
vercel rollback [deployment-url]
```

**⚠️ Wichtig:** Rollback ist **temporäre Lösung**, nicht permanent!

---

## Phase 2: Investigation (2-4h)

### ✅ Schritt 2.1: Reproduce Locally

**Ziel:** Fehler im lokalen Production-Build reproduzieren

```bash
# 1. Clean install
rm -rf node_modules dist .next
pnpm install

# 2. Build production
pnpm run build

# 3. Preview locally
pnpm run preview

# 4. Navigate to /analysis_v2
# 5. Open DevTools → Console
# 6. Check for React Error #185
```

**Wenn Fehler NICHT lokal reproduzierbar:**
- Unterschied zwischen Dev/Prod-Build
- Vercel-spezifische Build-Config
- Environment-Variable fehlt

**Wenn Fehler reproduzierbar:**
→ Weiter zu Schritt 2.2

---

### ✅ Schritt 2.2: Deploy Diagnostic Build

**Ziel:** Console-Logging in Production, um undefined Component zu finden

**File:** `src/components/analysis/AnalysisLayout.tsx`

```tsx
import AnalysisSidebarTabs, { AnalysisTab } from './AnalysisSidebarTabs';

// 🔍 DIAGNOSTIC LOGGING (remove after fix)
console.group('[DIAGNOSTIC] AnalysisLayout Imports');
console.log('AnalysisSidebarTabs:', AnalysisSidebarTabs);
console.log('Type:', typeof AnalysisSidebarTabs);
console.log('Is undefined?', AnalysisSidebarTabs === undefined);
console.log('Is function?', typeof AnalysisSidebarTabs === 'function');
console.groupEnd();

export default function AnalysisLayout({ ... }) {
  // 🔍 Runtime Guard
  if (!AnalysisSidebarTabs || typeof AnalysisSidebarTabs !== 'function') {
    console.error('❌ [DIAGNOSTIC] AnalysisSidebarTabs failed to load!');
    console.error('This is causing React Error #185');
    
    return (
      <div className="p-6 border border-red-500 bg-red-500/10 rounded">
        <p className="text-red-300 font-semibold">Component Load Error</p>
        <p className="text-xs text-red-200 mt-1">
          AnalysisSidebarTabs is undefined. Check console for details.
        </p>
      </div>
    );
  }
  
  // Normal render...
}
```

**Deploy & Test:**

```bash
git add src/components/analysis/AnalysisLayout.tsx
git commit -m "debug: Add diagnostic logging for AnalysisSidebarTabs (#185)"
git push origin main  # Auto-deploys to Vercel Preview

# Wait 2-3 min for build
# Navigate to Preview URL → /analysis_v2
# Open DevTools Console
# Read diagnostic output
```

**Expected Output (if AnalysisSidebarTabs is undefined):**

```
[DIAGNOSTIC] AnalysisLayout Imports
  AnalysisSidebarTabs: undefined
  Type: undefined
  Is undefined? true
  Is function? false
❌ [DIAGNOSTIC] AnalysisSidebarTabs failed to load!
```

---

### ✅ Schritt 2.3: Analyze Bundle (Optional, if diagnostic unclear)

**Ziel:** Inspiziere Production-Bundle, um fehlende Komponente zu finden

```bash
# Build production
pnpm run build

# Inspect generated chunks
ls -lh dist/assets/

# Find AnalysisPageV2 chunk
# Example: AnalysisPageV2-a1b2c3d4.js

# Search for AnalysisSidebarTabs in bundle
grep -r "AnalysisSidebarTabs" dist/assets/AnalysisPageV2-*.js

# If not found → Component missing from bundle
# If found as "void 0" or "undefined" → Import failed
```

**Vite Bundle Analyzer (optional):**

```bash
pnpm add -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ...
    visualizer({ open: true, gzipSize: true }),
  ],
});

pnpm run build
# Opens stats.html in browser → Find AnalysisPageV2 chunk
```

---

## Phase 3: Fix Implementation (1-3h)

### ✅ Schritt 3.1: Choose Fix Strategy

**Based on diagnostic results:**

#### Option A: Named Export Fix (Recommended)

**Problem:** Default export not resolving in production build

**Fix:**

```tsx
// src/components/analysis/AnalysisSidebarTabs.tsx
// CHANGE FROM:
export default function AnalysisSidebarTabs({ ... }) { ... }

// CHANGE TO:
export function AnalysisSidebarTabs({ ... }) { ... }
```

```tsx
// src/components/analysis/AnalysisLayout.tsx
// CHANGE FROM:
import AnalysisSidebarTabs, { AnalysisTab } from './AnalysisSidebarTabs';

// CHANGE TO:
import { AnalysisSidebarTabs, AnalysisTab } from './AnalysisSidebarTabs';
```

**Test locally:**
```bash
pnpm run build && pnpm run preview
# Navigate to /analysis_v2 → Should work
```

---

#### Option B: Lazy Import (If circular dependency)

**Problem:** Circular dependency causing undefined at module evaluation time

**Fix:**

```tsx
// src/pages/AnalysisPageV2.tsx
import React, { lazy, Suspense } from 'react';

const AnalysisLayout = lazy(() => 
  import('@/components/analysis/AnalysisLayout').then(m => ({ 
    default: m.default 
  }))
);

export default function AnalysisPageV2() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardShell>
        <AnalysisLayout {...props}>
          {/* content */}
        </AnalysisLayout>
      </DashboardShell>
    </Suspense>
  );
}
```

---

#### Option C: Remove Duplicate AnalysisLayout

**Problem:** Two AnalysisLayout components causing import confusion

**Fix:**

```bash
# Check which one is used
grep -r "from '@/components/analysis/AnalysisLayout'" src/
grep -r "from '@/features/analysis/AnalysisLayout'" src/

# If features/ version is unused:
git rm src/features/analysis/AnalysisLayout.tsx
git commit -m "fix: Remove duplicate AnalysisLayout (#185)"
```

---

### ✅ Schritt 3.2: Add Null Guards (Defense in Depth)

**Even after fixing imports, add guards to prevent future errors:**

```tsx
// src/components/analysis/AnalysisLayout.tsx
import { AnalysisSidebarTabs, AnalysisTab } from './AnalysisSidebarTabs';

export default function AnalysisLayout({ ... }) {
  // Runtime component validation
  if (process.env.NODE_ENV === 'production') {
    if (!AnalysisSidebarTabs) {
      console.error('[AnalysisLayout] AnalysisSidebarTabs is undefined');
      // Fallback UI instead of crash
      return <FallbackAnalysisLayout {...props} />;
    }
  }
  
  // Normal render
}
```

---

### ✅ Schritt 3.3: Test Fix

**Checklist:**

```bash
# 1. TypeScript check
pnpm run typecheck

# 2. Lint check
pnpm run lint

# 3. Unit tests (if exist)
pnpm test src/components/analysis/

# 4. Build production
pnpm run build

# 5. Preview locally
pnpm run preview

# 6. Manual test
# - Navigate to /analysis_v2
# - Check console for errors
# - Switch tabs (Overview, Flow, Playbook)
# - Verify AdvancedInsightCard loads

# 7. Test in Vercel Preview
git push origin fix/analysis-page-v2-error-185
# Wait for Preview deploy
# Test on real Preview URL
```

**Test Matrix:**

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Navigate to /analysis_v2 | Page loads, no console errors | ⬜ |
| Tab: Overview | AI insights visible | ⬜ |
| Tab: Flow | "Coming soon" message | ⬜ |
| Tab: Playbook | "Coming soon" message | ⬜ |
| URL param ?tab=flow | Correct tab active | ⬜ |
| AdvancedInsightCard | Renders with data | ⬜ |
| Mobile viewport | Responsive layout works | ⬜ |

---

## Phase 4: Deployment (1-2h)

### ✅ Schritt 4.1: Deploy to Preview (Staging)

```bash
# Create PR
git checkout -b fix/analysis-page-v2-error-185
git add -A
git commit -m "fix(analysis): Resolve React Error #185 - AnalysisSidebarTabs import

- Change AnalysisSidebarTabs to named export
- Update import in AnalysisLayout
- Add runtime guards to prevent future crashes
- Remove diagnostic logging

Fixes #185"

git push origin fix/analysis-page-v2-error-185

# Create PR via gh CLI or GitHub UI
gh pr create \
  --title "fix: Resolve React Error #185 in AnalysisPageV2" \
  --body "See INCIDENT_REPORT_REACT_ERROR_185_ANALYSISPAGEV2.md for details"
```

**Vercel Preview:**
- Auto-deploys on PR creation
- Test on Preview URL before merging

---

### ✅ Schritt 4.2: Peer Review (Fast-Track for P1)

**For P1 incidents, streamline review:**

```markdown
**Review Checklist (Fast-Track):**

- [ ] Does fix address root cause? (not just symptom)
- [ ] TypeScript/Lint checks pass?
- [ ] Manual testing on Preview successful?
- [ ] No new regressions introduced?
- [ ] Remove diagnostic code?

**Approval:** 1 reviewer sufficient for P1 hotfix
**Time Limit:** 30 minutes max
```

---

### ✅ Schritt 4.3: Deploy to Production

```bash
# Merge PR
gh pr merge --squash

# Production auto-deploys on merge to main
# Monitor deployment in Vercel Dashboard

# After deployment (2-3 min):
# 1. Test production URL: https://sparkfined-pwa.vercel.app/analysis_v2
# 2. Check browser console for errors
# 3. Verify all tabs work
```

**Rollback Plan (if deployment fails):**

```bash
# Revert merge commit
git revert HEAD
git push origin main

# Or use Vercel dashboard to promote previous deployment
```

---

### ✅ Schritt 4.4: Monitor Post-Deployment

**Monitoring Checklist (first 1-2 hours after deploy):**

- [ ] Check Vercel deployment logs for errors
- [ ] Monitor error rate (if Sentry/error tracking configured)
- [ ] Test /analysis_v2 route manually
- [ ] Check user reports/support tickets

**If new errors appear:**
→ Immediate rollback + re-investigate

**If stable:**
→ Mark incident as **Resolved** (but not Closed yet)

---

## Phase 5: Post-Incident Review (1-2 days later)

### ✅ Schritt 5.1: Incident Retrospective

**Schedule:** 24-48h after incident resolution

**Attendees:**
- Tech Lead
- Developer who implemented fix
- QA/Testing Lead
- (Optional) Product Owner

**Agenda (30-45 min):**

1. **Timeline Review** (5 min)
   - When was error introduced?
   - When was it detected?
   - When was it fixed?

2. **Root Cause Analysis** (10 min)
   - What was the technical root cause?
   - Why wasn't it caught earlier?

3. **What Went Well** (5 min)
   - Fast diagnosis?
   - Good communication?
   - Effective fix?

4. **What Could Be Better** (10 min)
   - Earlier detection?
   - Faster fix?
   - Better testing?

5. **Action Items** (10 min)
   - Assign preventive measures
   - Set deadlines

**Template:**

```markdown
## Incident Retrospective – React Error #185

**Date:** 2025-11-29
**Attendees:** [Names]

### Timeline
- **Introduced:** ~2025-11-20 (Commit 1ade0fe)
- **Detected:** 2025-11-27 (7 days exposure)
- **Fixed:** 2025-11-27 (same day)
- **Total Downtime:** ~7 days

### Root Cause
- Default export of AnalysisSidebarTabs not resolving in Vite production build
- Design token migration changed component, exposing latent import issue

### What Went Well ✅
- Fast diagnosis once reported (4h)
- Effective diagnostic logging strategy
- Clean fix with no regressions

### What Could Be Better ⚠️
- **Detection:** Error existed 7 days before discovery
- **Prevention:** No E2E tests for AnalysisPageV2
- **CI:** Production builds not tested for runtime errors

### Action Items
| Action | Owner | Deadline | Priority |
|--------|-------|----------|----------|
| Add E2E test for /analysis_v2 | Dev Team | 2025-12-01 | P0 |
| Add smoke tests to CI (all routes) | DevOps | 2025-12-05 | P0 |
| Audit all default exports | Dev Team | 2025-12-10 | P1 |
| Set up Storybook | Frontend | 2025-12-15 | P2 |
```

---

### ✅ Schritt 5.2: Implement Prevention Measures

**Priority Matrix:**

| Measure | Effort | Impact | Deadline |
|---------|--------|--------|----------|
| **E2E Test: AnalysisPageV2** | 2h | High | This week |
| **Smoke Tests in CI** | 4h | High | This sprint |
| **Standardize Exports** | 8h | Medium | This sprint |
| **Storybook Setup** | 16h | High | Next sprint |
| **ESLint Rules** | 2h | Medium | This sprint |

**Assign to sprint backlog** with deadlines.

---

### ✅ Schritt 5.3: Update Documentation

**Files to update:**

1. **Incident Report** (already done)
   - `/AGENT_FILES/INCIDENT_REPORT_REACT_ERROR_185_ANALYSISPAGEV2.md`
   - Add final resolution details

2. **Architecture Docs**
   - `.rulesync/02-frontend-arch.md`
   - Add section: "Component Export Conventions"

3. **Changelog**
   - `CHANGELOG.md` or release notes
   - Document fix in next version

4. **Runbook** (if exists)
   - Add "React Error #185" troubleshooting guide

**Example Changelog Entry:**

```markdown
## [0.9.1] - 2025-11-27

### Fixed
- **Critical:** Resolved React Error #185 in AnalysisPageV2 causing page crash
  - Changed AnalysisSidebarTabs to named export
  - Fixed import/export mismatch in production builds
  - Added runtime guards to prevent similar issues
  - See: INCIDENT_REPORT_REACT_ERROR_185_ANALYSISPAGEV2.md

### Added
- E2E test coverage for AnalysisPageV2
- Smoke tests for all routes in CI pipeline
```

---

## Best Practices Summary

### ✅ DO's

1. **Communicate Early & Often**
   - Status updates every 2-4h during active incident
   - Clear severity levels (P0/P1/P2)
   - Transparent timelines

2. **Fix, Then Optimize**
   - Hotfix first (even if not perfect)
   - Refactor later (separate PR)
   - Don't over-engineer during incident

3. **Add Tests Before Closing**
   - Reproduce bug in test
   - Verify fix with test
   - Prevent regression

4. **Document Everything**
   - Timeline
   - Root cause
   - Fix details
   - Prevention measures

5. **Learn From Incidents**
   - Blameless retrospectives
   - Focus on process, not people
   - Actionable improvements

---

### ❌ DON'Ts

1. **Don't Panic**
   - P1 ≠ End of world
   - Systematic approach beats rushed fixes

2. **Don't Skip Testing**
   - Even for "simple" fixes
   - Production is different from dev

3. **Don't Blame Individuals**
   - System failed, not person
   - Focus on prevention

4. **Don't Rush Post-Incident Review**
   - Wait 24-48h for clear heads
   - Don't skip retrospective

5. **Don't Forget Prevention**
   - Fix is not done until prevention is implemented
   - Add to sprint backlog immediately

---

## Tools & Resources

### Incident Management Tools

- **Communication:** Slack/Discord (dedicated #incidents channel)
- **Tracking:** Linear/Jira (Incident tickets)
- **Monitoring:** Vercel Dashboard, Sentry (when configured)
- **Rollback:** Vercel CLI + Dashboard

### Useful Commands

```bash
# Quick diagnostics
pnpm run build && pnpm run preview
grep -r "ComponentName" dist/

# Vercel
vercel --prod  # Deploy to production
vercel rollback [url]  # Rollback

# Git
git revert HEAD  # Revert last commit
git bisect start  # Find breaking commit

# Testing
pnpm test -- --watch  # Unit tests
pnpm run test:e2e  # E2E tests
```

### Checklists

**Pre-Deploy Checklist:**
```bash
pnpm run typecheck &&
pnpm run lint &&
pnpm test &&
pnpm run build &&
pnpm run preview
```

**Post-Deploy Checklist:**
- [ ] Test critical routes manually
- [ ] Check error logs
- [ ] Monitor for 30 minutes
- [ ] Update status page

---

## Incident Lifecycle Summary

```
Detection (0h)
    ↓
Triage & Communication (0-2h)
    ↓
[Optional] Rollback (if available)
    ↓
Investigation (2-4h)
    ├─ Reproduce locally
    ├─ Deploy diagnostics
    └─ Identify root cause
    ↓
Fix Implementation (1-3h)
    ├─ Write fix
    ├─ Test locally
    └─ Test on Preview
    ↓
Deployment (1-2h)
    ├─ PR review
    ├─ Merge to main
    └─ Monitor production
    ↓
Post-Incident Review (1-2 days later)
    ├─ Retrospective
    ├─ Prevention measures
    └─ Documentation
    ↓
Closed ✅
```

**Total Time for P1:** ~4-10 hours (detection to resolution)

---

## Contact & Escalation

**Incident Commander:** [Your Name]
**Tech Lead:** [Name]
**DevOps/On-Call:** [Name]

**Escalation:**
- P2 → P1: If user impact > expected or fix takes > 8h
- P1 → P0: If data loss, security breach, or full outage

---

**Revision History:**
- 2025-11-27: Initial workflow created for React Error #185 incident

