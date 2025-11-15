# Component-Library — Detaillierte Spezifikationen

> **Zweck:** Zentrale Spezifikation aller UI-Components mit Maßen, Varianten, States
> **Zielgruppe:** Frontend-Entwickler, Designer
> **Status:** Design-Spezifikation

---

## Inhaltsverzeichnis

1. [UI-Primitives](#1-ui-primitives)
2. [Composed-Components](#2-composed-components)
3. [Section-Components](#3-section-components)
4. [Layout-Components](#4-layout-components)
5. [States & Variants](#5-states--variants)
6. [Accessibility-Specs](#6-accessibility-specs)

---

## 1. UI-Primitives

### 1.1 Button

#### Variants

**Primary (Emerald):**
```tsx
<Button variant="primary">
  Save Entry
</Button>
```

**Maße & Styling:**
- **Background:** bg-emerald-500, hover:bg-emerald-600
- **Text:** text-white, font-semibold (600)
- **Border:** none
- **Shadow:** shadow-sm, hover:shadow-md
- **Transition:** all 150ms

**Secondary (Zinc):**
```tsx
<Button variant="secondary">
  Cancel
</Button>
```

**Maße & Styling:**
- **Background:** bg-zinc-800, hover:bg-zinc-700
- **Text:** text-zinc-100, font-medium (500)
- **Border:** border border-zinc-700

**Ghost (Transparent):**
```tsx
<Button variant="ghost">
  Delete
</Button>
```

**Maße & Styling:**
- **Background:** transparent, hover:bg-zinc-800
- **Text:** text-zinc-400, hover:text-zinc-200
- **Border:** none

**Danger/Destructive (Rose):**
```tsx
<Button variant="danger">
  Delete Entry
</Button>
```

**Maße & Styling:**
- **Background:** bg-rose-500, hover:bg-rose-600
- **Text:** text-white, font-semibold (600)

#### Sizes

```tsx
// Small
<Button size="sm">Small</Button>
// px-3 py-1.5, text-sm (14px)

// Medium (Default)
<Button size="md">Medium</Button>
// px-4 py-2, text-base (16px)

// Large
<Button size="lg">Large</Button>
// px-6 py-3, text-lg (18px)
```

#### States

**Loading:**
```tsx
<Button isLoading={true}>
  <Spinner /> Saving...
</Button>
```
- **Opacity:** opacity-70
- **Cursor:** cursor-not-allowed
- **Spinner:** 16×16px (sm), 20×20px (md), 24×24px (lg)

**Disabled:**
```tsx
<Button disabled={true}>
  Save
</Button>
```
- **Opacity:** opacity-50
- **Cursor:** cursor-not-allowed
- **Pointer-Events:** none

#### With Icons

**Left-Icon:**
```tsx
<Button leftIcon={<PlusIcon />}>
  New Entry
</Button>
```

**Right-Icon:**
```tsx
<Button rightIcon={<ArrowRightIcon />}>
  Next
</Button>
```

**Icon-Spacing:** gap-2 (8px)

---

### 1.2 Input

#### Variants

**Text-Input:**
```tsx
<Input
  type="text"
  placeholder="Enter title..."
  label="Entry-Title"
  helperText="Max 100 characters"
/>
```

**Maße & Styling:**
- **Height:** h-11 (44px) - Mobile-Touch-Target
- **Padding:** px-4
- **Background:** bg-zinc-800, focus:bg-zinc-900
- **Border:** border border-zinc-700, focus:border-emerald-500
- **Border-Radius:** rounded-md (8px)
- **Text:** text-base (16px), text-zinc-100
- **Placeholder:** text-zinc-500

**Label:**
- **Text:** text-sm (14px), font-medium (500), text-zinc-300
- **Margin-Bottom:** mb-2 (8px)

**Helper-Text:**
- **Text:** text-xs (12px), text-zinc-500
- **Margin-Top:** mt-1 (4px)

#### Error-State

```tsx
<Input
  error="Title is required"
  aria-invalid={true}
/>
```

**Styling:**
- **Border:** border-rose-500
- **Focus:** ring-2 ring-rose-500/50
- **Error-Text:** text-rose-400, text-xs, mt-1

#### With Icons

**Left-Icon (Search):**
```tsx
<Input
  leftIcon={<SearchIcon />}
  placeholder="Search entries..."
/>
```
- **Icon-Position:** absolute left-3
- **Icon-Size:** 20×20px
- **Text-Padding:** pl-10 (40px)

**Right-Icon (Clear):**
```tsx
<Input
  rightIcon={<XIcon />}
  onRightIconClick={() => setValue('')}
/>
```

#### Number-Input

```tsx
<Input
  type="number"
  step="0.01"
  className="font-mono"
/>
```

**Styling:**
- **Font:** font-mono (for precision)
- **Text-Align:** text-right (für Zahlen)

---

### 1.3 Textarea

```tsx
<Textarea
  placeholder="Document your trade..."
  rows={10}
  maxLength={5000}
/>
```

**Maße & Styling:**
- **Min-Height:** min-h-[120px]
- **Padding:** p-4
- **Background:** bg-zinc-800, focus:bg-zinc-900
- **Border:** border border-zinc-700, focus:border-emerald-500
- **Border-Radius:** rounded-md (8px)
- **Font:** text-base (16px), leading-relaxed (1.625)
- **Resize:** resize-vertical (nur vertikal)

**Character-Count:**
```tsx
<Textarea showCharCount maxLength={5000} />
```
- **Display:** text-xs, text-zinc-500, text-right, mt-1
- **Format:** "2450 / 5000"

---

### 1.4 Select (Dropdown)

```tsx
<Select
  options={[
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ]}
  value="1h"
  onChange={(value) => setTimeframe(value)}
/>
```

**Maße & Styling:**
- **Height:** h-10 (40px)
- **Padding:** pl-4 pr-10 (Arrow-Inset)
- **Background:** bg-zinc-800, hover:bg-zinc-700
- **Border:** border border-zinc-700
- **Border-Radius:** rounded-md (8px)
- **Arrow-Icon:** 16×16px, absolute right-3, text-zinc-500

**Dropdown-Menu:**
- **Background:** bg-zinc-800, border border-zinc-700, shadow-xl
- **Max-Height:** max-h-60 (240px), overflow-y-auto
- **Item-Padding:** px-3 py-2
- **Item-Hover:** bg-zinc-700
- **Item-Active:** bg-emerald-500, text-white

---

### 1.5 Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Entry"
>
  <ModalContent>
    {/* Content */}
  </ModalContent>
</Modal>
```

**Maße & Styling:**

**Backdrop:**
- **Background:** bg-black/70, backdrop-blur-sm
- **Position:** fixed inset-0, z-50

**Modal-Container:**
- **Width:** max-w-2xl (672px), smaller variants: max-w-md (448px), max-w-lg (512px)
- **Background:** bg-zinc-900, border border-zinc-800
- **Border-Radius:** rounded-xl (16px)
- **Shadow:** shadow-2xl
- **Animation:** scale-in 150ms, fade-in 250ms

**Modal-Header:**
- **Padding:** p-6
- **Border-Bottom:** border-b border-zinc-800
- **Title:** text-xl (20px), font-semibold (600), text-zinc-100
- **Close-Button:** w-8 h-8, absolute top-6 right-6, text-zinc-500, hover:text-zinc-300

**Modal-Body:**
- **Padding:** p-6
- **Max-Height:** max-h-[70vh], overflow-y-auto

**Modal-Footer:**
- **Padding:** p-6
- **Border-Top:** border-t border-zinc-800
- **Layout:** flex justify-end gap-3

**Focus-Trap:**
- Auto-focus first-input on-open
- Tab-cycle within modal
- Escape-key closes modal

---

### 1.6 Badge

```tsx
<Badge variant="success">Win</Badge>
<Badge variant="error">Loss</Badge>
<Badge variant="info">SOL</Badge>
<Badge variant="neutral">Pending</Badge>
```

**Maße & Styling:**
- **Padding:** px-2.5 py-1
- **Border-Radius:** rounded-md (8px)
- **Font:** text-xs (12px), font-medium (500)

**Variants:**
- **Success:** bg-emerald-500/10, text-emerald-500
- **Error:** bg-rose-500/10, text-rose-500
- **Warning:** bg-amber-500/10, text-amber-500
- **Info:** bg-cyan-500/10, text-cyan-500
- **Neutral:** bg-zinc-700, text-zinc-300

**Pill-Variant:**
```tsx
<Badge pill>Tag</Badge>
```
- **Border-Radius:** rounded-full

---

### 1.7 Card

```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content...
  </CardContent>
</Card>
```

**Maße & Styling:**

**Card-Container:**
- **Background:** bg-zinc-900
- **Border:** border border-zinc-800
- **Border-Radius:** rounded-lg (12px)
- **Padding:** p-0 (Sub-components handle padding)

**Variants:**
- **Default:** bg-zinc-900, border-zinc-800
- **Elevated:** hover:shadow-card-subtle, hover:border-zinc-700
- **Glass:** bg-zinc-900/80, backdrop-blur-md, border-zinc-700/50

**CardHeader:**
- **Padding:** p-5, pb-3 (if CardContent follows)
- **Border-Bottom:** border-b border-zinc-800 (if CardContent follows)

**CardTitle:**
- **Font:** text-lg (18px), font-semibold (600), text-zinc-100

**CardContent:**
- **Padding:** p-5

---

### 1.8 Skeleton (Loading-Placeholder)

```tsx
<Skeleton className="h-32 w-full" />
```

**Maße & Styling:**
- **Background:** bg-zinc-800
- **Border-Radius:** rounded-md (8px)
- **Animation:** animate-pulse (2s infinite)

**Shimmer-Variant:**
```tsx
<Skeleton shimmer />
```
- **Background:** linear-gradient shimmer-animation
- **Colors:** zinc-800 → zinc-700 → zinc-800

---

## 2. Composed-Components

### 2.1 KPITile

```tsx
<KPITile
  label="Portfolio-Value"
  value="$45,230"
  change={2.3}
  sentiment="positive"
  onRefresh={() => refetch()}
/>
```

**Maße & Styling:**
- **Min-Height:** min-h-32 (128px)
- **Padding:** p-4
- **Background:** bg-zinc-900, border border-zinc-800, rounded-lg
- **Hover:** border-zinc-700, shadow-card-subtle

**Layout:**
```
┌─────────────────────────────┐
│ Label (top-left)      [🔄]  │ ← Refresh (top-right)
│ ─────────────────────────   │
│ Value (large, bold)         │
│ Change (small, colored)     │
└─────────────────────────────┘
```

**Text-Specs:**
- **Label:** text-sm (14px), font-medium (500), text-zinc-400
- **Value:** text-2xl (24px), font-bold (700), dynamic-color
- **Change:** text-sm (14px), text-zinc-500, with arrow-icon

**Sentiment-Colors:**
- **Positive:** text-emerald-500
- **Negative:** text-rose-500
- **Neutral:** text-zinc-300

---

### 2.2 FeedItem (Activity-Feed)

```tsx
<FeedItem
  icon={<BellIcon />}
  title="BTC-Alert-Triggered"
  description="Price crossed $65,000"
  time="2 min ago"
  onClick={() => navigate('/alerts')}
/>
```

**Maße & Styling:**
- **Padding:** p-3
- **Border-Bottom:** border-b border-zinc-800 (except last)
- **Hover:** bg-zinc-850, cursor-pointer

**Layout:**
```
┌────────────────────────────────────┐
│ [Icon] Title              Time     │
│        Description                 │
└────────────────────────────────────┘
```

**Icon:**
- **Size:** 20×20px
- **Color:** Dynamic (emerald, rose, amber, cyan)
- **Background:** Icon-specific-color/10, rounded-full, p-2

**Text-Specs:**
- **Title:** text-sm (14px), font-medium (500), text-zinc-100
- **Description:** text-xs (12px), text-zinc-500, mt-1
- **Time:** text-xs (12px), text-zinc-500

---

### 2.3 SignalCard

```tsx
<SignalCard
  direction="long"
  token="SOL"
  confidence={85}
  entry={{ min: 125, max: 126 }}
  stopLoss={122.5}
  takeProfit={132}
  reasoning={[
    'EMA-20/50-bullish-crossover',
    'RSI-recovery from oversold'
  ]}
/>
```

**Maße & Styling:**
- **Padding:** p-5
- **Background:** bg-emerald-500/10 (long), bg-rose-500/10 (short)
- **Border:** border-emerald-500/30 (long), border-rose-500/30 (short)
- **Border-Radius:** rounded-lg

**Confidence-Bar:**
- **Height:** h-2
- **Background:** bg-zinc-800
- **Fill:** bg-emerald-500 (width: ${confidence}%)

**Layout:**
```
┌─────────────────────────────────────┐
│ 🟢 LONG-Signal: SOL                 │
├─────────────────────────────────────┤
│ Confidence: 85% [████████▓▓] (High) │
│ ─────────────────────────────────── │
│ Entry: $125.00-$126.00              │
│ Stop-Loss: $122.50                  │
│ Take-Profit: $132.00 (+5.2%)        │
│ ─────────────────────────────────── │
│ Reasoning:                          │
│ • EMA-20/50-bullish-crossover       │
│ • RSI-recovery from oversold        │
│ ─────────────────────────────────── │
│ [Save] [Alert] [Dismiss]            │
└─────────────────────────────────────┘
```

---

### 2.4 QuickActionCard

```tsx
<QuickActionCard
  icon={<PlusIcon />}
  title="New-Trade-Entry"
  description="Log your latest trade"
  onClick={() => openJournalEditor()}
/>
```

**Maße & Styling:**
- **Padding:** p-5
- **Min-Height:** 140px
- **Background:** bg-zinc-900, border border-zinc-800, rounded-lg
- **Hover:** bg-zinc-850, border-emerald-500/50, shadow-emerald-glow

**Layout:**
```
┌────────────────────────────┐
│  [Icon]                    │
│                            │
│  Title                     │
│  Description               │
│                       [→]  │ ← CTA-Arrow (bottom-right)
└────────────────────────────┘
```

**Icon:**
- **Size:** 48×48px
- **Color:** text-emerald-500
- **Margin-Bottom:** mb-4

**Text-Specs:**
- **Title:** text-base (16px), font-semibold (600), text-zinc-100
- **Description:** text-sm (14px), text-zinc-500, mt-2

**CTA-Arrow:**
- **Size:** 20×20px
- **Color:** text-emerald-500
- **Position:** absolute bottom-4 right-4
- **Hover:** translateX(4px) transition

---

## 3. Section-Components

### 3.1 ChartCanvas

**Maße & Styling:**
- **Min-Height:** min-h-[500px]
- **Background:** bg-zinc-950 (darkest)
- **Grid-Lines:** 1px, zinc-800/50

**Candlestick-Specs:**
- **Bullish:** fill-emerald-500, stroke-emerald-400
- **Bearish:** fill-rose-500, stroke-rose-400
- **Wick-Width:** 1px
- **Body-Width:** 80% of candle-width

**Crosshair:**
- **Lines:** stroke-zinc-500, stroke-width-1, dashed
- **Tooltip:** bg-zinc-900/95, border-zinc-700, rounded-md, p-2, shadow-lg

---

### 3.2 IndicatorPanel

**Maße & Styling:**
- **Height:** 100px (RSI, MACD), 80px (Volume)
- **Background:** bg-zinc-900/80
- **Border-Top:** 1px border-zinc-800
- **Padding:** p-3

**Header:**
- **Title:** text-sm (14px), font-semibold (600), text-zinc-300
- **Controls:** [−] Minimize, [X] Close (top-right)

**Chart-Area:**
- **Line-Color:** cyan-400 (default)
- **Fill:** gradient-fill-cyan-500/10

---

### 3.3 JournalEditor (Modal-Based)

**Maße & Styling:**
- **Width:** max-w-2xl (672px)
- **Form-Fields:** gap-5 (20px)

**Title-Input:**
- **Label:** "Entry-Title"
- **Placeholder:** "Enter title for this trade..."
- **Max-Length:** 100

**Tags-Input:**
- **Container:** flex flex-wrap gap-2
- **Tag-Badge:** px-2.5 py-1, with [X] remove-button

**Content-Textarea:**
- **Min-Height:** min-h-[300px]
- **Font:** font-mono, text-sm
- **Placeholder:** "Document your trade setup, execution, and learnings..."

**Trade-Metrics (Optional):**
- **Grid:** grid-cols-4 gap-4
- **Fields:** Entry, Exit, Size, P&L

---

## 4. Layout-Components

### 4.1 Header

**Maße & Styling:**
- **Height:** h-16 (64px) - Desktop, h-14 (56px) - Mobile
- **Background:** bg-zinc-900/95, backdrop-blur-sm
- **Border-Bottom:** border-b border-zinc-800
- **Position:** sticky top-0, z-40

**Logo:**
- **Size:** h-8 (32px)
- **Position:** left-side

**Navigation:**
- **Hidden:** Mobile (<lg)
- **Visible:** Desktop (≥lg)

---

### 4.2 Sidebar (Desktop ≥1024px)

**Maße & Styling:**
- **Width:** 80px (fixed)
- **Background:** bg-zinc-900, border-r border-zinc-800
- **Position:** fixed left-0, h-screen

**Nav-Item:**
- **Padding:** py-3
- **Icon:** 24×24px, centered
- **Label:** text-xs (12px), font-medium (500), centered, mt-1

**States:**
- **Default:** text-zinc-400
- **Hover:** bg-zinc-800, text-zinc-100
- **Active:** bg-emerald-500/10, border-l-4 border-emerald-500, text-emerald-500

---

### 4.3 BottomNav (Mobile <1024px)

**Maße & Styling:**
- **Height:** h-16 (64px)
- **Background:** bg-zinc-900/95, backdrop-blur-sm
- **Border-Top:** border-t border-zinc-800
- **Position:** fixed bottom-0, w-full, z-50

**Nav-Item:**
- **Width:** flex-1 (equally distributed)
- **Icon:** 24×24px, centered
- **Label:** text-xs (12px), mt-1

**Active-Indicator:**
- **Border-Top:** border-t-2 border-emerald-500
- **Color:** text-emerald-500

---

## 5. States & Variants

### 5.1 Loading-States

**Skeleton-Loader:**
```tsx
if (isLoading) return <Skeleton className="h-32" />
```

**Spinner:**
```tsx
<Spinner size="md" />
```
- **Sizes:** sm (16px), md (24px), lg (32px)
- **Animation:** animate-spin

---

### 5.2 Error-States

```tsx
<ErrorState
  error="Failed to load data"
  onRetry={() => refetch()}
/>
```

**Layout:**
```
┌─────────────────────────────┐
│        [❌ Icon]            │
│                             │
│  Something-went-wrong       │
│  Error-message-here         │
│                             │
│  [Try-Again]                │
└─────────────────────────────┘
```

---

### 5.3 Empty-States

```tsx
<EmptyState
  title="No-entries-found"
  description="Start documenting your trades..."
  action={{
    label: 'Create-First-Entry',
    onClick: () => openEditor()
  }}
/>
```

---

## 6. Accessibility-Specs

### 6.1 Keyboard-Navigation

**Tab-Order:**
- Logical-flow: Top-to-bottom, left-to-right
- Skip-to-main-content link
- Focus-visible: ring-2 ring-emerald-500

**Shortcuts:**
- Cmd/Ctrl + N: New-Entry
- Cmd/Ctrl + S: Save
- Escape: Close-Modal
- /: Focus-Search

### 6.2 ARIA-Labels

**Icon-Buttons:**
```tsx
<button aria-label="Delete entry">
  <TrashIcon />
</button>
```

**Form-Validation:**
```tsx
<Input
  aria-invalid={hasError}
  aria-describedby="error-message"
/>
<span id="error-message">{error}</span>
```

### 6.3 Color-Contrast

**WCAG-AA-Compliance:**
- Text-Primary (zinc-100) on bg-zinc-950: 14.5:1 ✅
- Text-Secondary (zinc-400) on bg-zinc-950: 7.2:1 ✅
- Emerald-500 on zinc-950: 4.8:1 ✅

---

**Status:** ✅ Component-Library-Spezifikation komplett
**Verwendung:** Reference für Frontend-Entwicklung
