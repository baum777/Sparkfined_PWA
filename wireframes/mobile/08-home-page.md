# Mobile Wireframe: HomePage (375px)

**Route:** `/`  
**Purpose:** Simple Beta Shell Landing Page with Dark Mode Toggle  
**Complexity:** ⭐ Low (Simple centered content)  
**Status:** ✅ Production Ready

---

## State 1: DEFAULT VIEW (Dark Mode)

```
┌─────────────────────────────────┐
│                                 │ ← Empty space (padding)
│                                 │
│         ╔═══════════╗           │
│         ║ SPARKFINED║           │ ← Logo component
│         ╚═══════════╝           │
│                                 │
│   Sparkfined TA-PWA Beta Shell  │ ← H1 (text-4xl, bold)
│                                 │
│  Technical Analysis Progressive │
│          Web App                │ ← Subtitle (text-lg, zinc-400)
│                                 │
│   ┌─────────────────────────┐  │
│   │  Toggle Light Mode      │  │ ← Primary button
│   └─────────────────────────┘  │
│                                 │
│   ✅ React 18 + Vite 6 + TS    │
│   ✅ Tailwind CSS + Dark Mode  │ ← Feature checklist
│   ✅ PWA Ready                 │   (text-sm, zinc-400)
│   ✅ ESLint + Prettier         │
│                                 │
│  ─────────────────────────────  │ ← Border divider
│                                 │
│  Foundation ready → Proceed to │
│        Phase 1                  │ ← Footer text (text-sm)
│                                 │
└─────────────────────────────────┘
```

**Visual Hierarchy:**
- **Background:** `min-h-screen flex items-center justify-center p-4`
- **Card:** `card max-w-2xl w-full text-center space-y-6`
- **Logo:** Centered at top
- **Title:** `text-4xl font-bold text-slate-900 dark:text-slate-100`
- **Subtitle:** `text-lg text-slate-600 dark:text-slate-400`
- **Button:** `btn-primary` (emerald green)
- **Checklist:** Vertical list with checkmark icons
- **Footer:** Border-top divider with muted text

---

## State 2: LIGHT MODE (After Toggle)

```
┌─────────────────────────────────┐
│        [SAME LAYOUT AS          │
│         DARK MODE]              │
│                                 │
│  VISUAL CHANGES:                │
│  - Background: White/Light      │
│  - Text: Dark gray              │
│  - Card: Light background       │
│  - Button: "Toggle Dark Mode"   │
│                                 │
│  Colors:                        │
│  - BG: slate-50                 │
│  - Card: white                  │
│  - Text: slate-900              │
│  - Muted: slate-600             │
│                                 │
└─────────────────────────────────┘
```

**Interaction:**
- Click "Toggle X Mode" → `setDarkMode(!darkMode)`
- Updates `document.documentElement.classList.toggle('dark')`
- Button text changes dynamically
- Instant theme switch (no animation needed for beta shell)

---

## Component Breakdown

### Logo Component
```
┌─────────────┐
│ SPARKFINED  │ ← Custom Logo component
│  [Vector]   │   (imported from @/components/Logo)
└─────────────┘
```
**Props:** None (self-contained)  
**Size:** Auto (responsive)  
**Color:** Adapts to theme

### Button Component
```
┌───────────────────────────────┐
│  Toggle {mode} Mode           │ ← Dynamic text
└───────────────────────────────┘
```
**Class:** `btn-primary`  
**Behavior:** `onClick={toggleDarkMode}`  
**State:** No loading/disabled states (instant toggle)

### Checklist Items
```
✅ React 18 + Vite 6 + TypeScript
✅ Tailwind CSS + Dark Mode
✅ PWA Ready
✅ ESLint + Prettier
```
**Typography:** `text-sm text-slate-500 dark:text-slate-400`  
**Layout:** Centered `<p>` tags in vertical stack  
**Icons:** Text-based checkmarks (✅)

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column, centered
- Max-width: 2xl (672px)
- Padding: p-4 (16px)
- Full viewport height (min-h-screen)

**Tablet (768px - 1024px):**
- Same layout as mobile
- Card may appear slightly wider

**Desktop (> 1024px):**
- Same layout as mobile/tablet
- Card remains centered with max-width constraint
- No significant layout changes (intentionally simple)

---

## Accessibility

| Criterion | Status | Implementation |
|-----------|--------|----------------|
| **Semantic HTML** | ✅ | `<h1>`, `<p>`, `<button>` |
| **Focus Indicators** | ⚠️ | Default browser styles (improve with focus-visible) |
| **Keyboard Nav** | ✅ | Button is keyboard accessible (Tab + Enter) |
| **Color Contrast** | ✅ | Text meets WCAG AA (zinc-100 on zinc-950) |
| **Screen Readers** | ✅ | All text is readable, button has clear label |

**Improvements Needed:**
- Add `focus-visible:ring-2` to button
- Consider `aria-label` for toggle button (e.g., "Toggle theme mode")

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Initial Load** | Defaults to Dark Mode (darkMode state = false initially, but UI shows dark by default) |
| **Multiple Toggles** | Each click toggles theme (no rate limiting) |
| **Browser Back** | No state changes (no routing involved) |
| **Refresh Page** | Resets to default state (no persistence in this simple shell) |

**Note:** This is a **beta shell** page, not a production homepage. Final production app will likely route directly to `/board` or have a more elaborate landing experience.

---

## Animation/Transitions

**None implemented** - Instant theme switch for beta simplicity.

**Future Enhancement:**
- Add fade transition on text color changes
- Smooth background color transition (e.g., `transition-colors duration-300`)

---

## Implementation Notes

**Key Code Snippets:**

```typescript
const [darkMode, setDarkMode] = useState(false)

const toggleDarkMode = () => {
  setDarkMode(!darkMode)
  document.documentElement.classList.toggle('dark')
}
```

**Dependencies:**
- `@/components/Logo` - Custom logo component
- TailwindCSS dark mode classes
- React useState hook

**File:** `src/pages/HomePage.tsx`  
**Lines:** 47 lines total  
**Complexity:** Low (straightforward presentation)

---

## Related Flows

| Flow | Link |
|------|------|
| **Theme Management** | Settings Page → Theme Toggle |
| **Navigation** | No direct nav from this page (standalone shell) |
| **Next Steps** | Production app should redirect to `/board` or `/analyze` |

---

**Next Iteration:**
- Replace this page with full landing page (see `LandingPage.tsx`)
- Or route directly to main app on load
- Add persistence for dark mode preference (localStorage)

---

**Status:** ✅ Complete - Ready for Phase 1 handoff
