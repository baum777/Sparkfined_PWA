# Alerts Redesign — Compact List + Right Sheet Create/Edit

## Objective
Fix overlay issues and make Alerts scannable with quick actions.

## Must-Fix (from screenshot)
- Current "New alert" overlay overlaps page content and doesn't isolate background.
- Implement RightSheet create/edit alert flow.

## Page Layout
- PageHeader: "Alerts" + KPI badge "X Triggered" + actions:
  - Enable notifications (only if not granted)
  - New alert (opens RightSheet)

- Filters row:
  - Tabs: All / Armed / Triggered / Paused
  - Chips: Price Above / Price Below + optional Symbol filter

## Alert Row (compact)
Each row shows:
- Symbol + TF
- Condition (single line)
- Status badge (Armed/Triggered/Paused)
- Meta: triggered time / last checked (optional)
- Row actions: Edit / Pause-Resume / Delete

Triggered styling:
- stronger badge + subtle highlight
- optional "Triggered 12m ago"

## RightSheet: New/Edit Alert (420px)
- Header: title + close
- Sections:
  1) Symbol (search + recent)
  2) Type + threshold
  3) Cadence + notifications
- Footer sticky buttons: Cancel / Create

## Acceptance Criteria
- New alert never overlaps underlying list; background scroll locks.
- Tabs/filters work and remain readable.
- Row actions are accessible via keyboard.
- Notifications CTA is conditional:
  - if granted -> show "Notifications enabled" + test button (optional)
  - if not -> show "Enable browser notifications"

## Tests
- Unit tests:
  - sheet open/close
  - row actions render for each status
