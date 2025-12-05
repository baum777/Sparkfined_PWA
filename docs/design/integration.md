# 🔧 Integration & Best Practices

Kombination mit Tailwind, Design Tokens, Theme-Switching und Performance-Optimierung.

---

## Kombination mit Tailwind

Alle Design-System-Klassen funktionieren perfekt mit Tailwind-Utilities:

```tsx
<div className="card-glass hover-lift backdrop-blur-xl p-6 rounded-3xl space-y-4 transition-all duration-300">
  {/* Glass Card mit Tailwind-Utilities */}
</div>

<button className="btn btn-primary hover:scale-105 active:scale-95 transition-transform">
  {/* Button mit Tailwind-Hover */}
</button>
```

### Empfohlene Kombinationen

```tsx
{/* Card mit responsive Padding */}
<div className="card-glass p-4 md:p-6 lg:p-8 rounded-2xl">

{/* Button mit conditional Classes */}
<button className={`btn ${isPrimary ? 'btn-primary' : 'btn-secondary'}`}>

{/* Grid mit responsive Columns */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="card-elevated p-6 rounded-xl">...</div>
</div>
```

---

## Design Tokens

Alle Farben und Spacing-Werte nutzen CSS Custom Properties aus `tokens.css`.

### Verwendung in Custom CSS

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

### Verfügbare Token-Kategorien

```css
/* Farben */
--color-brand
--color-accent
--color-background
--color-surface
--color-text-primary
--color-text-secondary
--color-border
--color-sentiment-bull
--color-sentiment-bear

/* Spacing */
--space-1 bis --space-12

/* Border Radius */
--radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl

/* Typography */
--font-sans, --font-mono
--text-xs bis --text-6xl
```

---

## Dark/Light Mode

Alle Styles unterstützen automatisch Dark/Light Mode via Data-Attribute.

### Theme-Switching

```html
<!-- Dark Mode (Standard) -->
<html data-theme="dark">

<!-- Light Mode -->
<html data-theme="light">

<!-- OLED Mode (nur Dark) -->
<body data-oled="true">
```

### Theme-Wechsel in React

```tsx
// Theme-Toggle Component
function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button onClick={toggleTheme} className="btn btn-ghost">
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Custom Theme-Varianten

```css
/* In tokens.css */
[data-theme='light'] {
  --color-background: 255 255 255; /* White */
  --color-surface: 248 250 252; /* Slate-50 */
  --color-text-primary: 15 23 42; /* Slate-900 */
}

[data-theme='dark'] {
  --color-background: 10 10 10; /* Zinc-950 */
  --color-surface: 24 24 27; /* Zinc-900 */
  --color-text-primary: 244 244 245; /* Zinc-100 */
}

[data-oled='true'] {
  --color-background: 0 0 0; /* Pure Black */
}
```

---

## Performance

### Reduced Motion Support

Alle Animationen respektieren `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Performance Best Practices

#### 1. Backdrop-Blur sparsam einsetzen
```tsx
{/* ❌ BAD: Backdrop-Blur auf großen Flächen */}
<div className="glass min-h-screen">...</div>

{/* ✅ GOOD: Backdrop-Blur nur auf Cards */}
<div className="card-glass p-6">...</div>
```

#### 2. CSS Transforms bevorzugen
```tsx
{/* ✅ GOOD: Transform für Animationen */}
<div className="hover-lift">...</div>

{/* ❌ BAD: Position/Size für Animationen */}
<div className="hover:mt-[-4px]">...</div>
```

#### 3. Will-Change für komplexe Animationen
```css
.complex-animation {
  will-change: transform, opacity;
}
```

#### 4. Lazy Loading für Images
```tsx
<img
  src="..."
  loading="lazy"
  className="hover-brightness rounded-xl"
/>
```

---

## Accessibility

### Focus States

Alle interaktiven Elemente haben sichtbare Focus-States:

```css
/* Automatisch integriert in Buttons und Cards */
.btn:focus-visible,
.card-interactive:focus-visible {
  outline: 2px solid rgb(var(--color-brand));
  outline-offset: 2px;
}
```

### Screen Reader Support

```tsx
{/* Visually hidden text for screen readers */}
<span className="sr-only">
  Loading...
</span>

{/* Skip to main content */}
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### ARIA Labels

```tsx
<button className="btn btn-ghost" aria-label="Close dialog">
  ✕
</button>

<div role="status" aria-live="polite">
  <span className="pulse-live">Live</span>
</div>
```

---

## File Structure

```
src/
├── styles/
│   ├── index.css              # Haupt-Stylesheet (importiert alle)
│   ├── tokens.css             # Design Tokens (CSS Variables)
│   ├── motion.css             # Animationen und Transitions
│   ├── fonts.css              # Font-Definitionen
│   ├── high-contrast.css      # Accessibility (High Contrast Mode)
│   ├── App.css                # App-spezifische Styles
│   └── landing.css            # Landing Page Styles
├── tailwind.config.ts         # Tailwind-Konfiguration
└── postcss.config.cjs         # PostCSS-Konfiguration
```

---

## Migration von altem Code

### Schrittweise Migration

```tsx
// VORHER: Inline Styles
<div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '16px' }}>

// NACHHER: Design System Classes
<div className="card-glass p-6 rounded-2xl">
```

```tsx
// VORHER: Custom CSS Classes
<button className="custom-button-primary">

// NACHHER: Design System Buttons
<button className="btn btn-primary">
```

### Compatibility Layer

Falls du alte Komponenten nicht sofort migrieren kannst:

```tsx
// Wrapper für Legacy Components
<div className="legacy-wrapper">
  <OldComponent />
</div>
```

```css
/* In App.css */
.legacy-wrapper {
  /* Isolation für alte Styles */
  all: revert;
}
```

---

## Debugging

### Chrome DevTools

```css
/* Temporary Debugging Borders */
* {
  outline: 1px solid red;
}
```

### Class Inspector

```tsx
// In Development, log classes
<div
  className={cn('card-glass', 'hover-lift')}
  onClick={() => console.log('Classes:', className)}
>
```

---

## Weitere Ressourcen

- **Tailwind Docs**: https://tailwindcss.com/docs
- **CSS Custom Properties**: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- **Design Tokens Guide**: `/docs/DESIGN_TOKENS_STYLEGUIDE_DE.md`
- **Component Library**: `src/components/ui/`

---

**[← Zurück zur Übersicht](./overview.md)**
