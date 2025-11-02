# Features Grid: Sparkfined TA-PWA

## Overview
**Layout:** 3-column grid (desktop) → Stack (mobile)
**Total Features:** 6 cards
**Spacing:** gap-6 (24px) between cards

---

## Feature Cards Specification

Each card follows this structure:
1. **Icon** (24×24px, accent color)
2. **Headline** (18px, semibold, 3–5 words)
3. **Description** (14px, gray-400, 2 sentences, ~25 words)

---

## Feature #1: AI-Powered Analysis

**Icon:** 🤖 (Sparkles or Brain from Heroicons)

**Headline:**
```
AI-Powered Insights
```

**Description:**
```
Get instant technical analysis with AI-generated bullet points. 
Identifies trends, support/resistance, and momentum in seconds.
```

**Technical Details:**
- Uses OpenAI GPT-4 for chart analysis
- Template: `v1/analyze_bullets`
- Outputs: Bullish/bearish thesis, key levels, risk factors
- Shown in: Analyze page, AI Assist panel

**Implementation Reference:**
- `/src/sections/ai/useAssist.ts`
- `/src/pages/AnalyzePage.tsx` (lines 33–47)

---

## Feature #2: Real-Time On-Chain Data

**Icon:** ⚡ (Bolt or ChartBar from Heroicons)

**Headline:**
```
Real-Time On-Chain Data
```

**Description:**
```
Track any Solana token with live OHLC data from Dexscreener. 
No delays, no stale charts—instant market intelligence.
```

**Technical Details:**
- Data source: Dexscreener API
- Timeframes: 1m, 5m, 15m, 1h, 4h, 1d
- Caching: Service Worker with StaleWhileRevalidate strategy (24h)
- Offline: Falls back to cached data

**Implementation Reference:**
- `/src/sections/chart/marketOhlc.ts`
- `/api/data/ohlc.ts`
- Vite config: Workbox runtime caching

---

## Feature #3: Offline-First Architecture

**Icon:** 📡 (SignalSlash or CloudOff from Heroicons)

**Headline:**
```
Works Completely Offline
```

**Description:**
```
Analyze charts without internet. All tools cached locally with 
service workers—perfect for flights, subway, or unreliable connections.
```

**Technical Details:**
- Service Worker: vite-plugin-pwa with workbox
- Strategies: 
  - App shell: Precached
  - API data: StaleWhileRevalidate
  - External APIs: NetworkFirst with 5s timeout
- Local storage: IndexedDB via Dexie for trade journal

**Implementation Reference:**
- `/vite.config.ts` (lines 41–88)
- `/public/push/sw.js`
- `/src/lib/db.ts` (Dexie setup)

---

## Feature #4: Technical Indicators Heatmap

**Icon:** 🔥 (Fire or TableCells from Heroicons)

**Headline:**
```
Indicator Heatmap
```

**Description:**
```
Visual matrix of SMA crossovers, RSI, MACD, and volume indicators. 
Spot bull/bear divergences at a glance—no manual chart setup.
```

**Technical Details:**
- Indicators: SMA (9/20/50/200), RSI(14), ATR(14), MACD, Bollinger Bands
- Output: Color-coded matrix (green = bullish, red = bearish, gray = neutral)
- Performance: Computed in Web Worker for large datasets

**Implementation Reference:**
- `/src/sections/analyze/analytics.ts` (KPI functions)
- `/src/sections/analyze/Heatmap.tsx`
- `/src/pages/AnalyzePage.tsx` (lines 156–164)

---

## Feature #5: Trade Journal & Playbooks

**Icon:** 📓 (BookOpen or DocumentText from Heroicons)

**Headline:**
```
Trade Journal & Playbooks
```

**Description:**
```
Document trade ideas with risk/reward presets (1:2, 1:3, 1:5 RR). 
Attach AI analysis, set alerts, and track performance over time.
```

**Technical Details:**
- Journal storage: Vercel serverless functions + local IndexedDB
- Playbook presets: Pre-configured R:R ratios with Kelly criterion sizing
- Integration: Links to alert rules, watchlists, exported snapshots
- Export: JSON, CSV formats

**Implementation Reference:**
- `/src/sections/journal/JournalEditor.tsx`
- `/src/sections/ideas/Playbook.tsx`
- `/api/journal/index.ts`
- `/src/pages/AnalyzePage.tsx` (lines 51–95, createIdeaPacket function)

---

## Feature #6: Instant 1-Click Install

**Icon:** 🚀 (RocketLaunch or ArrowDownTray from Heroicons)

**Headline:**
```
1-Click PWA Install
```

**Description:**
```
No App Store wait. Install directly from browser in 2 seconds. 
Gets own app icon, runs in standalone mode—feels like native.
```

**Technical Details:**
- PWA manifest: `/public/manifest.webmanifest`
- Install prompt: `beforeinstallprompt` event handling
- Icons: 192×192, 512×512 (maskable for adaptive icons)
- Theme: `#1e293b` (dark slate), standalone display mode

**Implementation Reference:**
- `/vite.config.ts` (VitePWA plugin config)
- `/public/manifest.webmanifest`
- Install banner: Potential component in `/src/components/UpdateBanner.tsx`

---

## Wireframe: Desktop (3-Column Grid)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      Features That Give You an Edge                        │
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │  🤖              │  │  ⚡              │  │  📡              │        │
│  │                  │  │                  │  │                  │        │
│  │  AI-Powered      │  │  Real-Time       │  │  Works           │        │
│  │  Insights        │  │  On-Chain Data   │  │  Completely      │        │
│  │                  │  │                  │  │  Offline         │        │
│  │  Get instant     │  │  Track any       │  │  Analyze charts  │        │
│  │  technical       │  │  Solana token    │  │  without         │        │
│  │  analysis with   │  │  with live OHLC  │  │  internet. All   │        │
│  │  AI-generated    │  │  data from       │  │  tools cached    │        │
│  │  bullet points.  │  │  Dexscreener.    │  │  locally with    │        │
│  │  Identifies      │  │  No delays, no   │  │  service         │        │
│  │  trends...       │  │  stale charts... │  │  workers...      │        │
│  │                  │  │                  │  │                  │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │  🔥              │  │  📓              │  │  🚀              │        │
│  │                  │  │                  │  │                  │        │
│  │  Indicator       │  │  Trade Journal   │  │  1-Click PWA     │        │
│  │  Heatmap         │  │  & Playbooks     │  │  Install         │        │
│  │                  │  │                  │  │                  │        │
│  │  Visual matrix   │  │  Document trade  │  │  No App Store    │        │
│  │  of SMA          │  │  ideas with      │  │  wait. Install   │        │
│  │  crossovers,     │  │  risk/reward     │  │  directly from   │        │
│  │  RSI, MACD, and  │  │  presets. Attach │  │  browser in 2    │        │
│  │  volume          │  │  AI analysis...  │  │  seconds...      │        │
│  │  indicators...   │  │                  │  │                  │        │
│  │                  │  │                  │  │                  │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│                                                                            │
│  Grid: grid-cols-3, gap-6                                                 │
│  Container: max-w-6xl, mx-auto, px-6, py-16                               │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe: Mobile (Stack)

```
┌─────────────────────────────────────┐
│  Features That Give You an Edge     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🤖                           │  │
│  │  AI-Powered Insights          │  │
│  │                               │  │
│  │  Get instant technical        │  │
│  │  analysis with AI-generated   │  │
│  │  bullet points. Identifies    │  │
│  │  trends, support/resistance,  │  │
│  │  and momentum in seconds.     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ⚡                           │  │
│  │  Real-Time On-Chain Data      │  │
│  │  ...                          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📡                           │  │
│  │  Works Completely Offline     │  │
│  │  ...                          │  │
│  └───────────────────────────────┘  │
│                                     │
│  [... 3 more cards ...]             │
│                                     │
│  Stack: flex-col, gap-4             │
│  Padding: px-6, py-12               │
└─────────────────────────────────────┘
```

---

## Card Styling

```css
.feature-card {
  @apply bg-surface rounded-xl border border-border;
  @apply p-6 transition-all duration-220 ease-soft-out;
  @apply hover:border-accent/30 hover:shadow-glow-accent;
  @apply hover:-translate-y-1;
}

.feature-icon {
  @apply w-12 h-12 mb-4;
  @apply text-accent; /* Neon green */
}

.feature-headline {
  @apply text-lg font-semibold text-text-primary mb-2;
}

.feature-description {
  @apply text-sm text-text-secondary leading-relaxed;
}
```

---

## Animation

**On Scroll into View:**
```javascript
// Stagger animation for cards (100ms delay between each)
cards.forEach((card, index) => {
  card.style.animationDelay = `${index * 100}ms`;
  card.classList.add('animate-fade-in');
});
```

**On Hover:**
- Card lifts: `transform: translateY(-4px)`
- Border glows: `box-shadow: 0 0 10px rgba(0, 255, 102, 0.22)`
- Icon pulses: Scale 1 → 1.1 → 1 (200ms)

---

## Accessibility

- ✅ Semantic HTML: Each card is an `<article>` element
- ✅ Icon `aria-hidden="true"` (decorative)
- ✅ Headline uses `<h3>` tag for proper hierarchy
- ✅ Focus ring on hover for keyboard navigation
- ✅ Screen reader friendly: "6 features available"

---

## Alternative Layout: 2-Column with Feature Highlight

For more visual impact, consider promoting 1 feature to a larger "hero feature":

```
┌────────────────────────────────────────────────────────────────┐
│  [HERO FEATURE: AI-Powered Analysis]                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🤖  AI-Powered Insights (LARGE)                         │  │
│  │  [Screenshot of AI panel with insights]                  │  │
│  │  Description + "Try AI Demo" CTA                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [Grid: 2×2 for remaining 4 features]                         │
│  ┌───────────────────┐  ┌───────────────────┐                │
│  │ Real-Time Data    │  │ Offline-First     │                │
│  └───────────────────┘  └───────────────────┘                │
│  ┌───────────────────┐  ┌───────────────────┐                │
│  │ Indicator Heatmap │  │ Trade Journal     │                │
│  └───────────────────┘  └───────────────────┘                │
└────────────────────────────────────────────────────────────────┘
```

---

## Social Proof Integration (Optional)

Add testimonial/metric above features grid:

```
┌────────────────────────────────────────────────────────────────┐
│  "Sparkfined cut my chart analysis time from 10 minutes to 30  │
│   seconds. The AI insights are eerily accurate."               │
│                                                                │
│   — @cryptotrader_xyz (12.5K followers)                        │
└────────────────────────────────────────────────────────────────┘
```

Or metrics:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  2,500+          │  │  4.8 / 5.0       │  │  < 5 MB          │
│  Beta Users      │  │  User Rating     │  │  App Size        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Implementation Component

```tsx
// /landing-page/FeaturesGrid.tsx
import { SparklesIcon, BoltIcon, SignalSlashIcon, FireIcon, BookOpenIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Insights',
    description: 'Get instant technical analysis with AI-generated bullet points. Identifies trends, support/resistance, and momentum in seconds.'
  },
  {
    icon: BoltIcon,
    title: 'Real-Time On-Chain Data',
    description: 'Track any Solana token with live OHLC data from Dexscreener. No delays, no stale charts—instant market intelligence.'
  },
  // ... rest
]

export default function FeaturesGrid() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Features That Give You an Edge
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <article key={i} className="feature-card">
              <feature.icon className="w-12 h-12 text-accent mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## SEO Keywords for This Section

- AI crypto analysis
- Real-time on-chain data
- Offline trading tools
- Technical indicator heatmap
- Progressive Web App trading
- Solana token analysis
- DeFi technical analysis
