# Sparkfined Design System v1.0

> **Alchemical Trading Interface Design System**  
> Complete specification for colors, typography, spacing, animations, gestures, and components.
> 
> Last Updated: December 2025  
> Status: Production Ready

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Shadows & Effects](#shadows--effects)
7. [Animation System](#animation-system)
8. [Mobile Gestures](#mobile-gestures)
9. [Component Library](#component-library)
10. [Usage Guidelines](#usage-guidelines)
11. [Accessibility](#accessibility)
12. [Implementation Notes](#implementation-notes)

---

## Introduction

Sparkfined is a Progressive Web App (PWA) for cryptocurrency trading analytics. The design system combines mystical/occult aesthetics with professional trading functionality, creating an "Alchemical Trading Interface" that guides users from DEGEN to SAGE trader status.

### Spark Is the Single Source of Truth

- Tokens live in `src/styles/tokens.css` and are compiled into Tailwind via `tailwind.config.ts`. No Tailwind default palettes or ad-hoc hex values are allowed in product code.
- Components, gestures, and utilities are exported from `src/design-system/index.ts`. Applications import from `@/design-system`, never from bespoke folders.
- CSS utilities map directly to Spark tokens (`bg-void`, `border-smoke-light`, `text-mist`, `text-fog`, sentiment tokens, etc.) so visual updates propagate globally.

### Design Philosophy

- **Dark-First**: Optimized for low-light trading environments
- **Mobile-Native**: Touch-first gestures and interactions
- **Mystical Branding**: Occult symbols and alchemical themes
- **Performance**: 60fps animations, sub-300ms interactions
- **Accessible**: WCAG AA compliance minimum

---

## Design Principles

### 1. **Immediate Feedback**
Every interaction receives visual and/or haptic feedback within 16ms (1 frame).

### 2. **Progressive Disclosure**
Complex actions reveal information gradually as users engage (e.g., swipe-to-delete shows action as user drags).

### 3. **Forgiving Interactions**
Users can cancel gestures by returning to neutral position before threshold.

### 4. **Mystical + Professional**
Balance arcane aesthetics with serious trading functionality.

### 5. **Mobile-First, Desktop-Enhanced**
Design for mobile, enhance for desktop — never the reverse.

---

## Color System

### Primary Colors

#### Void (Background)
```css
--color-void: #0A0A0A;           /* Primary background */
--color-void-lighter: #121212;    /* Elevated surfaces */
--color-void-lightest: #1A1A1A;   /* Hover states */
```

**RGB:** `10, 10, 10`  
**HSL:** `0°, 0%, 4%`  
**Usage:** Main background, deepest darkness

#### Spark (Brand Primary)
```css
--color-spark: #00F0FF;           /* Primary accent, CTAs, links */
--color-spark-dim: #00BCD4;       /* Hover/disabled states */
--color-spark-glow: rgba(0, 240, 255, 0.25); /* Glow effects */
```

**RGB:** `0, 240, 255`  
**HSL:** `184°, 100%, 50%`  
**Usage:** Primary actions, interactive elements, brand identity

#### Smoke (Containers)
```css
--color-smoke: #2A2A2A;           /* Cards, containers */
--color-smoke-light: #3A3A3A;     /* Borders, dividers */
--color-smoke-lighter: #4A4A4A;   /* Disabled states */
```

**Usage:** Card backgrounds, elevated surfaces

#### Mist (Text)
```css
--color-mist: #FFFFFF;            /* Primary text */
--color-fog: #9B9B9B;             /* Secondary text, placeholders */
--color-ash: #6B6B6B;             /* Tertiary text */
```

**Usage:** Text hierarchy, labels

---

### Semantic Colors

#### Gold (Warning/Opportunities)
```css
--color-gold: #FFB800;
--color-gold-dim: #FF9800;
--color-gold-glow: rgba(255, 184, 0, 0.2);
```

**RGB:** `255, 184, 0`  
**HSL:** `43°, 100%, 50%`  
**Usage:** Warnings, triggered alerts, opportunities

#### Blood (Danger/Stop-Loss)
```css
--color-blood: #FF006E;
--color-blood-dim: #E91E63;
--color-blood-glow: rgba(255, 0, 110, 0.2);
```

**RGB:** `255, 0, 110`  
**HSL:** `334°, 100%, 50%`  
**Usage:** Errors, destructive actions, stop-loss

#### Phosphor (Success/Confirmation)
```css
--color-phosphor: #39FF14;
--color-phosphor-dim: #00E676;
--color-phosphor-glow: rgba(57, 255, 20, 0.2);
```

**RGB:** `57, 255, 20`  
**HSL:** `111°, 100%, 54%`  
**Usage:** Success states, confirmations, wins

---

### Mystical Accents

Use sparingly for emphasis and mystical branding.

#### Violet (Mystical)
```css
--color-violet: #9D4EDD;
--color-violet-glow: rgba(157, 78, 221, 0.2);
```

**Usage:** Rare highlights, gradients, mystical elements

#### Ember (High Volatility)
```css
--color-ember: #FF4500;
--color-ember-glow: rgba(255, 69, 0, 0.2);
```

**Usage:** Hot trades, high volatility indicators

---

### Gradients

```css
/* Primary Brand Gradient */
--gradient-spark: linear-gradient(135deg, #00F0FF 0%, #9D4EDD 100%);

/* Warning Gradient */
--gradient-gold: linear-gradient(135deg, #FFB800 0%, #FF4500 100%);

/* Background Gradient */
--gradient-void: linear-gradient(180deg, #0A0A0A 0%, #121212 100%);

/* Glow Gradient */
--gradient-glow-spark: radial-gradient(
  circle at center,
  rgba(0, 240, 255, 0.25) 0%,
  transparent 70%
);
```

**Usage:**
- `gradient-spark`: Primary buttons, headers, hero sections
- `gradient-gold`: Warning states, important alerts
- `gradient-void`: Background overlays
- `gradient-glow-spark`: Hover effects, focus states

---

### Color Usage Rules

#### Contrast Requirements
- **Text on Void**: Minimum 12:1 (WCAG AAA)
- **Text on Smoke**: Minimum 7:1 (WCAG AA+)
- **Interactive Elements**: Minimum 3:1 against background

#### Color Combinations
✅ **DO:**
- Spark on Void (primary actions)
- Mist on Smoke (card content)
- Gold on Void-Lighter (warnings)
- Blood on Smoke (errors in cards)

❌ **DON'T:**
- Spark text on Gold background (low contrast)
- Blood on Ember (too similar)
- Fog on Smoke-Light (insufficient contrast)

---

## Typography

### Font Families

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Space Grotesk', var(--font-primary);
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Inter:** Body text, UI elements, forms  
**Space Grotesk:** Headlines, display text, branding  
**JetBrains Mono:** Code, data, timestamps, prices

---

### Type Scale

| Name | Size | Rem | Pixels | Line Height | Weight | Usage |
|------|------|-----|--------|-------------|--------|-------|
| `5xl` | 3rem | 3 | 48px | 1.2 | 700-900 | Hero headlines |
| `4xl` | 2.5rem | 2.5 | 40px | 1.2 | 700 | Page titles |
| `3xl` | 2rem | 2 | 32px | 1.25 | 600-700 | Section headers |
| `2xl` | 1.5rem | 1.5 | 24px | 1.3 | 600 | Card titles |
| `xl` | 1.25rem | 1.25 | 20px | 1.4 | 600 | Subheadings |
| `lg` | 1.125rem | 1.125 | 18px | 1.5 | 500 | Large body |
| `base` | 1rem | 1 | 16px | 1.5 | 400 | Body text |
| `sm` | 0.875rem | 0.875 | 14px | 1.5 | 400-500 | Small text, captions |
| `xs` | 0.75rem | 0.75 | 12px | 1.4 | 500-600 | Labels, badges |

---

### Font Weights

```css
--font-normal: 400;      /* Body text */
--font-medium: 500;      /* Buttons, labels */
--font-semibold: 600;    /* Card titles */
--font-bold: 700;        /* Headers */
--font-black: 900;       /* Display headlines only */
```

---

### Letter Spacing

```css
--tracking-tight: -0.02em;    /* Large headlines (3xl+) */
--tracking-normal: 0;         /* Body text, default */
--tracking-wide: 0.02em;      /* Buttons, emphasis */
--tracking-wider: 0.05em;     /* All-caps text, badges */
```

---

### Typography Rules

#### Headlines
- Use **Space Grotesk** for all headlines
- Apply `tracking-tight` for sizes 3xl and above
- Use `font-bold` (700) or `font-black` (900)
- Keep line-height tight (1.2-1.3)

#### Body Text
- Use **Inter** for all body text
- Minimum font-size: 16px (desktop), 14px (mobile)
- Line-height: 1.5-1.6 for readability
- Max width: 60-80 characters per line

#### Data & Code
- Use **JetBrains Mono** for:
  - Prices and values
  - Timestamps
  - Code snippets
  - API keys
  - Technical identifiers

#### All-Caps Text
- Use `text-transform: uppercase`
- Apply `tracking-wider` (0.05em)
- Font-size: typically `xs` or `sm`
- Font-weight: `medium` (500) or `semibold` (600)
- **Usage:** Labels, badges, status indicators

---

## Spacing & Layout

### Spacing Scale (8px Base)

All spacing uses multiples of 8px for consistent rhythm.

```css
--space-1: 0.25rem;   /* 4px  - Tight spacing */
--space-2: 0.5rem;    /* 8px  - Base unit */
--space-3: 0.75rem;   /* 12px - Small gaps */
--space-4: 1rem;      /* 16px - Default gaps */
--space-5: 1.5rem;    /* 24px - Medium gaps */
--space-6: 2rem;      /* 32px - Large gaps */
--space-8: 3rem;      /* 48px - XL gaps */
--space-10: 4rem;     /* 64px - Section spacing */
--space-12: 6rem;     /* 96px - Page spacing */
```

---

### Layout Grid

#### Container
```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
}
```

#### Grid System
```css
/* 12-column grid */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

/* Responsive columns */
.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

---

### Border Radius

```css
--radius-sm: 0.375rem;    /* 6px  - Badges, small buttons */
--radius-md: 0.5rem;      /* 8px  - Inputs, small cards */
--radius-lg: 0.75rem;     /* 12px - Cards, buttons, alerts */
--radius-xl: 1rem;        /* 16px - Large cards, modals */
--radius-full: 9999px;    /* ∞    - Pills, circular elements */
```

**Component Mapping:**
- Badges → `radius-sm` or `radius-full`
- Buttons → `radius-lg`
- Cards → `radius-lg`
- Inputs → `radius-md`
- Modals → `radius-xl`

---

### Z-Index Scale

```css
--z-base: 0;              /* Default layer */
--z-dropdown: 1000;       /* Dropdowns, tooltips */
--z-sticky: 1100;         /* Sticky headers */
--z-fixed: 1200;          /* Fixed elements */
--z-modal-backdrop: 1300; /* Modal overlays */
--z-modal: 1400;          /* Modals, dialogs */
--z-popover: 1500;        /* Popovers */
--z-tooltip: 1600;        /* Tooltips (highest) */
```

---

## Shadows & Effects

### Shadow Scale

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.6);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.7);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.8);
```

**Usage:**
- `shadow-sm`: Subtle elevation (buttons, inputs)
- `shadow-md`: Cards, dropdowns
- `shadow-lg`: Modals, floating panels
- `shadow-xl`: Hero sections, major elements

---

### Glow Effects

```css
--glow-spark: 0 0 20px rgba(0, 240, 255, 0.25),
              0 0 40px rgba(0, 240, 255, 0.25);

--glow-gold: 0 0 20px rgba(255, 184, 0, 0.2),
             0 0 40px rgba(255, 184, 0, 0.2);

--glow-blood: 0 0 20px rgba(255, 0, 51, 0.2),
              0 0 40px rgba(255, 0, 110, 0.2);

--glow-phosphor: 0 0 20px rgba(57, 255, 20, 0.2),
                 0 0 40px rgba(57, 255, 20, 0.2);
```

**Usage:**
- Hover states on interactive elements
- Active alerts (pulsing glow)
- Focus indicators
- Mystical UI elements

**Animation:**
```css
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px var(--color-spark-glow);
  }
  50% {
    box-shadow: 0 0 40px var(--color-spark-glow),
                0 0 60px var(--color-spark-glow);
  }
}

.alert-armed {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

---

## Animation System

### Timing & Easing

#### Duration Scale
```css
--duration-fast: 150ms;      /* Micro-interactions, hover */
--duration-normal: 250ms;    /* Default transitions */
--duration-slow: 350ms;      /* Modal open/close */
--duration-slower: 500ms;    /* Page transitions */
```

#### Easing Functions
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* Elements entering */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);       /* Elements exiting */
--ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);  /* Reversible actions */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful overshoot */
```

**When to Use:**
- `ease-out`: Fade-in, slide-in, scale-in (most common)
- `ease-in`: Fade-out, slide-out, collapse
- `ease-in-out`: Toggles, reversible transitions
- `ease-bounce`: Success states, notifications, mystical elements

---

### Micro-Interactions

#### Button States
```css
.btn {
  transition: all 0.25s var(--ease-out);
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: var(--glow-spark);
}

.btn:active {
  transform: scale(0.95);
}
```

**Framer Motion:**
```tsx
<motion.button
  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,240,255,0.4)" }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
>
  Click Me
</motion.button>
```

---

#### Card Hover
```tsx
<motion.div
  whileHover={{
    y: -4,
    boxShadow: "0 0 20px rgba(0, 240, 255, 0.25)",
    borderColor: "#00F0FF"
  }}
  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
>
  Card Content
</motion.div>
```

---

### Entrance Animations

#### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
/>
```

#### Slide Up (Most Common)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
/>
```

**Usage:** Cards, alerts, list items, toasts

#### Scale In (Modals)
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
/>
```

#### Bounce In (Success/Notifications)
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.3 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
/>
```

**Usage:** Success toasts, achievement unlocks, mystical reveals

---

### Page Transitions

#### Fade Transition (Simple)
```tsx
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

const pageTransition = {
  duration: 0.3,
  ease: "easeInOut"
}
```

#### Slide Transition (Mobile-Style)
```tsx
const slideVariants = {
  enter: { x: 100, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 }
}
```

#### Staggered Children (Lists)
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1  // 100ms delay between items
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
```

---

### Loading States

#### Spinner
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-smoke-light);
  border-top-color: var(--color-spark);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### Skeleton Screen
```css
@keyframes skeleton-loading {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-smoke) 0px,
    var(--color-smoke-light) 40px,
    var(--color-smoke) 80px
  );
  background-size: 200px 100%;
  animation: skeleton-loading 1.2s ease-in-out infinite;
  border-radius: 0.5rem;
}
```

---

### Performance Rules

✅ **DO (60fps Properties):**
- `transform`: translate, scale, rotate
- `opacity`: fade effects
- `filter`: blur, brightness (sparingly)

❌ **AVOID (Janky Properties):**
- `width`, `height` → triggers layout reflow
- `top`, `left`, `right`, `bottom` → use transform
- `margin`, `padding` → triggers layout
- `box-shadow` → expensive, use opacity on pseudo-elements

---

## Mobile Gestures

### Touch Target Guidelines

| Element | Min Size | Recommended | Spacing | Notes |
|---------|----------|-------------|---------|-------|
| Primary Button | 44x44px | 48x48px | 8px | iOS/Android minimum |
| Icon Button | 44x44px | 48x48px | 8px | Increase padding if icon small |
| List Item | 48px | 56px | 0px | Full-width tappable |
| Toggle/Checkbox | 44x44px | 48x48px | 16px | Include label in touch area |
| Input Field | 44px | 56px | 8px | Height, not including label |

---

### Swipe to Action

#### Swipeable Card Specs
```tsx
const SwipeableCard = ({ onDelete, onAcknowledge }) => {
  const x = useMotionValue(0)
  const leftActionOpacity = useTransform(x, [-150, -50], [1, 0])
  const rightActionOpacity = useTransform(x, [50, 150], [0, 1])

  const handleDragEnd = (event, info) => {
    // Threshold: 150px or velocity > 500px/s
    if (Math.abs(info.offset.x) > 150 || Math.abs(info.velocity.x) > 500) {
      if (info.offset.x < 0) {
        onDelete()
      } else {
        onAcknowledge()
      }
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x }}
    />
  )
}
```

#### Thresholds & Physics

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Drag Threshold | 150px or 50% width | Distance before action triggers |
| Velocity Threshold | 500px/s | Fast swipe triggers even if not past threshold |
| Elastic Bounce | 0.2 | Resistance when dragging beyond bounds |
| Snap Back Duration | 300ms | How quickly card returns if not triggered |
| Action Reveal Start | 50px | When background action becomes visible |

---

### Drag & Reorder

```tsx
import { Reorder } from 'framer-motion'

const DraggableList = () => {
  const [items, setItems] = useState([...watchlist])

  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems}>
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          whileDrag={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(0,240,255,0.3)",
            zIndex: 10
          }}
        >
          <DragHandle />
          {item.content}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
```

---

### Pull-to-Refresh

#### States & Thresholds

| State | Pull Distance | Indicator | Action |
|-------|---------------|-----------|--------|
| Idle | 0px | Hidden | User at top of scroll |
| Pulling | 1-79px | ↓ Arrow, opacity grows | Content translates down with resistance |
| Ready | 80px+ | ↑ Arrow (rotate 180°), haptic | Release will trigger refresh |
| Refreshing | 60px | Spinning loader | Fetching new data |
| Complete | → 0px | ✓ Checkmark (brief) | Snap back to top |

#### Implementation
```tsx
const usePullToRefresh = (onRefresh) => {
  const THRESHOLD = 80  // Pull distance to trigger refresh
  
  const handleTouchMove = (e) => {
    const pullDistance = currentY - startY
    
    if (pullDistance > 0) {
      // Apply resistance curve
      const resistance = Math.min(pullDistance / 2, THRESHOLD)
      container.style.transform = `translateY(${resistance}px)`
      
      // Haptic at threshold
      if (pullDistance >= THRESHOLD && !hapticTriggered) {
        navigator.vibrate(10)
      }
    }
  }
  
  // ... full implementation in code samples
}
```

### Gestures Module Reference

All production implementations live in `src/design-system/gestures`:

- `useSwipeable(options)` — handles horizontal swipe detection with configurable threshold, velocity, and callbacks for left/right actions.
- `usePullToRefresh({ onRefresh, threshold, resistance })` — orchestrates the state machine described above and emits haptic feedback when the threshold is crossed.
- `useBottomSheet({ snapPoints, onClose })` — supplies motion props for sheet/backdrop, drag-to-close logic, and spring animations tuned to Spark easing tokens.
- `useDragReorder<T>()` — thin wrapper on top of `framer-motion`’s `Reorder` component with sensible Spark defaults for scale, elevation, and shadows.

Utilities such as `haptic.tap/success/error` live in `src/design-system/utils/haptic.ts` and must be used instead of custom `navigator.vibrate` calls.

---

### Bottom Sheet

```tsx
const BottomSheet = ({ isOpen, onClose, children }) => {
  const handleDragEnd = (event, info) => {
    // Close if dragged down > 100px or velocity > 300
    if (info.offset.y > 100 || info.velocity.y > 300) {
      onClose()
    }
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 500 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <div className="handle" />
        {children}
      </motion.div>
    </>
  )
}
```

---

### Haptic Feedback

#### Haptic Patterns

| Action | Pattern | Duration | Use Case |
|--------|---------|----------|----------|
| Light Tap | `[10]` | 10ms | Button press, toggle, checkbox |
| Medium Tap | `[20]` | 20ms | Swipe threshold, drag start |
| Success | `[10, 50, 10]` | 70ms | Trade executed, alert confirmed |
| Error | `[20, 50, 20, 50, 20]` | 160ms | Invalid input, failed action |
| Warning | `[30, 30, 30]` | 90ms | Approaching threshold, confirmation |

#### Haptic Utilities
```typescript
const haptic = {
  tap: () => {
    if ('vibrate' in navigator) navigator.vibrate(10)
  },
  
  impact: () => {
    if ('vibrate' in navigator) navigator.vibrate(20)
  },
  
  success: () => {
    if ('vibrate' in navigator) navigator.vibrate([10, 50, 10])
  },
  
  error: () => {
    if ('vibrate' in navigator) navigator.vibrate([20, 50, 20, 50, 20])
  },
  
  warning: () => {
    if ('vibrate' in navigator) navigator.vibrate([30, 30, 30])
  }
}
```

---

### Mobile-Specific CSS

```css
/* Disable iOS tap highlight */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Prevent overscroll bounce */
body {
  overscroll-behavior: none;
}

/* Touch-action for better control */
.swipeable {
  touch-action: pan-y;  /* Only vertical scroll */
}

.draggable {
  touch-action: none;   /* Prevent all default touches */
}

/* Smooth momentum scrolling */
.scrollable {
  -webkit-overflow-scrolling: touch;
}

/* Prevent text selection on drag */
.no-select {
  -webkit-user-select: none;
  user-select: none;
}

/* GPU acceleration */
.animated {
  transform: translate3d(0, 0, 0);
  will-change: transform;
}
```

---

## Component Library

### Buttons

#### Sizes
```tsx
interface ButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
}
```

| Size | Height | Padding X | Font Size | Border Radius |
|------|--------|-----------|-----------|---------------|
| sm | 36px | 12px | 14px | 8px |
| md | 44px | 20px | 16px | 12px |
| lg | 56px | 32px | 18px | 16px |
| xl | 64px | 40px | 20px | 16px |

#### Variants
```tsx
// Primary - Spark gradient with glow
<motion.button
  className="bg-gradient-spark text-void border border-spark/20"
  whileHover={{ 
    scale: 1.05, 
    boxShadow: "0 0 20px rgba(0,240,255,0.4)" 
  }}
  whileTap={{ scale: 0.95 }}
/>

// Secondary - Outlined
<button className="bg-transparent text-spark border-2 border-spark hover:bg-spark hover:text-void" />

// Ghost - Subtle hover
<button className="bg-transparent text-mist hover:bg-smoke hover:text-spark" />

// Danger - Blood accent
<button className="bg-blood text-mist hover:shadow-glow-blood" />

// Success - Phosphor accent
<button className="bg-phosphor text-void hover:shadow-glow-phosphor" />
```

---

### Cards

#### Variants
```tsx
// Default
<div className="bg-smoke border border-smoke-light rounded-lg p-4 hover:border-smoke-lighter hover:shadow-md" />

// Interactive
<motion.div
  className="bg-smoke border border-smoke-light rounded-lg p-4 cursor-pointer"
  whileHover={{
    borderColor: "#00F0FF",
    boxShadow: "0 0 20px rgba(0,240,255,0.25)",
    y: -2
  }}
/>

// Glow (Active State)
<div className="bg-smoke border border-spark rounded-lg p-4 shadow-glow-spark" />
```

#### Structure
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-spark/10 rounded-lg flex items-center justify-center">
        <Icon />
      </div>
      <div>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </div>
    </div>
  </CardHeader>
  
  <CardContent>
    Main content
  </CardContent>
  
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### Badges

#### Sizes & Variants
```tsx
// Status Badges
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-spark/20 text-spark border border-spark/30">
  ARMED
</span>

<span className="bg-gold/20 text-gold border border-gold/30 animate-pulse-subtle">
  TRIGGERED
</span>

<span className="bg-smoke/50 text-fog border border-smoke-light">
  PAUSED
</span>
```

#### Sizes
| Size | Height | Padding X | Font Size |
|------|--------|-----------|-----------|
| sm | 20px | 8px | 10px |
| md | 24px | 10px | 12px |
| lg | 28px | 12px | 14px |

---

### Alerts

```tsx
// Armed Alert
<div className="relative rounded-lg border bg-spark/5 border-spark text-spark p-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-spark before:rounded-l-lg">
  <div className="flex justify-between items-start">
    <div className="flex-1">
      <div className="font-semibold mb-2 flex items-center gap-2">
        BTCUSDT <Badge>4H</Badge>
      </div>
      <p className="text-sm opacity-90">Price closes above 42,500 with RSI > 60</p>
    </div>
    <Badge variant="armed">ARMED</Badge>
  </div>
</div>

// Triggered Alert (with pulse)
<div className="bg-gold/5 border-gold text-gold animate-pulse-subtle" />

// Paused Alert
<div className="bg-smoke/50 border-smoke-light text-fog" />
```

---

### Inputs

```tsx
// Text Input
<input
  type="text"
  className="w-full px-4 py-2.5 bg-void-lighter border border-smoke-light rounded-lg text-mist placeholder:text-fog transition-all focus:outline-none focus:ring-2 focus:ring-spark focus:border-transparent"
  placeholder="Search markets..."
/>

// With Icons
<div className="relative">
  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
  <input className="pl-11" />
</div>

// Error State
<input className="border-blood focus:ring-blood" />
```

#### Sizes
| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm | 36px | 12px | 14px |
| md | 44px | 16px | 16px |
| lg | 56px | 20px | 18px |

---

## Usage Guidelines

### Color Usage

#### ✅ DO
- Use Spark for primary CTAs and interactive elements
- Apply semantic colors consistently (Gold=Warning, Blood=Danger)
- Maintain WCAG AA contrast ratios (4.5:1 minimum)
- Use glow effects sparingly for emphasis
- Keep mystical accents (Violet, Ember) rare

#### ❌ DON'T
- Use Spark for danger or warning states
- Mix semantic meanings (e.g., Blood for success)
- Place light text on light backgrounds
- Overuse glow effects on every element
- Use more than 3 colors in a single component

---

### Typography

#### ✅ DO
- Use Space Grotesk only for headlines and display text
- Maintain consistent line-height (1.5 for body text)
- Limit font weights to 3 per screen
- Use sentence case for most text, UPPERCASE for labels
- Keep paragraph width 60-80 characters

#### ❌ DON'T
- Mix Space Grotesk with body text
- Use more than 3 different font sizes in a card
- Set body text below 14px on mobile
- Use UPPERCASE for paragraphs or long text
- Stretch or distort font proportions

---

### Spacing

#### ✅ DO
- Use multiples of 8px for all spacing
- Maintain consistent padding within components
- Use space-4 (16px) as minimum touch target
- Add more whitespace for complex layouts
- Follow the spacing scale religiously

#### ❌ DON'T
- Use arbitrary values like 13px or 27px
- Cram elements too close together
- Make buttons smaller than 44px tall
- Use negative margins excessively
- Break the 8px grid alignment

---

### Animation

#### ✅ DO
- Keep most animations under 300ms
- Use ease-out for entrance, ease-in for exit
- Only animate transform and opacity when possible
- Provide immediate feedback (< 16ms)
- Use haptic feedback for important actions

#### ❌ DON'T
- Animate width, height, or layout properties
- Create animations longer than 500ms
- Overuse bounce easing (use sparingly)
- Animate multiple elements simultaneously without stagger
- Ignore performance (always target 60fps)

---

## Accessibility

### WCAG AA Compliance

#### Contrast Requirements
- **Text on Background:** Minimum 4.5:1 (normal text), 3:1 (large text 18px+)
- **UI Elements:** Minimum 3:1 against background
- **Focus Indicators:** Minimum 3:1, always visible

#### Focus States
All interactive elements must have visible focus indicators:
```css
.interactive:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-spark);
  border-color: var(--color-spark);
}
```

#### Touch Targets
- **Minimum:** 44x44px (iOS/Android standard)
- **Recommended:** 48x48px
- **Spacing:** 8px minimum between targets

---

### Keyboard Navigation

All functionality must be keyboard accessible:
- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` / `Space` - Activate buttons
- `Escape` - Close modals, cancel actions
- `Arrow Keys` - Navigate lists, sliders
- `Home` / `End` - Jump to start/end of lists

---

### Screen Readers

#### Semantic HTML
```tsx
// ✅ Good - Semantic
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// ❌ Bad - Divs everywhere
<div className="nav">
  <div className="link">Dashboard</div>
</div>
```

#### ARIA Labels
```tsx
// Icon-only buttons
<button aria-label="Delete alert">
  <TrashIcon />
</button>

// Loading states
<div role="status" aria-live="polite">
  Loading...
</div>

// Error messages
<input aria-describedby="email-error" />
<span id="email-error" role="alert">
  Invalid email address
</span>
```

---

### Motion & Animation

#### Reduced Motion
Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// In React/Framer Motion
import { useReducedMotion } from 'framer-motion'

const shouldReduceMotion = useReducedMotion()

<motion.div
  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

---

## Implementation Notes

### Tech Stack

- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS 3.4+ with custom config
- **Animations:** Framer Motion 11+
- **PWA:** Vite with PWA plugin
- **Charts:** TradingView Lightweight Charts

---

### Installation

#### 1. Install Dependencies
```bash
npm install framer-motion clsx tailwind-merge
npm install -D tailwindcss @tailwindcss/forms
```

#### 2. Tailwind Config
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#0A0A0A',
          lighter: '#121212',
          lightest: '#1A1A1A',
        },
        spark: {
          DEFAULT: '#00F0FF',
          dim: '#00BCD4',
        },
        // ... rest of colors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // ... rest of theme
    },
  },
  plugins: [],
} satisfies Config
```

#### 3. CSS Variables
```css
/* src/styles/design-tokens.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  /* Colors */
  --color-void: #0A0A0A;
  --color-spark: #00F0FF;
  /* ... rest of tokens */
  
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  
  /* Easing */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

### Utility Functions

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Haptic feedback
export const haptic = {
  tap: () => {
    if ('vibrate' in navigator) navigator.vibrate(10)
  },
  impact: () => {
    if ('vibrate' in navigator) navigator.vibrate(20)
  },
  success: () => {
    if ('vibrate' in navigator) navigator.vibrate([10, 50, 10])
  },
  error: () => {
    if ('vibrate' in navigator) navigator.vibrate([20, 50, 20, 50, 20])
  },
}
```

---

### Component Example

```tsx
// src/design-system/components/Button/Button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/design-system/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-spark text-void border border-spark/20 hover:shadow-glow-spark',
  secondary: 'bg-transparent text-spark border-2 border-spark hover:bg-spark hover:text-void',
  ghost: 'bg-transparent text-mist hover:bg-smoke hover:text-spark',
  danger: 'bg-blood text-mist hover:shadow-glow-blood',
  success: 'bg-phosphor text-void hover:shadow-glow-phosphor',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm rounded-md',
  md: 'h-11 px-5 text-base rounded-lg',
  lg: 'h-14 px-8 text-lg rounded-xl',
  xl: 'h-16 px-10 text-xl rounded-2xl',
}

const MotionButton = motion.button

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()
    const isDisabled = disabled || isLoading

    return (
      <MotionButton
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium tracking-wide',
          'transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        aria-busy={isLoading}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="text-sm">Loading</span>
          </span>
        ) : (
          <>
            {leftIcon ? <span className="flex items-center">{leftIcon}</span> : null}
            <span>{children}</span>
            {rightIcon ? <span className="flex items-center">{rightIcon}</span> : null}
          </>
        )}
      </MotionButton>
    )
  }
)

Button.displayName = 'Button'
```

---

### File Structure

```
src/
├── design-system/
│   ├── components/
│   │   ├── Alert/
│   │   ├── Badge/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Tooltip/
│   ├── gestures/
│   │   ├── useBottomSheet.ts
│   │   ├── useDragReorder.ts
│   │   ├── usePullToRefresh.ts
│   │   └── useSwipeable.ts
│   ├── tokens/
│   ├── theme/
│   └── utils/
├── components/
│   ├── dashboard/
│   ├── watchlist/
│   ├── alerts/
│   └── ui/            # Composite patterns (StateView, Select, Toast, etc.)
├── styles/
│   ├── tokens.css
│   ├── globals.css
│   └── animations.css
├── lib/
│   ├── downloadJSON.ts
│   └── theme/
└── pages/
    ├── DashboardPageV2.tsx
    ├── WatchlistPageV2.tsx
    └── ...
```

---

## Version History

### v1.0 (December 2024)
- Initial design system release
- Complete color palette with mystical accents
- Typography scale and font families
- Spacing system (8px base)
- Animation specifications
- Mobile gesture library
- Component specifications
- Accessibility guidelines

---

## Contributing

### Adding New Components
1. Follow existing component structure
2. Use Framer Motion for animations
3. Include all size and variant options
4. Add TypeScript interfaces
5. Document props and usage
6. Ensure WCAG AA compliance
7. Test on mobile devices

### Modifying Colors
1. Update CSS variables in `design-tokens.css`
2. Update Tailwind config
3. Check contrast ratios (WCAG AA minimum)
4. Test in light and dark modes
5. Update documentation

### Animation Guidelines
1. Keep duration under 300ms for most interactions
2. Always use appropriate easing (ease-out for entry, ease-in for exit)
3. Test on low-end devices (60fps target)
4. Respect `prefers-reduced-motion`
5. Include haptic feedback where appropriate

---

## Governance & Usage Rules

### ✅ Do
- Import primitives, gestures, and utilities exclusively from `@/design-system`.
- Use semantic Spark utilities (`bg-void`, `border-smoke-light`, `text-mist`, `text-fog`, `text-sentiment-bull`, etc.) instead of raw hex values.
- Keep composite patterns (`StateView`, `Select`, `Toast`, etc.) inside `src/components/ui/` until they graduate into the design system.
- Document every new token or component in `docs/design/DESIGN_SYSTEM.md` and `docs/design/DESIGN_MODULE_SPEC.md`.

### ❌ Don't
- Reintroduce Tailwind default palettes (`zinc-*`, `slate-*`, etc.) or arbitrary gradients.
- Create ad-hoc utility classes like `.btn-primary` outside of the design system.
- Add new `navigator.vibrate` calls—use the shared `haptic` helper.
- Bypass accessibility requirements (ARIA labeling, focus traps, reduced-motion handling).

### Extension Process
1. **Discovery** – open a Design ticket with a Figma exploration + rationale.
2. **Spec** – update DESIGN_SYSTEM.md + DESIGN_MODULE_SPEC.md with proposed API, props, tokens.
3. **Implementation** – add code under `src/design-system` with tests (`tests/design-system/...`), update tokens/Tailwind if needed.
4. **Review** – run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, plus manual smoke tests on Dashboard, Watchlist, Alerts CRUD, Onboarding, Landing, and Signals.
5. **Docs** – update `docs/index.md` + `docs/CHANGELOG.md` and add screenshots or references where relevant.

### QA Checklist Before Merge
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- Manual click-through of: Dashboard, Watchlist, Alerts CRUD, Onboarding flow, Landing hero, Signals/Analysis boards.
- Contrast spot checks for spark/blood/gold text against surfaces in both dark and any future light themes.

---

## Codex Playbook for Spark

1. **Scope Guardrails**
   - Codex may refactor or migrate components **only** by editing files inside `src/design-system/**` and call sites that import from there.
   - For composite views, Codex must reuse Spark primitives; no bespoke Tailwind palettes or new utility classes.
2. **Tokens & Variants**
   - Requests for new tokens/variants must cite updated documentation; Codex cannot invent colors, spacing, or shadows.
   - Input errors use `errorText`, button states use `variant="secondary" | "ghost" | "danger" | "success"`, etc.
3. **Gestures & Utils**
   - Interactions leverage `useSwipeable`, `useBottomSheet`, `usePullToRefresh`, `useDragReorder`, and `haptic` utilities. No custom gesture hooks without design approval.
4. **Workflow Expectations**
   - Follow the Phase 4/5 workflow: read specs, plan, implement, add tests, update docs, and list validation commands in handoff notes.
5. **Forbidden Actions**
   - Adding dependencies, toggling Tailwind config flags, or reintroducing legacy shims is prohibited without UX Architect sign-off.

Use this playbook when prompting Codex so generated code aligns with Spark governance.

---

## Support & Resources

### Documentation
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Picker](https://coolors.co/)
- [Easing Generator](https://cubic-bezier.com/)

### Figma
Design files available at: `[INSERT FIGMA LINK]`

---

## License

Sparkfined Design System  
© 2024 Sparkfined. All rights reserved.

---

**Built with ⚡ by the Sparkfined team**