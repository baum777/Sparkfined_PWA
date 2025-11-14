# Global Style – Sparkfined PWA

## Brand & Mood

**Keywords:** Professional, Dense, Data-Driven, Crypto-Native, Focused  
**Target Audience:** Crypto traders (day/swing/meme), tech-savvy, self-improvement oriented  
**Visual Direction:** Dark trading terminal aesthetic, high information density, subtle accents

---

## Colors

### Primary Palette
- **Primary (Accent):** `#3b82f6` (blue-500) – CTAs, active states, links
- **Primary Hover:** `#2563eb` (blue-600)
- **Primary Muted:** `#1e3a8a` (blue-900) – subtle backgrounds

### Backgrounds
- **App Background:** `#0a0a0a` (near-black)
- **Surface 1 (Cards/Panels):** `#141414` (zinc-900)
- **Surface 2 (Elevated):** `#1a1a1a` (zinc-800)
- **Surface 3 (Hover):** `#262626` (neutral-800)

### Neutrals (Text & Borders)
- **Text Primary:** `#fafafa` (neutral-50) – headings, key data
- **Text Secondary:** `#a3a3a3` (neutral-400) – labels, descriptions
- **Text Muted:** `#737373` (neutral-500) – metadata, timestamps
- **Border Subtle:** `#262626` (neutral-800)
- **Border Default:** `#404040` (neutral-700)

### Semantic (States)
- **Success:** `#22c55e` (green-500) – positive gains, confirmations
- **Warning:** `#f59e0b` (amber-500) – alerts, cautions
- **Error:** `#ef4444` (red-500) – losses, errors, deletions
- **Info:** `#06b6d4` (cyan-500) – informational hints

### Chart-Specific
- **Bullish (Green):** `#10b981` (emerald-500)
- **Bearish (Red):** `#f43f5e` (rose-500)
- **Volume:** `#6366f1` (indigo-500) with 40% opacity

---

## Typography

### Font Families
- **Primary (UI/Data):** `'Inter', system-ui, sans-serif`
- **Monospace (Numbers/Code):** `'JetBrains Mono', 'Fira Code', monospace`

### Scale
```
Heading 1 (Page Title):     text-3xl (30px) font-bold tracking-tight
Heading 2 (Section):        text-2xl (24px) font-semibold
Heading 3 (Subsection):     text-xl (20px) font-semibold
Heading 4 (Card Title):     text-lg (18px) font-medium

Body Large:                 text-base (16px) font-normal
Body Default:               text-sm (14px) font-normal
Body Small (Meta):          text-xs (12px) font-normal

Data/Numbers (Mono):        text-sm md:text-base font-mono tabular-nums
```

### Line Heights
- Headings: `leading-tight` (1.25)
- Body: `leading-relaxed` (1.625)
- Dense tables/data: `leading-snug` (1.375)

---

## Spacing & Layout

### Spacing Scale (Tailwind)
```
xs:  space-2  (8px)   – tight groupings, icon gaps
sm:  space-3  (12px)  – form fields, list items
md:  space-4  (16px)  – card padding, section gaps
lg:  space-6  (24px)  – major section breaks
xl:  space-8  (32px)  – page-level spacing
```

### Container Widths
- **Full Width (Dashboard):** `max-w-full` with `px-4 md:px-6 lg:px-8`
- **Content (Journal/Settings):** `max-w-4xl mx-auto`
- **Narrow (Forms):** `max-w-2xl mx-auto`

### Grid System
- **Responsive Columns:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Gap:** `gap-4 md:gap-6` (16px mobile, 24px desktop)

---

## Core UI Elements

### Buttons

#### Primary (CTA)
```tsx
className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
           font-medium rounded-lg transition-colors 
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
```

#### Secondary (Outline)
```tsx
className="px-4 py-2 border border-neutral-700 hover:border-neutral-600 
           text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800
           font-medium rounded-lg transition-colors"
```

#### Ghost (Minimal)
```tsx
className="px-3 py-1.5 text-neutral-400 hover:text-neutral-100 
           hover:bg-neutral-800 rounded-md transition-colors"
```

#### Destructive
```tsx
className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
           text-red-500 border border-red-500/30 
           font-medium rounded-lg transition-colors"
```

### Cards

#### Default Card
```tsx
className="bg-zinc-900 border border-neutral-800 rounded-xl 
           p-4 md:p-6 shadow-lg"
```

#### Elevated Card (Hover)
```tsx
className="bg-zinc-900 border border-neutral-800 rounded-xl 
           p-4 hover:border-neutral-700 hover:bg-zinc-800/50
           transition-all duration-200 shadow-lg"
```

#### Glass Card (Overlays)
```tsx
className="bg-zinc-900/80 backdrop-blur-md border border-neutral-700 
           rounded-xl p-4 shadow-2xl"
```

### Inputs & Forms

#### Text Input
```tsx
className="w-full px-3 py-2 bg-zinc-800 border border-neutral-700 
           rounded-lg text-neutral-100 placeholder:text-neutral-500
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
           transition-shadow"
```

#### Select/Dropdown
```tsx
className="px-3 py-2 bg-zinc-800 border border-neutral-700 rounded-lg 
           text-neutral-100 focus:ring-2 focus:ring-blue-500"
```

#### Label
```tsx
className="block text-sm font-medium text-neutral-300 mb-2"
```

### Navigation

#### Tab Bar (Horizontal)
```tsx
// Container
className="flex border-b border-neutral-800"

// Tab Item (Active)
className="px-4 py-2 text-sm font-medium text-blue-500 border-b-2 border-blue-500"

// Tab Item (Inactive)
className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-200 
           border-b-2 border-transparent hover:border-neutral-700 transition-colors"
```

#### Sidebar Navigation
```tsx
// Nav Item (Active)
className="flex items-center gap-3 px-3 py-2 bg-blue-500/10 text-blue-500 
           border-l-2 border-blue-500 rounded-r-md"

// Nav Item (Inactive)
className="flex items-center gap-3 px-3 py-2 text-neutral-400 
           hover:text-neutral-100 hover:bg-neutral-800 rounded-md 
           transition-colors"
```

### Badges & Tags

#### Status Badge
```tsx
// Success
className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs font-medium rounded-full"

// Warning
className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full"

// Error
className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs font-medium rounded-full"
```

#### Tag (Removable)
```tsx
className="inline-flex items-center gap-1.5 px-2.5 py-1 
           bg-neutral-800 text-neutral-300 text-xs rounded-md
           hover:bg-neutral-700 transition-colors"
```

---

## Interaction Patterns

### Hover/Focus/Active

**Principle:** Subtle, fast transitions (150-200ms)

- **Hover:** Brighten border/bg by 1 shade, increase opacity
- **Focus:** 2px ring in primary color with offset
- **Active:** Press effect (scale-95 or brightness adjustment)

### Feedback

#### Toast Notifications
```tsx
// Position: top-right
// Duration: 3-5s
// Style: Glass card with icon + message
className="fixed top-4 right-4 bg-zinc-900/90 backdrop-blur-md 
           border border-neutral-700 rounded-lg p-4 shadow-2xl
           animate-slide-in-right"
```

#### Inline Errors
```tsx
className="text-red-500 text-xs mt-1 flex items-center gap-1"
// Icon: AlertCircle or XCircle
```

#### Loading States
- **Spinner:** Blue (`text-blue-500`) with `animate-spin`
- **Skeleton:** `bg-neutral-800 animate-pulse rounded`
- **Progress Bar:** Thin (2-3px) blue bar at top of card/page

#### Modal/Dialog
```tsx
// Backdrop
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"

// Modal
className="fixed inset-0 z-50 flex items-center justify-center p-4"
// Content: Glass card with max-w-lg
```

### Empty States
```tsx
className="flex flex-col items-center justify-center py-12 text-center"
// Icon: 48px, text-neutral-600
// Heading: text-neutral-400, text-lg
// Description: text-neutral-500, text-sm
// CTA: Primary button
```

---

## Component Patterns

### KPI Tiles (Dashboard)
- **Layout:** Grid of 3-4 per row (responsive)
- **Card Style:** Default Card
- **Content:** Icon + Label + Value + Change% + Sparkline (optional)
- **Value:** Monospace, large (text-2xl), colored by state

### Data Tables
- **Header:** Sticky, bg-zinc-900, border-b
- **Rows:** Hover bg-neutral-800, border-b border-neutral-800
- **Cells:** py-3 px-4, align-left (text) or align-right (numbers)
- **Numbers:** Monospace, tabular-nums, right-aligned

### Charts
- **Container:** Default Card with optional toolbar (timeframe, indicators)
- **Canvas:** Full width, min-h-[300px] md:min-h-[400px]
- **Legend:** Below or right-side, small chips with color indicators

### Forms
- **Layout:** Single column, max-w-2xl
- **Grouping:** Space-y-4 (16px vertical gap)
- **Actions:** Sticky footer or right-aligned button group

---

## Responsive Breakpoints (Tailwind)

```
sm:  640px  – Small tablets, large phones (landscape)
md:  768px  – Tablets
lg:  1024px – Desktops
xl:  1280px – Large desktops
2xl: 1536px – Extra large displays
```

**Mobile-First Approach:**
- Base styles: mobile (320-640px)
- Use `md:` for tablet adjustments
- Use `lg:` for desktop enhancements

---

## Accessibility Notes

- **Focus Rings:** Always visible (2px ring with offset)
- **Contrast:** All text meets WCAG AA (4.5:1 for body, 3:1 for large)
- **Keyboard Nav:** Tab order follows visual flow, Escape closes modals
- **Screen Readers:** Use semantic HTML, aria-labels for icons

---

## Design Tokens Reference (Tailwind Config)

```js
// tailwind.config.ts (excerpt)
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',
      surface: {
        1: '#141414',
        2: '#1a1a1a',
        3: '#262626',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
  },
}
```

---

**Last Updated:** 2025-11-14  
**Status:** ✅ Source of Truth for all tab specs
