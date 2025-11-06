# 🔍 PHASE 0 – Repo-Scan & Status Report

**Datum:** 2025-11-05  
**Branch:** cursor/scan-repository-and-understand-setup-0875  
**Node:** v22.21.1 | **pnpm:** 10.20.0

---

## 📦 Projektbaum (Gekürzt)

```
/workspace/
├── api/                          # Vercel Edge Functions (serverless)
│   ├── access/                  # OG-System (mint-nft, lock, status)
│   ├── ai/                      # AI-Proxy (assist.ts)
│   ├── alerts/                  # Alert-System (dispatch, worker)
│   ├── board/                   # Board-Endpoints (feed, kpis)
│   ├── data/                    # Market-Data-Proxies (ohlc)
│   ├── dexpaprika/tokens/       # Dexpaprika-Adapter
│   ├── ideas/                   # Trade-Ideas CRUD
│   ├── journal/                 # Journal-Export
│   ├── market/                  # OHLC-Daten
│   ├── moralis/token/           # Moralis-Adapter
│   ├── push/                    # Push-Notifications
│   └── rules/                   # Alert-Rules Engine
├── docs/                         # Projekt-Dokumentation (15 MD-Dateien)
├── public/                       # Static Assets + PWA
│   ├── fonts/                   # JetBrains Mono (woff2)
│   ├── push/sw.js              # Custom Service Worker
│   ├── manifest.webmanifest    # PWA Manifest
│   └── pwa-*.png               # App Icons
├── src/
│   ├── components/              # 42 React-Komponenten
│   │   ├── board/              # Board-spezifische UI (Feed, KPI, QuickActions)
│   │   ├── layout/             # Layout-Container (Sidebar, Header, BottomNav)
│   │   ├── signals/            # Signal/Lesson-Cards
│   │   └── ui/                 # Design-Primitives (Button, Input, EmptyState)
│   ├── hooks/                   # 8 Custom Hooks (useSwipeNavigation, useSettings, etc.)
│   ├── lib/                     # 53 Business-Logic-Module
│   │   ├── adapters/           # External-API-Adapter (Moralis, Dexpaprika, Pumpfun)
│   │   ├── ai/                 # AI-Service (teaserAdapter.ts)
│   │   ├── analysis/           # Technische Analyse (Indikatoren)
│   │   ├── data/               # Data-Layer (marketOrchestrator)
│   │   ├── ocr/                # OCR-Service (Tesseract.js)
│   │   ├── validation/         # Input-Validation
│   │   └── *.ts                # Services (ReplayService, TelemetryService, etc.)
│   ├── pages/                   # 14 Route-Level-Pages
│   ├── routes/                  # RoutesRoot.tsx (React Router Config)
│   ├── sections/                # 36 Page-Sections (19 tsx, 17 ts)
│   ├── server/                  # 3 Server-Utilities
│   ├── state/                   # 4 Global-State-Provider (Settings, Telemetry, AI)
│   ├── store/                   # AccessProvider (Zustand)
│   ├── styles/                  # 7 CSS-Dateien (Design Tokens, Fonts, Motion)
│   └── types/                   # 8 TypeScript-Definitionen
├── tests/
│   ├── e2e/                     # 7 Playwright E2E-Tests
│   ├── integration/             # 1 API-Integration-Test
│   └── unit/                    # 12 Vitest-Unit-Tests
├── wireframes/                   # UI-Wireframes + Roadmap
├── vite.config.ts               # Vite + PWA Plugin (VitePWA)
├── vercel.json                  # Vercel-Deployment-Config
├── tsconfig.json                # TypeScript-Config (strict mode)
├── package.json                 # Dependencies (25 prod, 21 dev)
└── README.md                    # Projekt-Übersicht
```

---

## 🗺️ Erkannte Seiten/Tabs (Routen)

**Routing-System:** React Router 6.26 mit Lazy-Loading (Code-Splitting)  
**Router-Datei:** `src/routes/RoutesRoot.tsx`

| Route            | Page Component     | Zweck                                    | Layout |
|------------------|--------------------|------------------------------------------|--------|
| `/landing`       | LandingPage        | Landing/Marketing-Seite                  | Standalone |
| `/`              | BoardPage          | Dashboard/Command-Center (KPIs, Feed)    | With Layout |
| `/analyze`       | AnalyzePage        | Token-Analyse (25+ KPIs, Heatmaps)       | With Layout |
| `/chart`         | ChartPage          | Advanced Charting (Canvas-Based)         | With Layout |
| `/journal`       | JournalPage        | Trading-Journal (Rich-Text, OCR)         | With Layout |
| `/replay`        | ReplayPage         | Chart-Replay-Modus (Backtesting)         | With Layout |
| `/access`        | AccessPage         | OG-System (Lock-Calculator, NFT-Mint)    | With Layout |
| `/settings`      | SettingsPage       | User-Präferenzen (Theme, Layout, AI)     | With Layout |
| `/notifications` | NotificationsPage  | Push-Benachrichtigungen                  | With Layout |
| `/signals`       | SignalsPage        | Trading-Signals (AI-Generated)           | With Layout |
| `/lessons`       | LessonsPage        | Trading-Lessons (Educational Content)    | With Layout |
| `*`              | 404                | Fallback für ungültige Routen            | Minimal |

**Layout-System:**
- **Desktop (≥1024px):** Sidebar links (80px breit) + BottomNav ausgeblendet
- **Mobile (<1024px):** Sidebar ausgeblendet + BottomNav fixiert (Tabs)
- **Swipe-Navigation:** Global aktiviert via `useSwipeNavigation()` Hook

---

## 🎨 Globale Styles/Provider

### CSS-Architektur (src/styles/)
```
index.css           → Entry Point (@tailwind base/components/utilities)
├── tokens.css      → Design Tokens (Farben, Spacing, Typo, Motion)
├── fonts.css       → Font-Face-Deklarationen (JetBrains Mono)
├── motion.css      → Animation-Presets (fade-in, slide-up, glow-pulse)
├── high-contrast.css → WCAG-High-Contrast-Modus
├── landing.css     → Landing-Page-spezifische Styles
└── App.css         → Component-Utilities (Animationen, Scrollbars)
```

**Besonderheit:** `@tailwind`-Direktiven vorhanden, **ABER:**
- ❌ Keine `tailwind.config.js/ts` gefunden
- ❌ Keine `postcss.config.js` gefunden
- ⚠️ **Tailwind wird nur via @apply in CSS verwendet** (unkonventionell)
- ✅ CSS-Variablen funktionieren unabhängig von Tailwind

### React-Provider-Hierarchie (src/App.tsx)
```tsx
<TelemetryProvider>           // Analytics/Tracking-Context
  <SettingsProvider>          // User-Präferenzen (Theme, OLED, Layout)
    <AIProviderState>         // AI-Feature-Flags & State
      <AccessProvider>        // OG-System (Zustand Store)
        <BrowserRouter>       // React Router
          <UpdateBanner />   // PWA-Update-Notification
          <Sidebar />        // Desktop-Navigation
          <BottomNav />      // Mobile-Navigation
          <Routes>...</Routes>
        </BrowserRouter>
      </AccessProvider>
    </AIProviderState>
  </SettingsProvider>
</TelemetryProvider>
```

**State-Management:**
- **Zustand:** AccessProvider (Solana-Wallet-Connection, OG-Status)
- **React Context:** Settings, Telemetry, AI
- **IndexedDB (Dexie):** Persistent Data (Charts, Journal, Alerts)

---

## ⚙️ Build-/Deploy-Config

### Vite Config (`vite.config.ts`)
```typescript
- Base: '/' (Root-Path)
- Plugins:
  ✅ @vitejs/plugin-react (Fast Refresh)
  ✅ splitVendorChunkPlugin() (Vendor-Chunk-Splitting)
  ⚠️ rollup-plugin-visualizer (Bundle-Analysis, Type-Error)
  ✅ VitePWA ({
      registerType: 'autoUpdate',
      workbox: { /* Caching-Strategien */ }
    })
- Alias: '@/' → '/src'
- Server: Port 5173, API-Proxy → localhost:3000
- Build:
  - Target: ES2020
  - OutDir: dist
  - ChunkSizeWarningLimit: 900 KB
  - ManualChunks: react, workbox, dexie, chart, analyze
```

**Workbox Caching-Strategien:**
| URL-Pattern | Handler | Cache-Name | Max-Age |
|-------------|---------|------------|---------|
| `/api/board/(kpis\|feed)` | StaleWhileRevalidate | board-api-cache | 60s |
| `api.dexscreener.com` | StaleWhileRevalidate | dexscreener-cache | 24h |
| `/api/(moralis\|dexpaprika\|data)` | NetworkFirst (3s timeout) | token-api-cache | 5min |
| `fonts.googleapis.com` | CacheFirst | google-fonts | 1 year |

### Vercel Config (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "/api/:path*" → "/api/:path*" },  // API-Routing
    { "/(.*)" → "/index.html" }         // SPA-Fallback
  ],
  "headers": [
    "/api/*" → Cache-Control: s-maxage=0, stale-while-revalidate
    "/*" → X-Content-Type-Options: nosniff, X-Frame-Options: DENY
  ]
}
```

### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,                          // ✅ Strict-Mode aktiv
    "noUncheckedIndexedAccess": true,        // ✅ Extra-Strict
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "api", "tests", "*.config.ts"]
}
```

### PWA Manifest (`public/manifest.webmanifest`)
```json
{
  "name": "Sparkfined TA PWA",
  "short_name": "Sparkfined",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0fb34c",
  "icons": [
    { "src": "/pwa-192x192.png", "sizes": "192x192" },
    { "src": "/pwa-512x512.png", "sizes": "512x512" },
    { "src": "/mask-icon.svg", "sizes": "any", "purpose": "any maskable" }
  ]
}
```

**PWA-Setup:**
- ✅ Manifest vorhanden
- ✅ Service Worker via VitePWA (Workbox 7.3)
- ✅ Icons (192x192, 512x512, SVG-Mask)
- ✅ Offline-Fallback (`navigateFallback: '/index.html'`)
- ⚠️ Custom SW in `public/push/sw.js` (könnte VitePWA-SW überschreiben)

---

## 📊 Dependencies-Übersicht

### Production (25 Packages)
| Kategorie | Packages |
|-----------|----------|
| **Framework** | react@18.3, react-dom@18.3, react-router-dom@6.26 |
| **State** | zustand@5.0.8 |
| **Storage** | dexie@3.2.0 (IndexedDB) |
| **Icons** | lucide-react@0.552, @heroicons/react@2.1 |
| **Blockchain** | @solana/web3.js@1.95, @solana/spl-token@0.4 |
| **AI** | openai@4.0 |
| **PWA** | vite-plugin-pwa@0.20, workbox-window@7.1 |
| **Notifications** | web-push@3.6.7 |
| **OCR** | tesseract.js@5.0 |
| **Backend** | @vercel/node@3.0, ws@8.18 |

**⚠️ Upgrade-Potenzial:** Viele Packages haben neuere Major-Versionen (z. B. vite-plugin-pwa 0.20 → 1.1), aber gemäß **SCOPE-Regel** keine Upgrades ohne Freigabe.

### Dev Dependencies (21 Packages)
| Kategorie | Packages |
|-----------|----------|
| **Build** | vite@5.4, @vitejs/plugin-react@4.3 |
| **TypeScript** | typescript@5.6, typescript-eslint@8.0 |
| **Testing** | vitest@1.6, @vitest/coverage-v8@1.6, playwright@1.48 |
| **Linting** | eslint@9.9, @eslint/js@9.9, eslint-plugin-react@7.35 |
| **Formatting** | prettier@3.3.3 |
| **A11y** | @axe-core/playwright@4.11 |
| **Analysis** | rollup-plugin-visualizer@5.12 |

---

## 🔧 NPM Scripts

| Script | Command | Beschreibung |
|--------|---------|--------------|
| `dev` | `vite` | Dev-Server (Port 5173, HMR) |
| `build` | `tsc -b tsconfig.build.json && vite build` | TypeScript-Check + Prod-Build |
| `preview` | `vite preview` | Preview Prod-Build lokal |
| `typecheck` | `tsc --noEmit` | TypeScript-Validierung ohne Emit |
| `lint` | `eslint .` | Lint mit ESLint Flat Config |
| `format` | `prettier . --write` | Code-Formatierung |
| `test` | `vitest run --coverage` | Unit-Tests mit Coverage |
| `test:watch` | `vitest` | Unit-Tests im Watch-Mode |
| `test:e2e` | `playwright test` | E2E-Tests (Browser) |
| `analyze` | `cross-env ANALYZE=true vite build` | Bundle-Size-Visualisierung |
| `lighthouse` | `npx lighthouse http://localhost:4173 ...` | Lighthouse-Audit |

---

## 🛠️ PHASE 0 – Verify-Results

### ✅ Node & Package Manager
```bash
$ pnpm -v && node -v
10.20.0
v22.21.1
```
**Status:** ✅ Node >= 20.10.0 erfüllt (package.json engine)

### ✅ Install Dependencies
```bash
$ pnpm install
✅ Packages: +825 (30.6s)
⚠️ Warnings:
  - 9 deprecated subdependencies (nicht kritisch)
  - Build-Scripts ignored (bigint-buffer, esbuild, tesseract.js, etc.)
```
**Status:** ✅ Erfolgreich, keine Breaking-Errors

### ❌ Build (Fehlerhaft)
```bash
$ pnpm build
Exit Code: 1

Errors:
1. src/pages/LessonsPage.tsx(170,13): TS2322
   → StateViewProps hat kein 'icon'-Prop
   
2. src/pages/SignalsPage.tsx(149,13): TS2322
   → Gleiches Problem wie LessonsPage
   
3. vite.config.ts(12,27): TS2352
   → rollup-plugin-visualizer Type-Mismatch (Plugin → PluginOption)
```
**Status:** ❌ **Muss in PHASE 1 gefixt werden**

**Root Causes:**
- `StateViewProps` Interface fehlt `icon?: ReactNode`
- `visualizer()` braucht expliziten Cast `as PluginOption`

### ⚠️ TypeCheck (81 Errors)
```bash
$ pnpm typecheck
Exit Code: 0 (aber mit Fehlern)

Fehler-Kategorien:
- api/backtest.ts: 12 Fehler (p/prev possibly undefined)
- api/rules/eval.ts: 23 Fehler (x/prev possibly undefined)
- api/ideas/export-pack.ts: LadderConfig undefined
- api/market/ohlc.ts: HeadersInit Type-Mismatch
- src/lib/ReplayService.ts: 13 Fehler (before/after/last undefined)
- src/lib/TelemetryService.ts: 3 Fehler (number | undefined)
- src/lib/adapters/pumpfunAdapter.ts: number | undefined
- src/lib/execution.ts: LadderItem pct | undefined
- tests/**/*.test.ts: 5 Test-spezifische Fehler
```
**Status:** ⚠️ **Nicht blockierend für MVP** (hauptsächlich API-Layer + Tests)

**Strategie:**
- PHASE 1 fokussiert auf **Frontend-Build** (UI-lauffähig)
- API-Typecheck-Fixes als POST_LAUNCH (nicht kritisch, da Vercel Runtime JS ist)

---

## 🚨 Kritische Beobachtungen

### 1. **Tailwind-Setup fehlt komplett**
- ❌ Keine `tailwind.config.js/ts`
- ❌ Keine `postcss.config.js`
- ⚠️ `@tailwind`-Direktiven in `src/styles/index.css` vorhanden
- **Impact:** @apply wird nicht funktionieren, Utility-Klassen fehlen

**Fix für PHASE 1:**
```bash
# Tailwind als PostCSS-Plugin konfigurieren
# ODER: Tailwind entfernen und nur CSS-Variablen nutzen
```

### 2. **Custom Service Worker vs. VitePWA**
- ⚠️ `public/push/sw.js` könnte VitePWA-generierten SW überschreiben
- **Check:** In PHASE 2 prüfen, welcher SW aktiv ist

### 3. **TypeScript Strict-Mode Konflikte**
- ✅ `strict: true` aktiviert (gut für Qualität)
- ⚠️ API-Layer nicht strict-compliant (viele `possibly undefined`)
- **Strategie:** Frontend stabilisieren, API-Fixes später

### 4. **Fehlende .env.example**
- ❌ Keine `.env.example` gefunden
- **Impact:** Unklar, welche Keys benötigt werden
- **Fix:** In PHASE 8 (Config & Secrets) erstellen

---

## 📝 Nächste Schritte (PHASE 1)

1. ✅ **Tailwind-Config erstellen** (`tailwind.config.ts` + `postcss.config.cjs`)
2. ✅ **Build-Errors fixen:**
   - StateViewProps + icon-Prop
   - vite.config.ts visualizer-Cast
3. ✅ **Lokal dev-build starten** (`pnpm dev`)
4. ✅ **Styles-Check:** Tailwind-Utility-Klassen funktionieren?
5. ✅ **Vercel-Testbuild** (ohne neue Deps)

---

**Dokumentiert von:** Claude 4.5 (Sonnet) Cursor-Agent  
**Nächster Schritt:** `OK PHASE 1` → Build grün & Styles sichtbar
