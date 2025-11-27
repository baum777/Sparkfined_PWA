# UI Primitives Guide

The UI primitives layer exists to keep typography, spacing, and color decisions consistent across the app. Each primitive wraps our Tailwind design tokens (`bg-surface`, `text-text-primary`, `border-border-subtle`, etc.) so feature components stay lean and future branding changes remain low-effort.

Currently available primitives:

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | `src/components/ui/Button.tsx` | Actions / CTAs with shared variants & focus states |
| `Card` | `src/components/ui/Card.tsx` | Elevated surfaces with optional interactive affordances |
| `Badge` | `src/components/ui/Badge.tsx` | Inline status or tag labels tied to sentiment tokens |
| `Input` | `src/components/ui/Input.tsx` | Text inputs with helper/error text, icons, and mono mode |

## Button

- **Variants:** `primary`, `secondary`, `ghost`, `outline`
- **Sizes:** `sm`, `md`, `lg`
- **Tokens:** brand gradients for `primary`, `surface-subtle` for neutrals, `border-border-moderate` for outlines
- **API extras:** `isLoading`/`loading`, `leftIcon`, `rightIcon`, `className` passthrough

```tsx
import Button from '@/components/ui/Button'
import { Share2 } from '@/lib/icons'

<Button variant="outline" size="sm" leftIcon={<Share2 className="h-4 w-4" />}>
  Share snapshot
</Button>
```

## Card

- Variants: `default`, `muted`, `interactive`
- Adds `rounded-2xl`, `p-6`, `shadow-card-subtle` backed by `bg-surface` tokens
- `interactive` (or any `onClick`) adds cursor + keyboard handling
- Subcomponents: `CardHeader`, `CardFooter` with sensible spacing defaults

```tsx
import { Card, CardHeader, CardFooter } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <h3 className="text-base font-semibold text-text-primary">Journal snapshot</h3>
    <p className="text-sm text-text-secondary">Latest 3 entries</p>
  </CardHeader>
  {/* ... */}
  <CardFooter className="justify-end">
    <Button size="sm" variant="ghost">Open journal</Button>
  </CardFooter>
</Card>
```

## Badge

- Variants: `default`, `success`, `warning`, `danger`, `outline`
- Uses sentiment tokens (`sentiment-bull`, `sentiment-bear`) to avoid ad-hoc color classes
- Keeps typography consistent (`text-[11px]`, uppercase tracking)

```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="success">Live</Badge>
<Badge variant="outline" className="bg-surface-subtle">⚠️ Alerts</Badge>
```

## Input

- Forwarded refs, `label`, `helperText`, `error`
- Optional `leftIcon`, `rightIcon`, `mono`
- Applies `bg-surface-subtle`, `border-border-moderate`, and `focus-visible:ring-border-focus`

```tsx
import Input from '@/components/ui/Input'
import { Search } from '@/lib/icons'

<Input
  label="Token symbol"
  placeholder="SOL, ETH, BTC…"
  leftIcon={<Search className="h-4 w-4" />}
/>
```

## Theme Integration

All primitives assume the global `ThemeProvider` (`src/lib/theme/theme-provider.tsx`) sets `dark` on `<html>` exactly once. Components should **never** call `classList.toggle('dark')` or inspect `prefers-color-scheme` directly. Use the hook:

```ts
import { useTheme } from '@/lib/theme/useTheme'

const { theme, resolvedTheme, setTheme } = useTheme()
```

## When to add/edit a primitive

- **Add** a primitive when: a pattern shows up in ≥3 places, or involves more than two token families (colors + typography + spacing).
- **Extend** an existing primitive via the `className` prop before creating a new prop.
- **Avoid** one-off Tailwind stacks in feature components for buttons, badges, cards, or inputs; reach for the primitives first.

## Migration checklist

1. Replace raw elements (`<button>`, `<div className="rounded-2xl ...">`) with primitives.
2. Keep layout responsibilities (grid/flex positioning) in the feature component.
3. Use variants instead of hand-picked color classes; tokens should only leak for layout-specific tweaks (`gap`, `w-full`, etc.).
4. Confirm focus-visible styles remain intact (keyboard navigation).

First adopter: `ChartPageV2` now relies on `Button`, `Card`, and `Badge`, serving as the pilot for future migrations.
