# 🧟 Batch-Zombie-Scan Report — Sparkfined PWA

**Scan-Datum:** 2025-11-23
**Analyst:** Claude (Repo Branch Strategist)
**Methode:** Automated ahead/behind analysis via git rev-list

---

## 📊 Executive Summary

**Total Branches Scanned:** 58 (codex/* + claude/* + cursor/*)

### Breakdown by Status:

| Status | Count | % | Beschreibung |
|--------|-------|---|--------------|
| 🧟 **ZOMBIE** | **28** | **48%** | 0 ahead → Bereits gemerged, sicher zu löschen |
| ✅ **ACTIVE** | **12** | **21%** | >0 ahead, ≤50 behind → Aktive Arbeit, integrierbar |
| ⚠️ **FAR_BEHIND** | **18** | **31%** | >0 ahead, >50 behind → Alte Arbeit, needs rebase |

**CRITICAL FINDING:** Fast die Hälfte aller Branches (48%) sind ZOMBIES! 🚨

---

## 🧟 ZOMBIE BRANCHES (28 total) — SAFE TO DELETE

### Claude Zombies (10)

| Branch | Behind | PR/Status |
|--------|--------|-----------|
| claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f | 3 | Merged PR #164 |
| claude/eslint-cleanup-0128Z1pU2YiCuEEK6BJ8WtjE | 36 | Merged PR #146 |
| claude/refactor-root-readme-01MjYFvbqzv8KiuiGMmpi52q | 81 | Merged PR #126 |
| claude/remove-nft-functionality-01B3ptcRnj6gvSWcrnkGZiAi | 79 | Merged PR #128 |
| claude/review-legacy-components-01USZDBAKbCLmeG1Y7shdjPx | 46 | Merged PR #141 |
| claude/review-phase-2-release-01Q21ExSsrSfApc9ZxT4LYQh | 1 | Merged PR #168 |
| claude/review-todo-fixme-hygiene-01Ngr3wzwnKThZEbk6wsAdLA | 40 | Merged PR #144 |
| claude/review-todo-fixme-hygiene-01RwkrKeDKn9t8S1r1p88kyM | 45 | Merged PR #142 |
| claude/ui-review-errors-01QZfyon9oJhEWUHaN3HcH6U | 14 | Merged PR #159 |
| claude/zombie-code-sweep-01Ctsx13oxtxfbPyEGbRn4eT | 32 | Merged PR #149 |

### Codex Zombies (7)

| Branch | Behind | PR/Status |
|--------|--------|-----------|
| codex/implement-api-runtime-fixes-for-node/edge | 4 | Merged PR #163 |
| codex/implement-dexscreener-and-birdeye-adapters | 24 | Merged PR #153 |
| codex/implement-grok-pulse-api-integration | 16 | Merged PR #158 ✅ VERIFIED |
| codex/implement-heavy-ci-steps-for-phase-3 | 7 | Merged PR #162 |
| codex/integrate-real-adapters-and-context-builder | 20 | Merged PR #155 |
| codex/perform-final-zombie-code-sweep | 34 | Merged PR #147 |
| codex/perform-todo/fixme-hygiene-cleanup | 42 | Merged PR #143 |

### Cursor Zombies (11)

| Branch | Behind | PR/Status |
|--------|--------|-----------|
| cursor/apply-sparkfined-ci-fix-patch-6e6c | 98 | Old merged work |
| cursor/audit-and-iterate-production-readiness-f061 | 212 | Old merged work |
| cursor/configure-moralis-api-key-env-handling-17be | 149 | Merged PR #106 |
| cursor/describe-sparkfined-in-english-1cd1 | 213 | Old documentation |
| cursor/design-grok-event-integration-for-sparkfined-d279 | 98 | Old merged work |
| cursor/fetch-market-prices-for-watchlist-v2-9950 | 103 | Merged PR #117 |
| cursor/fix-ci-errors-and-workflow-issues-0f5a | 188 | Old CI fixes |
| cursor/fix-type-errors-and-linter-issues-7086 | 212 | Merged PR #87 |
| cursor/generate-markdown-mindmap-structure-bb20 | 190 | Old docs |
| cursor/implement-sparkfined-ta-pwa-beta-v0-1-features-8f74 | 188 | Old features |
| cursor/set-up-multi-tool-prompt-system-964c | 205 | Merged PR #88 |

---

## ✅ ACTIVE BRANCHES (12 total) — INTEGRATE OR KEEP

### High Priority (0 behind, ready to integrate)

| Branch | Ahead | Behind | Empfehlung |
|--------|-------|--------|------------|
| claude/assess-repo-status-01PStgL5EuYLwygHqgVVJt2u | 4 | 0 | ✅ Direct PR |
| claude/plan-repo-strategy-013zrjS1YJ8RDoo8KmJ1foEB | 4 | 0 | **CURRENT WORK** ✅ |

### Medium Priority (low behind, needs rebase)

| Branch | Ahead | Behind | Empfehlung |
|--------|-------|--------|------------|
| claude/check-repo-error-functions-016oNYVytLzEGSLVDuKxvDmk | 1 | 2 | Rebase + PR |
| claude/review-ci-vercel-deploy-01CUmNoTyrjZRqoZFt62jsjK | 3 | 2 | Rebase + PR |
| codex/fix-typescript,-lint,-and-test-errors | 2 | 2 | Rebase + PR |
| codex/fix-typescript-and-lint-issues-in-phase-2 | 2 | 2 | Rebase + PR |

### Low Priority (high behind, needs major rebase)

| Branch | Ahead | Behind | Empfehlung |
|--------|-------|--------|------------|
| claude/claude-md-mi9g0ybxd5p6gk2b-01CWPYeXUVRBGAMsuQ86AZuY | 1 | 13 | Cherry-pick valuable commit |
| claude/section-7-final-validation-01S19SzAKmVNJYSkNDGhU6ap | 1 | 21 | Cherry-pick or rebase |
| claude/ui-review-errors-01Ab5PR6yggXaVwUSws1Evbn | 1 | 17 | Cherry-pick or rebase |
| codex/implement-grok-pulse-engine-and-read-api | 1 | 33 | ⚠️ Nur 1 unique commit, prüfen ob wichtig |
| codex/migrate-design-tokens-and-fix-ui-issues | 2 | 13 | Rebase + PR |
| codex/stabilize-ci-and-fix-typescript-issues | 1 | 13 | Cherry-pick or rebase |

---

## ⚠️ FAR BEHIND BRANCHES (18 total) — NEEDS DECISION

Diese Branches haben unique work (>0 ahead), sind aber sehr weit behind (>50). Entscheidung erforderlich: Wertvolle commits cherry-picken oder Branch als veraltet archivieren.

### Claude Far Behind (6)

| Branch | Ahead | Behind | Empfehlung |
|--------|-------|--------|------------|
| claude/high-detail-ui-wireframes-014dhZFNbUQCh2ab1pj3mC82 | 1 | 176 | Prüfe ob Wireframes noch relevant |
| claude/refactor-markdown-docs-017pyG13QMe3dukttVj7ZRP8 | 1 | 84 | Prüfe doc-changes |
| claude/review-archive-planning-01PfqzZn7sMmnmLfS7rCfLTm | 1 | 57 | Prüfe planning-docs |
| claude/rituals-mvp-components-011CUz2MrdbFxBfiSFtBza3x | 3 | 238 | Prüfe MVP components |
| claude/search-optimize-ui-01Jb2Vt4qC1sJFaPkB9RCCYQ | 2 | 91 | Prüfe UI optimizations |
| claude/testing-mhy0ba9p8xe53aof-01Y9UCcrErgWQV6CTwg5LeKT | 3 | 190 | Prüfe test improvements |

### Cursor Far Behind (12)

| Branch | Ahead | Behind | Empfehlung |
|--------|-------|--------|------------|
| cursor/configure-vite-ui-claude-agent-rule-5587 | 1 | 190 | Prüfe agent-rules |
| cursor/create-page-functions-and-events-table-6cb2 | 1 | 175 | Prüfe docs |
| cursor/create-sparkfined-ta-pwa-mindmap-8bc0 | 2 | 190 | Prüfe mindmap |
| cursor/debug-vercel-build-and-ci-pipeline-03e8 | 6 | 183 | Prüfe CI-fixes |
| cursor/define-ui-ux-for-vite-react-app-49c4 | 5 | 188 | Prüfe UI-definitions |
| cursor/describe-and-assess-sarkfined-features-8f62 | 1 | 213 | Prüfe feature-docs |
| cursor/fix-ci-errors-and-workflow-issues-7a38 | 2 | 188 | Prüfe CI-fixes |
| cursor/fix-static-asset-sso-blocking-9fe5 | 1 | 213 | Prüfe asset-fixes |
| cursor/implement-sparkfined-ta-pwa-beta-v0-1-features-6e42 | 1 | 188 | Prüfe beta-features |
| cursor/list-ta-methods-by-context-group-fb8b | 1 | 183 | Prüfe TA-docs |
| cursor/refactor-vite-ui-agent-rules-for-unified-system-5ef7 | 5 | 190 | Prüfe agent-refactor |
| cursor/repository-analysis-and-soft-production-planning-fa9f | 4 | 213 | Prüfe analysis-docs |

---

## 🎯 Empfohlene Cleanup-Strategie

### Phase 1: ZOMBIE-DELETE (Immediate — 28 Branches)

**Zeitaufwand:** 5-10 Minuten via GitHub UI

**Aktion:**
1. Gehe zu: https://github.com/baum777/Sparkfined_PWA/branches
2. Suche jeweils nach Branch-Namen (siehe Liste oben)
3. Klicke auf 🗑️ Delete-Button
4. Wiederhole für alle 28 ZOMBIES

**Alternative:** GitHub CLI Batch-Delete:
```bash
# Alle claude/* ZOMBIES
gh api repos/baum777/Sparkfined_PWA/git/refs/heads/claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f -X DELETE
# ... (repeat for all 28)
```

**Risk:** 🟢 NONE — Alle commits bereits in main

---

### Phase 2: ACTIVE-INTEGRATE (12 Branches)

**Priorität:**
1. **0 behind Branches** (2): Direct PR
2. **Low behind** (4): Rebase + PR
3. **High behind** (6): Cherry-pick valuable commits

**Geschätzte Zeit:** 2-4 Stunden

---

### Phase 3: FAR-BEHIND-REVIEW (18 Branches)

**Aktion:** Manuelle Review jedes Branches:
- Sind die unique commits wertvoll?
- Ja → Cherry-pick in neuen Branch
- Nein → Branch löschen

**Geschätzte Zeit:** 3-5 Stunden

---

## 📋 ZOMBIE DELETE-LISTE (Copy-Paste Ready)

### Für GitHub UI:

```
claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f
claude/eslint-cleanup-0128Z1pU2YiCuEEK6BJ8WtjE
claude/refactor-root-readme-01MjYFvbqzv8KiuiGMmpi52q
claude/remove-nft-functionality-01B3ptcRnj6gvSWcrnkGZiAi
claude/review-legacy-components-01USZDBAKbCLmeG1Y7shdjPx
claude/review-phase-2-release-01Q21ExSsrSfApc9ZxT4LYQh
claude/review-todo-fixme-hygiene-01Ngr3wzwnKThZEbk6wsAdLA
claude/review-todo-fixme-hygiene-01RwkrKeDKn9t8S1r1p88kyM
claude/ui-review-errors-01QZfyon9oJhEWUHaN3HcH6U
claude/zombie-code-sweep-01Ctsx13oxtxfbPyEGbRn4eT
codex/implement-api-runtime-fixes-for-node/edge
codex/implement-dexscreener-and-birdeye-adapters
codex/implement-grok-pulse-api-integration
codex/implement-heavy-ci-steps-for-phase-3
codex/integrate-real-adapters-and-context-builder
codex/perform-final-zombie-code-sweep
codex/perform-todo/fixme-hygiene-cleanup
cursor/apply-sparkfined-ci-fix-patch-6e6c
cursor/audit-and-iterate-production-readiness-f061
cursor/configure-moralis-api-key-env-handling-17be
cursor/describe-sparkfined-in-english-1cd1
cursor/design-grok-event-integration-for-sparkfined-d279
cursor/fetch-market-prices-for-watchlist-v2-9950
cursor/fix-ci-errors-and-workflow-issues-0f5a
cursor/fix-type-errors-and-linter-issues-7086
cursor/generate-markdown-mindmap-structure-bb20
cursor/implement-sparkfined-ta-pwa-beta-v0-1-features-8f74
cursor/set-up-multi-tool-prompt-system-964c
```

---

## 📊 Statistiken nach Tool

| Tool | Total | ZOMBIES | ACTIVE | FAR_BEHIND | Zombie-Rate |
|------|-------|---------|--------|------------|-------------|
| **claude/** | 23 | 10 | 7 | 6 | 43% |
| **codex/** | 12 | 7 | 5 | 0 | 58% |
| **cursor/** | 23 | 11 | 0 | 12 | 48% |
| **TOTAL** | 58 | 28 | 12 | 18 | **48%** |

**Insight:** Codex hat die höchste Zombie-Rate (58%), Cursor die meisten FAR_BEHIND Branches.

---

## 🔗 Referenzen

- **Cleanup-Plan:** `docs/Repo_Branch_Cleanup_Plan.md`
- **Cleanup-Status:** `docs/Branch_Cleanup_Status.md`
- **Raw Scan Data:** `/tmp/zombie-results.txt` (local)
- **Current Strategy Branch:** `claude/plan-repo-strategy-013zrjS1YJ8RDoo8KmJ1foEB`

---

**Scan completed:** 2025-11-23
**Next Action:** Phase 1 — DELETE 28 ZOMBIES via GitHub UI
