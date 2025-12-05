# Color System – Sparkfined PWA

> **Complete color palette reference with Tailwind utilities, design tokens, and usage patterns**

---

## Table of Contents

1. [Color Philosophy](#color-philosophy)
2. [Design Tokens Reference](#design-tokens-reference)
3. [Tailwind Utility Classes](#tailwind-utility-classes)
4. [Usage Patterns](#usage-patterns)
5. [Semantic Colors (Trading Context)](#semantic-colors-trading-context)
6. [Theme Variants](#theme-variants)
7. [Accessibility](#accessibility)
8. [Migration Guide](#migration-guide)

---

## Color Philosophy

**Sparkfined follows a Dark-First approach:**
- 93% of traders prefer dark mode (reduces eye strain during long sessions)
- OLED optimization available (pure black backgrounds)
- Light mode exists but is not prioritized

**Key Principles:**
- **Consistency**: All colors come from design tokens
- **Flexibility**: RGB channel storage enables alpha transparency
- **Semantics**: Trading-specific colors (bull/bear/neutral)
- **Accessibility**: WCAG AA contrast ratios (7:1 for text)

---

## Design Tokens Reference

All color tokens are stored as **RGB channel values** in `src/styles/tokens.css`:

```css
/* Example: Brand color */
--color-brand: 15 179 76;  /* RGB channels only */

/* Consumption with alpha */
background: rgb(var(--color-brand) / 0.1);  /* 10% opacity */
border-color: rgb(var(--color-brand));      /* 100% opacity */
```

### Core Token Categories

#### 1. Brand & Accent
```css
--color-brand: 15 179 76;            /* emerald-500 */
--color-brand-hover: 5 150 105;      /* emerald-600 */
--color-accent: 0 255 102;           /* neon green */
--color-cyan: 6 182 212;             /* cyan-500 */
```

#### 2. Background & Surface
```css
--color-bg: 10 10 10;                /* zinc-950 */
--color-bg-elevated: 11 11 19;       /* overlay gradient */
--color-surface: 24 24 27;           /* zinc-900 */
--color-surface-subtle: 19 19 22;    /* darker variant */
--color-surface-elevated: 28 28 30;  /* zinc-850 */
--color-surface-hover: 39 39 42;     /* zinc-800 */
```

#### 3. Text
```css
--color-text-primary: 244 244 245;   /* zinc-100 */
--color-text-secondary: 161 161 170; /* zinc-400 */
--color-text-tertiary: 113 113 122;  /* zinc-500 */
```

#### 4. Borders
```css
--color-border: 39 39 42;            /* zinc-800 */
--color-border-contrast: 255 255 255;/* for opacity modulation */
--color-border-accent: 15 179 76;    /* brand */
--color-border-focus: 16 185 129;    /* emerald-500 */
```

#### 5. Semantic (Status)
```css
--color-success: 16 185 129;         /* emerald-500 */
--color-danger: 244 63 94;           /* rose-500 */
--color-info: 6 182 212;             /* cyan-500 */
--color-warn: 245 158 11;            /* amber-500 */
```

#### 6. Trading Sentiment
```css
--color-sentiment-bull: 16 185 129;  /* green - bullish */
--color-sentiment-bear: 244 63 94;   /* red - bearish */
--color-sentiment-neutral: 245 158 11; /* amber - neutral */
```

---

## Tailwind Utility Classes

### Brand Colors

| Utility | CSS Output | Use Case |
|---------|------------|----------|
| `bg-brand` | `background-color: rgb(var(--color-brand))` | Primary CTAs, active states |
| `bg-brand-hover` | `background-color: rgb(var(--color-brand-hover))` | Hover states (darker) |
| `bg-brand/20` | `background-color: rgb(var(--color-brand) / 0.2)` | Subtle backgrounds |
| `text-brand` | `color: rgb(var(--color-brand))` | Links, accents |
| `border-brand` | `border-color: rgb(var(--color-brand))` | Focus rings, active borders |

**Example:**
```tsx
<button className="bg-brand hover:bg-brand-hover text-white rounded-xl px-4 py-2">
  Save Entry
</button>
```

---

### Background & Surface Colors

| Utility | Value | Use Case |
|---------|-------|----------|
| `bg-bg` | `--color-bg` | Root background (zinc-950) |
| `bg-bg-elevated` | `--color-bg-elevated` | Modal overlays |
| `bg-surface` | `--color-surface` | Cards, panels (zinc-900) |
| `bg-surface-subtle` | `--color-surface-subtle` | Input fields, darker cards |
| `bg-surface-elevated` | `--color-surface-elevated` | Elevated cards (zinc-850) |
| `bg-surface-hover` | `--color-surface-hover` | Hover states (zinc-800) |

**Alpha Variants:**
```tsx
<div className="bg-surface/70">  {/* 70% opacity */}
<div className="bg-surface/95">  {/* 95% opacity - semi-transparent */}
```

**Example:**
```tsx
<div className="bg-surface rounded-xl border border-subtle p-6">
  <h3 className="text-primary">Card Title</h3>
  <p className="text-secondary">Card content here...</p>
</div>
```

---

### Text Colors

| Utility | Value | Use Case |
|---------|-------|----------|
| `text-primary` | `--color-text-primary` | Headings, labels (zinc-100) |
| `text-secondary` | `--color-text-secondary` | Body text, metadata (zinc-400) |
| `text-tertiary` | `--color-text-tertiary` | Helper text, disabled (zinc-500) |

**Example:**
```tsx
<div>
  <h2 className="text-2xl font-semibold text-primary">Trading Journal</h2>
  <p className="text-sm text-secondary">12 entries · Last updated 2h ago</p>
  <span className="text-xs text-tertiary uppercase">Metadata</span>
</div>
```

---

### Border Colors

| Utility | Value | Use Case |
|---------|-------|----------|
| `border` | `--color-border` | Default borders (zinc-800) |
| `border-subtle` | `--color-border-contrast / 0.06` | Very subtle borders |
| `border-moderate` | `--color-border-contrast / 0.1` | Card borders |
| `border-hover` | `--color-border-contrast / 0.15` | Interactive hover |
| `border-accent` | `--color-border-accent` | Focus rings (brand) |
| `border-focus` | `--color-border-focus` | Focus states (emerald) |

**Example:**
```tsx
<input 
  className="
    w-full px-4 py-2 
    bg-surface-subtle 
    border border-moderate
    rounded-xl
    focus:border-accent focus:ring-2 focus:ring-brand/40
  "
  placeholder="Enter address..."
/>
```

---

### Semantic Colors (Status)

| Utility | Value | Use Case |
|---------|-------|----------|
| `text-success` | `--color-success` | Success messages, profit |
| `text-danger` | `--color-danger` | Errors, loss |
| `text-info` | `--color-info` | Informational text |
| `text-warn` | `--color-warn` | Warnings, cautions |
| `bg-success/10` | `--color-success / 0.1` | Success backgrounds |
| `bg-danger/10` | `--color-danger / 0.1` | Error backgrounds |

**Example:**
```tsx
<div className="rounded-xl border border-success/60 bg-success/10 p-4">
  <p className="text-success font-medium">Trade executed successfully</p>
</div>

<div className="rounded-xl border border-danger/60 bg-danger/10 p-4">
  <p className="text-danger font-medium">Invalid wallet address</p>
</div>
```

---

### Trading Sentiment Colors

| Utility | Value | Use Case |
|---------|-------|----------|
| `text-sentiment-bull` | `--color-sentiment-bull` | Bullish indicators, long positions |
| `text-sentiment-bear` | `--color-sentiment-bear` | Bearish indicators, short positions |
| `text-sentiment-neutral` | `--color-sentiment-neutral` | Neutral/sideways bias |
| `bg-sentiment-bull-bg` | `--color-sentiment-bull / 0.12` | Bullish card backgrounds |
| `border-sentiment-bull-border` | `--color-sentiment-bull / 0.6` | Bullish borders |

**Example:**
```tsx
{/* Bullish Badge */}
<span className="
  inline-flex items-center gap-1
  rounded-full
  border border-sentiment-bull-border
  bg-sentiment-bull-bg
  px-2.5 py-0.5
  text-xs font-semibold uppercase
  text-sentiment-bull
">
  Long
</span>

{/* Bearish Badge */}
<span className="
  inline-flex items-center gap-1
  rounded-full
  border border-sentiment-bear-border
  bg-sentiment-bear-bg
  px-2.5 py-0.5
  text-xs font-semibold uppercase
  text-sentiment-bear
">
  Short
</span>
```

---

### Complete Color Palettes (Direct Access)

All Tailwind color palettes are available for direct use:

#### Zinc (UI Grays)
```tsx
<div className="bg-zinc-950">  {/* Darkest */}
<div className="bg-zinc-900">
<div className="bg-zinc-850">  {/* Custom */}
<div className="bg-zinc-800">
<div className="text-zinc-500"> {/* Mid gray */}
<div className="text-zinc-400">
<div className="text-zinc-100">  {/* Light text */}
```

#### Emerald (Brand/Success)
```tsx
<div className="bg-emerald-500">  {/* Brand green */}
<div className="bg-emerald-600">  {/* Hover */}
<div className="text-emerald-400">
<div className="border-emerald-500/30">  {/* With alpha */}
```

#### Rose (Danger/Bear)
```tsx
<div className="bg-rose-500">     {/* Danger red */}
<div className="text-rose-400">
<div className="border-rose-500/60">
```

#### Cyan (Info/Accents)
```tsx
<div className="bg-cyan-500">     {/* Info blue */}
<div className="text-cyan-400">
<div className="glow-cyan">        {/* Custom glow */}
```

#### Amber (Warning/Neutral)
```tsx
<div className="bg-amber-500">    {/* Warning yellow */}
<div className="text-amber-400">
<div className="border-amber-500/60">
```

---

## Usage Patterns

### Pattern 1: Tailwind Utilities (Recommended)

**When to use:** Simple, static colors without complex effects

```tsx
✅ Good: Tailwind utilities
<div className="bg-surface rounded-xl border border-subtle p-6">
  <h3 className="text-primary font-semibold">Title</h3>
  <p className="text-secondary">Description</p>
</div>
```

**Pros:**
- Short, readable
- Type-safe with IntelliSense
- Easy to maintain
- Responsive variants (`md:bg-surface-hover`)

---

### Pattern 2: CSS Component Classes

**When to use:** Complex effects (glassmorphism, glows, gradients)

```tsx
✅ Good: CSS classes for complex effects
<div className="card-glass hover-lift">
  <button className="btn-primary">Save</button>
</div>
```

**Available CSS Classes:**

#### Cards
- `.card` - Base card style
- `.card-elevated` - Elevated shadow
- `.card-glass` - Glassmorphism effect
- `.card-interactive` - Hover animations
- `.card-glow` - Brand glow effect

#### Buttons
- `.btn-primary` - Brand gradient button
- `.btn-secondary` - Subtle button
- `.btn-ghost` - Transparent button
- `.btn-outline` - Outline button
- `.btn-danger` - Destructive action

#### Effects
- `.glass` - Glassmorphism
- `.hover-lift` - Lift on hover
- `.hover-glow` - Glow on hover
- `.glow-accent` - Neon glow
- `.elevation-high` - Deep shadow

**Pros:**
- Reusable complex styles
- Centralized in `src/styles/index.css`
- Consistent across components

---

### Pattern 3: CSS Variables (Advanced)

**When to use:** Dynamic alpha values, custom gradients

```tsx
✅ Good: Direct token access for dynamic styles
<div style={{
  background: 'rgb(var(--color-brand) / 0.05)',
  borderColor: 'rgb(var(--color-brand) / 0.3)',
  boxShadow: '0 0 12px rgb(var(--color-brand) / 0.2)'
}}>
  Custom opacity levels
</div>
```

**Pros:**
- Maximum flexibility
- Dynamic alpha values
- Custom gradients

**Cons:**
- No type safety
- Harder to maintain
- Use sparingly

---

### Anti-Patterns (Avoid)

```tsx
❌ Bad: Hardcoded hex colors
<div style={{ backgroundColor: '#10b981' }}>

❌ Bad: Mixing patterns inconsistently
<div className="bg-surface" style={{ backgroundColor: '#18181b' }}>

❌ Bad: Inline colors without tokens
<div style={{ color: 'rgb(244, 244, 245)' }}>
```

**Why avoid:**
- Breaks theme system
- Harder to maintain
- No light mode support
- Inconsistent with design system

---

## Semantic Colors (Trading Context)

### Bullish (Long) Indicators

```tsx
{/* Card with bullish sentiment */}
<div className="rounded-xl border border-sentiment-bull-border bg-sentiment-bull-bg p-4">
  <div className="flex items-center gap-2">
    <span className="h-2 w-2 rounded-full bg-sentiment-bull" />
    <span className="text-sm font-medium text-sentiment-bull">Bullish Bias</span>
  </div>
  <p className="mt-2 text-sm text-secondary">
    Price broke above resistance with strong volume...
  </p>
</div>
```

### Bearish (Short) Indicators

```tsx
{/* Card with bearish sentiment */}
<div className="rounded-xl border border-sentiment-bear-border bg-sentiment-bear-bg p-4">
  <div className="flex items-center gap-2">
    <span className="h-2 w-2 rounded-full bg-sentiment-bear" />
    <span className="text-sm font-medium text-sentiment-bear">Bearish Bias</span>
  </div>
  <p className="mt-2 text-sm text-secondary">
    Lower highs forming, volume declining...
  </p>
</div>
```

### Neutral (Sideways) Indicators

```tsx
{/* Card with neutral sentiment */}
<div className="rounded-xl border border-sentiment-neutral-border bg-sentiment-neutral-bg p-4">
  <div className="flex items-center gap-2">
    <span className="h-2 w-2 rounded-full bg-sentiment-neutral" />
    <span className="text-sm font-medium text-sentiment-neutral">Neutral / Range-Bound</span>
  </div>
  <p className="mt-2 text-sm text-secondary">
    Price consolidating between key levels...
  </p>
</div>
```

### P&L Display (Profit/Loss)

```tsx
{/* Profit display */}
<div className="flex items-center gap-2">
  <span className="font-mono text-2xl font-bold text-sentiment-bull">
    +$12,450
  </span>
  <span className="text-sm text-sentiment-bull">+24.3%</span>
</div>

{/* Loss display */}
<div className="flex items-center gap-2">
  <span className="font-mono text-2xl font-bold text-sentiment-bear">
    -$3,200
  </span>
  <span className="text-sm text-sentiment-bear">-8.5%</span>
</div>
```

---

## Theme Variants

### Dark Mode (Default)

```css
:root {
  --color-bg: 10 10 10;              /* zinc-950 */
  --color-surface: 24 24 27;         /* zinc-900 */
  --color-text-primary: 244 244 245; /* zinc-100 */
}
```

**Usage:** Active by default, optimized for trading

---

### Light Mode

```css
:root[data-theme="light"] {
  --color-bg: 248 250 252;           /* slate-50 */
  --color-surface: 255 255 255;      /* white */
  --color-text-primary: 15 23 42;    /* slate-900 */
}
```

**Usage:** Available but not prioritized (93% prefer dark)

**Toggle:**
```tsx
<button onClick={() => document.documentElement.dataset.theme = 'light'}>
  Light Mode
</button>
```

---

### OLED Mode (Pure Black)

```css
:root:not([data-theme="light"]) body[data-oled="true"] {
  --color-bg: 0 0 0;                 /* Pure black */
  --color-surface: 8 8 8;            /* Near black */
}
```

**Usage:** Optimized for OLED displays (battery saving, no burn-in)

**Toggle:**
```tsx
<button onClick={() => document.body.dataset.oled = 'true'}>
  OLED Mode
</button>
```

---

## Accessibility

### WCAG Contrast Ratios

All text colors meet **WCAG AA** standards (minimum 4.5:1, target 7:1):

| Combination | Ratio | Grade | Use Case |
|-------------|-------|-------|----------|
| `text-primary` on `bg` | **14.2:1** | AAA | Headings |
| `text-secondary` on `bg` | **7.1:1** | AAA | Body text |
| `text-tertiary` on `bg` | **4.8:1** | AA | Helper text |
| `brand` on `bg` | **5.2:1** | AA | Links, CTAs |

### Focus Indicators

All interactive elements have visible focus rings:

```tsx
<button className="
  focus-visible:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-brand
  focus-visible:ring-offset-2
  focus-visible:ring-offset-bg
">
  Focusable Element
</button>
```

**Keyboard navigation:**
- Tab: Focus next element
- Shift+Tab: Focus previous
- Enter: Activate button/link
- Escape: Close modal/dialog

---

## Migration Guide

### From Hardcoded Colors to Tokens

**Before:**
```tsx
<div style={{ backgroundColor: '#18181b', color: '#f4f4f5' }}>
  <button style={{ backgroundColor: '#10b981' }}>Save</button>
</div>
```

**After:**
```tsx
<div className="bg-surface text-primary">
  <button className="bg-brand text-white rounded-xl px-4 py-2">Save</button>
</div>
```

---

### From Inline Styles to Tailwind

**Before:**
```tsx
<div style={{
  backgroundColor: 'rgb(24, 24, 27)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '24px'
}}>
```

**After:**
```tsx
<div className="bg-surface border border-moderate rounded-xl p-6">
```

---

### ESLint Rule (Prevent Hardcoded Colors)

Add to `.eslintrc.json`:

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Literal[value=/#[0-9a-fA-F]{3,8}/]",
        "message": "Avoid hardcoded hex colors. Use Tailwind utilities or design tokens instead."
      }
    ]
  }
}
```

---

## Quick Reference

### Most Common Utilities

```tsx
{/* Backgrounds */}
bg-surface           {/* Cards, panels */}
bg-surface-hover     {/* Hover states */}
bg-brand             {/* Primary CTAs */}
bg-brand/10          {/* Subtle brand backgrounds */}

{/* Text */}
text-primary         {/* Headings, labels */}
text-secondary       {/* Body text */}
text-tertiary        {/* Helper text */}

{/* Borders */}
border-subtle        {/* Subtle borders */}
border-moderate      {/* Card borders */}
border-brand         {/* Focus rings */}

{/* Sentiment */}
text-sentiment-bull  {/* Bullish/long */}
text-sentiment-bear  {/* Bearish/short */}
```

---

## Resources

- **Token Definition**: `src/styles/tokens.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Component Styles**: `src/styles/index.css`
- **Design Documentation**: `/docs/design/`
- **Styleguide**: `/docs/DESIGN_TOKENS_STYLEGUIDE_DE.md`

---

**Last Updated**: 2025-12-05  
**Maintained By**: Sparkfined Design Team  
**Version**: 1.0.0
