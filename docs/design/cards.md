# 🎴 Card-System

Umfangreiche Card-Varianten für verschiedene Use-Cases.

---

## Card-Varianten

### Standard Card
```tsx
<div className="card">
  Standard surface card
</div>
```

### Elevated Card (höher, mehr Schatten)
```tsx
<div className="card-elevated">
  Elevated surface with shadow
</div>
```

### Glass Card (Glassmorphism)
```tsx
<div className="card-glass">
  Frosted glass card
</div>
```

### Bordered Card (nur Border, transparenter Hintergrund)
```tsx
<div className="card-bordered">
  Transparent with border only
</div>
```

### Glow Card (Brand-Glow)
```tsx
<div className="card-glow">
  Card with brand glow effect
</div>
```

### Interactive Card (Hover-Effekte, Top-Border-Animation)
```tsx
<div className="card-interactive">
  Hover me!
</div>
```

---

## Beispiele

### Dashboard KPI Card
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

### Interactive List Item Card
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

---

## Verwendungsempfehlungen

### Wann welche Card-Variante?

- **card** - Standard-Container für Inhalte
- **card-elevated** - Hervorgehobene Inhalte, wichtige Informationen
- **card-glass** - Premium-Features, moderne Dashboard-Elemente
- **card-bordered** - Subtile Container, Gruppierung ohne starken Hintergrund
- **card-glow** - Highlights, Active States, Featured Content
- **card-interactive** - Klickbare Cards, Listen-Items, Navigation

---

## Best Practices

- **Padding**: Verwende `p-4` bis `p-6` für harmonische Abstände
- **Border Radius**: `rounded-xl` (12px) oder `rounded-2xl` (16px) für moderne Optik
- **Kombination**: Cards können mit Elevation- und Hover-Klassen kombiniert werden
- **Accessibility**: Interactive Cards sollten `<button>` oder `<a>` sein, nicht nur `<div>`

---

**[← Zurück zur Übersicht](./overview.md)**
