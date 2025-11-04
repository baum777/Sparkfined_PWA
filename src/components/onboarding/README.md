# Onboarding Components

Komponenten für das User-Onboarding bei der Veröffentlichung.

## 📦 Komponenten

### 1. WelcomeTour.tsx
**Zweck:** 3-Screen Tour für First-Time Users  
**Trigger:** Automatisch beim ersten Besuch  
**Inhalt:** Analyze, Chart, Access System Erklärung

**Props:** Keine  
**Events:** 
- `onboarding_tour_shown`
- `onboarding_tour_next`
- `onboarding_tour_skipped`
- `onboarding_tour_completed`

---

### 2. PWAInstallPrompt.tsx
**Zweck:** Progressive Web App Installation promoten  
**Trigger:** Nach 3 Minuten aktiver Nutzung  
**Features:** Custom UI, Benefits-Liste, Re-prompt nach 24h

**Props:** Keine  
**Events:**
- `pwa_install_prompt_shown`
- `pwa_install_clicked`
- `pwa_install_dismissed`
- `pwa_install_outcome`

---

### 3. AccessExplainer.tsx
**Zweck:** OG Pass vs Holder Access System erklären  
**Trigger:** Beim ersten Besuch der Access Page  
**Features:** Side-by-side Vergleich, Tab-Navigation

**Props:** Keine  
**Events:**
- `access_explainer_shown`
- `access_explainer_closed`
- `access_explainer_calculate_clicked`
- `access_explainer_check_balance_clicked`

---

## 🔧 Setup

### 1. Installation
Alle Dateien sind bereits in `/src/components/onboarding/` angelegt.

### 2. Import in App.tsx
```tsx
import WelcomeTour from './components/onboarding/WelcomeTour'
import PWAInstallPrompt from './components/onboarding/PWAInstallPrompt'

function App() {
  return (
    <>
      {/* Existing app components */}
      <WelcomeTour />
      <PWAInstallPrompt />
    </>
  )
}
```

### 3. Import in AccessPage.tsx
```tsx
import AccessExplainer from '../components/onboarding/AccessExplainer'

export default function AccessPage() {
  return (
    <>
      <AccessExplainer />
      {/* Rest of page */}
    </>
  )
}
```

---

## 🎨 Customization

### Styling
Alle Komponenten verwenden Tailwind CSS mit dem bestehenden Design System:
- Background: `bg-slate-900`
- Border: `border-slate-800`
- Primary Color: `green-500`
- Secondary Color: `blue-500`

### Timing anpassen
```typescript
// PWAInstallPrompt.tsx
const WAIT_TIME = 3 * 60 * 1000 // 3 Minuten (in ms)
```

### Tour Screens ändern
```typescript
// WelcomeTour.tsx
const TOUR_SCREENS = [
  { id: 'custom', icon: '🎯', title: '...', description: '...' },
  // Füge hinzu, entferne oder modifiziere
]
```

---

## 📊 Analytics

Alle Komponenten tracken Events über `trackOnboardingEvent()` aus `/src/lib/onboarding.ts`.

**Integration:**
- Plausible (empfohlen)
- Umami
- PostHog
- Custom Analytics Endpoint

---

## 🧪 Testing

### LocalStorage Reset
```javascript
localStorage.removeItem('sparkfined_onboarding_state')
location.reload()
```

### Onboarding State anzeigen
```javascript
console.log(JSON.parse(localStorage.getItem('sparkfined_onboarding_state')))
```

### Sofort PWA Prompt zeigen (Dev)
```javascript
localStorage.setItem('sparkfined_onboarding_state', JSON.stringify({
  firstAnalyzeTimestamp: Date.now() - (4 * 60 * 1000), // 4 Min ago
  pwaInstallPrompted: false,
}))
location.reload()
```

---

## 🐛 Known Issues

### Safari iOS PWA Install
Safari iOS zeigt keinen `beforeinstallprompt` Event. User muss manuell über "Zum Home-Bildschirm" installieren.

**Workaround:** Zeige iOS-spezifische Anleitung:
```tsx
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)

{isIOS && (
  <p>Tap Share → Add to Home Screen</p>
)}
```

### Private Mode
LocalStorage kann in Safari Private Mode nicht beschrieben werden.

**Workaround:** try/catch um alle localStorage Calls.

---

## 📚 Weitere Ressourcen

- [Onboarding Strategy Dokument](/docs/USER_ONBOARDING_STRATEGY.md)
- [Implementation Guide](/docs/ONBOARDING_IMPLEMENTATION_GUIDE.md)
- [Roadmap](/wireframes/ROADMAP-AND-X-TEASER.md)
