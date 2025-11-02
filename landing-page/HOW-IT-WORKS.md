# How It Works: Sparkfined TA-PWA

## Overview
**Goal:** Show users the 3-step flow from entry to insight
**Layout:** Horizontal flow (desktop), Vertical stack (mobile)
**Visual Style:** Step numbers + screenshots + connecting arrows

---

## 3-Step User Flow

### Step 1: Enter Token Address

**Icon/Number:** 1️⃣

**Headline:**
```
Enter Token Address
```

**Description:**
```
Paste any Solana contract address or search by token name. 
Select timeframe (1m to 1d).
```

**Screenshot Content:**
- Input field with placeholder: "0x1234...abcd"
- Timeframe dropdown showing "15m"
- "Analyze" button (orange gradient)
- Clean, minimal UI with dark theme

**User Action:**
- Copy address from Dexscreener/Birdeye/wallet
- Paste into input
- Select timeframe
- Click "Analyze"

**Time to Complete:** 5 seconds

---

### Step 2: AI Analyzes Chart

**Icon/Number:** 2️⃣

**Headline:**
```
AI Analyzes Chart
```

**Description:**
```
Get instant OHLC data, technical indicators, and AI-generated 
insights—all in under 3 seconds.
```

**Screenshot Content:**
- Loading skeleton with shimmer effect
- Chart rendering with candlesticks
- Indicator heatmap (color-coded matrix)
- AI panel showing: "🔍 Analyzing chart patterns..."
- KPI cards populating with data

**Behind the Scenes:**
1. Fetch OHLC data from Dexscreener API
2. Calculate indicators (SMA, RSI, ATR, etc.)
3. Generate signal matrix (bull/bear/neutral)
4. Send metrics to OpenAI for analysis
5. Render AI bullets in real-time (streaming)

**Time to Complete:** 2–3 seconds

---

### Step 3: Get Actionable Insights

**Icon/Number:** 3️⃣

**Headline:**
```
Get Actionable Insights
```

**Description:**
```
View AI analysis, indicator signals, and risk metrics. 
Export to journal, set alerts, or share with team.
```

**Screenshot Content:**
- Completed analysis page:
  - KPI cards: Close price, 24h change, volatility, ATR
  - Indicator heatmap: 4×4 grid with color coding
  - AI insights panel:
    ```
    ✓ Bullish momentum confirmed
    • Price above SMA(20) and SMA(50)
    • RSI(14) at 62 (neutral-bullish)
    • Volume +30% above average
    
    ⚠ Resistance at 0.00015 (recent high)
    ```
- Action buttons:
  - "Create Trade Idea"
  - "Set Alert"
  - "Export JSON"

**User Actions:**
- Review AI insights
- Create trade idea with pre-filled data
- Set price alert for breakout
- Export data for backtesting
- Add to watchlist

**Time to Complete:** 1 minute (review)

---

## Wireframe: Desktop (Horizontal Flow)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          How Sparkfined Works                                │
│                  From Token Address to Insight in 30 Seconds                 │
│                                                                              │
│  ┌─────────────────────┐   →   ┌─────────────────────┐   →   ┌────────────────────┐
│  │  1️⃣                 │       │  2️⃣                 │       │  3️⃣                  │
│  │                     │       │                     │       │                    │
│  │  Enter Token        │       │  AI Analyzes Chart  │       │  Get Actionable    │
│  │  Address            │       │                     │       │  Insights          │
│  │                     │       │                     │       │                    │
│  │ ┌─────────────────┐ │       │ ┌─────────────────┐ │       │ ┌────────────────┐ │
│  │ │ [Screenshot:    │ │       │ │ [Screenshot:    │ │       │ │ [Screenshot:   │ │
│  │ │  Input field +  │ │       │ │  Chart loading  │ │       │ │  Full analysis │ │
│  │ │  TF dropdown +  │ │       │ │  + Indicator    │ │       │ │  page with KPIs│ │
│  │ │  Analyze button]│ │       │ │  matrix + AI    │ │       │ │  + Heatmap +   │ │
│  │ └─────────────────┘ │       │ │  processing]    │ │       │ │  AI insights]  │ │
│  │                     │       │ └─────────────────┘ │       │ └────────────────┘ │
│  │                     │       │                     │       │                    │
│  │ Paste any Solana    │       │ Get instant OHLC    │       │ View AI analysis,  │
│  │ contract address or │       │ data, technical     │       │ indicator signals, │
│  │ search by token     │       │ indicators, and AI  │       │ and risk metrics.  │
│  │ name. Select        │       │ insights—all in     │       │ Export to journal, │
│  │ timeframe (1m-1d).  │       │ under 3 seconds.    │       │ set alerts, share. │
│  │                     │       │                     │       │                    │
│  └─────────────────────┘       └─────────────────────┘       └────────────────────┘
│                                                                              │
│  Arrow style: Dashed neon green line with chevron (→)                        │
│  Container: max-w-7xl, mx-auto, px-6, py-16                                  │
│  Grid: grid-cols-3, gap-8                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe: Mobile (Vertical Stack)

```
┌─────────────────────────────────────┐
│  How Sparkfined Works               │
│  From Token to Insight in 30s       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  1️⃣                           │  │
│  │  Enter Token Address          │  │
│  │                               │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ [Screenshot: Input UI]  │  │  │
│  │  └─────────────────────────┘  │  │
│  │                               │  │
│  │  Paste any Solana contract    │  │
│  │  address or search by token   │  │
│  │  name. Select timeframe.      │  │
│  └───────────────────────────────┘  │
│           ↓ (vertical arrow)        │
│  ┌───────────────────────────────┐  │
│  │  2️⃣                           │  │
│  │  AI Analyzes Chart            │  │
│  │  ...                          │  │
│  └───────────────────────────────┘  │
│           ↓                         │
│  ┌───────────────────────────────┐  │
│  │  3️⃣                           │  │
│  │  Get Actionable Insights      │  │
│  │  ...                          │  │
│  └───────────────────────────────┘  │
│                                     │
│  Stack: flex-col, gap-6             │
│  Padding: px-6, py-12               │
└─────────────────────────────────────┘
```

---

## Alternative Visual: Timeline with Progress Bar

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Step 1          Step 2            Step 3                       │
│  ━━━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━             │
│  ●               ●                ●                             │
│  ↓               ↓                ↓                             │
│  Enter Address   AI Analyzes      Get Insights                 │
│  (5 seconds)     (3 seconds)      (1 minute)                   │
│                                                                  │
│  Total Time: Under 30 seconds to first insights                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## Interactive Demo (Advanced)

For landing page, consider embedding a **live demo** where users can interact:

```
┌────────────────────────────────────────────────────────────────┐
│  Try It Now (Interactive Demo)                                 │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Contract Address:                                        │  │
│  │ ┌──────────────────────────────────────────────┐         │  │
│  │ │ 0x1234abcd... (Demo token pre-filled)        │         │  │
│  │ └──────────────────────────────────────────────┘         │  │
│  │                                                          │  │
│  │ Timeframe: [15m ▼]                                       │  │
│  │                                                          │  │
│  │ ┌──────────────────┐                                     │  │
│  │ │  Analyze Now     │  ← Clickable, shows real results   │  │
│  │ └──────────────────┘                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Click button → See live analysis in 3 seconds                 │
└────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Use demo token with cached data (instant results)
- Show actual Analyze page UI in an iframe or embedded component
- Reduces friction (no need to find contract address)

---

## Animation Timeline

**On Scroll into View:**

| Step | Element | Animation | Delay | Duration |
|------|---------|-----------|-------|----------|
| 1 | Section Headline | Fade-in + slide-up | 0ms | 220ms |
| 2 | Step 1 Card | Fade-in + slide-up | 100ms | 300ms |
| 3 | Arrow 1 | Draw animation (left to right) | 400ms | 200ms |
| 4 | Step 2 Card | Fade-in + slide-up | 600ms | 300ms |
| 5 | Arrow 2 | Draw animation | 900ms | 200ms |
| 6 | Step 3 Card | Fade-in + slide-up | 1100ms | 300ms |

**Interactive Hover:**
- Hovering over any step card highlights it (glow effect)
- Screenshot zooms slightly (scale 1 → 1.05)

---

## Content Variations

### For Technical Users:
```
Step 1: Input Token CA
Step 2: Compute Indicators & ML Analysis
Step 3: Export JSON/CSV or Integrate via API
```

### For Non-Technical Users:
```
Step 1: Type Token Name
Step 2: Get Smart Insights
Step 3: Make Better Trades
```

### For Speed-Focused Copy:
```
Step 1: Paste Address (5s)
Step 2: AI Analyzes (3s)
Step 3: Trade Decision (1m)
Total: Under 30 seconds
```

---

## Styling

```css
.how-it-works-section {
  @apply py-16 px-6 bg-bg;
}

.step-card {
  @apply bg-surface rounded-xl border border-border p-6;
  @apply transition-all duration-300 ease-soft-out;
  @apply hover:border-accent/30 hover:shadow-glow-accent;
}

.step-number {
  @apply text-6xl font-bold text-accent mb-4;
  @apply font-display;
}

.step-title {
  @apply text-xl font-semibold text-text-primary mb-3;
}

.step-description {
  @apply text-sm text-text-secondary leading-relaxed mb-4;
}

.step-screenshot {
  @apply rounded-lg border border-border-accent/20;
  @apply shadow-lg mb-4;
  @apply transition-transform duration-300;
  @apply hover:scale-105;
}

.connecting-arrow {
  @apply text-accent text-4xl;
  /* SVG or icon: → */
}
```

---

## Screenshots to Capture

### Step 1 Screenshot
**File:** `/public/landing/step-1-input.png`
**Content:**
- Analyze page header
- Input field with placeholder: "Contract Address (CA)"
- Timeframe dropdown: "15m"
- "Analyze" button (orange gradient)
- Empty state below: "Enter a contract address to start"

**Specs:**
- Resolution: 1200×800px
- Format: PNG with transparency or WebP
- Optimize: < 100 KB

---

### Step 2 Screenshot
**File:** `/public/landing/step-2-analyzing.png`
**Content:**
- Chart area with loading skeleton (shimmering effect)
- Indicator heatmap with placeholder rectangles
- AI panel showing: "🔍 Analyzing chart patterns..."
- KPI cards with skeleton loaders

**Specs:**
- Show motion/progress (consider animated GIF or video for landing page)
- Resolution: 1200×800px
- Optimize: < 150 KB

---

### Step 3 Screenshot
**File:** `/public/landing/step-3-insights.png`
**Content:**
- Full analysis page:
  - 6 KPI cards (Close, Change, Volatility, ATR, HiLo, Volume)
  - Indicator heatmap (colorful, 4×4 grid)
  - AI insights panel with bullet points:
    ```
    ✓ Bullish momentum confirmed
    • Price above SMA(20) and SMA(50)
    • RSI(14) at 62 (neutral-bullish)
    • Volume +30% above average
    
    ⚠ Resistance at 0.00015 (recent high)
    ```
  - Action buttons: "Create Trade Idea", "Set Alert", "Export JSON"

**Specs:**
- Full-featured, shows all capabilities
- Resolution: 1200×900px (taller to show more content)
- Optimize: < 200 KB

---

## Accessibility

- ✅ Semantic HTML: `<ol>` (ordered list) for steps
- ✅ Each step is `<li>` with `aria-label="Step 1 of 3: Enter Token Address"`
- ✅ Screenshots have descriptive `alt` text
- ✅ Connecting arrows are decorative (`aria-hidden="true"`)
- ✅ Keyboard navigation: Tab through steps
- ✅ Screen reader: "3-step process, Step 1: Enter Token Address, Step 2:..."

---

## Implementation Component

```tsx
// /landing-page/HowItWorks.tsx
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const steps = [
  {
    number: '1',
    title: 'Enter Token Address',
    description: 'Paste any Solana contract address or search by token name. Select timeframe (1m to 1d).',
    screenshot: '/landing/step-1-input.png',
    alt: 'Input field for entering contract address with timeframe dropdown'
  },
  {
    number: '2',
    title: 'AI Analyzes Chart',
    description: 'Get instant OHLC data, technical indicators, and AI-generated insights—all in under 3 seconds.',
    screenshot: '/landing/step-2-analyzing.png',
    alt: 'Chart loading with indicator heatmap and AI analysis in progress'
  },
  {
    number: '3',
    title: 'Get Actionable Insights',
    description: 'View AI analysis, indicator signals, and risk metrics. Export to journal, set alerts, or share with team.',
    screenshot: '/landing/step-3-insights.png',
    alt: 'Completed analysis page showing KPIs, heatmap, and AI insights'
  }
]

export default function HowItWorks() {
  return (
    <section className="py-16 px-6 bg-bg">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">
          How Sparkfined Works
        </h2>
        <p className="text-xl text-text-secondary text-center mb-12">
          From Token Address to Insight in 30 Seconds
        </p>
        
        <ol className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <li key={i} className="step-card" aria-label={`Step ${step.number} of 3: ${step.title}`}>
              <div className="step-number">{step.number}️⃣</div>
              <h3 className="step-title">{step.title}</h3>
              <img 
                src={step.screenshot} 
                alt={step.alt}
                className="step-screenshot"
                loading="lazy"
              />
              <p className="step-description">{step.description}</p>
            </li>
          ))}
          
          {/* Connecting Arrows (Desktop Only) */}
          <ArrowRightIcon 
            className="hidden lg:block absolute top-1/3 left-1/3 w-12 h-12 text-accent -translate-x-1/2"
            aria-hidden="true"
          />
          <ArrowRightIcon 
            className="hidden lg:block absolute top-1/3 left-2/3 w-12 h-12 text-accent -translate-x-1/2"
            aria-hidden="true"
          />
        </ol>
      </div>
    </section>
  )
}
```

---

## Performance Notes

**Image Optimization:**
- Use `<picture>` with WebP + PNG fallback
- Lazy load: `loading="lazy"` attribute
- Responsive images: `srcset` for mobile/desktop
- Placeholder: Show blurred low-res version while loading

**Example:**
```html
<picture>
  <source srcset="step-1-input.webp" type="image/webp">
  <img src="step-1-input.png" alt="..." loading="lazy" />
</picture>
```
