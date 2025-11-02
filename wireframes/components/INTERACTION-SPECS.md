# Component Interaction Specifications

**Purpose:** Detailed interaction specs for all reusable and screen-specific components  
**Format:** Component → Event → Action → Animation → Accessibility

---

## 1. Form Controls

### Input (Text)
| Property | Value |
|----------|-------|
| **Base Styles** | `border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200 rounded` |
| **Focus** | `focus:ring-2 focus:ring-emerald-500 focus:border-transparent` |
| **Error** | `border-rose-700 focus:ring-rose-500` |
| **Disabled** | `opacity-50 cursor-not-allowed` |
| **Placeholder** | `placeholder:text-zinc-500` |
| **Transition** | `transition-colors duration-200` |
| **ARIA** | `aria-label`, `aria-invalid` (if error), `aria-describedby` (error msg) |

### Textarea
| Property | Value |
|----------|-------|
| **Base Styles** | Same as Input + `min-h-32 resize-vertical` |
| **Auto-Resize** | Not implemented (could add with JS) |
| **Markdown Support** | Plain text only (no preview) |

### Dropdown (Select)
| Property | Value |
|----------|-------|
| **Base Styles** | Same as Input + chevron icon (right) |
| **Hover** | `hover:bg-zinc-800` (desktop) |
| **Active** | Native browser select styling |
| **Keyboard** | Arrow keys navigate, Enter/Space toggle |

### Toggle Button (ON/OFF)
| Property | Value |
|----------|-------|
| **ON State** | `border-emerald-700 bg-emerald-900/30 text-emerald-100` |
| **OFF State** | `border-zinc-700 text-zinc-200 hover:bg-zinc-800` |
| **Transition** | `transition-all duration-200` |
| **Click** | Toggle boolean state |
| **ARIA** | `role="switch"`, `aria-checked="true/false"` |

### Checkbox
| Property | Value |
|----------|-------|
| **Base Styles** | Native checkbox with custom accent color |
| **Checked** | `accent-emerald-500` |
| **Focus** | `focus:ring-2 focus:ring-emerald-500` |
| **Label** | Always associated (for/htmlFor or wrapped) |

---

## 2. Buttons

### Primary Button
| Property | Value |
|----------|-------|
| **Base** | `rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-100 bg-emerald-700` |
| **Hover** | `hover:bg-emerald-600 hover:shadow-lg` |
| **Active** | `active:scale-95` |
| **Disabled** | `disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-700` |
| **Loading** | Text changes (e.g., "Lade…"), disabled state |
| **Transition** | `transition-all duration-150` |
| **Touch Target** | Min 44px height (currently ~36px) |

### Secondary Button
| Property | Value |
|----------|-------|
| **Base** | Same as Primary but `bg-zinc-800 text-zinc-200` |
| **Hover** | `hover:bg-zinc-700` |

### Ghost Button
| Property | Value |
|----------|-------|
| **Base** | `rounded-lg px-2 py-1 text-xs text-zinc-400` |
| **Hover** | `hover:bg-zinc-800 hover:text-zinc-200` |
| **No Border** | Transparent bg, no border |

### Icon Button
| Property | Value |
|----------|-------|
| **Base** | `p-2 rounded-lg text-zinc-400` |
| **Hover** | `hover:bg-zinc-800 hover:text-zinc-200` |
| **Active Tool** | `bg-emerald-700 text-white` (Chart tools) |
| **ARIA** | `aria-label` (no visible text) |

### Danger Button
| Property | Value |
|----------|-------|
| **Base** | `border-rose-900 bg-rose-950/30 text-rose-100` |
| **Hover** | `hover:bg-rose-900/50` |
| **Confirm** | Always require confirmation prompt |

---

## 3. Cards

### Standard Card
| Property | Value |
|----------|-------|
| **Base** | `rounded-xl border border-zinc-800 bg-zinc-900/40 p-3` |
| **Hover** | None (static card) |
| **Shadow** | `shadow-sm` (subtle) |

### Interactive Card
| Property | Value |
|----------|-------|
| **Base** | Same as Standard + `cursor-pointer` |
| **Hover** | `hover:scale-[1.02] hover:shadow-xl hover:border-zinc-700` |
| **Active** | `active:scale-100` |
| **Transition** | `transition-all duration-200` |
| **Used In** | Session Replay cards, Notification cards |

### Info Card (AI Panel)
| Property | Value |
|----------|-------|
| **Base** | `rounded-xl border border-emerald-900 bg-emerald-950/20 p-3` |
| **Text** | `text-emerald-200` (primary), `text-emerald-300/70` (secondary) |
| **Result Box** | `border-emerald-800/60 bg-black/30 p-3 rounded` |

### Danger Card
| Property | Value |
|----------|-------|
| **Base** | `rounded-xl border border-rose-900 bg-rose-950/30 p-4` |
| **Text** | `text-rose-100` |
| **Used In** | Settings Danger Zone |

---

## 4. Navigation

### Bottom Tab Bar
| Property | Value |
|----------|-------|
| **Container** | `fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800` |
| **Grid** | `grid-cols-3` (Analyze, Journal, Replay) |
| **Tab Button** | `flex flex-col items-center gap-1 py-3 px-2 rounded-lg` |
| **Active** | `text-blue-400 bg-blue-950` |
| **Inactive** | `text-slate-400 hover:bg-slate-800` |
| **Icon** | Emoji (📊 📝 ⏮️), 2xl size |
| **Label** | `text-xs font-medium` |
| **Transition** | `transition-colors duration-150` |
| **ARIA** | `role="navigation"`, `aria-label="Main navigation"` |

### Top Header Nav (Desktop)
| Property | Value |
|----------|-------|
| **Container** | `flex items-center justify-between px-8 py-4 border-b border-zinc-800` |
| **Logo** | Left-aligned, clickable (navigate home) |
| **Links** | `hover:text-zinc-100 transition-colors` |
| **Active** | `text-zinc-100 border-b-2 border-emerald-500` |

---

## 5. Chart-Specific Components

### Canvas
| Property | Value |
|----------|-------|
| **Container** | `rounded-2xl border border-zinc-800 bg-zinc-900/40 p-2` |
| **Canvas Element** | `width: 100%, height: auto` (aspect ratio maintained) |
| **Cursor** | Changes based on active tool (default, crosshair, move) |
| **Touch Events** | Touch-drag for pan, pinch for zoom |
| **Mouse Events** | Click/drag for drawing, wheel for zoom |

### Drawing Tools
| Property | Value |
|----------|-------|
| **Tool Button** | Icon button (see above) |
| **Active Tool** | `bg-emerald-700 text-white` |
| **Hotkeys** | H (hline), T (trend), F (fib), Esc (cursor) |
| **Snap Indicator** | Text "Snap: ON" overlaid on canvas |

### Replay Controls
| Property | Value |
|----------|-------|
| **Play Button** | Toggle icon (▶️ / ⏸️) |
| **Speed Dropdown** | 1x, 2x, 4x, 8x, 10x |
| **Step Buttons** | [←←][←][→][→→] (step 10, step 1) |
| **Hotkeys** | Space (play/pause), Arrow keys (step) |
| **Bookmark Badges** | `[1][2][3]` quick jump (hotkeys 1-6) |

### Zoom/Pan Bar
| Property | Value |
|----------|-------|
| **Zoom Buttons** | [+][-] increase/decrease view by ~15% |
| **Reset** | Returns to full range view |
| **Range Text** | Shows current view range (formatted dates) |
| **Snap Toggle** | ON/OFF button |

---

## 6. Modals & Overlays

### Modal Container
| Property | Value |
|----------|-------|
| **Overlay** | `fixed inset-0 z-50 bg-black/80 backdrop-blur-sm` |
| **Content** | `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2` |
| **Max Width** | `max-w-4xl` (desktop), full-screen (mobile) |
| **Close Button** | [X] in top-right, Esc key closes |
| **Focus Trap** | Tab cycles within modal (not impl., should add) |
| **Scroll** | Body scroll locked when modal open |

### Prompt (Native)
| Property | Value |
|----------|-------|
| **Type** | Native `prompt()` / `confirm()` |
| **Replacement** | Could use custom modal for better UX |
| **Used In** | Factory Reset, Close Idea, Export Format |

---

## 7. Tables

### Standard Table
| Property | Value |
|----------|-------|
| **Container** | `w-full text-xs` |
| **Header** | `bg-zinc-900 text-zinc-400` |
| **Row** | `border-t border-zinc-800` |
| **Cell** | `px-2 py-1` |
| **Hover Row** | `hover:bg-zinc-800` (optional) |
| **Scrollable** | `max-h-72 overflow-auto` (Trigger History) |

### Responsive Table
| Property | Value |
|----------|-------|
| **Mobile** | Horizontal scroll (`overflow-x-auto`) |
| **Desktop** | Full width, no scroll |
| **Min Width** | Each column has min-width (prevents squish) |

---

## 8. Progress Indicators

### Loading State
| Property | Value |
|----------|-------|
| **Button** | Text changes (e.g., "Lade…"), opacity-50, disabled |
| **Spinner** | Not implemented (could add CSS spinner) |
| **Skeleton** | Not implemented (could add for cards) |

### Progress Bar (Token Budget)
| Property | Value |
|----------|-------|
| **Container** | `h-2 w-full rounded-full bg-zinc-800` |
| **Bar** | `h-full transition-all duration-300` |
| **Color** | Green (<70%), Amber (70-90%), Red (>90%) |
| **Width** | `style={{ width: pct + '%' }}` |

---

## 9. Feedback & Alerts

### Alert Banner
| Property | Value |
|----------|-------|
| **Error** | `border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200 rounded` |
| **Success** | `border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-200 rounded` |
| **Info** | `border-cyan-900 bg-cyan-950/40 p-3 text-sm text-cyan-200 rounded` |
| **Dismissable** | Could add [X] button (not impl.) |

### Toast / Notification
| Property | Value |
|----------|-------|
| **Type** | Native `alert()` (blocking) or Push Notification |
| **Replacement** | Could use toast library (react-hot-toast) |
| **Position** | Top-right (typical) |
| **Auto-Dismiss** | 3-5 seconds |

### Push Notification (PWA)
| Property | Value |
|----------|-------|
| **Permission** | Browser-native prompt |
| **Content** | Title, body, icon (from manifest) |
| **Click Action** | Opens app (focus window) |
| **Badge** | Not implemented |

---

## 10. Animations & Transitions

### Global Defaults
```css
.transition-colors { transition: color, background-color, border-color 200ms }
.transition-all { transition: all 150ms ease-in-out }
```

### Specific Animations
| Element | Animation | Duration |
|---------|-----------|----------|
| Button Hover | Scale 1.05 | 150ms |
| Button Active | Scale 0.95 | 100ms |
| Card Hover | Scale 1.02 + Shadow | 200ms |
| Toggle | Background color | 200ms |
| Progress Bar | Width | 300ms |
| Modal Open | Fade in + Scale 0.95→1 | 200ms |

### Performance
- **GPU-Accelerated:** transform, opacity
- **Avoid:** width, height, margin (causes reflow)
- **Request Animation Frame:** Used in Replay loop

---

## 11. Accessibility (WCAG 2.1 AA)

### Color Contrast
| Element | Ratio | Status |
|---------|-------|--------|
| Body Text (zinc-200 on zinc-950) | 12.63:1 | ✅ AAA |
| Secondary Text (zinc-400 on zinc-950) | 6.44:1 | ✅ AA |
| Button Text (zinc-100 on emerald-700) | 5.12:1 | ✅ AA |
| Error Text (rose-200 on rose-950) | 8.92:1 | ✅ AAA |

### Keyboard Navigation
| Feature | Support |
|---------|---------|
| Tab Order | ✅ Natural DOM order |
| Focus Visible | ⚠️ Partial (needs `focus-visible:ring-2`) |
| Skip Links | ❌ Not implemented |
| Keyboard Shortcuts | ✅ Chart (H/T/F/Esc/Space/Arrows) |
| Escape to Close | ⚠️ Partial (needs modal trap) |

### Screen Readers
| Feature | Support |
|---------|---------|
| Semantic HTML | ✅ nav, main, button, etc. |
| ARIA Labels | ⚠️ Partial (needs improvement on icons) |
| ARIA Live Regions | ❌ Not implemented (for alerts) |
| Alt Text | ⚠️ Canvas needs aria-label |

### Touch Targets
| Element | Size | Status |
|---------|------|--------|
| Bottom Nav Tabs | ~48px | ✅ Meets 44px min |
| Button (py-1) | ~36px | ⚠️ Below 44px ideal |
| Icon Button | ~36px | ⚠️ Below 44px ideal |
| Checkbox | 16px | ⚠️ Small (use larger custom) |

### Recommendations
1. **Increase Button Padding:** py-1 → py-2 (mobile)
2. **Add Focus Rings:** `focus-visible:ring-2 focus-visible:ring-emerald-500`
3. **Modal Focus Trap:** Use react-focus-lock or similar
4. **Skip Links:** Add "Skip to content" link
5. **Live Regions:** Announce alerts to screen readers
6. **Icon Labels:** Always provide aria-label on icon-only buttons

---

## 12. Error Handling Patterns

### Input Validation
```typescript
// Example pattern (not all fields use this yet)
<input
  className={error ? 'border-rose-700' : 'border-zinc-700'}
  aria-invalid={!!error}
  aria-describedby={error ? 'error-msg' : undefined}
/>
{error && <div id="error-msg" className="text-rose-200">{error}</div>}
```

### API Errors
- **Display:** Red banner above form/content
- **Retry:** Allow user to retry action (button or auto-retry)
- **Fallback:** Show cached data if available (offline mode)

### Network Errors
- **Offline Indicator:** `<OfflineIndicator />` component
- **Retry Strategy:** Exponential backoff (not impl.)
- **User Feedback:** "Network error: Failed to fetch"

---

## 13. Performance Optimizations

### Code Splitting
- **Route-Level:** `lazy(() => import("../pages/..."))` ✅
- **Component-Level:** Not implemented (could add for heavy components)

### Memoization
- **useMemo:** Used for KPIs, indicators, metrics
- **useCallback:** Used for event handlers
- **React.memo:** Not widely used (could add for expensive renders)

### Debouncing/Throttling
- **Input onChange:** Not debounced (could add for search)
- **Scroll Events:** Not throttled (not heavily used)
- **Resize Events:** Not throttled (could add for canvas)

### Canvas Optimization
- **Offscreen Canvas:** Not used (could add for complex drawings)
- **Layer Caching:** Not implemented (redraw full canvas each frame)
- **RequestAnimationFrame:** ✅ Used in Replay loop

---

## 14. Testing Considerations

### Unit Tests (Vitest)
- **Targets:** Pure functions (kpis, indicators, backtest)
- **Mocking:** API calls, localStorage, IndexedDB
- **Coverage:** ~40% estimated (needs improvement)

### Integration Tests
- **Targets:** User flows (login → analyze → chart)
- **Tools:** Vitest + Testing Library
- **Status:** Minimal (1 file)

### E2E Tests (Playwright)
- **Targets:** Critical paths (analyze → export, chart → replay)
- **Status:** Basic setup (5 files)
- **Needs:** More coverage, CI/CD integration

### Manual Testing Checklist
- [ ] Mobile (Chrome Android, Safari iOS)
- [ ] Desktop (Chrome, Firefox, Safari, Edge)
- [ ] PWA Install (Add to Home Screen)
- [ ] Offline Mode (Service Worker)
- [ ] Push Notifications (VAPID)
- [ ] Accessibility (VoiceOver, NVDA, keyboard-only)

---

**Next:** Storybook component stories, review checklist, roadmap.
