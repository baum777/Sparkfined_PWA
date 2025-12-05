# Developer Quick Reference: Design Tokens & Colors

**For**: New developers and quick lookups  
**Last Updated**: 2025-12-05  
**Status**: Production

---

## TL;DR

**Use this**:
```tsx
// ✅ Tailwind utilities (90% of cases)
<div className="bg-surface text-primary border-border" />

// ✅ CSS variables (inline styles, dynamic values)
<div style={{ backgroundColor: 'rgb(var(--color-surface))' }} />

// ✅ Chart colors (LightweightCharts, etc.)
import { getChartColors } from '@/lib/chartColors'
const colors = getChartColors()
```

**NOT this**:
```tsx
// ❌ Hardcoded hex colors
<div style={{ backgroundColor: '#18181b' }} />

// ❌ Hardcoded RGB
<div style={{ color: 'rgb(24, 24, 27)' }} />

// ❌ Direct palette references (unless semantic)
<div className="bg-zinc-900" /> // Use bg-surface instead
```

---

## Quick Decision Tree

```
Need a color?
│
├─ For JSX className?
│  └─ Use Tailwind: bg-surface, text-primary, border-border
│
├─ For inline style?
│  └─ Use CSS Variable: rgb(var(--color-surface))
│
├─ For chart library?
│  └─ Use chartColors: getChartColors().background
│
└─ For custom CSS class?
   └─ Use CSS Variable: background-color: rgb(var(--color-surface));
```

---

## Color Categories

### Background Colors

| Tailwind | CSS Variable | Use Case | Value (Dark) |
|----------|--------------|----------|--------------|
| `bg-bg` | `--color-bg` | Page background | `#0a0a0a` |
| `bg-surface` | `--color-surface` | Cards, panels | `#18181b` |
| `bg-surface-elevated` | `--color-surface-elevated` | Modals, dropdowns | `#1c1c1e` |
| `bg-surface-hover` | `--color-surface-hover` | Hover states | `#27272a` |

**Example**:
```tsx
<div className="bg-surface">Card</div>
```

---

### Text Colors

| Tailwind | CSS Variable | Use Case | Contrast |
|----------|--------------|----------|----------|
| `text-primary` | `--color-text-primary` | Headings, main content | AAA (21:1) |
| `text-secondary` | `--color-text-secondary` | Body text | AAA (9:1) |
| `text-tertiary` | `--color-text-tertiary` | Captions, hints | AA (5:1) |

**Example**:
```tsx
<h1 className="text-primary">Heading</h1>
<p className="text-secondary">Body text</p>
<span className="text-tertiary">Caption</span>
```

---

### Border Colors

| Tailwind | CSS Variable | Use Case |
|----------|--------------|----------|
| `border-border` | `--color-border` | Default borders |
| `border-border-subtle` | `--color-border-subtle` | Subtle dividers |
| `border-border-strong` | `--color-border-strong` | Emphasized borders |

**Example**:
```tsx
<div className="border border-border rounded-lg">
  Card with border
</div>
```

---

### Brand Colors

| Tailwind | CSS Variable | Use Case |
|----------|--------------|----------|
| `bg-brand` | `--color-brand` | Primary buttons | Emerald |
| `bg-brand-hover` | `--color-brand-hover` | Button hover | Emerald (lighter) |
| `text-brand` | `--color-brand` | Links, accents | Emerald |

**Example**:
```tsx
<button className="bg-brand hover:bg-brand-hover text-white">
  Primary Button
</button>
```

---

### Semantic Colors

| Purpose | Tailwind | CSS Variable | When to Use |
|---------|----------|--------------|-------------|
| **Error** | `text-danger` | `--color-danger` | Errors, validation |
| **Success** | `text-success` | `--color-success` | Success messages |
| **Info** | `text-info` | `--color-info` | Information |
| **Warning** | `text-warn` | `--color-warn` | Warnings |

**Example**:
```tsx
<div className="text-danger">Error: Invalid input</div>
<div className="text-success">Success: Saved!</div>
```

---

### Trading Sentiment

| Purpose | Tailwind | CSS Variable | Use Case |
|---------|----------|--------------|----------|
| **Bullish** | `text-sentiment-bull` | `--color-sentiment-bull` | Long, green candles |
| **Bearish** | `text-sentiment-bear` | `--color-sentiment-bear` | Short, red candles |
| **Neutral** | `text-sentiment-neutral` | `--color-sentiment-neutral` | No direction |

**Example**:
```tsx
<span className="text-sentiment-bull">+5.2%</span>
<span className="text-sentiment-bear">-3.1%</span>
```

---

## Common Patterns

### 1. Card Component

```tsx
<div className="bg-surface border border-border rounded-lg p-4">
  <h3 className="text-primary font-medium">Card Title</h3>
  <p className="text-secondary mt-2">Card content goes here</p>
</div>
```

---

### 2. Button (Primary)

```tsx
<button className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg transition-colors">
  Click Me
</button>
```

---

### 3. Button (Secondary)

```tsx
<button className="bg-surface hover:bg-surface-hover text-primary border border-border px-4 py-2 rounded-lg transition-colors">
  Secondary
</button>
```

---

### 4. Input Field

```tsx
<input
  className="bg-surface border border-border text-primary placeholder:text-tertiary px-3 py-2 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
  placeholder="Enter text..."
/>
```

---

### 5. Badge

```tsx
<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand text-white">
  New
</span>
```

---

## When to Use Each Approach

### Use Tailwind Utilities (90% of cases)

**When**:
- Building UI components
- Styling JSX elements
- Need responsive variants (`sm:`, `md:`, `lg:`)
- Need state variants (`hover:`, `focus:`, `active:`)

**Why**:
- Fastest development
- Best IntelliSense support
- Automatic responsive handling
- Consistent with codebase

**Example**:
```tsx
<div className="bg-surface text-primary border-border hover:bg-surface-hover md:text-lg">
  Content
</div>
```

---

### Use CSS Variables (inline styles)

**When**:
- Dynamic values from props/state
- Inline styles required
- Need alpha channel control

**Why**:
- Full alpha control
- Dynamic JavaScript values
- Compatible with third-party libs

**Example**:
```tsx
// With alpha
<div style={{ backgroundColor: 'rgb(var(--color-surface) / 0.5)' }}>
  50% opacity
</div>

// Dynamic
<div style={{ backgroundColor: `rgb(var(--color-${colorName}))` }}>
  Dynamic color
</div>
```

---

### Use Chart Colors Utility

**When**:
- Working with LightweightCharts
- Working with chart libraries that need RGB strings
- Need theme-aware chart colors

**Why**:
- Chart libraries don't support CSS variables directly
- Automatic theme updates
- Cache for performance

**Example**:
```tsx
import { getChartColors } from '@/lib/chartColors'

const colors = getChartColors()

chart.applyOptions({
  layout: {
    background: { color: colors.background },
    textColor: colors.textColor,
  },
  grid: {
    vertLines: { color: colors.gridColor },
    horzLines: { color: colors.gridColor },
  },
})
```

---

### Use Custom CSS Classes

**When**:
- Complex styling (pseudo-elements, animations)
- Shared across many components
- Need complex selectors

**Why**:
- Reusability
- Complex CSS features
- Better performance for repeated use

**Example**:
```css
/* styles.css */
.card-glass {
  background-color: rgb(var(--color-surface) / 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(var(--color-border));
}
```

```tsx
<div className="card-glass">Glassmorphism card</div>
```

---

## Anti-Patterns (DON'T)

### ❌ DON'T: Hardcoded Hex Colors

```tsx
// ❌ Bad
<div style={{ backgroundColor: '#18181b' }}>Content</div>

// ✅ Good
<div className="bg-surface">Content</div>
```

**Why**: Breaks theming, no OLED support, ESLint error

---

### ❌ DON'T: Direct Palette Colors (unless semantic)

```tsx
// ❌ Bad
<div className="bg-zinc-900">Content</div>

// ✅ Good
<div className="bg-surface">Content</div>
```

**Why**: `bg-surface` is semantic and adapts to theme changes

---

### ❌ DON'T: RGB without var()

```tsx
// ❌ Bad
<div style={{ backgroundColor: 'rgb(24, 24, 27)' }}>Content</div>

// ✅ Good
<div style={{ backgroundColor: 'rgb(var(--color-surface))' }}>Content</div>
```

**Why**: Hardcoded RGB doesn't adapt to themes

---

### ❌ DON'T: Mix Patterns Unnecessarily

```tsx
// ❌ Bad (mixing inline styles with Tailwind)
<div className="text-primary" style={{ color: 'rgb(var(--color-text-primary))' }}>
  Redundant
</div>

// ✅ Good (pick one)
<div className="text-primary">Content</div>
```

**Why**: Redundant, harder to maintain

---

## VSCode Snippets

Type these prefixes in VSCode for auto-completion:

| Prefix | Expands To | Use Case |
|--------|------------|----------|
| `bg-surface` | `bg-surface` | Surface background |
| `text-primary` | `text-primary` | Primary text |
| `border-border` | `border-border` | Default border |
| `card-pattern` | Full card JSX | Quick card component |
| `btn-primary` | Full button JSX | Primary button |
| `import-chart-colors` | Import statement | Chart colors import |
| `get-chart-colors` | `const colors = getChartColors()` | Get chart colors |

**Install**: Snippets are in `.vscode/sparkfined.code-snippets`

---

## ESLint Rule

**Enabled**: `sparkfined/no-hardcoded-colors`

**What it does**:
- Warns on hardcoded hex colors (`#18181b`)
- Warns on hardcoded RGB (`rgb(24, 24, 27)`)
- Suggests design tokens

**Example**:
```tsx
// ESLint Warning ⚠️
const bg = '#18181b'
// Suggests: Use bg-surface or rgb(var(--color-surface))
```

**Ignored**:
- Test files (`tests/`)
- Scripts (`scripts/`)
- Storybook (`.storybook/`)

---

## Debugging Colors

### Check Current Theme

```javascript
// Console
document.body.dataset.theme // 'dark' or 'light'
document.body.dataset.oled  // 'true' or 'false'
```

### Check Computed Color

```javascript
// Console
const el = document.querySelector('.bg-surface')
window.getComputedStyle(el).backgroundColor
// Output: 'rgb(24, 24, 27)' (dark mode)
```

### Check Token Value

```javascript
// Console
getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim()
// Output: '24 24 27' (RGB channels)
```

---

## OLED Mode

**What**: Pure black backgrounds (`#000000`) for OLED displays

**When enabled**:
- `--color-bg` → `0 0 0` (pure black)
- `--color-surface` → `8 8 8` (near-black)
- `--color-surface-elevated` → `12 12 12`

**Enable**:
```javascript
localStorage.setItem('oled-mode', 'true')
document.body.dataset.oled = 'true'
```

**Benefits**:
- 20-30% battery savings on OLED displays
- Reduced eye strain
- Minimized screen burn-in

**Usage**: All design tokens automatically adapt. No code changes needed.

---

## Resources

### Documentation

- **Full Color System**: `docs/design/colors.md`
- **Pattern Decision Matrix**: `docs/design/pattern-decision-matrix.md`
- **Migration Guide**: `docs/design/colors.md` (bottom)
- **Roadmap**: `docs/design/color-integration-roadmap.md`

### Code

- **Tokens**: `src/styles/tokens.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Chart Colors**: `src/lib/chartColors.ts`
- **ESLint Rule**: `eslint-rules/no-hardcoded-colors.js`

### Tools

- **VSCode Snippets**: `.vscode/sparkfined.code-snippets`
- **VSCode Settings**: `.vscode/settings.json`
- **Extensions**: `.vscode/extensions.json`

---

## FAQ

**Q: When should I use direct Zinc colors (`bg-zinc-900`)?**  
A: Rarely. Only if you need a specific shade not covered by semantic tokens. Prefer `bg-surface`, `bg-surface-elevated`, etc.

**Q: How do I add alpha to a design token?**  
A: Use CSS variable syntax with alpha:
```tsx
<div style={{ backgroundColor: 'rgb(var(--color-surface) / 0.5)' }}>
  50% opacity
</div>
```

**Q: Why does my chart not update colors on theme change?**  
A: Use `subscribeToThemeChanges()` from `chartColors.ts`:
```tsx
useEffect(() => {
  const unsubscribe = subscribeToThemeChanges()
  return unsubscribe
}, [])
```

**Q: Can I use hex colors in tests?**  
A: Yes, hardcoded colors are allowed in `tests/` folder (ESLint ignores).

**Q: How do I check if OLED mode is enabled?**  
A: Check `document.body.dataset.oled === 'true'`

---

## Cheat Sheet (Print this!)

```
BACKGROUNDS:
  bg-bg, bg-surface, bg-surface-elevated, bg-surface-hover
  bg-brand, bg-brand-hover

TEXT:
  text-primary, text-secondary, text-tertiary
  text-brand, text-brand-hover
  
BORDERS:
  border-border, border-border-subtle, border-border-strong

SEMANTIC:
  text-danger, text-success, text-info, text-warn
  bg-danger, bg-success, bg-info, bg-warn

TRADING:
  text-sentiment-bull, text-sentiment-bear, text-sentiment-neutral

CSS VARIABLES:
  rgb(var(--color-*))
  
CHARTS:
  import { getChartColors } from '@/lib/chartColors'
  const colors = getChartColors()
  
PATTERNS:
  Tailwind (90%) → className="bg-surface text-primary"
  CSS Var (inline) → style={{ backgroundColor: 'rgb(var(--color-surface))' }}
  Chart (libs) → getChartColors().background
```

---

**Created**: 2025-12-05  
**Author**: AI Assistant (Claude Sonnet 4.5)  
**Phase**: 5 (Developer Experience)  
**Status**: Production-Ready ✅
