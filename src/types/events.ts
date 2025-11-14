/**
 * Sparkfined TA-PWA — Beta v0.1 event types.
 * Reference: sparkfined_logic_bundle/types/event_types.ts (read-only).
 */

export type AppEventId =
  // AI + orchestrator telemetry
  | 'ui.market_snapshot.requested'
  | 'ui.trade_plan.requested'
  | 'ui.social_analysis.requested'
  | 'ai.orchestrator.market_analysis.started'
  | 'ai.orchestrator.market_analysis.completed'
  | 'ai.orchestrator.social_analysis.completed'
  | 'ai.model.grok.called'
  | 'ai.model.grok.succeeded'
  | 'ai.model.grok.failed'
  | 'ai.model.openai.called'
  | 'ai.model.openai.succeeded'
  | 'ai.model.openai.failed'
  | 'ai.sanity_check.applied'
  | 'ai.bot_score.computed'
  | 'ai.sampling.decision'
  // Token lock + access gating
  | 'tokenlock.feature_access_attempt'
  | 'tokenlock.feature_access_result'
  // Advanced insight overrides
  | 'ui.advanced_insight.opened'
  | 'ui.advanced_insight.field_overridden'
  | 'ui.advanced_insight.saved'
  // Watchlist + search
  | 'watchlist_add'
  | 'watchlist_row_select'
  | 'watchlist_bulk_remove'
  | 'watchlist_open_chart'
  | 'watchlist_remove'
  | 'watchlist_sort_change'
  | 'ui_search_select'
  // Dashboard + snapshot shortcuts
  | 'dash_symbol_open'
  | 'ui_snapshot_open'
  | 'ui_snapshot_create'
  | 'dash_signal_open'
  | 'dash_journal_open'
  // Replay controls
  | 'replay_session_load'
  | 'replay_play_toggle'
  | 'replay_speed_change'
  | 'replay_seek'
  | 'replay_bookmark_create'
  | 'replay_step'
  | 'replay_export_start'
  // Chart interactions
  | 'chart_crosshair_move'
  | 'chart_click'
  | 'chart_tool_activate'
  | 'chart_annotation_create'
  | 'chart_indicator_add'
  | 'chart_indicator_toggle'
  // Orders & alerts
  | 'ui_trade_quick_open'
  | 'order_place_preview'
  | 'order_panel_open'
  | 'order_place_sim'
  | 'alert_create'
  // Journal + quick log
  | 'journal_quick_log_create'
  // Screenshot, OCR & CA resolve
  | 'screenshot_upload_start'
  | 'screenshot_upload_done'
  | 'screenshot_crop_done'
  | 'screenshot_ocr_success'
  | 'screenshot_ocr_failed'
  | 'ca_resolve_success'
  | 'ca_resolve_failed'

export interface EventPayloadMap {
  // AI + orchestrator telemetry
  'ui.market_snapshot.requested': {
    symbol: string
    timeframe: string
    requested_mode: 'basic' | 'advanced'
  }
  'ui.trade_plan.requested': {
    symbol: string
    timeframe: string
    context?: string
  }
  'ui.social_analysis.requested': {
    symbol: string
    query?: string
    postCount: number
  }
  'ai.orchestrator.market_analysis.started': {
    request_id: string
    symbol: string
    timeframe: string
  }
  'ai.orchestrator.market_analysis.completed': {
    request_id: string
    symbol: string
    hasSnapshot: boolean
    hasDeepSignal: boolean
    hasAdvanced: boolean
  }
  'ai.orchestrator.social_analysis.completed': {
    request_id: string
    symbol: string
    postCount: number
    sentiment: string
    confidence: number
  }
  'ai.model.grok.called': {
    request_id: string
    task: string
    symbol?: string
    payloadSize?: number
  }
  'ai.model.grok.succeeded': {
    request_id: string
    task: string
    duration_ms: number
    tokens?: number
    cost?: number
  }
  'ai.model.grok.failed': {
    request_id: string
    task: string
    error: string
    status?: number
  }
  'ai.model.openai.called': {
    request_id: string
    task: string
    symbol?: string
    payloadSize?: number
  }
  'ai.model.openai.succeeded': {
    request_id: string
    task: string
    duration_ms: number
    tokens?: number
    cost?: number
  }
  'ai.model.openai.failed': {
    request_id: string
    task: string
    error: string
    status?: number
  }
  'ai.sanity_check.applied': {
    request_id: string
    anomalies?: string[]
  }
  'ai.bot_score.computed': {
    post_id: string
    bot_score: number
    features_sample?: Record<string, unknown>
  }
  'ai.sampling.decision': {
    event: string
    rate: number
    sampled: boolean
    user_id?: string
    ab_bucket?: string
  }

  // Token lock
  'tokenlock.feature_access_attempt': {
    user_id?: string
    feature: string
    tier_required: string
    has_lock: boolean
    token_lock_id?: string
  }
  'tokenlock.feature_access_result': {
    user_id?: string
    feature: string
    is_unlocked: boolean
    reason?: string
  }

  // Advanced insight actions
  'ui.advanced_insight.opened': {
    user_id?: string
    symbol: string
    timeframe: string
    access: {
      feature: string
      tier: string
      is_unlocked: boolean
    }
  }
  'ui.advanced_insight.field_overridden': {
    user_id?: string
    symbol: string
    field_path: string
    auto_value: unknown
    user_value: unknown
  }
  'ui.advanced_insight.saved': {
    user_id?: string
    symbol: string
    timeframe: string
    overrides_count: number
    journal_id?: string
  }

  // Watchlist + search
  'watchlist_add': {
    symbol: string
    source: 'search' | 'signal'
  }
  'watchlist_row_select': {
    symbol: string
    selected: boolean
  }
  'watchlist_bulk_remove': {
    symbols: string[]
  }
  'watchlist_open_chart': {
    symbol: string
  }
  'watchlist_remove': {
    symbol: string
  }
  'watchlist_sort_change': {
    sortBy: string
    direction?: 'asc' | 'desc'
  }
  'ui_search_select': {
    query: string
    selectedSymbol: string
  }

  // Dashboard
  'dash_symbol_open': {
    symbol: string
  }
  'ui_snapshot_open': {
    context: 'dashboard' | 'chart'
    symbol?: string
  }
  'ui_snapshot_create': {
    snapId: string
    symbol: string
    ts: string
  }
  'dash_signal_open': {
    signalId: string
  }
  'dash_journal_open': {
    from: 'dashboard' | 'chart' | 'replay'
  }

  // Replay
  'replay_session_load': {
    sessionId: string
  }
  'replay_play_toggle': {
    sessionId: string
    playing: boolean
  }
  'replay_speed_change': {
    sessionId: string
    speed: number
  }
  'replay_seek': {
    sessionId: string
    ts: number
  }
  'replay_bookmark_create': {
    sessionId: string
    ts: number
    note?: string
  }
  'replay_step': {
    sessionId: string
    direction: 'fwd' | 'back'
    amount: number
  }
  'replay_export_start': {
    sessionId: string
    from: number
    to: number
  }

  // Chart interactions
  'chart_crosshair_move': {
    symbol: string
    timeframe: string
    x: number
    y: number
    ts: number
    price: number
  }
  'chart_click': {
    symbol: string
    timeframe: string
    action: 'place_marker' | string
    coords: { x: number; y: number }
  }
  'chart_tool_activate': {
    tool: 'trendline' | 'fib' | 'rect' | string
    symbol?: string
  }
  'chart_annotation_create': {
    id: string
    symbol: string
    coords: { x: number; y: number }
    text: string
  }
  'chart_indicator_add': {
    symbol: string
    indicator: string
    params: Record<string, unknown>
  }
  'chart_indicator_toggle': {
    symbol: string
    indicator: string
    visible: boolean
  }

  // Orders & alerts
  'ui_trade_quick_open': {
    symbol: string
    source: 'watchlist_row' | 'dashboard_row'
  }
  'order_place_preview': {
    symbol: string
    side: 'buy' | 'sell'
    size: number
    price?: number
    sl?: number
    tp?: number
  }
  'order_panel_open': {
    symbol: string
  }
  'order_place_sim': {
    symbol: string
    side: 'buy' | 'sell'
    size: number
    sl?: number
    tp?: number
  }
  'alert_create': {
    symbol: string
    condition: string
    value: number
    direction: 'above' | 'below'
  }

  // Journal + quick log
  'journal_quick_log_create': {
    entryId: string
    symbol: string
    side: 'long' | 'short' | 'neutral'
    emotion?: string
  }

  // Screenshot, OCR & CA resolve
  'screenshot_upload_start': {
    screenshot_id: string
  }
  'screenshot_upload_done': {
    screenshot_id: string
    file_size_bytes: number
  }
  'screenshot_crop_done': {
    screenshot_id: string
  }
  'screenshot_ocr_success': {
    screenshot_id: string
    token_symbol?: string
    price?: number
  }
  'screenshot_ocr_failed': {
    screenshot_id: string
    error: string
  }
  'ca_resolve_success': {
    ca: string
    token_symbol?: string
  }
  'ca_resolve_failed': {
    ca: string
    error: string
  }
}

export type AppEventPayload<E extends AppEventId> = EventPayloadMap[E]
