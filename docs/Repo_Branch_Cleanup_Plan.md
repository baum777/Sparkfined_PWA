# 🏗️ Sparkfined PWA — Repository Branch Cleanup & Integration Strategy

**Datum:** 2025-11-23
**Erstellt von:** Claude (Repo Branch Strategist & Cleanup Architect)
**Ziel-Branch für Entwicklung:** `claude/plan-repo-strategy-013zrjS1YJ8RDoo8KmJ1foEB`
**Status:** 🔄 Phase 1 — Analyse abgeschlossen

---

## 📊 Executive Summary

**Gesamt-Branches erfasst:** 65+ remote branches
**Kritische Findings:**

1. ❌ **`hardening/F-02-analyze`**: 0 ahead, 202 behind → **ZOMBIE-BRANCH** (bereits gemerged in PR #86, bereit für Löschung!)
2. ⚠️ **`codex/implement-grok-pulse-engine-and-read-api`**: 33 commits ahead, 1 behind → Wichtige Feature-Arbeit
3. ✅ **`codex/implement-grok-pulse-api-integration`**: 16 commits ahead, 0 behind → Clean integration candidate
4. 🔄 **Viele `claude/*` review branches**: Meistens merged, können archiviert werden
5. 📦 **Viele `cursor/*` branches**: Teilweise veraltet, Audit erforderlich

**Empfehlung:** Stufenweises Cleanup mit Safety-First-Ansatz.

---

## 🎯 Branch-Klassifikations-Tabelle

### Priorität 1: CRITICAL — Sofortige Aufmerksamkeit erforderlich

| Branch | Ahead/Behind | Letzter Commit | Inhalt/Zweck | Empfehlung | Risk |
|--------|--------------|----------------|--------------|------------|------|
| **codex/implement-grok-pulse-engine-and-read-api** | **33 / 1** | 2025-11-21 | Grok Pulse Engine + State Endpoints | Rebase auf main, dann PR | 🟡 MEDIUM |
| **codex/implement-grok-pulse-api-integration** | **16 / 0** | 2025-11-21 | Enhanced Grok Pulse Context/Sentiment APIs | Direkter PR → main | 🟢 LOW |

### Priorität 2: MEDIUM — Integration vorbereiten

| Branch | Ahead/Behind | Letzter Commit | Inhalt/Zweck | Empfehlung | Risk |
|--------|--------------|----------------|--------------|------------|------|
| codex/fix-typescript-and-lint-issues-in-phase-2 | 2 / 2 | 2025-11-23 | TS/Lint Phase 2 Fixes | Rebase, cherry-pick relevante commits | 🟡 MEDIUM |
| codex/integrate-real-adapters-and-context-builder | 22 / 1 | 2025-11-21 | Live Grok Pulse Adapters | Rebase, PR | 🟡 MEDIUM |
| codex/implement-dexscreener-and-birdeye-adapters | 27 / 1 | 2025-11-21 | Token Source Adapters | Rebase, PR | 🟡 MEDIUM |
| claude/assess-repo-status-01PStgL5EuYLwygHqgVVJt2u | 0 / 4 | 2025-11-23 | Repo Status Assessment | **ARCHIVE:** Behind main, vermutlich merged | 🟢 LOW |

### Priorität 3: LOW — Archive / Cleanup

| Branch-Pattern | Anzahl | Status | Empfehlung |
|----------------|--------|--------|------------|
| **hardening/F-02-analyze** | 1 | ❌ ZOMBIE (0 ahead, 202 behind, gemerged in PR #86) | **DELETE:** Siehe Branch_Analysis_hardening_F-02.md |
| `claude/review-*` | ~10 | Meistens merged | Safety-Archive, dann löschen |
| `claude/refactor-*` | ~3 | Meistens merged | Safety-Archive, dann löschen |
| `cursor/*` (alte) | ~15 | Teilweise veraltet | Audit: Wertvolle commits identifizieren, Rest archivieren |
| `revert-168-*` | 1 | Revert-Branch | Nach Klärung löschen |

---

## 🛡️ Safety-Invarianten (NIEMALS VERLETZEN!)

### Core-Regeln für Codex

```bash
# ✅ IMMER VOR JEDER OPERATION:

# 1. Working Directory Status prüfen
git status

# 2. Uncommitted Changes? → Stash oder Commit!
git stash push -m "safety-$(date +%Y%m%d-%H%M%S)"

# 3. Safety-Branch vom aktuellen Stand erstellen
SAFETY_NAME="safety/$(date +%Y%m%d)-<beschreibung>"
git branch $SAFETY_NAME
git push origin $SAFETY_NAME  # Wenn möglich

# 4. NIEMALS ohne Safety-Branch löschen!
# 5. NIEMALS `git push --force` auf main/master
# 6. NIEMALS Branches mit uncommitted work switchen
```

### Pre-Flight-Checklist (Vor jedem Cleanup-Schritt)

```bash
# ☑️ Checklist:
[ ] git status → clean
[ ] Safety-Branch erstellt & gepusht
[ ] Ziel-Branch existiert & ist erreichbar
[ ] Ahead/Behind-Counts bekannt
[ ] Playbook-Schritte verstanden
```

---

## 📋 Per-Branch-Playbooks für Codex

### ❌ ZOMBIE-BRANCH DELETE: `hardening/F-02-analyze`

**Status:** ✅ Analyse abgeschlossen (siehe `docs/Branch_Analysis_hardening_F-02.md`)

**Finding:** 0 commits ahead, 202 behind — Bereits gemerged in PR #86, sicher zu löschen!

#### DELETE-Playbook (Codex)

```bash
# 1. Safety-Check: Verifiziere 0 ahead
git fetch origin
git rev-list --left-right --count origin/main...origin/hardening/F-02-analyze
# Erwartung: "202 0" (main ist 202 ahead, hardening 0 ahead)

# 2. Lokale Branch löschen (falls vorhanden)
git branch -D hardening/F-02-analyze 2>/dev/null || echo "Branch nicht lokal vorhanden"

# 3. Remote-Branch löschen
git push origin --delete hardening/F-02-analyze

# 4. Verifikation
echo "✅ hardening/F-02-analyze gelöscht"
git branch -r | grep hardening/F-02-analyze || echo "✅ Branch erfolgreich entfernt"
```

**Risk:** 🟢 NONE — Alle commits in main via PR #86

---

### 🟡 MEDIUM: `codex/implement-grok-pulse-engine-and-read-api` (33 commits)

**Ziel:** Grok Pulse Engine & State Endpoints in main integrieren.

#### Playbook (Codex)

```bash
# 1. Safety
git status
git stash push -m "safety-before-grok-pulse-engine"
git branch safety/2025-11-23-grok-pulse-engine
git push origin safety/2025-11-23-grok-pulse-engine

# 2. Main aktualisieren
git switch main
git pull origin main

# 3. Integrations-Branch
git switch -c integrate/grok-pulse-engine-2025-11-23

# 4. Rebase Grok-Pulse-Branch auf main
git fetch origin
git rebase origin/main origin/codex/implement-grok-pulse-engine-and-read-api

# 5. Konflikte auflösen (falls vorhanden)
# → Codex: Bei Konflikten: git status, Konflikte manuell lösen, dann `git rebase --continue`

# 6. Tests & Linting
pnpm install
pnpm run typecheck
pnpm run lint
pnpm test

# 7. Push & PR
git push origin integrate/grok-pulse-engine-2025-11-23

# 8. PR anlegen (gh CLI oder manuell)
gh pr create --title "feat(grok): Integrate Pulse Engine & State Endpoints (33 commits)" \
  --body "$(cat <<'EOF'
## Summary
- Integrates Grok Pulse Engine core functionality
- Adds state endpoints for pulse data retrieval
- 33 commits from codex/implement-grok-pulse-engine-and-read-api

## Changes
- See commit history for detailed changes

## Test Plan
- [x] typecheck passes
- [x] lint passes
- [x] tests pass
- [ ] Manual testing: Grok Pulse APIs functional

## Origin Branch
- codex/implement-grok-pulse-engine-and-read-api (33 ahead, 1 behind main)
EOF
)"

# 9. Nach erfolgreicher PR-Merge: Branch cleanup
# git push origin --delete codex/implement-grok-pulse-engine-and-read-api
# git branch -d integrate/grok-pulse-engine-2025-11-23
```

---

### 🟢 LOW-RISK: `codex/implement-grok-pulse-api-integration` (16 commits, 0 behind)

**Ziel:** Schnelle Integration, da up-to-date.

#### Playbook (Codex)

```bash
# 1. Safety
git status
git stash push -m "safety-before-grok-api-integration"
git branch safety/2025-11-23-grok-api
git push origin safety/2025-11-23-grok-api

# 2. Main aktualisieren
git switch main
git pull origin main

# 3. Fast-Forward oder Rebase (da 0 behind)
git switch -c integrate/grok-api-integration-2025-11-23
git merge --no-ff origin/codex/implement-grok-pulse-api-integration

# 4. Tests
pnpm install
pnpm run typecheck
pnpm run lint
pnpm test

# 5. Push & PR
git push origin integrate/grok-api-integration-2025-11-23

gh pr create --title "feat(grok): Enhanced Pulse Context & Sentiment APIs" \
  --body "16 commits from codex/implement-grok-pulse-api-integration (up-to-date with main)"

# 6. Nach Merge: Cleanup
```

---

### 🗄️ ARCHIVE: `claude/review-*` Branches (~10 Branches)

**Ziel:** Archivieren von bereits gemergten Review-Branches.

#### Playbook (Codex — Batch-Operation)

```bash
# 1. Safety-Snapshot
git status
git branch safety/2025-11-23-before-claude-review-cleanup
git push origin safety/2025-11-23-before-claude-review-cleanup

# 2. Liste aller claude/review-* branches
git branch -r | grep "origin/claude/review-" > /tmp/claude-review-branches.txt

# 3. Für jeden Branch: Prüfen ob merged
for branch in $(cat /tmp/claude-review-branches.txt); do
  branch_name=${branch#origin/}
  echo "Checking: $branch_name"

  # Ist der Branch komplett in main enthalten?
  ahead_behind=$(git rev-list --left-right --count origin/main...$branch)
  echo "  Ahead/Behind: $ahead_behind"

  # Wenn 0 ahead → komplett merged → kann gelöscht werden
  ahead=$(echo $ahead_behind | cut -d' ' -f2)
  if [ "$ahead" -eq 0 ]; then
    echo "  → SAFE TO DELETE (0 ahead)"
    # Optional: Sofort löschen (nach manueller Bestätigung)
    # git push origin --delete $branch_name
  else
    echo "  → KEEP (has unique commits)"
  fi
done
```

**→ Hand-off an Claude:** Codex liefert Liste der safe-to-delete Branches, Claude bestätigt Löschung.

---

## 📈 Cleanup-Phasen-Plan

### Phase 1: 🔍 Discovery & Analysis (AKTUELL — ✅ Abgeschlossen)

- ✅ Alle remote branches erfasst
- ✅ Ahead/Behind-Counts für Top-Branches ermittelt
- ✅ Kritische Branches identifiziert (`hardening/F-02-analyze`, Grok Pulse branches)
- ✅ Safety-Strategie definiert
- ✅ Per-Branch-Playbooks erstellt

### Phase 2: 🚨 Critical Integration (NEXT — ⏳ Bereit)

**Priorität:**
1. **`hardening/F-02-analyze` Analyse** (Codex führt Schritt 1 aus, Claude entscheidet)
2. **`codex/implement-grok-pulse-api-integration`** (16 commits, low-risk PR)
3. **`codex/implement-grok-pulse-engine-and-read-api`** (33 commits, rebase + PR)

**Geschätzte Zeit:** 2-4 Stunden (inkl. Testing)

### Phase 3: 🔄 Medium Integration (DANN)

- `codex/integrate-real-adapters-and-context-builder`
- `codex/implement-dexscreener-and-birdeye-adapters`
- `codex/fix-typescript-and-lint-issues-in-phase-2`

**Geschätzte Zeit:** 1-2 Stunden

### Phase 4: 🗑️ Archive & Cleanup (DANACH)

- `claude/review-*` branches (batch delete)
- `cursor/*` alte branches (selektiv)
- `claude/refactor-*` merged branches

**Geschätzte Zeit:** 30 Minuten

---

## ✅ Hand-off-Checkliste für Codex

### Immediate Next Steps (Phase 2 Start)

#### Task 1: ~~`hardening/F-02-analyze` Analyse~~ ✅ ABGESCHLOSSEN

**Status:** ✅ Analyse komplett — Branch ist ZOMBIE, bereit für Löschung
**Dokumentation:** `docs/Branch_Analysis_hardening_F-02.md`
**Nächster Schritt:** Optional: Branch löschen (siehe DELETE-Playbook oben)

#### Task 2: `codex/implement-grok-pulse-api-integration` PR (EMPFOHLEN als nächstes)

```bash
[ ] Safety-Branch: safety/2025-11-23-grok-api
[ ] Integrations-Branch: integrate/grok-api-integration-2025-11-23
[ ] Merge origin/codex/implement-grok-pulse-api-integration
[ ] Tests: typecheck + lint + test
[ ] Push & PR anlegen
[ ] Nach Merge: Branch cleanup
```

#### Task 3: `codex/implement-grok-pulse-engine-and-read-api` PR

```bash
[ ] Safety-Branch: safety/2025-11-23-grok-pulse-engine
[ ] Integrations-Branch: integrate/grok-pulse-engine-2025-11-23
[ ] Rebase auf main
[ ] Konflikte auflösen (falls vorhanden)
[ ] Tests: typecheck + lint + test
[ ] Push & PR anlegen
[ ] Nach Merge: Branch cleanup
```

---

## 🔄 Status-Tracking

| Phase | Status | Start | Ende | Verantwortlich |
|-------|--------|-------|------|----------------|
| Phase 1: Discovery | ✅ Completed | 2025-11-23 | 2025-11-23 | Claude |
| Phase 2: Critical Integration | ⏳ Ready | — | — | Codex (mit Claude Review) |
| Phase 3: Medium Integration | 🔜 Pending | — | — | Codex |
| Phase 4: Archive & Cleanup | 🔜 Pending | — | — | Codex |

---

## 📝 Changelog

### 2025-11-23 — Initial Creation
- **Claude:** Repository-Analyse durchgeführt
- **Claude:** 65+ branches erfasst, Top 5 priorisiert
- **Claude:** Safety-Invarianten definiert
- **Claude:** Per-Branch-Playbooks erstellt
- **Status:** Ready for Codex hand-off (Phase 2)

### 2025-11-23 — Update nach hardening/F-02-analyze Deep-Dive
- **Claude:** hardening/F-02-analyze detailliert analysiert
- **Finding:** ❌ ZOMBIE-BRANCH (0 ahead, 202 behind, bereits gemerged in PR #86)
- **Action:** Branch aus Priority 1 → Priority 3 (DELETE) verschoben
- **Dokumentation:** Branch_Analysis_hardening_F-02.md erstellt
- **Status:** Bereit für Phase 2 (Grok Pulse Integration)

---

## 🔗 Referenzen

- **Git-Branch-Status:** Siehe git for-each-ref output oben
- **Current Working Branch:** `claude/plan-repo-strategy-013zrjS1YJ8RDoo8KmJ1foEB`
- **Main Branch:** `origin/main` (HEAD: f5b07ca)
- **Safety-Branches:** Alle safety/* branches im Repo
- **Detaillierte Branch-Analysen:** docs/Branch_Analysis_*.md

---

**Nächster Schritt:** Grok Pulse Integration (codex/implement-grok-pulse-api-integration PR)
