---
title: "Onboarding Blueprint"
summary: "Verdichtete Strategie, Implementierung und Nutzungshinweise für das Onboarding-System."
sources:
  - docs/archive/raw/2025-11-12/ONBOARDING_STRATEGY.md
  - docs/archive/raw/2025-11-12/ONBOARDING_IMPLEMENTATION_COMPLETE.md
  - docs/archive/raw/2025-11-12/ONBOARDING_QUICK_START.md
  - src/pages/BoardPage.tsx
  - src/components/onboarding/index.ts
  - src/store/onboardingStore.ts
---

<!-- merged_from: docs/archive/raw/2025-11-12/ONBOARDING_STRATEGY.md; docs/archive/raw/2025-11-12/ONBOARDING_IMPLEMENTATION_COMPLETE.md; docs/archive/raw/2025-11-12/ONBOARDING_QUICK_START.md -->

## Zielgruppen & Prinzipien
- **Personas:** Beginner, Active Trader, Power User, Mobile User – steuern Tiefe der Einführung.
- **Leitsätze:** Progressive Disclosure, Learning by Doing, kontextuelle Hilfe, personalisierte Tours, jederzeit überspringbar.

## Kernmodule
| Modul | Zweck | Trigger |
| --- | --- | --- |
| Welcome Modal | Persona-Auswahl, Einstieg in Tour | `firstVisit` Flag auf BoardPage. |
| Driver.js Tour | Spotlight-Guides für Kernzonen (Board, Analyze, Journal) | Persona wählt Guided Flow. |
| Hint Banners | Kontextuelle Tipps (z. B. AI Analyse) | `useOnboardingStore().isHintDismissed` prüft Flags. |
| First-Time Actions | Success Toasts & Checklist-Progress | `useFirstTimeActions().trackAction`. |
| Checkliste & Keyboard Overlay | Fortschritt + Shortcuts | Sticky Panel auf BoardPage, `?` Shortcut. |

## Implementierungsnotizen
- Zustand via `zustand` Store (`onboardingStore`) mit Persistenz in `localStorage`.
- Hints & Aktionen nutzen string IDs (`hint:analyze-ai`, `chart-created`) für Wiederverwendung.
- Komponenten unter `src/components/onboarding` kapseln Modal, Checklist, HintBanner, KeyboardShortcuts.
- Der Onboarding-Wizard wird im `AppShell` als `OnboardingOverlay` gerendert (glass-heavy + Scrim, `data-testid="onboarding-overlay"`), sodass Dashboard-Interaktionen blockiert bleiben, bis Abschluss/Skip.
- Quick Start Snippets zeigen Integration (HintBanner, First-Time Action Tracker, TooltipIcon, Feature Discovery).

## Rollout-Plan
1. **Phase 1 – Welcome & Persona:** Modal + Auswahl, speichert Präferenz, startet passende Tour (7/3/1 Schritte).
2. **Phase 2 – Guided Tour:** Driver.js Sequenzen für Board (KPIs, Feed, Actions), optional Analyze/Journal tiefer.
3. **Phase 3 – Progressive Hints:** Verzögerte Banners (z. B. AI, Alerts) mit CTA, dismissbar.
4. **Phase 4 – Checklist & Shortcuts:** Gamified Fortschritt, `Shift+/` Overlay, modulare Erweiterung für neue Features.
5. **Phase 5 – Re-Engagement:** Reminder via Notifications & Feed, wenn Checkliste offen bleibt (konzipiert, Umsetzung offen).

## Erfolgsmessung
- Ziele: Time-to-First-Value <2 min, 80 % Feature-Discovery nach 7 Tagen, D7-Retention ≥70 %.
- Trackbar über Telemetrie-Events (`onboarding.completedStep`, `firstAction.done`).

