# Sparkfined PWA – UX/UI Wireframe Analysis

**Repository:** github.com/baum777/Sparkfined_PWA  
**Original Analysis Date:** 2025-11-02  
**Last Update:** 2025-11-09  
**Framework:** React 18.3 + TypeScript + Vite  
**Purpose:** Progressive Web App for crypto technical analysis, trading journaling, and alert management

---

## 🆕 LATEST UPDATE (2025-11-09)

**👉 NEW MASTER DOCUMENT: [COMPLETE-WIREFRAMES-MASTER-2025-11-09.md](./COMPLETE-WIREFRAMES-MASTER-2025-11-09.md)**

This master document includes:
- **12 total pages** (7 original + 5 new)
- Complete mobile + desktop wireframes
- 12 detailed user flows
- Ready for Review/Storybook/PR-Specs

**New Pages Added:**
- HomePage (Beta Shell)
- BoardPage (Command Center Dashboard)
- SignalsPage (Trading Signals)
- LessonsPage (Trading Lessons)
- LandingPage (Marketing)

---

## 📋 STEP 1: REPOSITORY INVENTARISIERUNG

### Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend** | React | 18.3.1 | UI Framework |
| | TypeScript | 5.6.2 | Type Safety |
| | Vite | 5.4.3 | Build Tool & Dev Server |
| | React Router | 6.26.0 | Client-Side Routing |
| **State Management** | React Context | Built-in | Global State (Settings, Telemetry, AI, Access) |
| **Styling** | TailwindCSS | Implicit (via classes) | Utility-First CSS |
| | Heroicons | 2.1.0 | Icon Library |
| **Storage** | Dexie | 3.2.0 | IndexedDB Wrapper |
| | LocalStorage | Native | Simple Key-Value Store |
| **PWA** | vite-plugin-pwa | 0.20.0 | Service Worker & Manifest |
| | Workbox | 7.1.0 | Offline Strategy |
| **API Integration** | Solana Web3.js | 1.95.0 | Blockchain Queries |
| | @solana/spl-token | 0.4.0 | Token Operations |
| | OpenAI | 4.0.0 | AI-Assisted Analysis |
| **Backend** | Vercel Functions | - | Serverless API Routes |
| | Web Push | 3.6.7 | Push Notifications |
| **OCR** | Tesseract.js | 5.0.0 | Screenshot Analysis |
| **Testing** | Vitest | 1.6.0 | Unit Tests |
| | Playwright | 1.48.2 | E2E Tests |
| | Testing Library | 14.3.1 | Component Tests |

---

### Feature Matrix

| Feature | File Path | Tech | Status |
|---------|-----------|------|--------|
| **Token Analysis** | `src/pages/AnalyzePage.tsx` | React + OHLC API | ✅ Implemented |
| ├─ OHLC Data Fetch | `src/sections/chart/marketOhlc.ts` | Fetch API | ✅ Implemented |
| ├─ KPI Calculation | `src/sections/analyze/analytics.ts` | Pure Functions | ✅ Implemented |
| ├─ Heatmap Visualization | `src/sections/analyze/Heatmap.tsx` | React Component | ✅ Implemented |
| ├─ AI Assist (Bullets) | `src/sections/ai/useAssist.ts` | OpenAI API | ✅ Implemented |
| └─ Playbook (Risk Calc) | `src/sections/ideas/Playbook.tsx` | React Component | ✅ Implemented |
| **Advanced Charting** | `src/pages/ChartPage.tsx` | Canvas API | ✅ Implemented |
| ├─ Candlestick Rendering | `src/sections/chart/CandlesCanvas.tsx` | React + Canvas | ✅ Implemented |
| ├─ Indicators (SMA/EMA/VWAP) | `src/sections/chart/indicators.ts` | Pure Functions | ✅ Implemented |
| ├─ Drawing Tools | `src/sections/chart/draw/` | Canvas Shapes | ✅ Implemented |
| ├─ Replay Mode | `src/sections/chart/replay/useReplay.ts` | React Hook | ✅ Implemented |
| ├─ Backtest Engine | `src/sections/chart/backtest.ts` | Pure Functions | ✅ Implemented |
| ├─ Timeline Events | `src/sections/chart/Timeline.tsx` | React Component | ✅ Implemented |
| └─ Export (PNG, JSON) | `src/sections/chart/export.ts` | Canvas to Blob | ✅ Implemented |
| **Journal** | `src/pages/JournalPage.tsx` | IndexedDB + Server | ✅ Implemented |
| ├─ Local Storage | `src/lib/journal.ts` | Dexie | ✅ Implemented |
| ├─ Server Sync | `api/journal/index.ts` | Vercel Function | ✅ Implemented |
| ├─ AI Compression | `src/sections/ai/useAssist.ts` | OpenAI API | ✅ Implemented |
| └─ Export (JSON, MD) | `api/journal/export.ts` | Vercel Function | ✅ Implemented |
| **Session Replay** | `src/pages/ReplayPage.tsx` | IndexedDB | ✅ Implemented |
| ├─ Event Tracking | `src/lib/db.ts` | Dexie | ✅ Implemented |
| └─ Timeline Viewer | `src/components/ReplayModal.tsx` | React Component | ✅ Implemented |
| **Access Gating** | `src/pages/AccessPage.tsx` | Solana + Server | ✅ Implemented |
| ├─ Status Check | `src/hooks/useAccessStatus.ts` | React Hook | ✅ Implemented |
| ├─ Lock Calculator | `src/components/access/LockCalculator.tsx` | React Component | ✅ Implemented |
| ├─ Hold Verification | `src/components/access/HoldCheck.tsx` | React Component | ✅ Implemented |
| └─ Leaderboard | `src/components/access/LeaderboardList.tsx` | React Component | ✅ Implemented |
| **Alert System** | `src/pages/NotificationsPage.tsx` | LocalStorage + Server | ✅ Implemented |
| ├─ Rule Editor | `src/sections/notifications/RuleEditor.tsx` | React Component | ✅ Implemented |
| ├─ Rule Wizard | `src/sections/notifications/RuleWizard.tsx` | React Component | ✅ Implemented |
| ├─ Server Rules | `api/rules/` | Vercel Functions | ✅ Implemented |
| ├─ Push Notifications | `src/lib/push.ts` | Web Push API | ✅ Implemented |
| └─ Backtest Integration | `api/backtest.ts` | Vercel Function | ✅ Implemented |
| **Settings** | `src/pages/SettingsPage.tsx` | LocalStorage | ✅ Implemented |
| ├─ Theme Toggle | `src/hooks/useDarkMode.ts` | React Hook | ✅ Implemented |
| ├─ Data Export/Import | `src/lib/datastore.ts` | LocalStorage Utils | ✅ Implemented |
| ├─ AI Configuration | `src/state/ai.tsx` | React Context | ✅ Implemented |
| └─ PWA Controls | `src/lib/swUpdater.ts` | Service Worker API | ✅ Implemented |
| **Telemetry** | `src/state/telemetry.tsx` | Context + API | ✅ Implemented |
| └─ Event Tracking | `api/telemetry.ts` | Vercel Function | ✅ Implemented |

---

### API Routes (Vercel Functions)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/access/status` | GET | Check user access status (OG/Holder) |
| `/api/access/mint-nft` | POST | Mint soulbound NFT for OG |
| `/api/access/lock` | POST | Calculate MCAP-based lock |
| `/api/ai/assist` | POST | AI-powered analysis (OpenAI/Anthropic) |
| `/api/alerts/dispatch` | POST | Send alert notifications |
| `/api/backtest` | POST | Run backtest with rules |
| `/api/data/ohlc` | GET | Fetch OHLC data |
| `/api/ideas` | GET/POST | CRUD for trade ideas |
| `/api/ideas/export` | GET | Export ideas as case studies |
| `/api/ideas/export-pack` | GET | Export execution pack |
| `/api/ideas/close` | POST | Close trade idea |
| `/api/journal` | GET/POST | CRUD for journal notes |
| `/api/journal/export` | GET | Export journal (JSON/MD) |
| `/api/market/ohlc` | GET | Market OHLC proxy |
| `/api/rules` | GET/POST | CRUD for server rules |
| `/api/rules/eval` | POST | Evaluate rules |
| `/api/rules/eval-cron` | POST | Batch rule evaluation |
| `/api/push/subscribe` | POST | Subscribe to push notifications |
| `/api/push/unsubscribe` | POST | Unsubscribe from push |
| `/api/push/test-send` | POST | Test push notification |
| `/api/telemetry` | POST | Log telemetry events |

---

### File Structure Overview

```
/workspace/
├── api/                    # Vercel Serverless Functions
│   ├── access/            # Access gating (OG system)
│   ├── ai/                # AI proxy (OpenAI/Anthropic)
│   ├── alerts/            # Alert dispatch & worker
│   ├── data/              # Data fetching proxies
│   ├── ideas/             # Trade idea CRUD
│   ├── journal/           # Journal CRUD + export
│   ├── market/            # Market data proxy
│   ├── push/              # Push notification handlers
│   └── rules/             # Server rule management
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── access/       # Access-related components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Generic UI components
│   ├── config/           # App configuration
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core business logic
│   │   ├── adapters/    # External API adapters
│   │   ├── ai/          # AI client logic
│   │   ├── analysis/    # Analysis algorithms
│   │   ├── data/        # Data processing
│   │   └── validation/  # Input validation
│   ├── pages/            # Route-level pages
│   ├── sections/         # Page-specific sections
│   │   ├── ai/          # AI-specific logic
│   │   ├── analyze/     # Analysis features
│   │   ├── chart/       # Chart components
│   │   ├── ideas/       # Trade ideas
│   │   ├── journal/     # Journal logic
│   │   └── notifications/ # Alert rules
│   ├── state/            # Global state contexts
│   └── types/            # TypeScript definitions
└── tests/                # Test suites
    ├── e2e/             # Playwright tests
    ├── integration/     # Integration tests
    └── unit/            # Vitest unit tests
```

---

## 📊 PWA Capabilities

| Feature | Status | Implementation |
|---------|--------|----------------|
| **Offline Support** | ✅ | Service Worker + Cache-First |
| **Install Prompt** | ✅ | Manifest + Add-to-Home |
| **Push Notifications** | ✅ | Web Push API + VAPID |
| **Background Sync** | 🚧 | Planned (not implemented) |
| **Shortcuts** | ❌ | Not implemented |

---

## 🎨 Design System

### Colors (Inferred from Code)
- **Primary (Brand):** `#0fb34c` (Emerald Green)
- **Background:** `#0a0a0a` (Near Black)
- **Surface:** `zinc-900` (#18181b)
- **Text Primary:** `zinc-100` (#f4f4f5)
- **Text Secondary:** `zinc-400` (#a1a1aa)
- **Accent Success:** `emerald-*`
- **Accent Danger:** `rose-*`
- **Accent Info:** `cyan-*`

### Spacing (8px Grid)
- Base: `8px`
- Common: `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px)
- Gap: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)

### Typography
- Font: System default (likely Inter or San Francisco)
- Sizes: `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl` (20px)

---

## 🔑 Key Insights

1. **Mobile-First:** Bottom navigation, responsive breakpoints (md: 768px, lg: 1024px)
2. **Dark Theme Default:** Entire UI built for dark mode (zinc palette)
3. **Performance-Optimized:** Lazy-loaded routes, Canvas for charts, IndexedDB for storage
4. **AI-Powered:** OpenAI integration for analysis compression and insight generation
5. **Offline-First:** PWA architecture with service worker caching
6. **Modular Architecture:** Clear separation of concerns (pages/sections/lib)
7. **Multi-Provider AI:** Supports Anthropic, OpenAI, xAI (configurable)
8. **Crypto-Native:** Solana blockchain integration for access gating
9. **Export-Heavy:** Multiple export formats (JSON, MD, CSV, PNG)
10. **Real-Time Alerts:** Server-side rule evaluation with push notifications

---

## 📁 Output Structure

This analysis includes:

- **Mobile Wireframes:** `/wireframes/mobile/` (375px baseline)
- **Desktop Wireframes:** `/wireframes/desktop/` (1280px+ baseline)
- **User Flows:** `/wireframes/flows/` (Mermaid diagrams)
- **Component Specs:** `/wireframes/components/` (Interaction details)
- **Storybook Files:** `/wireframes/storybook/` (Ready-to-use stories)

---

**Next:** See individual screen wireframes and user flows in respective directories.
