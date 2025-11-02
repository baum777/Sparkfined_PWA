# Hero Section: Sparkfined TA-PWA

## Content Matrix

| Element | Desktop (1280px+) | Mobile (375px) | Notes |
|---------|-------------------|----------------|-------|
| **Headline** | 48px / Bold / Line-height 1.15 | 32px / Bold / Line-height 1.2 | Max 8 words |
| **Subheadline** | 20px / Regular / Line-height 1.5 | 16px / Regular / Line-height 1.5 | Max 20 words |
| **CTA Primary** | 56px h × 220px w | 48px h × 100% w | Orange gradient |
| **CTA Secondary** | 56px h × 200px w | 48px h × 100% w | Ghost style |
| **Hero Visual** | 50% width, right-aligned | 100% width, below CTAs | Chart screenshot or illustration |
| **Trust Badges** | Flex row, 3 items | Stack, 3 items | Below CTAs |

---

## Copy Formula

**Target:** Crypto traders seeking edge with technical analysis

**Pain Points Addressed:**
- ❌ Slow native apps (50–200 MB downloads)
- ❌ Complex indicators requiring manual setup
- ❌ No offline analysis capability
- ❌ Poor mobile UX for on-chain data
- ❌ No AI-assisted insights

**Value Proposition:**
Instant crypto TA + AI insights, no installation, works offline.

---

## Headline Options

### Option 1: Speed-Focused
```
Chart Analysis in Seconds, Not Minutes
```
**Rationale:** Targets traders frustrated with slow TradingView load times

### Option 2: Feature-Focused (SELECTED)
```
Professional Crypto TA – No App Install
```
**Rationale:** Differentiates PWA benefit, appeals to mobile-first users

### Option 3: Outcome-Focused
```
Smarter Trades Start with Better Charts
```
**Rationale:** Focuses on end goal (profitable trades), aspirational

---

## Subheadline

```
Real-time on-chain analysis with AI-powered insights. 
Works offline, installs in 1-click. Built for DeFi traders.
```

**Structure:**
1. **What:** Real-time on-chain analysis with AI
2. **USP:** Offline + 1-click install
3. **Who:** DeFi traders

**Length:** 15 words (optimal for comprehension)

---

## CTA Duo

### Primary CTA
```
┌────────────────────┐
│  Analyze Chart Now │  ← Orange gradient, white text
└────────────────────┘
```
**Action:** Opens analyze page with demo contract pre-filled
**Microcopy:** "Analyze Chart Now" (3 words, verb-first)

### Secondary CTA
```
┌──────────────────┐
│  See Live Demo   │  ← Ghost style, border + glow on hover
└──────────────────┘
```
**Action:** Plays 30s product video or interactive tour
**Microcopy:** "See Live Demo" (reduces friction for hesitant users)

---

## Trust Badges (Below CTAs)

```
✓ No Sign-Up Required    ✓ Works Offline    ✓ Open Beta Access
```

**Styling:**
- Font: 14px, text-text-secondary
- Icon: Checkmark (green accent)
- Layout: Flex row on desktop, stack on mobile
- Spacing: gap-6 (24px)

---

## Wireframe: Desktop (1280px+)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         [Logo] Sparkfined                  [Install] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LEFT COLUMN (50%)                      RIGHT COLUMN (50%)           │
│  ┌─────────────────────────────┐       ┌───────────────────────┐    │
│  │                             │       │                       │    │
│  │  Professional Crypto TA –   │       │   [Chart Screenshot]  │    │
│  │  No App Install             │       │                       │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━   │       │   • Candlestick chart │    │
│  │  (48px, bold, white)        │       │   • Indicators        │    │
│  │                             │       │   • Heatmap panel     │    │
│  │  Real-time on-chain         │       │   • Neon accents      │    │
│  │  analysis with AI-powered   │       │                       │    │
│  │  insights. Works offline,   │       │   (Subtle glow,       │    │
│  │  installs in 1-click.       │       │    tilted 5° right)   │    │
│  │  (20px, gray-400)           │       │                       │    │
│  │                             │       └───────────────────────┘    │
│  │  ┌───────────────────────┐  │                                    │
│  │  │ Analyze Chart Now     │  │ ← Orange gradient, glow            │
│  │  └───────────────────────┘  │                                    │
│  │  ┌──────────────────────┐   │                                    │
│  │  │ See Live Demo        │   │ ← Ghost style                      │
│  │  └──────────────────────┘   │                                    │
│  │                             │                                    │
│  │  ✓ No Sign-Up Required      │                                    │
│  │  ✓ Works Offline            │                                    │
│  │  ✓ Open Beta Access         │                                    │
│  │                             │                                    │
│  └─────────────────────────────┘                                    │
│                                                                      │
│  Padding: 80px (top/bottom), 120px (left/right)                     │
│  Background: Radial gradient (#0A0A0A → rgba(255,98,0,0.03))        │
│  Height: 90vh (viewport height minus nav)                           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe: Mobile (375px)

```
┌─────────────────────────────────────┐
│  [☰]  Sparkfined        [Install]   │
├─────────────────────────────────────┤
│                                     │
│  Professional Crypto TA –           │
│  No App Install                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━       │
│  (32px, bold, center-aligned)       │
│                                     │
│  Real-time on-chain analysis with   │
│  AI-powered insights. Works         │
│  offline, installs in 1-click.      │
│  (16px, gray-400, center)           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [Chart Preview Image]      │    │
│  │  • Cropped to key elements  │    │
│  │  • 16:9 aspect ratio        │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Analyze Chart Now           │  │
│  └───────────────────────────────┘  │
│  (Full width, 48px height)          │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  See Live Demo               │  │
│  └───────────────────────────────┘  │
│  (Full width, ghost style)          │
│                                     │
│  ✓ No Sign-Up Required              │
│  ✓ Works Offline                    │
│  ✓ Open Beta Access                 │
│  (14px, stacked, center-aligned)    │
│                                     │
│  Padding: 48px (top/bottom),        │
│           24px (left/right)         │
│  Height: Auto (scroll)              │
└─────────────────────────────────────┘
```

---

## Background Effects

### Desktop
```css
background: radial-gradient(
  ellipse at 20% 50%, 
  rgba(255, 98, 0, 0.03) 0%, 
  #0A0A0A 60%
);
```
**Effect:** Subtle orange glow from left (brand color), fades to pure black

### Mobile
```css
background: linear-gradient(
  180deg, 
  rgba(255, 98, 0, 0.02) 0%, 
  #0A0A0A 40%
);
```
**Effect:** Top-down gradient for cleaner mobile view

---

## Hero Visual Options

### Option 1: Product Screenshot (SELECTED)
**Content:**
- Analyze page with loaded chart
- Visible: Candlestick chart, indicator heatmap, KPI cards, AI insights panel
- Styling: Subtle drop shadow, 5° tilt to right, neon glow around borders
- Format: PNG with transparency, optimized for web (< 200 KB)

**Rationale:** Shows actual product, builds trust, demonstrates value immediately

### Option 2: Illustration
**Content:**
- Abstract chart with neon lines
- Floating UI elements (cards, buttons) in 3D space
- Cyberpunk aesthetic matching brand

**Rationale:** Faster load, more artistic, but less concrete

### Option 3: Animated Lottie
**Content:**
- Chart animating with price movement
- Indicators updating in real-time
- AI panel typing out insights

**Rationale:** Eye-catching, demonstrates real-time aspect, but increases complexity

---

## Animation Timeline

**On Page Load:**

| Step | Element | Animation | Delay | Duration |
|------|---------|-----------|-------|----------|
| 1 | Headline | Fade-in + slide-up | 0ms | 220ms |
| 2 | Subheadline | Fade-in + slide-up | 100ms | 220ms |
| 3 | CTA Buttons | Fade-in + slide-up | 200ms | 220ms |
| 4 | Trust Badges | Fade-in | 300ms | 180ms |
| 5 | Hero Visual | Fade-in + scale (0.95 → 1) | 150ms | 400ms |

**On CTA Hover:**
- Primary: Glow pulse (0 → 12px orange glow), brightness +10%
- Secondary: Border color shift (gray → green), subtle glow

---

## A/B Test Variants

### Test 1: Headline
- **A:** "Professional Crypto TA – No App Install" (control)
- **B:** "Chart Analysis in Seconds, Not Minutes" (speed-focused)
- **Metric:** Click-through rate on primary CTA

### Test 2: CTA Copy
- **A:** "Analyze Chart Now" (control)
- **B:** "Try Free Demo" (emphasizes free)
- **Metric:** Conversion rate to analyze page

### Test 3: Hero Visual
- **A:** Product screenshot (control)
- **B:** Animated Lottie
- **Metric:** Time on page, scroll depth

---

## SEO & Meta Tags

```html
<title>Sparkfined – Professional Crypto TA | No App Install</title>
<meta name="description" content="Real-time on-chain analysis with AI-powered insights. Works offline, installs in 1-click. Built for DeFi traders.">

<!-- Open Graph -->
<meta property="og:title" content="Sparkfined – Professional Crypto TA">
<meta property="og:description" content="Real-time on-chain analysis with AI-powered insights. Works offline, installs in 1-click.">
<meta property="og:image" content="https://sparkfined.app/og-hero.png">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Sparkfined – Professional Crypto TA">
<meta name="twitter:description" content="Real-time on-chain analysis with AI. Works offline, installs in 1-click.">
<meta name="twitter:image" content="https://sparkfined.app/og-hero.png">
```

---

## Accessibility Checklist

- ✅ Headline uses semantic `<h1>` tag
- ✅ CTAs have `aria-label` for screen readers
- ✅ Hero visual has descriptive `alt` text
- ✅ Focus indicators on all interactive elements
- ✅ Keyboard navigation (Tab to CTAs, Enter to activate)
- ✅ Sufficient color contrast (white text on dark bg = 14:1 ratio)
- ✅ `prefers-reduced-motion` disables entrance animations

---

## Implementation Notes

**Component Structure:**
```tsx
<section className="hero-section">
  <div className="container max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Column */}
      <div className="hero-content">
        <h1 className="text-5xl lg:text-6xl font-bold">...</h1>
        <p className="text-xl text-gray-400">...</p>
        <div className="cta-group">
          <button className="btn-primary">...</button>
          <button className="btn-ghost">...</button>
        </div>
        <div className="trust-badges">...</div>
      </div>
      
      {/* Right Column */}
      <div className="hero-visual">
        <img src="..." alt="..." className="animate-fade-in" />
      </div>
    </div>
  </div>
</section>
```

**File References:**
- Component: `/landing-page/HeroSection.tsx` (to be created)
- Styles: `/src/styles/landing.css` (extends base styles)
- Assets: `/public/hero-chart-screenshot.png`
