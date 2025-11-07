# Onboarding System - Quick Start Guide

**Für Entwickler die das Onboarding-System nutzen wollen**

---

## 🚀 Basis-Setup (Bereits implementiert!)

Das Onboarding-System ist bereits vollständig integriert in:
- ✅ BoardPage (erste Anlaufstelle)
- ✅ Navigation (Sidebar & BottomNav)
- ✅ Styles (Driver.js Theme)

---

## 📝 Wie du Onboarding in anderen Pages nutzt

### 1. Progressive Hint hinzufügen

**Beispiel: AnalyzePage**

```tsx
import { HintBanner } from '@/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function AnalyzePage() {
  const { isHintDismissed } = useOnboardingStore();

  return (
    <div>
      {/* Hint Banner */}
      {!isHintDismissed('hint:analyze-ai') && (
        <HintBanner
          hintId="hint:analyze-ai"
          title="💡 Quick Tip"
          message="Try our AI-powered token analysis! Get instant insights on risk, momentum, and trade opportunities."
          actionLabel="Try AI Analysis"
          onAction={() => {/* Open AI modal */}}
          delayMs={5000} // Optional: Delay in ms
        />
      )}

      {/* Rest of your page */}
    </div>
  );
}
```

---

### 2. First-Time Action tracken

**Beispiel: ChartPage - Erster Chart erstellt**

```tsx
import { useFirstTimeActions } from '@/hooks/useFirstTimeActions';

export default function ChartPage() {
  const { trackAction } = useFirstTimeActions();

  const handleSaveChart = () => {
    // ... chart save logic

    // Track first-time action
    trackAction(
      'chart-created',
      '🎉 Nice! Your first chart is ready. Try adding an indicator next!',
      'chart-created' // Optional: Links to checklist item
    );
  };

  return (
    <div>
      <button onClick={handleSaveChart}>Save Chart</button>
    </div>
  );
}
```

---

### 3. Tooltip zu komplexem Begriff hinzufügen

**Beispiel: Indicator Selection**

```tsx
import { TooltipIcon } from '@/components/ui/TooltipIcon';

export function IndicatorSelect() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label>RSI (14)</label>
        <TooltipIcon 
          content="Relative Strength Index: Measures momentum. > 70 is overbought, < 30 is oversold."
          learnMoreUrl="/help/indicators/rsi" // Optional
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label>MACD</label>
        <TooltipIcon 
          content="Moving Average Convergence Divergence: Trend-following momentum indicator."
        />
      </div>
    </div>
  );
}
```

---

### 4. Feature Discovery manuell triggern

**Beispiel: Alert erfolgreich erstellt**

```tsx
import { useOnboardingStore } from '@/store/onboardingStore';

export function AlertCreator() {
  const { discoverFeature } = useOnboardingStore();

  const handleCreateAlert = () => {
    // ... alert creation logic

    // Mark feature as discovered
    discoverFeature('alert-added');
    
    // Optional: Show toast
    toast.success('🔔 Alert created! You\'ll be notified when it triggers.');
  };

  return <button onClick={handleCreateAlert}>Create Alert</button>;
}
```

---

### 5. Checklist Item hinzufügen

**In `src/store/onboardingStore.ts`:**

```typescript
const CHECKLIST_ITEMS = [
  // ... existing items
  'new-feature-used', // Add your new item
];

export const ONBOARDING_CHECKLIST = {
  'Your Category': [
    { id: 'new-feature-used', label: 'Try the new feature' },
  ],
};
```

**Dann in deiner Komponente:**

```tsx
discoverFeature('new-feature-used');
```

---

### 6. Tour Step für neue Page hinzufügen

**In `src/lib/productTour.ts`:**

```typescript
const yourPageStep: DriveStep = {
  element: '#your-page-element',
  popover: {
    title: '🎯 Your Feature',
    description: 'This is how you use this feature...',
    side: 'bottom',
    align: 'center',
  },
};

// Add to beginner/intermediate/advanced tour
if (level === 'beginner') {
  return [
    navigationStep,
    overviewStep,
    yourPageStep, // Add here
    // ... rest
  ];
}
```

**Nicht vergessen: Element-ID in JSX setzen:**

```tsx
<div id="your-page-element">
  Your content
</div>
```

---

## 🎮 Keyboard Shortcuts erweitern

**In `src/components/onboarding/KeyboardShortcuts.tsx`:**

```typescript
const shortcuts = {
  'Your Category': [
    { key: 'Ctrl + X', description: 'Your action' },
    { key: 'Shift + A', description: 'Another action' },
  ],
};
```

---

## 🧪 Testing während Development

### Onboarding zurücksetzen

**Browser Console:**
```javascript
// Alles zurücksetzen
localStorage.removeItem('sparkfined-onboarding');
location.reload();

// Nur First-Time Actions zurücksetzen
Object.keys(localStorage)
  .filter(key => key.startsWith('first:'))
  .forEach(key => localStorage.removeItem(key));
```

### Tour manuell starten

**Browser Console:**
```javascript
import { createProductTour } from '@/lib/productTour';
const tour = createProductTour('intermediate', () => console.log('Tour done!'));
tour.drive();
```

### Checklist Progress anzeigen

**Browser Console:**
```javascript
const state = JSON.parse(localStorage.getItem('sparkfined-onboarding'));
console.log('Progress:', state.state.progress + '%');
console.log('Discovered:', state.state.discoveredFeatures);
```

---

## 📊 Verfügbare Checklist IDs

```typescript
// Getting Started
'tour-completed'
'theme-customized'
'watchlist-created'

// First Steps
'token-analyzed'
'chart-created'
'alert-added'
'journal-entry-written'

// Advanced Features
'replay-mode-used'
'ai-analysis-used'
'alert-backtested'
```

---

## 🎨 Hint IDs Konvention

Nutze folgendes Format: `hint:{page}-{feature}`

Beispiele:
- `hint:board-kpi-tiles`
- `hint:chart-shortcuts`
- `hint:analyze-ai`
- `hint:journal-screenshots`
- `hint:replay-controls`

---

## 🐛 Troubleshooting

### Hint erscheint nicht
- ✅ Check: `isHintDismissed()` conditional korrekt?
- ✅ Check: `delayMs` zu kurz?
- ✅ Check: Element im DOM beim Render?

### Tour Element nicht gefunden
- ✅ Check: Element-ID existiert im DOM?
- ✅ Check: Element visible (nicht `display: none`)?
- ✅ Add delay: `setTimeout(() => tour.drive(), 500)`

### Checklist Progress nicht aktualisiert
- ✅ Check: `discoverFeature()` aufgerufen?
- ✅ Check: Feature-ID in `CHECKLIST_ITEMS` array?
- ✅ Check: LocalStorage nicht voll?

---

## 💡 Best Practices

1. **Hints sparsam einsetzen** - Max 1 Hint pro Page
2. **First-Time Actions für wichtige Milestones** - Nicht für jede Kleinigkeit
3. **Tooltips für Fachbegriffe** - Wenn User es nicht kennen könnte
4. **Tour Steps kurz halten** - Max 7 Steps für Beginner
5. **Checklist Items messbar** - Klar definierte Actions

---

## 🚀 Das wars!

Du kannst jetzt:
- ✅ Progressive Hints zu Pages hinzufügen
- ✅ First-Time Actions tracken
- ✅ Tooltips zu Begriffen hinzufügen
- ✅ Checklist Items erweitern
- ✅ Tour Steps hinzufügen

**Bei Fragen:** Siehe [ONBOARDING_STRATEGY.md](./ONBOARDING_STRATEGY.md) oder [ONBOARDING_IMPLEMENTATION_COMPLETE.md](./ONBOARDING_IMPLEMENTATION_COMPLETE.md)
