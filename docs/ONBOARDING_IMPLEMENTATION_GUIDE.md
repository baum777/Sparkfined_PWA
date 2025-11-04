# Onboarding Implementation Guide

## 🚀 Quick Start (30 Minuten)

### Schritt 1: CSS Animationen hinzufügen

Füge zu `src/styles/App.css` oder `src/styles/index.css` hinzu:

```css
/* Onboarding Animations */
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

---

### Schritt 2: Onboarding-Komponenten in App einbinden

**Datei:** `src/App.tsx`

```typescript
import { SettingsProvider } from './state/settings'
import { TelemetryProvider } from './state/telemetry'
import { AIProviderState } from './state/ai'
import RoutesRoot from './routes/RoutesRoot'
import GlobalInstruments from './pages/_layout/GlobalInstruments'

// ✨ NEU: Onboarding Components importieren
import WelcomeTour from './components/onboarding/WelcomeTour'
import PWAInstallPrompt from './components/onboarding/PWAInstallPrompt'

import './styles/App.css'

function App() {
  return (
    <TelemetryProvider>
      <SettingsProvider>
        <AIProviderState>
          <RoutesRoot />
          <GlobalInstruments />
          
          {/* ✨ NEU: Onboarding Components */}
          <WelcomeTour />
          <PWAInstallPrompt />
        </AIProviderState>
      </SettingsProvider>
    </TelemetryProvider>
  )
}

export default App
```

---

### Schritt 3: AccessExplainer in AccessPage einbinden

**Datei:** `src/pages/AccessPage.tsx`

```typescript
import { useState } from 'react'
import AccessStatusCard from '../components/access/AccessStatusCard'
import LockCalculator from '../components/access/LockCalculator'
import HoldCheck from '../components/access/HoldCheck'
import LeaderboardList from '../components/access/LeaderboardList'

// ✨ NEU: AccessExplainer importieren
import AccessExplainer from '../components/onboarding/AccessExplainer'
import { updateOnboardingState } from '@/lib/onboarding'
import { useEffect } from 'react'

type TabType = 'status' | 'lock' | 'hold' | 'leaderboard'

export default function AccessPage() {
  const [activeTab, setActiveTab] = useState<TabType>('status')

  // ✨ NEU: Track Access Page Visit
  useEffect(() => {
    updateOnboardingState({ accessPageVisited: true })
  }, [])

  // ✨ NEU: Listen for tab switch events from AccessExplainer
  useEffect(() => {
    const handleSwitchToLock = () => setActiveTab('lock')
    const handleSwitchToHold = () => setActiveTab('hold')

    window.addEventListener('switch-to-lock-tab', handleSwitchToLock)
    window.addEventListener('switch-to-hold-tab', handleSwitchToHold)

    return () => {
      window.removeEventListener('switch-to-lock-tab', handleSwitchToLock)
      window.removeEventListener('switch-to-hold-tab', handleSwitchToHold)
    }
  }, [])

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'status', label: 'Status', icon: '🎫' },
    { id: 'lock', label: 'Lock', icon: '🔒' },
    { id: 'hold', label: 'Hold', icon: '💎' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* ✨ NEU: Access Explainer Modal */}
      <AccessExplainer />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Sparkfiend Access Pass
        </h1>
        <p className="text-slate-400">
          Fair OG-Gating • 333 Slots • MCAP-Dynamic Lock • Soulbound NFT
        </p>
      </div>

      {/* Rest of the page... */}
      {/* ... existing code ... */}
    </div>
  )
}
```

---

### Schritt 4: First Analyze Tracking in AnalyzePage

**Datei:** `src/pages/AnalyzePage.tsx`

Füge nach erfolgreichem Analyze hinzu:

```typescript
import { updateOnboardingState, getOnboardingState } from '@/lib/onboarding'

// In der Analyze-Funktion (nach erfolgreichem API-Call):
const handleAnalyze = async () => {
  // ... existing analyze logic ...
  
  // ✨ NEU: Track first analyze for PWA install timing
  const state = getOnboardingState()
  if (!state.firstAnalyzeTimestamp) {
    updateOnboardingState({
      firstAnalyzeTimestamp: Date.now(),
    })
  }
}
```

---

### Schritt 5: Feature Discovery Tracking

Füge in relevanten Pages hinzu:

```typescript
import { markFeatureDiscovered } from '@/lib/onboarding'

// Beispiel: ChartPage
useEffect(() => {
  markFeatureDiscovered('chart')
}, [])

// Beispiel: JournalPage
useEffect(() => {
  markFeatureDiscovered('journal')
}, [])

// Beispiel: NotificationsPage
useEffect(() => {
  markFeatureDiscovered('notifications')
}, [])
```

---

## 🧪 Testen

### Manuelles Testing

1. **LocalStorage löschen:**
   ```javascript
   localStorage.clear()
   ```

2. **Seite neu laden** → Welcome Tour sollte erscheinen

3. **Tour durchgehen** oder skippen

4. **Analyze Page öffnen** → Demo-Analyse durchführen

5. **3 Minuten warten** → PWA Install Prompt sollte erscheinen

6. **Access Page öffnen** → Access Explainer sollte erscheinen

### Reset Onboarding (für Testing)

Öffne Browser Console und führe aus:

```javascript
import { resetOnboardingState } from '@/lib/onboarding'
resetOnboardingState()
location.reload()
```

Oder füge temporär einen Button hinzu:

```tsx
<button onClick={() => {
  localStorage.removeItem('sparkfined_onboarding_state')
  location.reload()
}}>
  Reset Onboarding (Dev Only)
</button>
```

---

## 📊 Analytics Integration

### Option 1: Plausible (Empfohlen)

**Installation:**
```bash
npm install plausible-tracker
```

**Setup in `src/lib/onboarding.ts`:**

```typescript
import Plausible from 'plausible-tracker'

const plausible = Plausible({
  domain: 'your-domain.com',
  apiHost: 'https://plausible.io', // oder self-hosted
})

export const trackOnboardingEvent = (event: string, data?: Record<string, any>) => {
  plausible.trackEvent(event, { props: data })
}
```

**In `src/main.tsx`:**

```typescript
import Plausible from 'plausible-tracker'

const plausible = Plausible({
  domain: 'your-domain.com',
})

plausible.enableAutoPageviews()
```

### Option 2: Custom Analytics Endpoint

```typescript
export const trackOnboardingEvent = async (event: string, data?: Record<string, any>) => {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties: data,
        timestamp: Date.now(),
      }),
    })
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error)
  }
}
```

---

## 🎨 Customization

### Welcome Tour anpassen

Editiere `src/components/onboarding/WelcomeTour.tsx`:

```typescript
const TOUR_SCREENS: TourScreen[] = [
  {
    id: 'analyze',
    icon: '🎯', // ← Ändere Icon
    title: 'Dein Custom Titel', // ← Ändere Titel
    description: 'Deine Custom Beschreibung', // ← Ändere Text
  },
  // Füge weitere Screens hinzu oder entferne welche
]
```

### PWA Install Prompt Timing ändern

In `src/components/onboarding/PWAInstallPrompt.tsx`:

```typescript
// Ändere Wartezeit (aktuell 3 Minuten):
const WAIT_TIME = 3 * 60 * 1000 // ← Ändere hier (in Millisekunden)

if (elapsed > WAIT_TIME) {
  setVisible(true)
}
```

### Access Explainer Design anpassen

Editiere `src/components/onboarding/AccessExplainer.tsx` für Layout/Farben.

---

## 🐛 Troubleshooting

### Problem: Welcome Tour erscheint nicht

**Lösung:**
1. Prüfe, ob `WelcomeTour` in `App.tsx` importiert ist
2. Öffne Browser Console → Sollte `[Onboarding Event] onboarding_tour_shown` zeigen
3. Prüfe LocalStorage: `localStorage.getItem('sparkfined_onboarding_state')`
4. Reset State: `localStorage.clear()` und Seite neu laden

### Problem: PWA Install Prompt erscheint nicht

**Mögliche Ursachen:**
1. Browser unterstützt kein PWA (nur Chrome/Edge/Safari iOS)
2. App ist bereits installiert
3. LocalStorage Flag `pwaInstallPrompted: true` ist gesetzt
4. `firstAnalyzeTimestamp` ist nicht gesetzt (keine Analyze-Aktion durchgeführt)
5. Weniger als 3 Minuten seit erster Aktion vergangen

**Lösung:**
```javascript
// Browser Console:
localStorage.removeItem('sparkfined_onboarding_state')
location.reload()
// Dann Analyze durchführen und 3 Minuten warten
```

### Problem: Access Explainer erscheint jedes Mal

**Lösung:**
Prüfe, ob `updateOnboardingState({ accessExplainerSeen: true })` beim Schließen aufgerufen wird.

### Problem: Animations funktionieren nicht

**Lösung:**
Prüfe, ob CSS-Animationen in `App.css` oder `index.css` hinzugefügt wurden.

---

## 🚀 Deployment Checklist

Vor dem Launch:

- [ ] Welcome Tour funktioniert auf Mobile & Desktop
- [ ] PWA Install Prompt funktioniert (Chrome/Edge/Safari)
- [ ] Access Explainer erscheint beim ersten Besuch
- [ ] Analytics Events werden getrackt
- [ ] Feature Discovery Badges funktionieren
- [ ] Empty States für alle Pages vorhanden
- [ ] Alle Animationen funktionieren
- [ ] LocalStorage Fallbacks für Safari Private Mode
- [ ] Onboarding auf 3 verschiedenen Geräten getestet
- [ ] A/B Testing Setup (optional)

---

## 📈 Post-Launch Monitoring

### Wichtige Metriken (Woche 1)

Dashboard in Analytics Tool erstellen mit:

1. **Onboarding Funnel:**
   - `onboarding_tour_shown` → 100%
   - `onboarding_tour_completed` → ?%
   - `first_analyze` → ?%
   - `access_explainer_shown` → ?%
   - `pwa_install_prompt_shown` → ?%
   - `pwa_install_clicked` → ?%

2. **Drop-off Analysis:**
   - Wo brechen User ab?
   - Welche Screens werden übersprungen?
   - Wie lange dauert Onboarding im Durchschnitt?

3. **Feature Discovery:**
   - Welche Features werden entdeckt?
   - Wie lange bis zur Entdeckung?
   - Welche Features werden ignoriert?

### Optimierungen basierend auf Daten

| Metrik | Schwellenwert | Aktion |
|--------|---------------|--------|
| Tour Completion < 70% | ⚠️ | Tour kürzen oder vereinfachen |
| PWA Install < 30% | ⚠️ | Timing anpassen oder Wert besser erklären |
| Access Explainer Skip > 50% | ⚠️ | Kürzer machen oder weniger Text |
| First Analyze > 90s | ⚠️ | Demo-Token vorausfüllen |

---

## 🎓 Best Practices

### Do's ✅

- Onboarding **so kurz wie möglich** halten
- **Wert zeigen vor Erklärung** (Show, don't tell)
- **Skip-Option** immer anbieten
- **Mobile-First** designen
- **Analytics** von Anfang an integrieren
- **Iterativ verbessern** basierend auf Daten

### Don'ts ❌

- Nie mehr als **3 Onboarding-Screens**
- Keine **automatischen Videos** (nervt User)
- Keine **Browser-Permissions** ohne Kontext abfragen
- Keine **langen Texte** (niemand liest das)
- Keine **Blocker-Modals** ohne Skip-Option
- Keine **Animationen länger als 0.5s**

---

## 💡 Weitere Ideen (Nice-to-Have)

### 1. Interactive Demo Mode

```typescript
// Guided Tour mit Tooltips (react-joyride)
import Joyride from 'react-joyride'

const steps = [
  {
    target: '.analyze-button',
    content: 'Click here to analyze any token',
  },
  // ... more steps
]

<Joyride steps={steps} continuous />
```

### 2. Progress Bar im Header

```tsx
const progress = getOnboardingProgress() // 0-100

<div className="fixed top-0 left-0 right-0 h-1 bg-slate-900 z-50">
  <div
    className="h-full bg-green-500 transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>
```

### 3. Achievement System

```typescript
const ACHIEVEMENTS = [
  { id: 'first_analyze', name: 'First Analysis', icon: '🎯' },
  { id: 'first_chart', name: 'Chart Master', icon: '📈' },
  { id: 'og_pass', name: 'OG Member', icon: '👑' },
]

// Show toast when achievement unlocked
toast.success('🎉 Achievement Unlocked: First Analysis')
```

### 4. Empty State Templates

```tsx
// Reusable Empty State Component
<EmptyState
  icon="📝"
  title="No entries yet"
  description="Start documenting your trades to improve your strategy."
  action={<button>Create First Entry</button>}
/>
```

---

**Viel Erfolg beim Launch! 🚀**
