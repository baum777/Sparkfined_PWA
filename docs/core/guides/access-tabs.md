---
title: "Access Page Tab-Guide"
summary: "Umsetzung und Tests der überarbeiteten Access-Tab-Navigation."
sources:
  - docs/archive/raw/2025-11-12/ACCESS_PAGE_TAB_IMPROVEMENTS.md
  - src/pages/AccessPage.tsx
  - src/components/access/AccessStatusCard.tsx
  - src/components/access/LockCalculator.tsx
  - src/components/access/HoldCheck.tsx
  - src/components/access/LeaderboardList.tsx
  - src/styles/index.css
---

<!-- merged_from: docs/archive/raw/2025-11-12/ACCESS_PAGE_TAB_IMPROVEMENTS.md -->

## Änderungen im Überblick
- Mobile-optimierte Tabs (`scrollbar-hide`, smooth scrolling) mit `aria-current` für aktives Label.
- `onNavigate` Callback verbindet Status-, Lock-, Hold- und Leaderboard-Tab per Buttons.
- Konsistente Loading-Spinner inkl. Textfeedback in allen Tabs.
- UI-Polish: Emoji-Header, Padding, Fade-in Animationen, Hover-Feedback.

## Implementierungsschritte
1. **Navigation:** `navigateToTab(id)` in `AccessPage` steuert Scroll & Fokus.
2. **Props:** Tab-Komponenten erhalten `onNavigate` und nutzen zentrale Button-Stile.
3. **Styles:** `.scrollbar-hide` Utility in `src/styles/index.css` blendet Scrollbars aus.
4. **Accessibility:** Aktiver Tab setzt `aria-current="page"`; Buttons mit sprechenden Labels.

## Test-Checkliste
- Mobile (≤640px): Tabs horizontal scrollbar, Buttons erreichbar, Footer nicht überdeckt.
- Cross-Navigation: Jeder CTA aktiviert richtigen Tab und scrollt in View.
- Loading-State: Spinner + Text erscheinen bei jedem async Call.

