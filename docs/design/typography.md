# 📝 Typography

Responsive Typography mit Fluid-Sizing und Gradient-Text-Effekten.

---

## Fluid Typography

Skaliert automatisch zwischen Breakpoints für optimale Lesbarkeit auf allen Geräten.

### Heading Sizes
```tsx
{/* Große Überschrift */}
<h1 className="text-fluid-3xl font-bold">
  Große Überschrift
</h1>

{/* Mittlere Überschrift */}
<h2 className="text-fluid-2xl font-semibold">
  Mittlere Überschrift
</h2>

{/* Kleine Überschrift */}
<h3 className="text-fluid-xl font-semibold">
  Kleine Überschrift
</h3>
```

### Body Text
```tsx
{/* Normaler Text */}
<p className="text-fluid-base">
  Normaler Text für Fließtext und Beschreibungen
</p>

{/* Kleiner Text */}
<span className="text-fluid-sm text-text-secondary">
  Kleiner Text für Metadaten
</span>
```

---

## Gradient Text

Auffällige Gradient-Effekte für wichtige Zahlen und Highlights.

### Brand Gradient
```tsx
<h1 className="text-gradient-brand text-4xl font-bold">
  Sparkfined
</h1>
```

### Success Gradient (Bull)
```tsx
<span className="text-gradient-success text-2xl font-bold">
  +24.5%
</span>
```

### Danger Gradient (Bear)
```tsx
<span className="text-gradient-danger text-2xl font-bold">
  -12.3%
</span>
```

---

## Text-Farben

### Hierarchie
```tsx
{/* Primärer Text */}
<p className="text-text-primary">
  Haupttext mit höchster Priorität
</p>

{/* Sekundärer Text */}
<p className="text-text-secondary">
  Nebensächliche Informationen
</p>

{/* Tertiärer Text */}
<p className="text-text-tertiary">
  Metadaten, Timestamps, Labels
</p>
```

### Sentiment Colors
```tsx
{/* Bullish */}
<span className="text-sentiment-bull font-medium">
  +8.5% Uptrend
</span>

{/* Bearish */}
<span className="text-sentiment-bear font-medium">
  -3.2% Downtrend
</span>

{/* Neutral */}
<span className="text-sentiment-neutral font-medium">
  Sideways
</span>
```

---

## Font Weights

```tsx
<p className="font-light">Light (300)</p>
<p className="font-normal">Normal (400)</p>
<p className="font-medium">Medium (500)</p>
<p className="font-semibold">Semibold (600)</p>
<p className="font-bold">Bold (700)</p>
```

---

## Beispiele

### KPI Display
```tsx
<div className="space-y-2">
  <span className="text-xs uppercase tracking-wide text-text-tertiary">
    Net P&L (30d)
  </span>
  <div className="text-gradient-success text-3xl font-bold">
    +$12,450
  </div>
  <p className="text-sm text-text-secondary">
    +24.5% vs. last month
  </p>
</div>
```

### Section Header
```tsx
<div className="space-y-1">
  <h2 className="text-fluid-2xl font-bold text-text-primary">
    Trading Performance
  </h2>
  <p className="text-fluid-base text-text-secondary">
    Your trading statistics for the last 30 days
  </p>
</div>
```

---

## Best Practices

- **Hierarchie**: Verwende Font-Size und Weight konsistent für klare Hierarchie
- **Kontrast**: Achte auf ausreichenden Kontrast (WCAG AA: 4.5:1 für Text)
- **Line Height**: Fließtext sollte `leading-relaxed` oder `leading-normal` haben
- **Letter Spacing**: Große Überschriften profitieren von `tracking-tight`
- **Gradient Text**: Sparsam einsetzen, nur für wichtige Highlights
- **Monospace**: Nutze `font-mono` für Zahlen, Preise, Code

---

## Font Stack

```css
/* Sans-Serif (Standard) */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Monospace (Zahlen, Code) */
font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

---

**[← Zurück zur Übersicht](./overview.md)**
