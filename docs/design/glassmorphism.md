# 🪟 Glassmorphism

Moderne Frosted-Glass-Effekte mit Backdrop-Blur für elegante, transparente Oberflächen.

---

## Verfügbare Klassen

### Basis Glassmorphism
```tsx
<div className="glass p-6 rounded-2xl">
  Content with frosted glass effect
</div>
```

### Subtiler Glass-Effekt
```tsx
<div className="glass-subtle p-6 rounded-2xl">
  Lighter frosted glass
</div>
```

### Heavy Glass (mehr Blur)
```tsx
<div className="glass-heavy p-6 rounded-2xl">
  Heavy frosted glass with strong blur
</div>
```

---

## Verwendung in Komponenten

### Dashboard Card mit Glassmorphism
```tsx
<div className="glass p-6 rounded-3xl shadow-lg">
  <h3 className="text-xl font-semibold mb-4">Glass Card</h3>
  <p className="text-text-secondary">
    Moderner Glassmorphism-Effekt für elegante UI
  </p>
</div>
```

### Kombination mit anderen Effekten
```tsx
<div className="glass hover-lift p-6 rounded-3xl elevation-medium">
  Glas-Effekt mit Hover-Animation und Schatten
</div>
```

---

## Best Practices

- **Kontrast**: Achte auf ausreichenden Kontrast zwischen Vorder- und Hintergrund
- **Blur-Stärke**: Verwende `glass-subtle` für subtile Effekte, `glass-heavy` für starke Betonung
- **Performance**: Backdrop-Blur ist ressourcenintensiv - sparsam einsetzen
- **Accessibility**: Stelle sicher, dass Text auf Glas-Oberflächen lesbar bleibt

---

**[← Zurück zur Übersicht](./overview.md)**
