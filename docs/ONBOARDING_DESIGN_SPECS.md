# 🎨 Onboarding Design Specifications

**Projekt:** Sparkfined PWA  
**Design System:** Blade Runner × TradingView × Notion  
**Theme:** Dark Mode (Primary)  
**Version:** 2.0  
**Datum:** 2025-11-04

---

## 🎨 Design System Foundation

### Color Palette

```css
/* Primary Colors */
--primary-green: #10B981;      /* green-500 - Main CTA */
--primary-green-hover: #059669; /* green-600 - Hover state */
--primary-green-glow: #00FF66;  /* Neon accent */

/* Secondary Colors */
--secondary-blue: #3B82F6;      /* blue-500 */
--secondary-cyan: #06B6D4;      /* cyan-500 */
--secondary-purple: #8B5CF6;    /* purple-500 */

/* Backgrounds */
--bg-primary: #0A0A0A;          /* zinc-950 - Page background */
--bg-secondary: #18181B;        /* zinc-900 - Card background */
--bg-tertiary: #27272A;         /* zinc-800 - Elevated elements */

/* Borders */
--border-default: #3F3F46;      /* zinc-700 */
--border-subtle: #27272A;       /* zinc-800 */
--border-accent: #10B98133;     /* green-500/20 */

/* Text */
--text-primary: #FAFAFA;        /* zinc-50 */
--text-secondary: #A1A1AA;      /* zinc-400 */
--text-tertiary: #71717A;       /* zinc-500 */

/* Status Colors */
--success: #10B981;             /* green-500 */
--warning: #F59E0B;             /* amber-500 */
--error: #EF4444;               /* red-500 */
--info: #3B82F6;                /* blue-500 */

/* Overlays */
--overlay-backdrop: #000000CC;  /* black/80 */
--overlay-light: #FFFFFF0D;     /* white/5 */
```

### Typography

```css
/* Font Family */
--font-sans: ui-sans-serif, system-ui, -apple-system, 
             BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: ui-monospace, "SF Mono", "Cascadia Code", 
             "Roboto Mono", monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale

```css
/* 8px base scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius

```css
--radius-sm: 0.375rem;  /* 6px - Small elements */
--radius-md: 0.5rem;    /* 8px - Cards, buttons */
--radius-lg: 0.75rem;   /* 12px - Modals */
--radius-xl: 1rem;      /* 16px - Large cards */
--radius-2xl: 1.5rem;   /* 24px - Overlays */
--radius-full: 9999px;  /* Pills, badges */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Glow Effects */
--glow-green: 0 0 20px rgba(16, 185, 129, 0.3);
--glow-blue: 0 0 20px rgba(59, 130, 246, 0.3);
--glow-cyan: 0 0 20px rgba(6, 182, 212, 0.3);
```

### Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 10;
--z-sticky: 20;
--z-fixed: 30;
--z-modal-backdrop: 40;
--z-modal: 50;
--z-toast: 60;
--z-tooltip: 70;
```

---

## 📱 Component 1: Welcome Overlay

### Design Goal
Warm, inviting first impression without blocking the entire screen.

### Layout - Mobile (375px)

```
┌─────────────────────────────────────┐
│                                     │ ← Dimmed AnalyzePage visible
│  [Input Field - partially visible] │
│  [Analyze Button - dimmed]          │
│                                     │
├─────────────────────────────────────┤
│ ╔═════════════════════════════════╗ │
│ ║  Welcome Overlay (Bottom Sheet)  ║ │ ← 60% of viewport height
│ ║                                  ║ │
│ ║  [Content]                       ║ │
│ ║                                  ║ │
│ ╚═════════════════════════════════╝ │
└─────────────────────────────────────┘
```

### Exact Dimensions - Mobile

```css
.welcome-overlay {
  /* Position */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  
  /* Size */
  height: 65vh;
  max-height: 600px;
  
  /* Background */
  background: linear-gradient(
    to bottom,
    rgba(24, 24, 27, 0.98) 0%,
    rgba(24, 24, 27, 1) 20%
  );
  backdrop-filter: blur(12px);
  
  /* Border */
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-top: 1px solid rgba(63, 63, 70, 0.5);
  
  /* Shadow */
  box-shadow: 
    0 -10px 40px -10px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(16, 185, 129, 0.1);
  
  /* Animation */
  animation: slide-up-bottom-sheet 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up-bottom-sheet {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Backdrop */
.welcome-overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 49;
  animation: fade-in 300ms ease-out;
}
```

### Content Layout

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │ ← 8px padding top
│  │ ─────                       │   │ ← Handle (drag indicator)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← 24px padding horizontal
│  │                             │   │
│  │  👋                          │   │ ← 64px emoji
│  │                             │   │
│  │  Welcome to Sparkfined      │   │ ← 30px bold (text-3xl)
│  │                             │   │
│  │  Professional Trading       │   │ ← 16px regular (text-base)
│  │  Analysis                   │   │   zinc-400
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← 32px margin top
│  │ Feature Cards (3 items)     │   │
│  │                             │   │
│  │ 📊 Instant KPIs             │   │ ← 48px each
│  │ 📈 Advanced Charts          │   │   12px gap between
│  │ 🤖 AI Insights              │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← 32px margin top
│  │ CTA Buttons                 │   │
│  │                             │   │
│  │ [Try Demo]  [Skip Tour]     │   │ ← 48px height
│  │                             │   │   12px gap
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← 16px margin top
│  │ • • •                       │   │ ← Progress dots (optional)
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Component Structure

```tsx
<div className="welcome-overlay-backdrop" onClick={handleBackdropClick}>
  <div className="welcome-overlay">
    {/* Drag Handle */}
    <div className="flex justify-center pt-2 pb-4">
      <div className="w-12 h-1 rounded-full bg-zinc-700" />
    </div>
    
    {/* Header */}
    <div className="text-center px-6 mb-8">
      <div className="text-6xl mb-4 animate-bounce-slow">
        👋
      </div>
      <h2 className="text-3xl font-bold mb-2 text-zinc-50">
        Welcome to Sparkfined
      </h2>
      <p className="text-base text-zinc-400">
        Professional Trading Analysis
      </p>
    </div>
    
    {/* Feature Cards */}
    <div className="px-6 mb-8 space-y-3">
      <FeatureCard 
        icon="📊"
        title="Instant KPIs"
        desc="Real-time metrics & heatmaps"
      />
      <FeatureCard 
        icon="📈"
        title="Advanced Charts"
        desc="Draw, analyze, replay sessions"
      />
      <FeatureCard 
        icon="🤖"
        title="AI Insights"
        desc="GPT-powered analysis"
      />
    </div>
    
    {/* CTA Buttons */}
    <div className="px-6 pb-6 flex gap-3">
      <button className="btn-secondary flex-1">
        Skip Tour
      </button>
      <button className="btn-primary flex-1">
        Try Demo
      </button>
    </div>
  </div>
</div>
```

### Feature Card Component

```css
.feature-card {
  /* Layout */
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  
  /* Background */
  background: rgba(39, 39, 42, 0.5);
  
  /* Border */
  border: 1px solid rgba(63, 63, 70, 0.5);
  border-radius: 12px;
  
  /* Transition */
  transition: all 200ms ease;
}

.feature-card:hover {
  background: rgba(39, 39, 42, 0.8);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateX(4px);
}

.feature-card-icon {
  font-size: 32px;
  line-height: 1;
}

.feature-card-content {
  flex: 1;
}

.feature-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #FAFAFA;
  margin-bottom: 2px;
}

.feature-card-desc {
  font-size: 12px;
  color: #A1A1AA;
}
```

### Button Styles

```css
/* Primary Button (Try Demo) */
.btn-primary {
  /* Layout */
  height: 48px;
  padding: 0 24px;
  
  /* Typography */
  font-size: 16px;
  font-weight: 600;
  
  /* Colors */
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: #FFFFFF;
  
  /* Border */
  border: none;
  border-radius: 12px;
  
  /* Shadow */
  box-shadow: 
    0 4px 12px rgba(16, 185, 129, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  /* Transition */
  transition: all 200ms ease;
  
  /* Glow effect */
  position: relative;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 14px;
  opacity: 0;
  filter: blur(8px);
  transition: opacity 200ms ease;
  z-index: -1;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(16, 185, 129, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.btn-primary:hover::before {
  opacity: 0.6;
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button (Skip Tour) */
.btn-secondary {
  /* Layout */
  height: 48px;
  padding: 0 24px;
  
  /* Typography */
  font-size: 16px;
  font-weight: 500;
  
  /* Colors */
  background: rgba(39, 39, 42, 0.8);
  color: #A1A1AA;
  
  /* Border */
  border: 1px solid rgba(63, 63, 70, 0.8);
  border-radius: 12px;
  
  /* Transition */
  transition: all 200ms ease;
}

.btn-secondary:hover {
  background: rgba(39, 39, 42, 1);
  border-color: rgba(63, 63, 70, 1);
  color: #FAFAFA;
}
```

### Desktop Variant (1280px+)

```css
@media (min-width: 1280px) {
  .welcome-overlay {
    /* Center modal instead of bottom sheet */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    bottom: auto;
    
    /* Fixed dimensions */
    width: 480px;
    height: auto;
    max-height: 640px;
    
    /* Full rounded corners */
    border-radius: 24px;
    border: 1px solid rgba(63, 63, 70, 0.5);
    
    /* Animation */
    animation: modal-appear 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  /* Hide drag handle on desktop */
  .welcome-overlay .drag-handle {
    display: none;
  }
}
```

---

## 🎯 Component 2: Demo Token Animation

### Animation Sequence

```
Step 1: Welcome Overlay fades out (300ms)
   ↓
Step 2: Input field highlight (200ms)
   ↓
Step 3: SOL address types in (800ms, character by character)
   ↓
Step 4: Analyze button pulse (infinite until click)
   ↓
Step 5: Loading state (5-10s)
   ↓
Step 6: Results animate in (staggered, 600ms total)
```

### Input Field Highlight

```css
.input-demo-highlight {
  position: relative;
  animation: input-glow 2000ms ease-in-out infinite;
}

@keyframes input-glow {
  0%, 100% {
    box-shadow: 
      0 0 0 2px rgba(16, 185, 129, 0.2),
      0 0 20px rgba(16, 185, 129, 0.1);
  }
  50% {
    box-shadow: 
      0 0 0 2px rgba(16, 185, 129, 0.4),
      0 0 30px rgba(16, 185, 129, 0.2);
  }
}
```

### Typing Animation

```tsx
// React implementation
const typeAddress = async (address: string, setAddress: (s: string) => void) => {
  for (let i = 0; i <= address.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 30)) // 30ms per char
    setAddress(address.slice(0, i))
  }
}
```

```css
/* Cursor blink */
.typing-cursor::after {
  content: '|';
  animation: cursor-blink 1000ms step-end infinite;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### Button Pulse (Call-to-Action)

```css
.btn-pulse {
  animation: button-pulse 2000ms ease-in-out infinite;
}

@keyframes button-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
}
```

### Results Staggered Animation

```css
.result-card {
  opacity: 0;
  animation: result-card-in 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.result-card:nth-child(1) { animation-delay: 100ms; }
.result-card:nth-child(2) { animation-delay: 200ms; }
.result-card:nth-child(3) { animation-delay: 300ms; }
.result-card:nth-child(4) { animation-delay: 400ms; }
.result-card:nth-child(5) { animation-delay: 500ms; }
.result-card:nth-child(6) { animation-delay: 600ms; }

@keyframes result-card-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 💡 Component 3: Contextual Tooltips

### Design Goal
Lightweight, non-intrusive hints that appear near their target.

### Tooltip Structure

```
┌─────────────────────────────────────┐
│  [Target Element - KPI Card]        │ ← Element being explained
│  ┌───────────────────────────────┐  │
│  │ Close: $123.45               │  │
│  └───────────────────────────────┘  │
│     ↓ (arrow)                       │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ 💡 Key metrics at a glance   ┃  │ ← Tooltip
│  ┃                              ┃  │
│  ┃ Click any card for detailed ┃  │
│  ┃ information.                 ┃  │
│  ┃                              ┃  │
│  ┃ [Got it] [Next →]            ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└─────────────────────────────────────┘
```

### Dimensions & Styling

```css
.tooltip {
  /* Position - calculated dynamically */
  position: absolute;
  z-index: 70;
  
  /* Size */
  max-width: 280px;
  padding: 16px;
  
  /* Background */
  background: linear-gradient(
    135deg,
    rgba(24, 24, 27, 0.98) 0%,
    rgba(39, 39, 42, 0.98) 100%
  );
  backdrop-filter: blur(12px);
  
  /* Border */
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  
  /* Shadow */
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(16, 185, 129, 0.1),
    0 0 20px rgba(16, 185, 129, 0.15);
  
  /* Animation */
  animation: tooltip-appear 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes tooltip-appear {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Arrow */
.tooltip::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 24px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid rgba(16, 185, 129, 0.3);
}

.tooltip::after {
  content: '';
  position: absolute;
  top: -7px;
  left: 25px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid rgba(24, 24, 27, 0.98);
}

/* Icon */
.tooltip-icon {
  display: inline-block;
  font-size: 18px;
  margin-right: 8px;
  vertical-align: middle;
}

/* Content */
.tooltip-content {
  font-size: 14px;
  line-height: 1.5;
  color: #FAFAFA;
  margin-bottom: 12px;
}

/* Buttons */
.tooltip-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.tooltip-btn {
  flex: 1;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 150ms ease;
}

.tooltip-btn-secondary {
  background: rgba(39, 39, 42, 0.8);
  border: 1px solid rgba(63, 63, 70, 0.5);
  color: #A1A1AA;
}

.tooltip-btn-secondary:hover {
  background: rgba(39, 39, 42, 1);
  color: #FAFAFA;
}

.tooltip-btn-primary {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10B981;
}

.tooltip-btn-primary:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: rgba(16, 185, 129, 0.5);
}
```

### Positioning Logic

```tsx
// Smart positioning to avoid viewport edges
function calculateTooltipPosition(
  targetElement: HTMLElement,
  tooltipWidth: number,
  tooltipHeight: number
) {
  const rect = targetElement.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let top = rect.bottom + 12 // 12px gap
  let left = rect.left
  
  // Adjust if overflowing right
  if (left + tooltipWidth > viewportWidth - 16) {
    left = viewportWidth - tooltipWidth - 16
  }
  
  // Adjust if overflowing left
  if (left < 16) {
    left = 16
  }
  
  // Flip to top if overflowing bottom
  if (top + tooltipHeight > viewportHeight - 16) {
    top = rect.top - tooltipHeight - 12
  }
  
  return { top, left }
}
```

---

## 📲 Component 4: PWA Install Prompt

### Mobile Design (Bottom Right)

```
┌─────────────────────────────────────┐
│  AnalyzePage                        │
│                                     │
│  [Content continues...]             │
│                                     │
│                                     │
│                 ┏━━━━━━━━━━━━━━━┓   │ ← 16px from edges
│                 ┃ 📲 Install    ┃   │
│                 ┃               ┃   │
│                 ┃ ✓ Fast        ┃   │
│                 ┃ ✓ Offline     ┃   │
│                 ┃ ✓ Alerts      ┃   │
│                 ┃               ┃   │
│                 ┃ [Install]     ┃   │
│                 ┃ [Not Now]     ┃   │
│                 ┗━━━━━━━━━━━━━━━┛   │
│                                     │
│  Bottom Nav                         │ ← 80px height
└─────────────────────────────────────┘
     ↑
     80px from bottom (above Bottom Nav)
```

### Dimensions & Styling

```css
.pwa-prompt {
  /* Position */
  position: fixed;
  bottom: 96px; /* 80px nav + 16px gap */
  right: 16px;
  z-index: 60;
  
  /* Size */
  width: calc(100vw - 32px);
  max-width: 360px;
  
  /* Background */
  background: linear-gradient(
    135deg,
    rgba(24, 24, 27, 0.98) 0%,
    rgba(39, 39, 42, 0.98) 100%
  );
  backdrop-filter: blur(20px);
  
  /* Border */
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  
  /* Shadow */
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(16, 185, 129, 0.1),
    0 0 40px rgba(16, 185, 129, 0.2);
  
  /* Animation */
  animation: pwa-prompt-in 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes pwa-prompt-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Close button */
.pwa-prompt-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(39, 39, 42, 0.8);
  border: none;
  border-radius: 6px;
  color: #71717A;
  font-size: 18px;
  cursor: pointer;
  transition: all 150ms ease;
}

.pwa-prompt-close:hover {
  background: rgba(39, 39, 42, 1);
  color: #FAFAFA;
}

/* Content padding */
.pwa-prompt-content {
  padding: 20px;
  padding-top: 16px; /* Less top padding due to close btn */
}

/* Header */
.pwa-prompt-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pwa-prompt-icon {
  font-size: 40px;
  line-height: 1;
}

.pwa-prompt-title {
  font-size: 20px;
  font-weight: 700;
  color: #FAFAFA;
}

/* Benefits list */
.pwa-benefits {
  margin-bottom: 20px;
  space-y: 8px;
}

.pwa-benefit {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #A1A1AA;
}

.pwa-benefit-check {
  font-size: 16px;
  color: #10B981;
}

/* Action buttons */
.pwa-prompt-actions {
  display: flex;
  gap: 10px;
}

.pwa-prompt-actions button {
  flex: 1;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 150ms ease;
}
```

### Desktop Variant (Sidebar)

```css
@media (min-width: 1024px) {
  .pwa-prompt {
    /* Position */
    top: 120px; /* Below header */
    right: 24px;
    bottom: auto;
    
    /* Size */
    width: 320px;
    
    /* Different animation on desktop */
    animation: pwa-prompt-in-desktop 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @keyframes pwa-prompt-in-desktop {
    from {
      opacity: 0;
      transform: translateX(20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
}
```

---

## 🎫 Component 5: Access Explainer Modal

### Layout - Mobile

```
┌─────────────────────────────────────┐
│  [Header with Close]                │ ← 60px height
│                                     │
│  🎫 Understanding Access            │ ← 24px text
│  Two ways to unlock                 │ ← 14px text
│                                     │
├─────────────────────────────────────┤
│  Scrollable Content                 │ ← overflow-y-auto
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👑 OG Pass                  │   │ ← Card 1
│  │ • Lock tokens               │   │
│  │ • Lifetime access           │   │
│  │ [Calculate]                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💎 Holder Access            │   │ ← Card 2
│  │ • Hold ≥100k tokens         │   │
│  │ • Flexible                  │   │
│  │ [Check Balance]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Comparison Table]                 │
│                                     │
├─────────────────────────────────────┤
│  [Footer Actions]                   │ ← 72px height
│  [Maybe Later] [Get Started]        │
└─────────────────────────────────────┘
```

### Exact Dimensions

```css
.access-explainer-modal {
  /* Position */
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  
  /* Background */
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  
  /* Animation */
  animation: modal-backdrop-in 300ms ease-out;
}

.access-explainer-content {
  /* Size */
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  
  /* Background */
  background: linear-gradient(
    to bottom,
    rgba(24, 24, 27, 1) 0%,
    rgba(39, 39, 42, 1) 100%
  );
  
  /* Border */
  border: 1px solid rgba(63, 63, 70, 0.8);
  border-radius: 20px;
  
  /* Shadow */
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(16, 185, 129, 0.1);
  
  /* Layout */
  display: flex;
  flex-direction: column;
  
  /* Animation */
  animation: modal-content-in 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-content-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Header */
.access-explainer-header {
  padding: 24px;
  padding-bottom: 20px;
  text-align: center;
  position: relative;
}

.access-explainer-emoji {
  font-size: 56px;
  margin-bottom: 12px;
  animation: bounce-slow 2s ease-in-out infinite;
}

.access-explainer-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.access-explainer-subtitle {
  font-size: 14px;
  color: #A1A1AA;
}

/* Close button */
.access-explainer-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  /* ... same as PWA close btn ... */
}

/* Scrollable body */
.access-explainer-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

/* Footer */
.access-explainer-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(63, 63, 70, 0.5);
  display: flex;
  gap: 12px;
}
```

### Access Option Cards

```css
.access-option-card {
  /* Layout */
  padding: 20px;
  margin-bottom: 16px;
  
  /* Background - Green variant (OG) */
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.1) 0%,
    rgba(59, 130, 246, 0.1) 100%
  );
  
  /* Border */
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  
  /* Transition */
  transition: all 250ms ease;
}

.access-option-card:hover {
  border-color: rgba(16, 185, 129, 0.4);
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.15) 0%,
    rgba(59, 130, 246, 0.15) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
}

/* Blue variant (Holder) */
.access-option-card.holder {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 100%
  );
  border-color: rgba(59, 130, 246, 0.2);
}

.access-option-card.holder:hover {
  border-color: rgba(59, 130, 246, 0.4);
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(139, 92, 246, 0.15) 100%
  );
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

/* Card header */
.access-option-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.access-option-icon {
  font-size: 36px;
  line-height: 1;
}

.access-option-title {
  font-size: 20px;
  font-weight: 700;
  color: #10B981; /* OG variant */
}

.access-option-card.holder .access-option-title {
  color: #3B82F6; /* Holder variant */
}

.access-option-subtitle {
  font-size: 13px;
  color: #71717A;
}

/* Feature list */
.access-feature-list {
  margin-bottom: 16px;
  space-y: 8px;
}

.access-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #D4D4D8;
}

.access-feature-check {
  color: #10B981;
  font-size: 16px;
  margin-top: 2px;
}

/* Info box */
.access-info-box {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.access-info-text {
  font-size: 12px;
  line-height: 1.5;
  color: #A1A1AA;
}

/* CTA button in card */
.access-card-cta {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 200ms ease;
}

.access-card-cta.og {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10B981;
}

.access-card-cta.og:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: rgba(16, 185, 129, 0.5);
  transform: translateY(-2px);
}

.access-card-cta.holder {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3B82F6;
}

.access-card-cta.holder:hover {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}
```

### Comparison Table

```css
.comparison-table {
  background: rgba(39, 39, 42, 0.5);
  border: 1px solid rgba(63, 63, 70, 0.5);
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
  overflow-x: auto;
}

.comparison-table-title {
  font-size: 16px;
  font-weight: 600;
  color: #FAFAFA;
  margin-bottom: 12px;
}

table {
  width: 100%;
  font-size: 14px;
}

thead th {
  text-align: left;
  padding: 8px;
  color: #A1A1AA;
  font-weight: 500;
  border-bottom: 1px solid rgba(63, 63, 70, 0.5);
}

tbody tr {
  border-bottom: 1px solid rgba(63, 63, 70, 0.3);
}

tbody tr:last-child {
  border-bottom: none;
}

tbody td {
  padding: 12px 8px;
  color: #D4D4D8;
}

tbody td:first-child {
  color: #FAFAFA;
  font-weight: 500;
}

tbody td:not(:first-child) {
  text-align: center;
}
```

---

## 🍞 Component 6: Toast Messages

### Design Goal
Lightweight notifications that don't interrupt the user.

### Position & Animation

```
Mobile:
┌─────────────────────────────────────┐
│                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │ ← 16px from edges
│  ┃ 💡 Tip: Save to Journal    ┃   │   16px from top
│  ┃ [Show me] [Dismiss]         ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│                                     │
│  Content                            │
│                                     │
└─────────────────────────────────────┘

Desktop:
┌─────────────────────────────────────┐
│                                     │
│                                     │
│  Content                            │
│                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━┓          │ ← 24px from edges
│  ┃ 💡 Tip: Save to       ┃          │   24px from bottom
│  ┃ Journal               ┃          │
│  ┃ [Show me] [Dismiss]   ┃          │
│  ┗━━━━━━━━━━━━━━━━━━━━━━┛          │
└─────────────────────────────────────┘
```

### Styling

```css
.toast {
  /* Position */
  position: fixed;
  z-index: 60;
  
  /* Mobile */
  top: 16px;
  left: 16px;
  right: 16px;
  
  /* Size */
  max-width: 100%;
  padding: 14px 16px;
  
  /* Background */
  background: linear-gradient(
    135deg,
    rgba(24, 24, 27, 0.98) 0%,
    rgba(39, 39, 42, 0.98) 100%
  );
  backdrop-filter: blur(12px);
  
  /* Border */
  border: 1px solid rgba(63, 63, 70, 0.8);
  border-left: 3px solid #10B981; /* Accent */
  border-radius: 10px;
  
  /* Shadow */
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(16, 185, 129, 0.1);
  
  /* Animation */
  animation: toast-in 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Auto-dismiss animation */
.toast.dismissing {
  animation: toast-out 300ms cubic-bezier(0.4, 0, 1, 1);
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
}

/* Desktop positioning */
@media (min-width: 1024px) {
  .toast {
    top: auto;
    bottom: 24px;
    left: 24px;
    right: auto;
    max-width: 400px;
  }
  
  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes toast-out {
    to {
      opacity: 0;
      transform: translateX(-20px) scale(0.95);
    }
  }
}

/* Toast content */
.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.toast-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: #FAFAFA;
}

.toast-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.toast-btn {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 150ms ease;
}

.toast-btn-primary {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10B981;
}

.toast-btn-primary:hover {
  background: rgba(16, 185, 129, 0.25);
}

.toast-btn-ghost {
  background: transparent;
  border: none;
  color: #A1A1AA;
}

.toast-btn-ghost:hover {
  color: #FAFAFA;
}

/* Toast variants */
.toast.info {
  border-left-color: #3B82F6;
}

.toast.success {
  border-left-color: #10B981;
}

.toast.warning {
  border-left-color: #F59E0B;
}

.toast.error {
  border-left-color: #EF4444;
}
```

### Auto-Dismiss Logic

```tsx
// React implementation
const showToast = (message: string, duration = 5000) => {
  // Show toast
  setVisible(true)
  
  // Auto-dismiss after duration
  const timer = setTimeout(() => {
    setVisible(false)
  }, duration)
  
  // Cleanup
  return () => clearTimeout(timer)
}
```

---

## 📏 Responsive Breakpoints

```css
/* Mobile First (default) */
/* 375px - 767px */

/* Tablet */
@media (min-width: 768px) {
  /* Larger touch targets */
  /* More horizontal space */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Hover states */
  /* Sidebar layouts */
  /* Keyboard shortcuts */
}

/* Large Desktop */
@media (min-width: 1280px) {
  /* Max-width containers */
  /* Multi-column layouts */
}
```

---

## ♿ Accessibility Considerations

### Focus Indicators

```css
/* Global focus ring */
*:focus-visible {
  outline: 2px solid #10B981;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Button focus */
button:focus-visible {
  outline: 2px solid #10B981;
  outline-offset: 2px;
}

/* Input focus */
input:focus-visible,
textarea:focus-visible {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader

```tsx
// ARIA labels
<button aria-label="Close welcome overlay">
  ✕
</button>

<div role="dialog" aria-labelledby="welcome-title" aria-modal="true">
  <h2 id="welcome-title">Welcome to Sparkfined</h2>
</div>

// Live regions for toasts
<div role="status" aria-live="polite">
  {toastMessage}
</div>
```

---

## 🎬 Animation Timing

```css
/* Durations */
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;

/* Easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);

/* Usage */
.element {
  transition: all var(--duration-base) var(--ease-spring);
}
```

---

## 🎨 Design Tokens Summary

```typescript
// tokens.ts
export const tokens = {
  colors: {
    primary: '#10B981',
    primaryHover: '#059669',
    secondary: '#3B82F6',
    background: {
      primary: '#0A0A0A',
      secondary: '#18181B',
      tertiary: '#27272A',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#A1A1AA',
      tertiary: '#71717A',
    },
    border: {
      default: '#3F3F46',
      subtle: '#27272A',
      accent: 'rgba(16, 185, 129, 0.2)',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },
  
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  
  animation: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '400ms',
    },
    easing: {
      spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
  
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    toast: 60,
    tooltip: 70,
  },
}
```

---

**Design Specs komplett! 🎨**

**Nächste Schritte:**
1. 🖼️ Figma Prototyp erstellen?
2. 💻 Implementation starten?
3. 🎨 Weitere Components verfeinern?

Lass mich wissen, was du als nächstes brauchst! 🚀
