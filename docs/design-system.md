# 🎨 Sparkfined Design System - Styling Guide

Komplett überarbeitetes Design-System mit Glassmorphism, Microinteractions und modernen Effekten.

---

## 📦 Was ist neu?

### 1. **Glassmorphism-Effekte**
### 2. **Modernes Button-System**
### 3. **Card-Varianten**
### 4. **Microinteractions**
### 5. **Responsive Typography**
### 6. **Utility-Classes**

---

## 🪟 Glassmorphism

Moderne Frosted-Glass-Effekte mit Backdrop-Blur.

### Verfügbare Klassen:

```tsx
// Basis Glassmorphism
<div className="glass p-6 rounded-2xl">
  Content with frosted glass effect
</div>

// Subtiler Glass-Effekt
<div className="glass-subtle p-6 rounded-2xl">
  Lighter frosted glass
</div>

// Heavy Glass (mehr Blur)
<div className="glass-heavy p-6 rounded-2xl">
  Heavy frosted glass with strong blur
</div>
```

### Verwendung in Komponenten:

```tsx
// Dashboard Card mit Glassmorphism
<div className="glass p-6 rounded-3xl shadow-lg">
  <h3 className="text-xl font-semibold mb-4">Glass Card</h3>
  <p className="text-text-secondary">
    Moderner Glassmorphism-Effekt für elegante UI
  </p>
</div>
```

---

## 📐 Elevation & Depth

Verschiedene Schatten-Ebenen für visuielle Hierarchie.

```tsx
// Niedrige Elevation (subtil)
<div className="elevation-low p-4 rounded-xl">
  Subtle shadow
</div>

// Mittlere Elevation
<div className="elevation-medium p-4 rounded-xl">
  Medium shadow
</div>

// Hohe Elevation
<div className="elevation-high p-4 rounded-xl">
  Strong shadow
</div>

// Floating Elevation (schwebt über der Seite)
<div className="elevation-float p-4 rounded-xl">
  Floating element
</div>
```

---

## 🎴 Card-System

Umfangreiche Card-Varianten für verschiedene Use-Cases.

### Card-Varianten:

```tsx
// Standard Card
<div className="card">
  Standard surface card
</div>

// Elevated Card (höher, mehr Schatten)
<div className="card-elevated">
  Elevated surface with shadow
</div>

// Glass Card (Glassmorphism)
<div className="card-glass">
  Frosted glass card
</div>

// Bordered Card (nur Border, transparenter Hintergrund)
<div className="card-bordered">
  Transparent with border only
</div>

// Glow Card (Brand-Glow)
<div className="card-glow">
  Card with brand glow effect
</div>

// Interactive Card (Hover-Effekte, Top-Border-Animation)
<div className="card-interactive">
  Hover me!
</div>
```

> **TypeScript-Hinweis:** Motion-spezifische Props (z. B. `whileHover` oder animierte `style`-Werte) werden nur an interaktive Cards weitergereicht. Statische Cards akzeptieren ausschließlich reguläre HTML/CSS-Properties, damit `style` sauber mit `CSSProperties` typisiert bleibt.

### Beispiel: Dashboard KPI Card

```tsx
<div className="card-glass p-6 rounded-2xl space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-xs uppercase tracking-wide text-text-tertiary">
      Net P&L
    </span>
    <span className="text-2xl font-bold text-gradient-success">
      +12.5%
    </span>
  </div>
  <div className="text-sm text-text-secondary">
    Last 30 days
  </div>
</div>
```

---

## 🔘 Button-System

Komplett überarbeitete Buttons mit Hover-Animationen.

**TypeScript-Hinweis:** Framer-Motion-Buttons nehmen ausschließlich `ReactNode` als `children` entgegen. `MotionValue`-Payloads werden in den Motion-Props herausgefiltert, damit Komponenten-APIs konsistent bleiben.

### Button-Varianten:

```tsx
// Primary Button (Gradient + Glow)
<button className="btn btn-primary">
  Primary Action
</button>

// Secondary Button (Subtle Surface)
<button className="btn btn-secondary">
  Secondary Action
</button>

// Ghost Button (Transparent)
<button className="btn btn-ghost">
  Ghost Button
</button>

// Outline Button (Brand Border)
<button className="btn btn-outline">
  Outline Button
</button>

// Danger Button (Red Gradient)
<button className="btn btn-danger">
  Delete
</button>
```

### Button-Größen:

```tsx
// Small
<button className="btn btn-primary btn-sm">
  Small
</button>

// Default (kein Modifier)
<button className="btn btn-primary">
  Default
</button>

// Large
<button className="btn btn-primary btn-lg">
  Large
</button>
```

### Button States:

```tsx
// Disabled
<button className="btn btn-primary btn-disabled">
  Disabled
</button>

// Loading (mit Shimmer)
<button className="btn btn-primary shimmer">
  Loading...
</button>
```

---

## ✨ Microinteractions

Subtile Hover-Effekte für bessere UX.

### Verfügbare Hover-Effekte:

```tsx
// Lift-Effekt (hebt sich beim Hover)
<div className="hover-lift p-4 bg-surface rounded-xl">
  Hebt sich beim Hover
</div>

// Glow-Effekt
<div className="hover-glow p-4 bg-surface rounded-xl">
  Leuchtet beim Hover
</div>

// Scale-Effekt
<div className="hover-scale p-4 bg-surface rounded-xl">
  Vergrößert sich beim Hover
</div>

// Brightness-Effekt
<img src="..." className="hover-brightness rounded-xl" />
```

### Live-Indicator mit Pulse:

```tsx
// Pulsierende Live-Badge
<span className="pulse-live inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentiment-bull-bg text-sentiment-bull">
  <span className="w-2 h-2 rounded-full bg-sentiment-bull" />
  Live
</span>
```

### Loading Shimmer:

```tsx
// Skeleton mit Shimmer-Animation
<div className="shimmer h-20 rounded-xl bg-surface-skeleton" />
```

---

## 📝 Typography

Responsive Typography mit Fluid-Sizing und Gradient-Text.

### Fluid Typography:

```tsx
// Skaliert automatisch zwischen Breakpoints
<h1 className="text-fluid-3xl font-bold">
  Große Überschrift
</h1>

<h2 className="text-fluid-2xl font-semibold">
  Mittlere Überschrift
</h2>

<p className="text-fluid-base">
  Normaler Text
</p>

<span className="text-fluid-sm text-text-secondary">
  Kleiner Text
</span>
```

### Gradient Text:

```tsx
// Brand Gradient
<h1 className="text-gradient-brand text-4xl font-bold">
  Sparkfined
</h1>

// Success Gradient (Bull)
<span className="text-gradient-success text-2xl font-bold">
  +24.5%
</span>

// Danger Gradient (Bear)
<span className="text-gradient-danger text-2xl font-bold">
  -12.3%
</span>
```

---

## 🌈 Border Glows

Leuchtende Borders für Highlights.

```tsx
// Brand Glow
<div className="border-glow-brand p-4 rounded-xl">
  Brand highlight
</div>

// Success Glow
<div className="border-glow-success p-4 rounded-xl">
  Success state
</div>

// Danger Glow
<div className="border-glow-danger p-4 rounded-xl">
  Danger state
</div>
```

---

## 🎨 Background Patterns

Grid-Pattern für Hintergründe.

```tsx
// Small Grid
<div className="bg-grid-pattern min-h-screen">
  Content with grid pattern
</div>

// Large Grid
<div className="bg-grid-pattern-lg min-h-screen">
  Content with larger grid
</div>
```

---

## 📜 Custom Scrollbars

Moderne, minimale Scrollbar-Styles.

```tsx
// Custom Scrollbar
<div className="scrollbar-custom h-96 overflow-y-auto">
  Scrollable content with styled scrollbar
</div>

// Hide Scrollbar
<div className="scrollbar-hide h-96 overflow-y-auto">
  Scrollable content without scrollbar
</div>
```

---

## 🎯 Komplette Beispiele

### Dashboard Card mit allen Features:

```tsx
<div className="card-glass hover-lift p-6 rounded-3xl space-y-4">
  {/* Header mit Gradient Text */}
  <div className="flex items-center justify-between">
    <h3 className="text-fluid-lg font-semibold">
      Trading Performance
    </h3>
    <span className="pulse-live px-3 py-1 rounded-full bg-sentiment-bull-bg text-sentiment-bull text-xs font-semibold">
      Live
    </span>
  </div>

  {/* KPI mit Gradient */}
  <div className="space-y-2">
    <span className="text-xs uppercase tracking-wide text-text-tertiary">
      Net P&L (30d)
    </span>
    <div className="text-gradient-success text-3xl font-bold">
      +$12,450
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-2">
    <button className="btn btn-primary flex-1">
      View Details
    </button>
    <button className="btn btn-ghost">
      Export
    </button>
  </div>
</div>
```

### Interactive List Item:

```tsx
<button className="card-interactive hover-scale w-full text-left space-y-3">
  <div className="flex items-start justify-between">
    <div>
      <h4 className="font-semibold text-text-primary">
        SOL/USDT
      </h4>
      <p className="text-sm text-text-secondary">
        Solana • Mainnet
      </p>
    </div>
    <span className="text-gradient-success font-mono font-bold">
      +8.5%
    </span>
  </div>
  
  <div className="border-glow-success p-3 rounded-xl bg-sentiment-bull-bg/50">
    <span className="text-xs text-sentiment-bull">
      Strong uptrend detected
    </span>
  </div>
</button>
```

### Alert Banner with Glow:

```tsx
<div className="glass-heavy border-glow-brand p-4 rounded-2xl flex items-center gap-3">
  <div className="w-2 h-2 rounded-full bg-brand pulse-live" />
  <div className="flex-1">
    <p className="font-semibold text-text-primary">
      Price Alert Triggered
    </p>
    <p className="text-sm text-text-secondary">
      BTC reached $50,000
    </p>
  </div>
  <button className="btn btn-sm btn-outline">
    Dismiss
</button>
</div>
```

---

## 📚 Kombination mit Tailwind

Alle neuen Klassen funktionieren perfekt mit Tailwind:

```tsx
<div className="card-glass hover-lift backdrop-blur-xl p-6 rounded-3xl space-y-4 transition-all duration-300">
  {/* Glass Card mit Tailwind-Utilities */}
</div>

<button className="btn btn-primary hover:scale-105 active:scale-95 transition-transform">
  {/* Button mit Tailwind-Hover */}
</button>
```

---

## 🎨 Design Tokens

Alle Farben und Spacing-Werte nutzen die CSS Custom Properties aus `tokens.css`:

```css
/* In deinem CSS */
.custom-element {
  background: rgb(var(--color-surface));
  color: rgb(var(--color-text-primary));
  border: 1px solid rgb(var(--color-border));
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
```

---

## 🌓 Dark/Light Mode

Alle Styles unterstützen automatisch Dark/Light Mode via Data-Attribute:

```html
<!-- Dark Mode (Standard) -->
<html data-theme="dark">

<!-- Light Mode -->
<html data-theme="light">

<!-- OLED Mode (nur Dark) -->
<body data-oled="true">
```

---

## 🚀 Performance

Alle Animationen respektieren `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📖 Weitere Ressourcen

- **Tailwind Config**: `tailwind.config.ts`
- **Design Tokens**: `src/styles/tokens.css`
- **Komponenten-Styles**: `src/styles/index.css`
- **Typography**: Nutzt System-Fonts für beste Performance

---

**Happy Styling! 🎨✨**
