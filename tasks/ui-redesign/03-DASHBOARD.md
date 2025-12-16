# Dashboard Redesign — Command Surface

## Objective
Transform Dashboard into a fast "scan & act" command surface:
- KPI tiles, Bias hero, compact journal list, actionable alerts snapshot, holdings table, trade log CTA.

## New Layout
Desktop: 2 columns
- Left (65–70%): Bias, Journal, Alerts
- Right (30–35%): Quick Actions, Holdings, Trade Log

Mobile:
- Stack cards, allow collapsing less-important sections.

## Components to Use
- PageHeader + actions (Open Chart / New Alert / Run Journal)
- KpiTile grid (4–6 tiles)
- BiasHero Card (confidence + bullets + actions)
- RecentJournal ListRow (title, time, tags, quick action)
- AlertsSnapshot (Triggered top3 + Armed top3)
- HoldingsTable (top tokens + total)
- TradeLog (empty -> CTA; non-empty -> last 3 items)

## Acceptance Criteria
- Dashboard has max-width and consistent padding.
- Lists are compact (no huge empty rows).
- Alerts snapshot shows “Triggered” items (not only counts).
- Quick Actions are always visible (right column).
- “Log entry” button behavior:
  - if feature exists: show disabled state + tooltip until buy event / wallet connected.

## Tests
- Add snapshot-ish tests for:
  - KPI tiles render
  - Alerts snapshot renders triggered/armed sections
  - Empty trade log shows CTA
