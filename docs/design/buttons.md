# 🔘 Button-System

Komplett überarbeitete Buttons mit Hover-Animationen und verschiedenen Varianten.

---

## Button-Varianten

### Primary Button (Gradient + Glow)
```tsx
<button className="btn btn-primary">
  Primary Action
</button>
```

### Secondary Button (Subtle Surface)
```tsx
<button className="btn btn-secondary">
  Secondary Action
</button>
```

### Ghost Button (Transparent)
```tsx
<button className="btn btn-ghost">
  Ghost Button
</button>
```

### Outline Button (Brand Border)
```tsx
<button className="btn btn-outline">
  Outline Button
</button>
```

### Danger Button (Red Gradient)
```tsx
<button className="btn btn-danger">
  Delete
</button>
```

---

## Button-Größen

### Small
```tsx
<button className="btn btn-primary btn-sm">
  Small
</button>
```

### Default (kein Modifier)
```tsx
<button className="btn btn-primary">
  Default
</button>
```

### Large
```tsx
<button className="btn btn-primary btn-lg">
  Large
</button>
```

---

## Button States

### Disabled
```tsx
<button className="btn btn-primary btn-disabled">
  Disabled
</button>
```

### Loading (mit Shimmer)
```tsx
<button className="btn btn-primary shimmer">
  Loading...
</button>
```

---

## Verwendungsempfehlungen

### Hierarchie

- **btn-primary**: Hauptaktion (max. 1 pro Screen)
- **btn-secondary**: Sekundäre Aktionen
- **btn-ghost**: Tertiäre Aktionen, Cancel-Buttons
- **btn-outline**: Alternative Aktionen
- **btn-danger**: Destruktive Aktionen (Delete, Remove)

### Beispiel: Action-Gruppe
```tsx
<div className="flex gap-2">
  <button className="btn btn-primary flex-1">
    View Details
  </button>
  <button className="btn btn-ghost">
    Export
  </button>
</div>
```

---

## Best Practices

- **Konsistenz**: Verwende Primary-Buttons sparsam (max. 1 pro Kontext)
- **Labels**: Klare, aktionsbeschreibende Labels ("Speichern", nicht "OK")
- **Loading States**: Zeige Loading-Zustand bei asynchronen Aktionen
- **Accessibility**: Buttons sollten mindestens 44x44px Touch-Target haben
- **Icons**: Kombiniere mit Icons für bessere Erkennbarkeit

---

## Kombination mit Tailwind

```tsx
<button className="btn btn-primary hover:scale-105 active:scale-95 transition-transform">
  Hover me!
</button>
```

---

**[← Zurück zur Übersicht](./overview.md)**
