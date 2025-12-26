# Loveable → Sparkfined File Mapping (UI Replace + Adapter)

## Rules
- Copy UI layout/components from Loveable.
- Do NOT copy Loveable feature hooks if they represent business logic; use adapters calling Sparkfined stores/services.
- Sparkfined routes stay: /dashboard, /journal, /lessons, /chart, /alerts, /settings, /watchlist, /oracle, /replay(alias).

---

## Pages
Loveable                              → Sparkfined
- src/pages/Dashboard.tsx             → src/pages/DashboardPage.tsx  (replace UI, keep sections contract)
- src/pages/Journal.tsx               → src/pages/JournalPage.tsx     (replace UI, wire journalStore/JournalService)
- src/pages/Learn.tsx                 → src/pages/LessonsPage.tsx     (route stays /lessons)
- src/pages/Chart.tsx                 → src/pages/ChartPage.tsx       (replace UI, keep ChartLayout sections contract)
- src/pages/Alerts.tsx                → src/pages/AlertsPage.tsx      (replace UI, wire alertsStore + trigger engine)
- src/pages/SettingsPage.tsx          → src/pages/SettingsPage.tsx + src/pages/SettingsContent.tsx (layout replace, functions same)
- src/pages/Watchlist.tsx             → src/pages/WatchlistPage.tsx   (replace UI, wire watchlistStore)
- src/pages/Oracle.tsx                → src/pages/OraclePage.tsx      (replace UI, wire oracleStore)
- src/pages/Replay.tsx                → (do not keep as top-level UI) integrate into Chart replay UI
- src/pages/NotFound.tsx              → src/pages/NotFoundPage.tsx (or existing 404 page)

---

## Components (tab-specific)
Loveable                              → Sparkfined
- src/components/dashboard/*          → src/components/dashboard/* OR src/features/dashboard/* (UI-only)
- src/components/journal/*            → src/components/journal/* OR src/features/journal/* (UI-only)
- src/components/chart/*              → src/components/chart/* OR src/features/chart/* (UI-only)
- src/components/alerts/*             → src/components/alerts/* OR src/features/alerts/* (UI-only)
- src/components/lessons/*            → src/components/lessons/*
- src/components/settings/*           → src/components/settings/*
- src/components/watchlist/*          → src/components/watchlist/*
- src/components/oracle/*             → src/components/oracle/*
- src/components/ReplayPlayer.tsx     → src/components/replay/ReplayPlayer.tsx (or within chart/replay UI)

---

## Shared UI primitives (shadcn/ui)
Loveable                              → Sparkfined
- src/components/ui/*                 → src/components/ui/*  (allowed)
  BUT: must be adapted to Sparkfined tokens/primitives conventions:
  - no hardcoded colors
  - use existing cn() utility or bridge it

---

## Shell/Navigation UI
Loveable                              → Sparkfined
- src/features/shell/*                → src/features/shell/* (UI-only)
- src/config/navigation.ts            → DO NOT replace src/config/navigation.ts (Sparkfined is truth)
  - Use Loveable navigation.ts only as reference to update Sparkfined nav labels/primary-secondary grouping.

---

## Hooks/Features logic
Loveable hooks/features                → Sparkfined adapters
- src/features/journal/*              → do not import business logic; build adapter around src/store/journalStore.ts + JournalService.ts
- src/features/alerts/*               → adapter around src/store/alertsStore.ts + triggerEngine
- src/features/chart/*                → adapter around Sparkfined chart libs + replay engine
- src/features/oracle/*               → adapter around oracleStore/services
- src/features/watchlist/*            → adapter around watchlistStore
- src/hooks/useLessons.ts             → if purely UI-level, can import; if logic conflicts, wrap Sparkfined lessons source.

---

## Styles
Loveable                              → Sparkfined
- src/index.css, src/App.css          → merge into src/styles/* (do not overwrite global resets blindly)
- Keep Sparkfined tokens as truth; map Loveable colors to tokens.