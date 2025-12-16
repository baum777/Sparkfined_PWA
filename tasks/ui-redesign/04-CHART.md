# Chart Workspace Redesign — Keep Chart Always Visible

## Objective
Keep chart as primary surface and move controls into compact, predictable panels.

## Key Fixes (from current UI)
- Avoid giant empty parameter area pushing chart away.
- Fix typo: "Scapler" -> "Scalper".
- Fix BB param mapping mismatch (chip label BB 20/2 vs fields showing length=2).
- Replace raw JSON parse error UI:
  - no `Unexpected token '<'...` displayed to user
  - show friendly error panel with "Retry" and optional "Details"

## Layout
- Top: compact toolbar row (symbol/timeframe, live/replay, refresh)
- Left/Bottom: chart itself
- RightSheet/ActionPanel: Indicators + Drawings + Replay settings
  - Indicators: chips + collapsible parameter groups
  - Drawings: mode toolbar + history controls

## Error Handling Spec
When data fetch returns non-JSON / HTML / error:
- show InlineBanner in chart area:
  - Title: "Data feed unavailable"
  - Actions: Retry / Open Settings
  - Details (collapsible): status code, endpoint, raw message (dev friendly)

## Acceptance Criteria
- Chart remains visible (controls do not consume majority of vertical space).
- Indicators parameters are collapsible and consistent with chip label.
- Replay toggle and controls remain accessible.
- Drawings toolbar shows clear active mode.
- Error state is user-friendly and never shows raw parse error.

## Tests
- Unit tests for error boundary/handler:
  - given HTML response, UI shows "Data feed unavailable" banner
- Optional: basic interaction tests for indicator panel open/close
