# Mobile Wireframe: LandingPage (375px)

**Route:** `/landing` (Marketing page, not main app entry)  
**Purpose:** Marketing Landing Page for Public-Facing Traffic  
**Complexity:** ⭐⭐⭐⭐ High (Multiple sections, animations, CTAs)  
**Status:** ✅ Production Ready

---

## Overview: Full Page Structure

```
1. [Navigation Bar - Sticky]
2. [Hero Section]
3. [Social Proof Ticker]
4. [Problem Section]
5. [Solution Features (3-Grid)]
6. [Stats Banner]
7. [Access System Teaser]
8. [Testimonials]
9. [Final CTA]
10. [Footer]
```

**Total Length:** ~10 viewport heights (long scroll)  
**Scroll Behavior:** Smooth scroll with anchor links

---

## Section 1: NAVIGATION BAR (Sticky)

```
┌─────────────────────────────────┐
│ ⚡ Sparkfined    [Launch App]  │ ← Sticky nav
│                                 │   (bg-zinc-950/80 blur)
└─────────────────────────────────┘
```

**Layout:** `fixed top-0 z-50 border-b border-zinc-800`  
**Left:** Logo (⚡) + Brand name  
**Right:** "Launch App" button (emerald-500)  
**Backdrop:** Blur effect (`backdrop-blur-lg`)  

**Mobile Nav (< 768px):**
- Logo + "Launch App" button only
- Features/Pricing links hidden (accessed via scroll)

---

## Section 2: HERO SECTION

```
┌─────────────────────────────────┐
│                                 │ ← Empty space (pt-32)
│  ⚡ 1,247 alerts · 98.5% uptime│ ← Floating stats
│     · 42ms response             │   (text-xs, zinc-500)
│                                 │
│   Stop Trading Blind.           │
│   Start Trading Smart.          │ ← H1 (text-4xl bold)
│                                 │   Gradient: emerald→cyan
│  Your edge isn't the chart.     │
│  It's what you DO with it.      │ ← Subtitle (text-lg)
│                                 │   zinc-400
│  The command center that actual │
│  traders use. No BS, just alpha.│
│                                 │
│  ┌───────────────────────────┐ │
│  │ Get Started - It's Free → │ │ ← Primary CTA
│  └───────────────────────────┘ │   (emerald-500, shadow)
│                                 │
│  ┌───────────────────────────┐ │
│  │ Watch 30s Demo            │ │ ← Secondary CTA
│  └───────────────────────────┘ │   (border, zinc-900)
│                                 │
│  ✅ No signup                  │
│  ✅ No credit card             │ ← Trust badges
│  ✅ Works offline              │   (text-sm, zinc-500)
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │  [Chart Preview Mock]   │   │ ← Chart preview
│  │                         │   │   (aspect-video, zinc-950)
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Visual Effects:**
- Grid background (subtle lines)
- Gradient text on "Start Trading Smart"
- Shadow glow on primary CTA button
- Floating stats with fade-in animation

---

## Section 3: SOCIAL PROOF TICKER

```
┌─────────────────────────────────┐
│ ══════════════════════════════  │ ← Horizontal scroll
│ "Finally, a chart tool that     │   (infinite loop)
│ doesn't suck" – @degenwizard •  │   Auto-scroll animation
│ "This is what TradingView       │
│ should've been" – @0xAlpha •... │
│ ══════════════════════════════  │
└─────────────────────────────────┘
```

**Layout:** `border-y border-zinc-800 bg-zinc-900/50 py-4`  
**Animation:** `animate-ticker` (continuous scroll)  
**Content:** Repeats 3x for seamless loop  
**Text:** zinc-400, separated by bullets (zinc-700)

---

## Section 4: THE PROBLEM

```
┌─────────────────────────────────┐
│  YOU'RE LOSING MONEY BECAUSE:   │ ← H2 (text-3xl bold)
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📉 Problem 1            │   │
│  │                         │   │ ← Problem card
│  │ You missed the breakout │   │   (border zinc-800)
│  │ (again)                 │   │   hover: border-rose-500
│  │                         │   │
│  │ "Set it at $50k, woke   │   │ ← Quote (italic)
│  │ up to $52k. FML."       │   │   zinc-400
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📝 Problem 2            │   │
│  │                         │   │
│  │ You can't remember why  │   │
│  │ you entered             │   │
│  │                         │   │
│  │ "Was it a scalp or      │   │
│  │ swing? Fuck if I know." │   │
│  └─────────────────────────┘   │
│                                 │
│  [2 more problem cards...]      │
│                                 │
└─────────────────────────────────┘
```

**Grid:** `grid gap-8` (single column on mobile)  
**Cards:** 4 total problem cards  
**Icons:** Lucide icons (colored rose-500 in circle)  
**Hover:** Border color changes to rose-500/50

---

## Section 5: THE SOLUTION (3 Features)

```
┌─────────────────────────────────┐
│  HERE'S HOW SPARKFINED FIXES    │ ← H2 (text-3xl bold)
│  THAT:                          │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │  [Chart Icon Placeholder]│  │ ← Feature image
│  │                         │   │   (aspect-video, bg-zinc-950)
│  │                         │   │
│  │  CHARTS THAT DON'T SUCK │   │ ← Feature title (text-2xl)
│  │                         │   │
│  │  ✅ Canvas 60fps        │   │
│  │  ✅ 10+ indicators      │   │ ← Feature bullets
│  │  ✅ Drawing tools       │   │   (emerald checkmarks)
│  │  ✅ Works offline       │   │
│  │                         │   │
│  │  [ Try Demo → ]         │   │ ← CTA button
│  └─────────────────────────┘   │   (hover: border-emerald)
│                                 │
│  ┌─────────────────────────┐   │
│  │  ALERTS THAT WORK       │   │ ← Feature 2
│  │  [Similar layout...]    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  JOURNAL YOU'LL USE     │   │ ← Feature 3
│  │  [Similar layout...]    │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Grid:** Single column on mobile (stacked)  
**Cards:** `border border-zinc-800 bg-zinc-900 p-6`  
**Hover:** `hover:border-emerald-500/50 hover:-translate-y-2`  
**Animation:** Lift effect on hover

---

## Section 6: STATS BANNER

```
┌─────────────────────────────────┐
│  BY THE NUMBERS                 │ ← H2 (text-3xl)
│                                 │
│  ┌──────┐ ┌──────┐             │
│  │1,247 │ │98.5% │             │ ← Stats (2x2 grid)
│  │Alerts│ │Uptime│             │   on mobile
│  └──────┘ └──────┘             │
│  ┌──────┐ ┌──────┐             │
│  │ 42ms │ │ 100% │             │
│  │ Resp │ │ Free │             │
│  └──────┘ └──────┘             │
│                                 │
│  [4 more stat tiles...]         │
│                                 │
└─────────────────────────────────┘
```

**Grid:** `grid-cols-2 gap-6` (mobile)  
**Tiles:** `border border-zinc-800 bg-zinc-900 p-6 text-center`  
**Value:** text-4xl font-bold emerald-500  
**Label:** text-sm zinc-400

---

## Section 7: ACCESS SYSTEM TEASER

```
┌─────────────────────────────────┐
│  🔐 THE OG SYSTEM               │ ← H2 (text-3xl)
│  Not all features are for       │
│  everyone.                      │
│                                 │
│  ┌─────────────────────────┐   │
│  │ FREE TIER               │   │ ← Free card
│  │                         │   │   (zinc-900)
│  │ ✅ All core features    │   │
│  │ ✅ Unlimited charts     │   │
│  │ ✅ Basic alerts         │   │
│  │ ✅ Journal (100 entries)│   │
│  │ ✅ Offline mode         │   │
│  │                         │   │
│  │ [ Start Free ]          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🏆 RECOMMENDED          │   │ ← Badge (emerald-500)
│  │                         │   │
│  │ OG TIER                 │   │ ← OG card
│  │                         │   │   (gradient emerald-950)
│  │ ✅ Everything in Free   │   │   border-emerald-500
│  │ ✅ Priority alerts      │   │
│  │ ✅ AI analysis (unlimit)│   │
│  │ ✅ Advanced backtest    │   │
│  │ ✅ Soulbound NFT        │   │
│  │ ✅ Leaderboard access   │   │
│  │                         │   │
│  │ [ Become OG (0.5 SOL) ] │   │ ← CTA (emerald-500)
│  │                         │   │
│  │ *No subscription BS.*   │   │ ← Fine print
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Grid:** Single column (stacked cards)  
**OG Card:** Highlighted with gradient background + emerald border

---

## Section 8: TESTIMONIALS

```
┌─────────────────────────────────┐
│  WHAT DEGENS SAY               │ ← H2 (text-3xl)
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Avatar] @0xWizard      │   │ ← Testimonial card
│  │ 24.5K followers         │   │
│  │                         │   │
│  │ "Been using for 3 months│   │ ← Quote
│  │ My win rate went from   │   │   zinc-300
│  │ 45% to 68%. No cap."    │   │
│  │                         │   │
│  │ ⭐⭐⭐⭐⭐              │   │ ← 5-star rating
│  └─────────────────────────┘   │
│                                 │
│  [2 more testimonial cards...]  │
│                                 │
└─────────────────────────────────┘
```

**Grid:** Single column on mobile (stacked)  
**Cards:** `border border-zinc-800 bg-zinc-900 p-6`  
**Active Card:** Highlighted with emerald border (auto-rotate every 5s)  
**Animation:** Subtle glow transition on active card

---

## Section 9: FINAL CTA

```
┌─────────────────────────────────┐
│  ⚡ READY TO TRADE SMARTER?    │ ← H2 (text-4xl bold)
│                                 │
│  Open the app. No signup.       │
│  No credit card.                │ ← Subtitle (text-xl)
│  Start charting in 3 seconds.   │   zinc-300
│                                 │
│  ┌───────────────────────────┐ │
│  │ Launch Sparkfined →       │ │ ← Primary CTA
│  └───────────────────────────┘ │   (emerald-500, glow)
│                                 │
│  ✅ Works offline               │
│  ✅ 80KB download              │ ← Trust badges
│  ✅ Privacy-first              │
│                                 │
│  Or continue being exit         │
│  liquidity. Your call. 🤷      │ ← Cheeky footer text
│                                 │
└─────────────────────────────────┘
```

**Background:** Gradient (emerald-950/30 → zinc-950)  
**Button:** Large, glowing, impossible to miss

---

## Section 10: FOOTER

```
┌─────────────────────────────────┐
│  ⚡ Sparkfined                  │ ← Logo + Brand
│                                 │
│  [Twitter] [GitHub] [Discord]   │ ← Social links
│  [Docs]                         │   (horizontal, zinc-400)
│                                 │
│  Built by degens, for degens.   │
│  © 2024 Sparkfined.             │ ← Copyright text
│  No bullshit guarantee.         │   (zinc-600)
│                                 │
└─────────────────────────────────┘
```

**Layout:** `border-t border-zinc-800 py-12 text-center`  
**Links:** `hover:text-zinc-100`

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column for all sections
- Hero CTAs stacked vertically
- Stats grid: 2 columns
- Features, Problems, Testimonials: Single column
- Nav: Logo + "Launch App" only

**Tablet (768px - 1024px):**
- Problems: 2-column grid
- Features: Remains single column (larger)
- Stats: 4 columns (2x2 becomes 1x4)
- Testimonials: 2 columns

**Desktop (> 1024px):**
- Nav: Adds "Features" and "Pricing" links
- Hero: Wider max-width (5xl = 1024px)
- Problems: 2-column grid
- Features: 3-column grid
- Stats: 4 columns
- Access Tiers: 2 columns (side-by-side)
- Testimonials: 3 columns

---

## Animations

**Page Load:**
- Hero fade-in with slide-up (0.4s)
- Floating stats fade-in with stagger (0.2s delay each)
- Chart preview fade-in (0.6s delay)

**Scroll Animations:**
- Sections fade-in as they enter viewport (Intersection Observer)
- Problem cards slide-in from left (stagger by 0.1s)
- Feature cards slide-in from bottom (stagger by 0.15s)

**Interactions:**
- Button hover: scale-105 + glow increase
- Card hover: translate-y-2 (lift effect)
- Ticker: Continuous scroll (no pause)
- Testimonial rotation: Fade transition (5s interval)

**CSS Keyframes:**
```css
@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.33%); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
```

---

## Accessibility

| Criterion | Status | Implementation |
|-----------|--------|----------------|
| **Semantic HTML** | ✅ | `<nav>`, `<section>`, `<footer>`, `<h1>`, `<h2>` |
| **Skip Links** | ⚠️ | Not implemented (add "Skip to content") |
| **Focus Indicators** | ✅ | All buttons have focus-visible rings |
| **Keyboard Nav** | ✅ | All interactive elements keyboard accessible |
| **Alt Text** | ⚠️ | Icons need aria-labels (currently decorative) |
| **Color Contrast** | ✅ | All text meets WCAG AA |
| **Reduced Motion** | ⚠️ | Animations don't respect `prefers-reduced-motion` |

**Improvements Needed:**
- Add skip link
- Add `aria-label` to icon buttons
- Respect `prefers-reduced-motion` media query

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Slow Network** | Hero loads first, rest lazy-loads |
| **JavaScript Disabled** | Static HTML with no animations (graceful degradation) |
| **Adblock** | No external dependencies, works fine |
| **Small Screens (< 375px)** | Text scales down, maintains readability |
| **Large Screens (> 1920px)** | Max-width containers prevent excessive stretching |

---

## Implementation Notes

**Key Dependencies:**
- `lucide-react` - Icons (Zap, TrendingUp, Bell, etc.)
- `react-router` - Navigation (`useNavigate()` hook)
- CSS animations (Tailwind + custom keyframes)

**Data Arrays:**
```typescript
const problemPoints = [ /* 4 problems */ ]
const features = [ /* 3 features */ ]
const stats = [ /* 8 stats */ ]
const freeTierFeatures = [ /* 5 features */ ]
const ogTierFeatures = [ /* 6 features */ ]
const testimonials = [ /* 3 testimonials */ ]
```

**File:** `src/pages/LandingPage.tsx`  
**Lines:** 484 lines  
**Complexity:** High (multiple sections, animations, CTAs)

---

## Marketing Copy Guidelines

**Tone:** Bold, direct, slightly edgy (target: crypto traders)  
**Language:** No corporate BS, use trader lingo  
**CTAs:** Action-oriented, benefit-focused  
**Social Proof:** Real quotes (or realistic mock quotes)  
**Visuals:** Dark theme, neon accents, high contrast

**Example Headlines:**
- ✅ "Stop Trading Blind. Start Trading Smart."
- ✅ "The command center that actual traders use."
- ❌ "Revolutionizing the trading experience." (too corporate)

---

## Conversion Optimization

**Primary CTA:** "Launch App" → `/board`  
**Secondary CTA:** "Watch 30s Demo" → Video modal (future)  
**Tertiary CTA:** "Become OG" → `/access`

**Funnel:**
1. Hero CTA → Launch App (cold traffic)
2. Features → Try Demo (warm traffic)
3. Access Teaser → Become OG (hot traffic)
4. Final CTA → Launch App (last chance)

**Tracking:** (Future implementation)
- Click events on all CTAs
- Scroll depth tracking
- Time on page
- Exit intent detection

---

## Related Flows

| Flow | Link |
|------|------|
| **First-Time User** | Landing → Launch App → Onboarding (BoardPage) |
| **Returning User** | Direct to `/board` (bypass landing) |
| **OG Upgrade** | Landing → Become OG → `/access` |
| **Demo Request** | Landing → Watch Demo → Video modal (future) |

---

**Status:** ✅ Complete - Production ready for marketing launch
