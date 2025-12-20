# WP-090 Checklist — Settings Foundation + PWA Update

## Current State Snapshot (before changes)
- Settings page uses `DashboardShell` with `SettingsContent` monolith and header actions component.
- Advanced PWA controls already exist in `SettingsContent` (manual check for updates and clear caches).
- Service worker registered via vite-plugin-pwa with autoUpdate; `swUpdater` helper supports waiting detection + skipWaiting.
- `UpdateBanner` component listens for SW updates and triggers `applyUpdate` when user accepts.
- Settings route mounted in `src/pages/SettingsPage.tsx` and referenced via router shell.

## Task Steps
- [x] Step 1 — Settings layout primitives (SettingsCard + settings.css)
- [x] Step 2 — SettingsPage skeleton with header/actions/cards
- [x] Step 3 — Implement PWA update helper (check/apply update)
- [x] Step 4 — Add PwaUpdateCard UI + wiring
- [x] Step 5 — Wire /settings to new SettingsPage component
- [x] Step 6 — Docs + checklist updates

## Acceptance Criteria Mapping
- Settings layout matches required structure with header, subtitle, actions, and card stack.
- Mobile responsive and tokens-only styling for new settings components.
- PWA update button handles Idle/Checking/Available/Updating/Updated/Error states with skipWaiting + reload.
- Update triggers without reinstall; no new deps; other settings sections remain stubbed.

## Verification Plan
- pnpm typecheck
- pnpm lint
- pnpm vitest run --reporter=basic
- pnpm build
- pnpm run check:size
- pnpm test:e2e (if browsers installed; note if blocked)
- Manual SW update verification: simulate waiting SW via DevTools/Application > Service Workers or bump SW version; trigger Update app button.

## Verification Results
- ✅ `pnpm typecheck`
- ✅ `pnpm lint` (pre-existing warnings remain)
- ✅ `pnpm vitest run --reporter=basic`
- ✅ `pnpm build`
- ✅ `pnpm run check:size` (budget warnings acknowledged)
- ❌ `pnpm test:e2e` blocked — Playwright browsers not installed in container (`pnpm exec playwright install` required)
- Manual SW update: Use DevTools > Application > Service Workers, toggle "Update on reload" to force a waiting worker, then use Settings → Update app to apply (or bump `sw.js` version and reload to observe waiting state).

## Step Log
- Step 1: ✅ Added settings layout primitives (SettingsCard + settings.css). Files: src/features/settings/settings.css, src/features/settings/SettingsCard.tsx.
- Step 2: ✅ Added SettingsPage scaffold with header actions, placeholder cards, and danger accordion placeholder. Files: src/features/settings/SettingsPage.tsx, src/features/settings/settings.css.
- Step 3: ✅ Added PWA update helper with capability detection, update checking, and skipWaiting apply flow. Files: src/features/settings/pwa-update.ts.
- Step 4: ✅ Added PWA update card with status states, retry flow, and update/apply actions plus layout wiring. Files: src/features/settings/PwaUpdateCard.tsx, src/features/settings/settings.css, src/features/settings/SettingsPage.tsx.
- Step 5: ✅ Routed /settings to new SettingsPage features layout via PageLayout wrapper. Files: src/pages/SettingsPage.tsx.
- Step 6: ✅ Updated docs/index + changelog and captured verification outcomes plus manual SW steps. Files: docs/CHANGELOG.md, docs/index.md, WP-Polish/WP-090/checklist.md.

## AC Verification
- Layout: Header, subtitle, right actions, and stacked cards delivered in `src/features/settings/SettingsPage.tsx`.
- Tokens/mobile: Styling uses design tokens in `src/features/settings/settings.css` with responsive stack.
- PWA update: Status states + check/apply flows implemented via `src/features/settings/PwaUpdateCard.tsx` and helper `src/features/settings/pwa-update.ts` with skipWaiting + reload path.
