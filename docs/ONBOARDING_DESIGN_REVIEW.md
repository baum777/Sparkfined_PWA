# ✅ Onboarding Design Review Checklist

**Pre-Launch Quality Gate**  
**Version:** 1.0  
**Datum:** 2025-11-04

---

## 🎯 Purpose

Dieser Checklist stellt sicher, dass alle Onboarding-Komponenten die Design-Standards erfüllen, bevor sie live gehen.

---

## 📱 1. Visual Design

### Layout & Spacing

- [ ] **Konsistente Abstände** (8px Grid System)
  - [ ] Padding: 16px (Mobile), 24px (Desktop)
  - [ ] Gaps: 8px, 12px, 16px, 24px
  - [ ] Margins folgen 8px-Skala

- [ ] **Typography** korrekt angewendet
  - [ ] Headlines: 24px-36px bold
  - [ ] Body: 14px-16px regular
  - [ ] Labels: 12px-14px medium
  - [ ] Line-height: 1.5 (body), 1.25 (headlines)

- [ ] **Border Radius** konsistent
  - [ ] Cards: 12px-16px
  - [ ] Buttons: 8px-12px
  - [ ] Modals: 20px-24px
  - [ ] Inputs: 8px

- [ ] **Shadows** korrekt
  - [ ] Modals: `0 25px 50px rgba(0,0,0,0.25)`
  - [ ] Cards: `0 10px 40px rgba(0,0,0,0.3)`
  - [ ] Tooltips: `0 10px 30px rgba(0,0,0,0.3)`
  - [ ] PWA Prompt: `0 20px 60px rgba(0,0,0,0.5)`

### Colors

- [ ] **Primary Green** verwendet (#10B981)
  - [ ] CTA Buttons
  - [ ] Success States
  - [ ] Highlights/Accents

- [ ] **Background Colors** korrekt
  - [ ] Page: #0A0A0A (zinc-950)
  - [ ] Cards: #18181B (zinc-900)
  - [ ] Elevated: #27272A (zinc-800)

- [ ] **Text Colors** lesbar
  - [ ] Primary: #FAFAFA (contrast ratio > 7:1)
  - [ ] Secondary: #A1A1AA (contrast ratio > 4.5:1)
  - [ ] Tertiary: #71717A (contrast ratio > 3:1)

- [ ] **Border Colors** subtil
  - [ ] Default: #3F3F46 (zinc-700)
  - [ ] Subtle: #27272A (zinc-800)
  - [ ] Accent: rgba(16, 185, 129, 0.3)

### Dark Mode

- [ ] **Alle Komponenten** im Dark Mode getestet
- [ ] **Kontrast** ausreichend (WCAG AA)
- [ ] **Glow Effects** funktionieren
- [ ] **Backdrop Blur** sichtbar

---

## 🎬 2. Animations & Transitions

### Timing

- [ ] **Schnelle Transitions** (150ms)
  - [ ] Hover States
  - [ ] Button Feedback
  - [ ] Tooltip Dismiss

- [ ] **Standard Transitions** (200-300ms)
  - [ ] Modal Open/Close
  - [ ] Toast Appear/Dismiss
  - [ ] Card Hover

- [ ] **Slow Transitions** (400ms+)
  - [ ] Welcome Overlay Slide-up
  - [ ] Page Transitions
  - [ ] Staggered Animations

### Easing

- [ ] **Spring Easing** für Entrances
  - [ ] `cubic-bezier(0.16, 1, 0.3, 1)`
  - [ ] Modals, Overlays

- [ ] **Ease Out** für Exits
  - [ ] `cubic-bezier(0, 0, 0.2, 1)`
  - [ ] Dismissals, Closes

- [ ] **Ease In-Out** für Hover
  - [ ] `cubic-bezier(0.4, 0, 0.2, 1)`
  - [ ] Button States

### Performance

- [ ] **60 FPS** auf allen Animationen
  - [ ] Kein Jank bei Slide-up
  - [ ] Smooth Fades
  - [ ] GPU-accelerated (transform, opacity)

- [ ] **Reduced Motion** respektiert
  - [ ] `@media (prefers-reduced-motion: reduce)`
  - [ ] Animationen auf 0.01ms reduziert
  - [ ] Funktionalität bleibt erhalten

- [ ] **No Layout Shifts**
  - [ ] Keine Content Jumps
  - [ ] Placeholder heights gesetzt
  - [ ] Skeletons verwenden

---

## 📱 3. Responsive Design

### Mobile (375px - 767px)

- [ ] **Welcome Overlay** als Bottom Sheet
  - [ ] 65vh Höhe
  - [ ] Rounded Top Corners (24px)
  - [ ] Drag Handle sichtbar
  - [ ] Touch-friendly (44px Buttons)

- [ ] **PWA Prompt** Bottom Right
  - [ ] 16px von Edges
  - [ ] 80px über Bottom Nav
  - [ ] Full-width minus 32px
  - [ ] Max-width: 360px

- [ ] **Toast** Top Center
  - [ ] 16px von allen Seiten
  - [ ] Full-width minus 32px
  - [ ] Keine Overlap mit Header

- [ ] **Tooltips** Smart Positioning
  - [ ] Avoid viewport edges
  - [ ] Arrow points to target
  - [ ] Max-width: 280px

### Tablet (768px - 1023px)

- [ ] **Layouts** funktionieren
- [ ] **Touch Targets** ≥ 44px
- [ ] **Keine Layout Breaks**

### Desktop (1024px+)

- [ ] **Welcome Overlay** als Centered Modal
  - [ ] 480px width
  - [ ] Auto height
  - [ ] Centered (50%, 50%, translate)
  - [ ] Full rounded (24px)
  - [ ] No Drag Handle

- [ ] **PWA Prompt** als Sidebar
  - [ ] Top: 120px (below header)
  - [ ] Right: 24px
  - [ ] Width: 320px
  - [ ] Slide-in from right

- [ ] **Toast** Bottom Left
  - [ ] Bottom: 24px, Left: 24px
  - [ ] Max-width: 400px
  - [ ] Slide-in from left

- [ ] **Hover States** funktionieren
  - [ ] Alle Buttons
  - [ ] Alle Cards
  - [ ] Alle Links

### Breakpoints

- [ ] **375px** - Mobile Small ✓
- [ ] **768px** - Tablet ✓
- [ ] **1024px** - Desktop ✓
- [ ] **1280px** - Large Desktop ✓

---

## ♿ 4. Accessibility

### Keyboard Navigation

- [ ] **Tab Order** logisch
  - [ ] Modals: Focus trap aktiv
  - [ ] Buttons in richtiger Reihenfolge
  - [ ] Skip Links funktionieren

- [ ] **Focus Indicators** sichtbar
  - [ ] 2px solid green (#10B981)
  - [ ] 2px offset
  - [ ] Nur bei :focus-visible

- [ ] **ESC Key** schließt Overlays
  - [ ] Welcome Overlay
  - [ ] Access Explainer Modal
  - [ ] Tooltips
  - [ ] Toast (optional)

- [ ] **Enter Key** aktiviert Buttons
  - [ ] Primary CTAs
  - [ ] Secondary Actions

### Screen Reader

- [ ] **ARIA Labels** gesetzt
  - [ ] Alle Icon Buttons
  - [ ] Close Buttons
  - [ ] Progress Indicators

- [ ] **ARIA Roles** korrekt
  - [ ] `role="dialog"` für Modals
  - [ ] `aria-modal="true"` gesetzt
  - [ ] `role="status"` für Toasts
  - [ ] `aria-live="polite"` für Updates

- [ ] **Heading Hierarchy** logisch
  - [ ] H2 für Modal Titles
  - [ ] H3 für Section Titles
  - [ ] Keine H-Level übersprungen

- [ ] **Alt Text** für Emojis
  - [ ] `role="img"`
  - [ ] `aria-label="Waving hand"`

### Color Contrast

- [ ] **WCAG AA** erfüllt (4.5:1)
  - [ ] Primary Text vs Background
  - [ ] Secondary Text vs Background
  - [ ] Button Text vs Button BG

- [ ] **WCAG AAA** angestrebt (7:1)
  - [ ] Headlines
  - [ ] CTAs

- [ ] **Focus Indicators** kontrastreich
  - [ ] Green vs Dark Background

### Touch Targets

- [ ] **Minimum 44x44px**
  - [ ] Alle Buttons
  - [ ] Close Buttons
  - [ ] Checkbox/Radio (wenn verwendet)

- [ ] **Spacing** zwischen Targets
  - [ ] Minimum 8px Gap
  - [ ] Besser 12-16px

---

## 🔄 5. Interactions & States

### Button States

- [ ] **Default** - Resting state
  - [ ] Richtige Farben
  - [ ] Shadow/Border

- [ ] **Hover** - Mouse over
  - [ ] Color Change
  - [ ] Transform (-2px Y)
  - [ ] Shadow Increase

- [ ] **Active** - Click/Press
  - [ ] Transform (0px Y)
  - [ ] Color Darken

- [ ] **Focus** - Keyboard focus
  - [ ] Focus Ring
  - [ ] Outline visible

- [ ] **Disabled** - Not interactive
  - [ ] Opacity: 0.5
  - [ ] Cursor: not-allowed
  - [ ] No Hover Effect

### Loading States

- [ ] **Spinner** oder Skeleton
  - [ ] PWA Install (nach Click)
  - [ ] Form Submissions
  - [ ] Data Fetching

- [ ] **Progress Indicators**
  - [ ] Progress Dots für Stepper
  - [ ] Loading Bars (wenn lang)

### Error States

- [ ] **Inline Errors** (wenn Forms)
  - [ ] Red Border
  - [ ] Error Message
  - [ ] Icon (❌)

- [ ] **Toast Errors**
  - [ ] Red Accent
  - [ ] Clear Message
  - [ ] Action Button (optional)

### Success States

- [ ] **Confirmation Messages**
  - [ ] Green Toast
  - [ ] Checkmark Icon
  - [ ] Auto-dismiss (5s)

- [ ] **Celebrations** (optional)
  - [ ] Confetti (OG Pass Mint)
  - [ ] Checkmark Animation
  - [ ] Success Sound (optional)

---

## 🧪 6. User Flow Testing

### Welcome Overlay Flow

- [ ] **Trigger** nach 2s delay
- [ ] **Backdrop Click** schließt
- [ ] **"Try Demo"** startet Demo
- [ ] **"Skip Tour"** schließt ohne Demo
- [ ] **LocalStorage** speichert State
- [ ] **Nicht erneut** bei Return

### Demo Analysis Flow

- [ ] **Address Typing** smooth (30ms/char)
- [ ] **Button Pulse** startet nach Typing
- [ ] **Auto-Click** nach 2s (optional)
- [ ] **Loading State** zeigt Spinner
- [ ] **Results** animieren staggered
- [ ] **Tooltips** erscheinen nacheinander

### PWA Install Flow

- [ ] **Timing** korrekt (3 Min nach firstAnalyze)
- [ ] **Prompt** erscheint Bottom Right
- [ ] **"Install"** öffnet Browser Dialog
- [ ] **"Not Now"** dismissed prompt
- [ ] **Re-prompt** nach 24h
- [ ] **Already Installed** zeigt nicht

### Access Explainer Flow

- [ ] **Trigger** beim ersten Access-Besuch
- [ ] **Modal** erscheint centered
- [ ] **OG + Holder Cards** sichtbar
- [ ] **"Calculate Lock"** wechselt Tab
- [ ] **"Check Balance"** wechselt Tab
- [ ] **"Maybe Later"** schließt Modal
- [ ] **LocalStorage** speichert Flag

---

## 🎨 7. Design Consistency

### Component Reuse

- [ ] **Buttons** verwenden shared styles
  - [ ] `.btn-primary`
  - [ ] `.btn-secondary`
  - [ ] `.btn-ghost`

- [ ] **Cards** konsistent
  - [ ] Same Border Radius
  - [ ] Same Background
  - [ ] Same Padding

- [ ] **Modals** folgen Template
  - [ ] Header + Body + Footer
  - [ ] Close Button top-right
  - [ ] Max-height + Scroll

### Spacing System

- [ ] **Alle Spaces** aus 8px-Skala
  - [ ] 4px, 8px, 12px, 16px, 24px, 32px, 48px

- [ ] **Keine Magic Numbers**
  - [ ] 7px ❌
  - [ ] 15px ❌
  - [ ] 23px ❌

### Typography Scale

- [ ] **Font Sizes** konsistent
  - [ ] 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px

- [ ] **Font Weights** definiert
  - [ ] 400 (Regular)
  - [ ] 500 (Medium)
  - [ ] 600 (Semibold)
  - [ ] 700 (Bold)

---

## 🚀 8. Performance

### Load Times

- [ ] **Component Mounts** < 100ms
- [ ] **Animations Start** immediately
- [ ] **No Blocking JS** während Onboarding

### Bundle Size

- [ ] **Onboarding Components** lazy-loaded
- [ ] **Icons** optimiert (SVG oder Font)
- [ ] **Images** compressed (wenn verwendet)

### Memory

- [ ] **No Memory Leaks**
  - [ ] Event Listeners cleaned up
  - [ ] Timers cleared
  - [ ] Refs released

### Network

- [ ] **LocalStorage** nur bei Changes
- [ ] **Analytics** batched (nicht jedes Event einzeln)
- [ ] **No Unnecessary Requests**

---

## 📊 9. Analytics & Tracking

### Events Implementiert

- [ ] `onboarding_tour_shown`
- [ ] `onboarding_tour_completed`
- [ ] `onboarding_tour_skipped`
- [ ] `first_analyze`
- [ ] `pwa_install_prompt_shown`
- [ ] `pwa_install_clicked`
- [ ] `pwa_install_outcome`
- [ ] `access_explainer_shown`
- [ ] `access_explainer_calculate_clicked`
- [ ] `access_explainer_check_balance_clicked`

### State Tracking

- [ ] **LocalStorage** schreibt bei Changes
- [ ] **Custom Events** dispatched
- [ ] **State Provider** (wenn React Context)

### Funnel Setup

- [ ] **Dashboard** vorbereitet
  - [ ] Welcome → Demo → Analyze
  - [ ] Analyze → Features → PWA
  - [ ] Access Page → Explainer → Action

---

## 🐛 10. Error Handling

### Edge Cases

- [ ] **LocalStorage voll** (Safari Limit)
  - [ ] Try/Catch um alle Writes
  - [ ] Fallback zu SessionStorage

- [ ] **Private Mode** (keine Persistence)
  - [ ] App funktioniert ohne LocalStorage
  - [ ] State in Memory

- [ ] **Old Browsers** (keine beforeinstallprompt)
  - [ ] PWA Prompt zeigt iOS-Anleitung
  - [ ] Graceful Degradation

- [ ] **Slow Networks**
  - [ ] Loading States
  - [ ] Timeouts (30s)
  - [ ] Retry Logic

### Fallbacks

- [ ] **JS Disabled** - Graceful Degradation
- [ ] **CSS Not Loaded** - Functional ohne Styles
- [ ] **Service Worker Failed** - App funktioniert

---

## ✅ 11. Final Checks

### Code Quality

- [ ] **TypeScript** - No Errors
- [ ] **ESLint** - No Warnings
- [ ] **Prettier** - Formatted
- [ ] **Tests** - Passing (wenn vorhanden)

### Documentation

- [ ] **README** aktualisiert
- [ ] **Comments** in komplexen Teilen
- [ ] **Props documented** (TSDoc)

### Git

- [ ] **Branch** aktuell (main/develop)
- [ ] **Commit Messages** klar
- [ ] **No Console.logs** (außer gewollt)
- [ ] **No Debug Code**

### Environment

- [ ] **ENV Variables** gesetzt (Production)
- [ ] **Analytics Keys** korrekt
- [ ] **API Endpoints** Production URLs

---

## 🎉 Sign-Off

### Reviewer: _______________

### Date: _______________

### Status:
- [ ] ✅ **Approved** - Ready for Launch
- [ ] ⚠️ **Approved with Minor Issues** - Can launch, fix later
- [ ] ❌ **Not Approved** - Major issues, must fix

### Notes:
```
[Platz für Reviewer-Notizen]




```

---

## 📈 Post-Launch Monitoring

### Week 1 Checklist

- [ ] **Analytics** täglich prüfen
- [ ] **Onboarding Completion** > 70%?
- [ ] **PWA Install Rate** > 40%?
- [ ] **Time to First Action** < 60s?
- [ ] **Error Rate** < 1%?
- [ ] **User Feedback** sammeln

### Iteration Plan

- [ ] **A/B Tests** planen
- [ ] **Drop-off Points** identifizieren
- [ ] **User Interviews** (5-10 Users)
- [ ] **Heatmaps** (Hotjar/Microsoft Clarity)

---

**Review komplett! 🎨**

**Wenn alle Checkboxen ✅ sind → Launch Ready! 🚀**
