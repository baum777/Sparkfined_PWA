# Calm & Focus Implementation (Sparkfined Suite)

## Navigation (Suite / Multi-Module)
- **Home:** `/dashboard-v2` (Landing overview, calm background)
- **Analytics:** `/analysis-v2` (deep insight board), `/signals`
- **Assets:** `/watchlist-v2` (table-first), `/chart-v2` (focus chart)
- **Tools:** `/alerts-v2`, `/replay`, `/oracle`
- **Journal & Playbook:** `/journal-v2`, `/lessons` (playbook/learning surface)
- **Settings:** `/settings-v2`

## Calm/Focus Principles Applied
- **Global shell:** unified gradient background with soft radial accents, max width 7xl to keep reading width calm.
- **Primary vs. secondary actions:** home quick actions expose a single primary CTA (Open Watchlist) plus three light secondary actions that sit close to the hero area.
- **Navigation tone:** sidebar/bottom navigation uses low-contrast glass surfaces, grouped labels, and avoids badge noise.

## Page Focus (1–2 sentences each)
- **Home (Dashboard):** Tier-1 KPIs + insight grid stay above the fold with quick actions nearby; calm header gradient keeps the board consistent with other modules.
- **Analytics:** Chart/insight stack remains central, with tabs kept in the header track to avoid competing controls.
- **Assets / Watchlist:** Table remains the primary focus, with Chart/Replay routes nearby via navigation and quick actions.
- **Chart:** Single dominant chart card with lean controls; next actions stay adjacent (alerts, journal, replay).
- **Journal / Playbook:** Writing surface stays minimal; navigation groups keep learning and journaling under one calm section.

## Next-Best-Action (Butter-und-Belag)
- **Principle:** Each primary focus block carries 2–3 adjacent actions that extend the current intent without forcing navigation jumps.
- **Placement:** Actions live in the same card or immediate sidebar; only one primary button per cluster, the rest are quiet secondary/ghost buttons.

### Page → Primary Focus → Next Actions
- **Home:** KPI strip + hero grid → Open Watchlist (primary), Review Alerts, Start Session/Replay, Open Analyze.
- **Analytics:** Insight overview card → Open chart with context, Create alert from condition, Add note to journal.
- **Watchlist:** Table + detail drawer → Open chart (primary), Create/Update alert, Open replay, Add to journal/playbook tab.
- **Chart:** Central chart → Create alert at level (primary), Save view/timestamp to journal, Open replay at range.
- **Replay:** Timeline/controls → Save current moment to journal, Open in static chart, Find similar patterns (dashboard switch).
- **Journal:** Entry detail → Open chart at entry context, Open replay window, Generate playbook rule (stub until wired).
- **Settings:** Section cards → Preview theme/layout, Test notification, Export/backup settings.
