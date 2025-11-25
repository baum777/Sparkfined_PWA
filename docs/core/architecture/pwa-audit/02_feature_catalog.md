---
title: "Feature Catalog"
summary: "Functional inventory of Sparkfined PWA with dependencies and data flows."
sources:
  - src/routes/RoutesRoot.tsx
  - src/pages/BoardPage.tsx
  - src/pages/AnalyzePage.tsx
  - src/pages/ChartPage.tsx
  - src/pages/JournalPage.tsx
  - src/pages/ReplayPage.tsx
  - src/pages/NotificationsPage.tsx
  - src/pages/SettingsPage.tsx
  - src/lib/offline-sync.ts
  - src/lib/db-board.ts
  - src/lib/aiClient.ts
  - src/state/ai.tsx
  - public/manifest.webmanifest
  - public/push/sw.js
---

| Feature ID | Name | Entry Points | Description | Local Stores | External APIs |
| --- | --- | --- | --- | --- | --- |
| F-01 | Command Board | `src/pages/BoardPage.tsx` via `/` | KPI tiles, "Now Stream" feed, quick actions, onboarding modals/tours orchestrate initial user flow. Consumes onboarding store + product tour driver. | IndexedDB tables `kpiCache`, `feedCache` (`src/lib/db-board.ts`); `localStorage` for onboarding progress. | `/api/feed`, `/api/kpi` (implied by data loaders), product tour assets (local). |
| F-02 | Market Analyze | `src/pages/AnalyzePage.tsx` via `/analyze` | OHLC fetch, KPI computation, signal matrix heatmap, AI bullet insights, exports, idea packet automation. | In-memory React state; broadcasts to journal; `localStorage` watchlist. | `/api/ohlc` via `fetchOhlc`; `/api/rules`, `/api/journal`, `/api/ideas`; `/api/ai/assist` for templates. |
| F-03 | Interactive Chart | `src/pages/ChartPage.tsx` | Trading chart embed with drawing snapshots, quick journal draft emitter, replay integration, watchlist overlays. Accepts `chart`/`short` params for permalinks. | IndexedDB `charts` (`src/lib/db-board.ts`); `localStorage` for user layout toggles; `sessionStorage` for share tokens. | `/api/chart` websocket/pollers (implied), `/api/journal` for quick drafts. |
| F-04 | Journal Workspace | `src/pages/JournalPage.tsx` | Rich note editor, tag filters, AI condense assistant, server sync (create/update/delete), attach AI outputs, event listeners for chart inserts. | IndexedDB via `useJournal` (Dexie `journal` tables in `src/lib/journal.ts`); `localStorage` for UI state. | `/api/journal` REST; `/api/ai/assist` for condense template. |
| F-05 | Signal Matrix | `src/pages/SignalsPage.tsx` | Aggregates strategy signals, token gating, server-rule linking, broadcast to notifications. | IndexedDB `rules` table; `localStorage` toggles. | `/api/signals`, `/api/rules` management. |
| F-06 | Replay Lab | `src/pages/ReplayPage.tsx` | Session playback for trades, integrates with chart snapshots and AI commentary overlays. | IndexedDB `charts` + custom replay store; `localStorage` slider state. | `/api/replay` fetch; `/api/ai/assist` optional transcripts. |
| F-07 | Notifications Center | `src/pages/NotificationsPage.tsx` | Push subscription management, feed of alerts, actions to mark read / clear caches. | IndexedDB `feedCache` + service worker push queue; PushManager registration stored via `src/lib/push.ts`. | `/push/sw.js` worker, `/api/notifications`, Web Push subscription endpoint. |
| F-08 | Access Control | `src/pages/AccessPage.tsx`, `src/store/AccessProvider.tsx` | Wallet mock connect, fetch gate status, local caching, gating of app routes. | `localStorage` `sparkfined_access_status`. | `${ACCESS_CONFIG.API_BASE}/access/status`, future Solana wallet adapter. |
| F-09 | Settings | `src/pages/SettingsPage.tsx` | Manage theme, AI provider/model, telemetry opt-in, offline cache reset. | `localStorage` for preferences; IndexedDB clears via `clearAllBoardData`. | None (local) except toggled web APIs. |
| F-10 | Lessons & Ideas | `src/pages/LessonsPage.tsx`, `src/sections/ideas` | Learning modules, AI-assisted playbooks, share flows. | `localStorage` progress; Dexie `ideas`. | `/api/ideas`, `/api/ai/assist`. |
| F-11 | Telemetry & Diagnostics | `src/telemetry`, `src/diagnostics` | Client metrics, crash reporting, token usage overlay. | `localStorage` (token counts), `IndexedDB` (telemetry buffers). | `/api/telemetry`, optional Sentry endpoint. |
| F-12 | Offline Shell | `public/offline.html`, `src/lib/swUpdater.ts` | PWA install prompts, update banner, offline fallback. | Cache Storage (workbox manifest), IndexedDB caches. | Service worker precache manifest, push endpoints. |

> Coverage: 11 core features + infrastructure (≈90%). Remaining minor utilities (icon showcase, font test) treated as auxiliary.

