# ✨ Microinteractions

Subtile Hover-Effekte und Animationen für bessere User Experience.

---

## Hover-Effekte

### Lift-Effekt (hebt sich beim Hover)
```tsx
<div className="hover-lift p-4 bg-surface rounded-xl">
  Hebt sich beim Hover
</div>
```

### Glow-Effekt
```tsx
<div className="hover-glow p-4 bg-surface rounded-xl">
  Leuchtet beim Hover
</div>
```

### Scale-Effekt
```tsx
<div className="hover-scale p-4 bg-surface rounded-xl">
  Vergrößert sich beim Hover
</div>
```

### Brightness-Effekt
```tsx
<img src="..." className="hover-brightness rounded-xl" />
```

---

## Spezielle Animationen

### Live-Indicator mit Pulse
```tsx
{/* Pulsierende Live-Badge */}
<span className="pulse-live inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentiment-bull-bg text-sentiment-bull">
  <span className="w-2 h-2 rounded-full bg-sentiment-bull" />
  Live
</span>
```

### Loading Shimmer
```tsx
{/* Skeleton mit Shimmer-Animation */}
<div className="shimmer h-20 rounded-xl bg-surface-skeleton" />
```

---

## Verwendungsempfehlungen

### Wann welcher Effekt?

- **hover-lift**: Cards, Listen-Items, klickbare Container
- **hover-glow**: Highlights, Featured Content, CTAs
- **hover-scale**: Buttons, Icons, kleine interaktive Elemente
- **hover-brightness**: Bilder, Thumbnails, Media-Elemente
- **pulse-live**: Live-Daten, Active States, Real-Time Updates
- **shimmer**: Loading States, Skeleton Screens

---

## Beispiele

### Interactive Card mit Hover-Effekt
```tsx
<div className="card-glass hover-lift p-6 rounded-3xl">
  <h3 className="text-lg font-semibold">Trading Performance</h3>
  <p className="text-text-secondary">Hover to lift</p>
</div>
```

### Live Status Badge
```tsx
<div className="flex items-center gap-2">
  <span className="pulse-live w-2 h-2 rounded-full bg-sentiment-bull" />
  <span className="text-sm text-sentiment-bull font-medium">
    Live Trading Active
  </span>
</div>
```

### Loading Skeleton Grid
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="shimmer h-32 rounded-xl bg-surface-skeleton" />
  <div className="shimmer h-32 rounded-xl bg-surface-skeleton" />
  <div className="shimmer h-32 rounded-xl bg-surface-skeleton" />
</div>
```

---

## Best Practices

- **Subtilität**: Microinteractions sollten subtil sein, nicht überwältigend
- **Performance**: Nutze CSS-Transforms (nicht position/width/height) für bessere Performance
- **Accessibility**: Respektiere `prefers-reduced-motion` (automatisch integriert)
- **Feedback**: Jede Interaktion sollte visuelles Feedback geben
- **Timing**: Hover-Effekte sollten schnell reagieren (150-250ms)

---

**[← Zurück zur Übersicht](./overview.md)**
