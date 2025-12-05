# Design Token Quick Reference Card

> **📌 Printable Version** — Print on A4/Letter, fold into pocket guide  
> **Version**: 1.0.0 | **Date**: 2025-12-05 | **Project**: Sparkfined PWA

---

## 🎨 Color Token Cheat Sheet

### Quick Decision Tree

```
Need a color?
│
├─ Background/Surface? ────────► bg-surface, bg-bg
├─ Text? ──────────────────────► text-primary, text-secondary, text-tertiary
├─ Button/Action? ─────────────► bg-brand hover:bg-brand-hover
├─ Trading Indicator? ─────────► text-sentiment-{bull|bear|neutral}
├─ System Feedback? ───────────► text-{success|danger|warn|info}
└─ Border? ────────────────────► border-border, border-subtle
```

---

## 📦 Core Tokens (Use 90% of the time)

### Backgrounds

| Tailwind | Purpose | Dark | OLED |
|----------|---------|------|------|
| `bg-bg` | Page root | `#0a0a0a` | `#000000` |
| `bg-surface` | Cards | `#18181b` | `#080808` |
| `bg-surface-elevated` | Modals | `#1c1c1e` | `#0c0c0c` |
| `bg-surface-hover` | Hover | `#27272a` | `#121212` |

### Text

| Tailwind | Purpose | Contrast |
|----------|---------|----------|
| `text-primary` | Headings | 20.8:1 ✅ |
| `text-secondary` | Body | 8.9:1 ✅ |
| `text-tertiary` | Helper | 5.2:1 ✅ |

### Brand

| Tailwind | Purpose |
|----------|---------|
| `bg-brand` | Primary button |
| `hover:bg-brand-hover` | Button hover |
| `text-brand` | Links, accents |

### Borders

| Tailwind | Purpose |
|----------|---------|
| `border-border` | Default |
| `border-subtle` | Faint lines |
| `ring-brand` | Focus ring |

---

## 📈 Semantic Colors (Trading-Specific)

### Sentiment

| State | Tailwind | Hex |
|-------|----------|-----|
| **Bullish** | `text-sentiment-bull` | `#22c55e` 🟢 |
| **Bearish** | `text-sentiment-bear` | `#f43f5e` 🔴 |
| **Neutral** | `text-sentiment-neutral` | `#f59e0b` 🟡 |

### System Feedback

| Type | Tailwind | Hex |
|------|----------|-----|
| **Success** | `text-success` | `#10b981` ✅ |
| **Danger** | `text-danger` | `#f43f5e` ❌ |
| **Warning** | `text-warn` | `#f59e0b` ⚠️ |
| **Info** | `text-info` | `#06b6d4` ℹ️ |

---

## 🔧 Common Patterns

### Card

```tsx
<div className="bg-surface border border-border rounded-lg p-4">
  <h3 className="text-primary font-medium">Title</h3>
  <p className="text-secondary mt-2">Body</p>
</div>
```

### Primary Button

```tsx
<button className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg transition-colors">
  Save
</button>
```

### Input Field

```tsx
<input className="bg-surface border border-border text-primary px-3 py-2 rounded-lg focus:ring-2 focus:ring-brand" />
```

### Price Display (Trading)

```tsx
<span className="text-sentiment-bull font-mono">+5.2%</span>
<span className="text-sentiment-bear font-mono">-3.1%</span>
```

---

## ⚡ Anti-Patterns (DON'T DO THIS)

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `bg-zinc-900` | `bg-surface` |
| `text-zinc-400` | `text-secondary` |
| `text-green-500` | `text-sentiment-bull` |
| `border-zinc-800` | `border-border` |
| `style={{ color: '#0fb34c' }}` | `className="text-brand"` |

---

## 🌙 OLED Mode

**What**: Pure black backgrounds for OLED displays  
**How**: Settings → OLED Mode toggle  
**Result**: Automatic theme adaptation (no code changes needed)

**Battery Savings**: 20-30% on OLED devices

---

## 🔍 Advanced Usage

### CSS Variables (with alpha)

```tsx
// 50% opacity
<div style={{ backgroundColor: 'rgb(var(--color-surface) / 0.5)' }}>
  Semi-transparent
</div>
```

### Chart Colors

```tsx
import { getChartColors } from '@/lib/chartColors'

const colors = getChartColors()
chart.applyOptions({
  layout: { background: { color: colors.background } }
})
```

### Dynamic Color

```tsx
const colorMap = {
  long: 'text-sentiment-bull',
  short: 'text-sentiment-bear',
}
<span className={colorMap[direction]}>{value}</span>
```

---

## 📚 VSCode Snippets

Type these prefixes in `.tsx` files:

| Prefix | Expands To |
|--------|------------|
| `bg-surface` | `bg-surface` |
| `text-primary` | `text-primary` |
| `card-pattern` | Full card component |
| `button-primary` | Primary button |
| `input-field` | Input field |

Install: `.vscode/sparkfined.code-snippets` (auto-loaded)

---

## 🚨 ESLint Rule

**Rule**: `sparkfined/no-hardcoded-colors`  
**Level**: `warn`

**Catches**:
- `#hex` colors in JSX
- `rgba(...)` in inline styles
- Hardcoded `background-color`, `color`, `borderColor`

**Suggests**:
- Tailwind utilities (`bg-surface`)
- Design tokens (`--color-surface`)
- Chart utilities (`getChartColors()`)

---

## 📖 Full Documentation

- **Complete Token List**: [docs/design/colors.md](colors.md)
- **Developer Guide**: [docs/design/developer-quick-reference.md](developer-quick-reference.md)
- **Pattern Guide**: [docs/design/pattern-decision-matrix.md](pattern-decision-matrix.md)
- **UI Style Guide**: [docs/UI_STYLE_GUIDE.md](../UI_STYLE_GUIDE.md)

---

## 🎯 Quick Tips

1. **Always use semantic tokens** (not direct Zinc/Emerald)
2. **Prefer Tailwind utilities** (not inline styles)
3. **Use `text-primary/secondary/tertiary`** for text hierarchy
4. **Use `text-sentiment-{bull|bear|neutral}`** for trading indicators
5. **Use `bg-brand`** for primary actions
6. **Use `border-border`** for default borders
7. **Never hardcode hex colors** (ESLint will warn you)

---

## 🔖 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-05 | Initial release with OLED support |

---

**💡 Pro Tip**: Print this page double-sided, fold in half, and keep at your desk for instant reference!

**🐛 Found an issue?** Update [docs/design/colors.md](colors.md) and regenerate this card.

---

*Made with ❤️ by the Sparkfined Team*
