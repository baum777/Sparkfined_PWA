# Pattern Decision Matrix – Color Usage Guidelines

**Purpose**: Clear rules for when to use Tailwind utilities vs CSS classes vs inline styles  
**Audience**: All developers working on Sparkfined PWA  
**Last Updated**: 2025-12-05

---

## Quick Decision Tree

```
Need to apply colors?
│
├─ Is it a simple, static color? (bg, text, border)
│  └─ YES → Use Tailwind utilities
│      Examples: bg-surface, text-primary, border-subtle
│
├─ Is it a complex effect? (glassmorphism, gradients, glows)
│  └─ YES → Use CSS classes
│      Examples: .card-glass, .btn-primary, .hover-lift
│
├─ Does it need dynamic opacity or gradients?
│  └─ YES → Use CSS variables (rare)
│      Example: style={{ background: 'rgb(var(--color-brand) / 0.05)' }}
│
└─ Is it for a chart library that requires RGB strings?
   └─ YES → Use chartColors utility
       Example: const colors = getChartColors()
```

---

## Pattern 1: Tailwind Utilities (Recommended 90% of time)

### When to Use

✅ Simple, static colors  
✅ Text colors  
✅ Background colors (solid)  
✅ Border colors  
✅ Trading sentiment colors  
✅ Spacing, sizing, typography alongside colors

### Examples

#### Background Colors
```tsx
// ✅ Surfaces
<div className="bg-surface">Default card background</div>
<div className="bg-surface-subtle">Darker variant</div>
<div className="bg-surface-elevated">Elevated card</div>
<div className="bg-surface-hover">Hover state</div>

// ✅ Brand
<div className="bg-brand">Primary CTA background</div>
<div className="bg-brand-hover">CTA hover state</div>

// ✅ Semantic
<div className="bg-success/10">Success background (10% opacity)</div>
<div className="bg-danger/10">Error background</div>
```

#### Text Colors
```tsx
// ✅ Hierarchy
<h1 className="text-primary">Main heading</h1>
<p className="text-secondary">Body text</p>
<span className="text-tertiary">Helper text</span>

// ✅ Semantic
<span className="text-success">Trade executed successfully</span>
<span className="text-danger">Invalid input</span>
<span className="text-info">Informational message</span>

// ✅ Trading Sentiment
<span className="text-sentiment-bull">Long position</span>
<span className="text-sentiment-bear">Short position</span>
<span className="text-sentiment-neutral">Sideways market</span>
```

#### Border Colors
```tsx
// ✅ Borders
<div className="border border-subtle">Barely visible border</div>
<div className="border border-moderate">Standard card border</div>
<div className="border border-hover">Interactive hover</div>
<div className="border border-accent">Focus ring</div>
<div className="border border-focus">Keyboard focus</div>
```

#### Complete Component Example
```tsx
// ✅ Good: Tailwind utilities for simple card
export function KPITile({ label, value, trend }: KPITileProps) {
  return (
    <div className="rounded-xl border border-subtle bg-surface p-4">
      <span className="text-xs uppercase tracking-wide text-tertiary">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">{value}</span>
        <span className={trend >= 0 ? 'text-sentiment-bull' : 'text-sentiment-bear'}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      </div>
    </div>
  );
}
```

---

## Pattern 2: CSS Classes (Use for complex effects)

### When to Use

✅ Glassmorphism effects  
✅ Complex gradients  
✅ Multi-layered shadows/glows  
✅ Compound hover animations  
✅ Reusable design patterns (buttons, cards)

### Available CSS Classes

From `src/styles/index.css`:

#### Cards
```css
.card               /* Base card (background, border, shadow) */
.card-elevated      /* Elevated shadow + inset highlight */
.card-glass         /* Glassmorphism (backdrop-filter, blur) */
.card-interactive   /* Hover animations (lift, glow, border) */
.card-bordered      /* Transparent bg, prominent border */
.card-glow          /* Brand glow shadow */
```

#### Buttons
```css
.btn                /* Base button styles */
.btn-primary        /* Brand gradient + glow */
.btn-secondary      /* Subtle background + border */
.btn-ghost          /* Transparent, hover bg */
.btn-outline        /* Border only, hover fill */
.btn-danger         /* Red gradient for destructive */
```

#### Effects
```css
.glass              /* Glassmorphism effect */
.glass-subtle       /* Lighter glass */
.glass-heavy        /* Stronger glass */

.hover-lift         /* Lift on hover (-2px translate) */
.hover-glow         /* Glow on hover */
.hover-scale        /* Scale on hover (1.02) */

.glow-accent        /* Neon accent glow */
.glow-brand         /* Brand glow */
.glow-cyan          /* Cyan glow */
```

#### Elevation
```css
.elevation-low      /* Subtle shadow */
.elevation-medium   /* Standard shadow */
.elevation-high     /* Deep shadow */
.elevation-float    /* Floating shadow + lift */
```

### Examples

#### Glassmorphism Card
```tsx
// ✅ Good: CSS class for complex effect
<div className="card-glass rounded-2xl p-6">
  <h3 className="text-primary font-semibold">Trading Insight</h3>
  <p className="text-secondary">Market structure shows...</p>
</div>

// ❌ Bad: Recreating in Tailwind (too verbose)
<div className="rounded-2xl p-6 bg-surface/70 backdrop-blur-lg border border-border/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
  {/* Way too verbose, hard to maintain */}
</div>
```

#### Interactive Card
```tsx
// ✅ Good: CSS class for hover animations
<div className="card-interactive cursor-pointer" onClick={handleClick}>
  <h3 className="text-primary">Clickable Card</h3>
  {/* Hover: lift, glow, border animate */}
</div>

// ❌ Bad: Manual hover classes
<div className="border border-subtle hover:border-brand/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all">
  {/* Hover effect split across classes, hard to reuse */}
</div>
```

#### Button with Gradient
```tsx
// ✅ Good: CSS class for gradient + glow
<button className="btn-primary px-4 py-2 rounded-xl">
  Save Entry
</button>

// ❌ Bad: Inline gradient
<button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
  {/* Hard to maintain, not reusable */}
</button>
```

---

## Pattern 3: CSS Variables (Rare, advanced cases)

### When to Use

✅ Dynamic opacity values (not available in Tailwind)  
✅ Custom gradients with design tokens  
✅ Programmatic color manipulation  
❌ NOT for simple colors (use Tailwind instead)

### Examples

#### Dynamic Opacity
```tsx
// ✅ Good: Custom opacity not in Tailwind
<div 
  style={{
    background: 'rgb(var(--color-brand) / 0.03)',
    borderColor: 'rgb(var(--color-brand) / 0.15)'
  }}
>
  Extremely subtle brand background (3% opacity)
</div>

// ❌ Bad: Use Tailwind if opacity is standard
<div style={{ background: 'rgb(var(--color-brand) / 0.1)' }}>
  {/* Use bg-brand/10 instead */}
</div>
```

#### Custom Gradient
```tsx
// ✅ Good: Custom gradient with tokens
<div
  style={{
    backgroundImage: `
      linear-gradient(135deg, 
        rgb(var(--color-brand)) 0%, 
        rgb(var(--color-info)) 100%
      )
    `
  }}
>
  Brand to Info gradient
</div>
```

#### Programmatic Colors
```tsx
// ✅ Good: Calculated color based on data
const opacity = Math.min(0.8, confidence / 100);

<div
  style={{
    backgroundColor: `rgb(var(--color-sentiment-bull) / ${opacity})`
  }}
>
  Confidence: {confidence}%
</div>
```

---

## Pattern 4: Chart Colors Utility (Special case)

### When to Use

✅ Chart libraries (LightweightCharts, TradingView)  
✅ Canvas rendering  
✅ Libraries that require RGB strings  
❌ NOT for React components (use Tailwind/CSS)

### Example

```typescript
import { getChartColors } from '@/lib/chartColors';

function MyChart() {
  const colors = getChartColors();
  
  useEffect(() => {
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: colors.background }, // Uses design tokens
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
    });
    
    const candleSeries = chart.addCandlestickSeries({
      upColor: colors.bullColor,
      downColor: colors.bearColor,
      wickUpColor: colors.bullColor,
      wickDownColor: colors.bearColor,
    });
  }, []);
}
```

---

## Pattern Mixing Guidelines

### ✅ Good Mixing (Encouraged)

**CSS class for effect + Tailwind for content:**
```tsx
<div className="card-glass rounded-2xl p-6">
  <h2 className="text-xl font-semibold text-primary">Title</h2>
  <p className="text-sm text-secondary">Description</p>
  <div className="mt-4 flex gap-2">
    <button className="btn-primary px-4 py-2">Save</button>
    <button className="btn-secondary px-4 py-2">Cancel</button>
  </div>
</div>
```

**Why this works**:
- `.card-glass` handles complex background effect
- Tailwind handles simple text/spacing
- No property duplication

---

### ❌ Bad Mixing (Avoid)

**Duplicating properties:**
```tsx
// ❌ Bad: card-glass already sets background
<div className="bg-surface card-glass">
  {/* Redundant, bg-surface overridden by .card-glass */}
</div>

// ✅ Good: Just use card-glass
<div className="card-glass">
  {/* Clean */}
</div>
```

**Mixing semantics:**
```tsx
// ❌ Bad: Mixing direct colors with semantic tokens
<div className="text-zinc-400 border-subtle">
  {/* Inconsistent: use text-tertiary instead */}
</div>

// ✅ Good: All semantic
<div className="text-tertiary border-subtle">
  {/* Consistent */}
</div>
```

---

## Anti-Patterns (Never Do This)

### ❌ 1. Hardcoded Hex Colors

```tsx
// ❌ BAD
<div style={{ backgroundColor: '#18181b' }}>

// ✅ GOOD
<div className="bg-surface">
```

### ❌ 2. Arbitrary Tailwind Values with Colors

```tsx
// ❌ BAD
<div className="bg-[#10b981] text-[#f4f4f5]">

// ✅ GOOD
<div className="bg-brand text-primary">
```

### ❌ 3. Direct Zinc Colors Instead of Semantic

```tsx
// ❌ BAD
<span className="text-zinc-400">Helper text</span>
<div className="bg-zinc-900 border-zinc-800">Card</div>

// ✅ GOOD
<span className="text-tertiary">Helper text</span>
<div className="bg-surface border-subtle">Card</div>
```

### ❌ 4. Inline RGB Values

```tsx
// ❌ BAD
<div style={{ color: 'rgb(161, 161, 170)' }}>

// ✅ GOOD
<div className="text-secondary">
```

### ❌ 5. Mixing Direct Palette Colors

```tsx
// ❌ BAD (inconsistent)
<div className="text-emerald-500 border-zinc-800 bg-slate-900">

// ✅ GOOD (semantic)
<div className="text-sentiment-bull border-subtle bg-surface">
```

---

## Decision Matrix Table

| Use Case | Pattern | Example | Reason |
|----------|---------|---------|--------|
| **Simple background** | Tailwind | `bg-surface` | Fast, standard |
| **Text color** | Tailwind | `text-primary` | Semantic, clear |
| **Border** | Tailwind | `border-subtle` | Standard token |
| **Trading sentiment** | Tailwind | `text-sentiment-bull` | Semantic |
| **Glassmorphism** | CSS Class | `card-glass` | Complex effect |
| **Button gradient** | CSS Class | `btn-primary` | Reusable |
| **Hover lift** | CSS Class | `hover-lift` | Compound animation |
| **Custom opacity (3%)** | CSS Variable | `rgb(var(--color-brand) / 0.03)` | Not in Tailwind |
| **Chart colors** | Utility | `getChartColors()` | Library requirement |
| **Dynamic gradient** | CSS Variable | `linear-gradient(...)` | Programmatic |

---

## Migration Checklist

When updating components to use patterns correctly:

### Before Changing
- [ ] Read component code and understand current pattern
- [ ] Identify which pattern should be used (Tailwind, CSS class, or variable)
- [ ] Check if CSS class exists (don't recreate in Tailwind)
- [ ] Verify visual appearance before change (screenshot)

### Making Changes
- [ ] Replace direct Zinc colors with semantic tokens
- [ ] Remove redundant class combinations
- [ ] Use Tailwind for simple properties
- [ ] Use CSS classes for complex effects
- [ ] Preserve existing functionality

### After Changing
- [ ] Verify visual appearance matches (compare screenshots)
- [ ] Test hover/focus states
- [ ] Test in Dark/Light/OLED modes (if applicable)
- [ ] Run `pnpm lint` and `pnpm typecheck`
- [ ] No console errors

---

## Examples by Component Type

### UI Primitive (Simple)
```tsx
// Button.tsx
export function Button({ variant, children, ...props }: ButtonProps) {
  // ✅ Use CSS classes for complex button variants
  const baseClasses = 'btn'; // From src/styles/index.css
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };
  
  return (
    <button 
      className={cn(baseClasses, variantClasses[variant])}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Card Component
```tsx
// Card.tsx
export function Card({ variant, children, ...props }: CardProps) {
  // ✅ Map variants to CSS classes
  const variantClasses = {
    default: 'card',
    glass: 'card-glass',
    interactive: 'card-interactive',
  };
  
  return (
    <div className={cn(variantClasses[variant], 'rounded-xl p-6')}>
      {/* ✅ Tailwind for simple spacing/rounding */}
      {children}
    </div>
  );
}
```

### Domain Component (Badge)
```tsx
// TradingBadge.tsx
export function TradingBadge({ direction }: { direction: 'long' | 'short' }) {
  // ✅ Tailwind utilities for trading sentiment
  const styles = {
    long: 'border-sentiment-bull-border bg-sentiment-bull-bg text-sentiment-bull',
    short: 'border-sentiment-bear-border bg-sentiment-bear-bg text-sentiment-bear',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase',
      styles[direction]
    )}>
      {direction === 'long' ? 'Long' : 'Short'}
    </span>
  );
}
```

---

## Quick Reference

### Most Common Utilities

```tsx
// Backgrounds
bg-surface           // Default card/panel background
bg-surface-hover     // Hover state background
bg-brand             // Primary CTA background
bg-brand/10          // Subtle brand tint (10%)

// Text
text-primary         // Headings, labels
text-secondary       // Body text, descriptions
text-tertiary        // Helper text, metadata

// Borders
border-subtle        // Barely visible (6% opacity)
border-moderate      // Standard card border (10%)
border-hover         // Interactive hover (15%)
border-accent        // Focus rings (brand color)

// Sentiment (Trading)
text-sentiment-bull  // Bullish/long indicators
text-sentiment-bear  // Bearish/short indicators
```

### Most Common CSS Classes

```tsx
// Cards
.card-glass          // Glassmorphism card
.card-interactive    // Hover animations

// Buttons
.btn-primary         // Brand gradient button
.btn-secondary       // Subtle button

// Effects
.hover-lift          // Lift on hover
.glow-accent         // Neon glow
```

---

## FAQ

### Q: When should I use `text-zinc-400` vs `text-tertiary`?

**A**: Always use `text-tertiary`. It's semantic, adapts to themes, and clearer intent.

### Q: Can I mix `.card-glass` with `bg-surface`?

**A**: No, `.card-glass` already sets background. Use only one.

### Q: How do I create a custom opacity not in Tailwind?

**A**: Use CSS variable: `style={{ background: 'rgb(var(--color-brand) / 0.03)' }}`

### Q: Should I use `.btn-primary` or Tailwind classes for buttons?

**A**: Use `.btn-primary`. It includes gradient, glow, and hover effects that would be verbose in Tailwind.

### Q: What if I need a color that doesn't exist in tokens?

**A**: First check if a semantic token fits. If truly custom, add to `tokens.css` as a new token. Never use hardcoded values.

---

**Last Updated**: 2025-12-05  
**Version**: 1.0.0  
**Maintained By**: Sparkfined Design Team
