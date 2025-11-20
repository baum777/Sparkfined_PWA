# Event Mapping Table

Übersicht aller Events mit Status, Trigger, Owner und Priorität.

| Event Name | Exists | Trigger | Owner | Privacy | Priority | Effort | Notes |
|------------|--------|---------|-------|---------|----------|--------|-------|
| `alert_create` | yes | ui.submit | alerts | pii | A | 1 | Server dedupe by userId+symbol+condition... |
| `error.occurred` | inferred | error | engineering | sensitive | A | 2 | From useEventLogger - critical for debugging... |
| `push.permission_request` | inferred | ui.click | notifications | public | A | 2 | Critical for notification opt-in tracking... |
| `replay_export_start` | yes | ui.interaction | replay | pii | A | 1 | Jobs return jobId; gated access... |
| `replay_seek` | yes | ui.seek | replay | sensitive | A | 1 | High-frequency — heavily sampled... |
| `replay_session_load` | yes | ui.click | replay | sensitive | A | 1 | Authenticate access; 404 if missing... |
| `screen_view` | inferred | ui.view | unassigned | public | A | 2 | Core navigation event - missing from catalog... |
| `session.end` | inferred | system | analytics | public | A | 2 | From useEventLogger - session completion tracking... |
| `session.start` | inferred | system | analytics | public | A | 2 | From useEventLogger - foundational session trackin... |
| `ui_snapshot_create` | yes | ui.interaction | journal | pii | A | 1 | Optimistic UI; server persists with unique snapId... |
| `user.signup` | inferred | ui.submit | auth | pii | A | 2 | Critical user lifecycle event... |
| `wallet.connect` | inferred | api.call | wallet | pseudonymous | A | 2 | From codebase analysis - wallet flow... |
| `watchlist_add` | yes | ui.click | product/ux | public | A | 1 | Idempotency: dedupe by userId+symbol+tsWindow... |
| `watchlist_bulk_remove` | yes | ui.interaction | product/ux | public | A | 1 | Operation keyed by batchId for idempotency... |
| `watchlist_remove` | yes | ui.interaction | product/ux | public | A | 1 | Server-side idempotency by userId+symbol... |
| `chart_annotation_create` | yes | ui.interaction | chart | pii | B | 1 | Optimistic UI; persist with idempotent id... |
| `dash_journal_open` | yes | ui.view | journal | pii | B | 1 | Guard access; redaction rules... |
| `dash_signal_open` | yes | ui.click | signals | public | B | 1 | ... |
| `dash_symbol_open` | yes | ui.click | product/ux | public | B | 1 | Navigates to /chart/:symbol... |
| `order_panel_open` | yes | ui.view | trading | public | B | 1 | ... |
| `order_place_preview` | yes | ui.interaction | trading | sensitive | B | 1 | No execution - preview only... |
| `order_place_sim` | yes | ui.interaction | trading | sensitive | B | 1 | Mark simulated:true... |
| `pwa.install_prompt_shown` | inferred | system | product/ux | public | B | 2 | PWA adoption metric... |
| `replay_bookmark_create` | yes | ui.interaction | replay | pii | B | 1 | Deduplicate by sessionId+ts+userId... |
| `replay_play_toggle` | yes | ui.interaction | replay | sensitive | B | 1 | Sample play events to reduce volume... |
| `ui_export_start` | yes | ui.interaction | export | pii | B | 1 | Enqueue job; return jobId... |
| `ui_layout_save` | yes | ui.interaction | product/ux | public | B | 1 | Use layoutHash to dedupe... |
| `ui_search_select` | yes | ui.click | search | public | B | 1 | ... |
| `ui_trade_quick_open` | yes | ui.click | trading | public | B | 1 | Fire-and-forget analytic; modal opened client-side... |
| `watchlist_open_chart` | yes | ui.click | product/ux | public | B | 1 | Prefill timeframe if available... |
| `chart_click` | yes | ui.click | chart | public | C | 1 | ... |
| `chart_crosshair_move` | yes | ui.mousemove | chart | public | C | 1 | Buffer locally; send aggregated... |
| `chart_indicator_add` | yes | ui.interaction | chart | public | C | 1 | ... |
| `chart_indicator_toggle` | yes | ui.click | chart | public | C | 1 | ... |
| `chart_tool_activate` | yes | ui.click | chart | public | C | 1 | ... |
| `replay_speed_change` | yes | ui.click | replay | sensitive | C | 1 | ... |
| `replay_step` | yes | ui.interaction | replay | sensitive | C | 1 | ... |
| `ui_snapshot_open` | yes | ui.interaction | journal | public | C | 1 | ... |
| `ui_toast_dismiss` | yes | ui.interaction | product/ux | public | C | 1 | ... |
| `watchlist_row_select` | yes | ui.click | product/ux | public | C | 1 | Client-only unless persisted... |
| `watchlist_sort_change` | yes | ui.click | product/ux | public | C | 1 | Optionally persist to user settings... |

## Legende

- **Exists:** `yes` (implemented), `partial` (partially implemented), `inferred` (missing, needs implementation)
- **Priority:** A (must-track), B (should-track), C (nice-to-have)
- **Effort:** 1-5 (geschätzter Implementierungsaufwand)