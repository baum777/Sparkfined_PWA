# Settings Redesign — Product Settings (Not Admin Table)

## Objective
Convert Settings from "plain table" to a structured card-based settings hub.

## Must-Fix Issues
- Provider/Model mismatch UI (e.g. Provider=OpenAI but Model=claude-3.5...).
  -> Model list must be provider-scoped and consistent.
- Danger Zone actions must have safe confirm flows (type-to-confirm).

## Layout
- Left: SectionNav (sticky anchors)
- Right: Cards with <FormRow/>

Sections:
1) Appearance
   - Theme (Light/Dark/System)
   - Quote currency
2) Chart Defaults
   - Snap-to-OHLC (switch)
   - Replay speed (segmented)
   - HUD/Timeline/Mini-map (switches)
3) Wallets
   - Connected wallets list + Add wallet
   - Wallet monitoring (Auto-journal) with clear help text
4) Export & Backup
   - Export journal JSON/MD
   - Export all app data
   - Import (Merge/Replace)
5) AI
   - Provider select
   - Model select (filtered by provider)
   - maxOutputTokens, maxCostUsd (validated)
   - Token budget view + reset counter
6) Risk & Playbook Defaults
7) Monitoring & Diagnostics (collapsed "Advanced" by default)
   - API timings, user events, sampling, token overlay
8) PWA
   - SW update, clear caches
   - show status as "Configured/Not configured" (avoid scary "missing" unless actionable)
9) Danger Zone
   - Clear settings/alerts/sessions/events/journal etc
   - Factory reset
   - Each action requires a confirm modal with explicit scope.

## Confirm Modal Spec (Danger Zone)
- Modal title: "Clear journal?"
- Explain exactly what is deleted.
- Offer "Export recommended" link/button before delete.
- Require typing a phrase: DELETE JOURNAL
- Destructive button disabled until phrase matches.

## Acceptance Criteria
- Settings page uses max-width, cards, consistent spacing.
- All toggles are switches where appropriate.
- AI Provider/Model selection cannot be inconsistent.
- Danger actions are safe and cannot be triggered accidentally.

## Tests
- Unit tests:
  - provider change updates model options
  - danger modal requires confirm text
