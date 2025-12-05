# 🌈 Effects & Utilities

Border Glows, Background Patterns und Custom Scrollbars für moderne UI-Details.

---

## Border Glows

Leuchtende Borders für Highlights und Status-Anzeigen.

### Brand Glow
```tsx
<div className="border-glow-brand p-4 rounded-xl">
  Brand highlight
</div>
```

### Success Glow
```tsx
<div className="border-glow-success p-4 rounded-xl">
  Success state
</div>
```

### Danger Glow
```tsx
<div className="border-glow-danger p-4 rounded-xl">
  Danger state
</div>
```

### Beispiel: Alert Banner
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

## Background Patterns

Grid-Pattern für Hintergründe mit Cyberpunk-Optik.

### Small Grid
```tsx
<div className="bg-grid-pattern min-h-screen">
  Content with grid pattern
</div>
```

### Large Grid
```tsx
<div className="bg-grid-pattern-lg min-h-screen">
  Content with larger grid
</div>
```

### Beispiel: Hero Section
```tsx
<section className="bg-grid-pattern min-h-screen flex items-center justify-center">
  <div className="card-glass p-12 rounded-3xl text-center">
    <h1 className="text-gradient-brand text-5xl font-bold mb-4">
      Welcome to Sparkfined
    </h1>
    <p className="text-fluid-lg text-text-secondary">
      Your crypto trading companion
    </p>
  </div>
</section>
```

---

## Custom Scrollbars

Moderne, minimale Scrollbar-Styles für bessere Ästhetik.

### Custom Scrollbar
```tsx
<div className="scrollbar-custom h-96 overflow-y-auto">
  Scrollable content with styled scrollbar
</div>
```

### Hide Scrollbar
```tsx
<div className="scrollbar-hide h-96 overflow-y-auto">
  Scrollable content without scrollbar
</div>
```

### Beispiel: Scrollbare Liste
```tsx
<div className="card scrollbar-custom h-96 overflow-y-auto p-4 space-y-2">
  {items.map(item => (
    <div key={item.id} className="card-interactive p-3 rounded-xl">
      {item.name}
    </div>
  ))}
</div>
```

---

## Verwendungsempfehlungen

### Border Glows
- **brand**: Feature Highlights, Active States
- **success**: Erfolgreiche Aktionen, Positive Trends
- **danger**: Fehler, Warnungen, Negative Trends

### Background Patterns
- **bg-grid-pattern**: Landing Pages, Hero Sections
- **bg-grid-pattern-lg**: Full-Screen Backgrounds
- **Kombinieren**: Mit `bg-gradient-to-br` für Gradient-Overlays

### Scrollbars
- **scrollbar-custom**: Standard für alle scrollbaren Container
- **scrollbar-hide**: Nur wenn Scrollbar UX stört (z.B. horizontale Scrolls)

---

## Best Practices

- **Border Glows**: Sparsam einsetzen, nur für wichtige Elemente
- **Grid Pattern**: Performance beachten - nicht auf allen Seiten verwenden
- **Scrollbars**: Custom Scrollbars sollten mindestens 8px breit sein
- **Accessibility**: Scrollbare Bereiche sollten klar erkennbar sein

---

## Kombination von Effekten

```tsx
{/* Alert mit Border Glow, Glass und Pattern */}
<div className="bg-grid-pattern-lg min-h-screen p-8">
  <div className="glass border-glow-success p-6 rounded-2xl">
    <div className="flex items-center gap-3">
      <span className="pulse-live w-3 h-3 rounded-full bg-sentiment-bull" />
      <p className="font-semibold">Trade executed successfully</p>
    </div>
  </div>
</div>
```

---

**[← Zurück zur Übersicht](./overview.md)**
