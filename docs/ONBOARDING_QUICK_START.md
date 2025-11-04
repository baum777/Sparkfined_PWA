# ⚡ Onboarding Quick Start Guide

**Von 0 auf Launch-Ready in 30-60 Minuten**

---

## 🎯 Ziel

Implementiere das Onboarding-System mit minimalem Aufwand und maximalem Impact.

---

## 📋 Checkliste (30 Min)

### Step 1: CSS Animationen (2 Min) ✅

Füge zu `/workspace/src/styles/App.css` hinzu:

```css
/* Onboarding Animations */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tooltip-appear {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-slide-up {
  animation: slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-tooltip-appear {
  animation: tooltip-appear 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

### Step 2: Onboarding Library (5 Min) ✅

Die Datei `/workspace/src/lib/onboarding.ts` existiert bereits! ✅

**Nichts zu tun hier!**

---

### Step 3: Welcome Overlay Component (10 Min) ✅

Die Datei `/workspace/src/components/onboarding/WelcomeOverlay.tsx` existiert bereits! ✅

**Teste die Komponente:**

```tsx
// In App.tsx temporär hinzufügen zum Testen:
import WelcomeTour from './components/onboarding/WelcomeTour'

<WelcomeTour />
```

---

### Step 4: PWA Install Prompt (5 Min) ✅

Die Datei `/workspace/src/components/onboarding/PWAInstallPrompt.tsx` existiert bereits! ✅

**Integration in App.tsx:**

```tsx
import PWAInstallPrompt from './components/onboarding/PWAInstallPrompt'

// Am Ende von App return:
<PWAInstallPrompt />
```

---

### Step 5: Access Explainer (5 Min) ✅

Die Datei `/workspace/src/components/onboarding/AccessExplainer.tsx` existiert bereits! ✅

**Integration in AccessPage.tsx:**

```tsx
import AccessExplainer from '../components/onboarding/AccessExplainer'

// Am Anfang von AccessPage return:
<AccessExplainer />
```

---

### Step 6: Analytics Tracking (3 Min) ⏱️

In `/workspace/src/pages/AnalyzePage.tsx` füge hinzu:

```tsx
import { updateOnboardingState, getOnboardingState } from '@/lib/onboarding'

// In der load() Funktion nach erfolgreichem fetchOhlc:
const state = getOnboardingState()
if (!state.firstAnalyzeTimestamp) {
  updateOnboardingState({
    firstAnalyzeTimestamp: Date.now(),
  })
}
```

---

## 🚀 Minimale Implementation (Nur Criticals)

Falls du nur **15 Minuten** hast, implementiere nur diese 3:

### 1. Welcome Overlay in App.tsx

```tsx
import WelcomeTour from './components/onboarding/WelcomeTour'

// In App() return:
<WelcomeTour />
```

### 2. PWA Install Prompt in App.tsx

```tsx
import PWAInstallPrompt from './components/onboarding/PWAInstallPrompt'

<PWAInstallPrompt />
```

### 3. First Analyze Tracking

```tsx
// In AnalyzePage.tsx load():
import { updateOnboardingState, getOnboardingState } from '@/lib/onboarding'

const state = getOnboardingState()
if (!state.firstAnalyzeTimestamp) {
  updateOnboardingState({ firstAnalyzeTimestamp: Date.now() })
}
```

**Das war's! Diese 3 Dinge geben dir:**
- ✅ Welcome Experience
- ✅ PWA Installation Boost
- ✅ Timing für weitere Prompts

---

## 🧪 Testing (10 Min)

### 1. LocalStorage Reset

Browser Console:

```javascript
localStorage.removeItem('sparkfined_onboarding_state')
location.reload()
```

### 2. Test Welcome Overlay

1. ✅ Overlay erscheint nach 2 Sekunden
2. ✅ "Try Demo" Button funktioniert
3. ✅ "Skip Tour" schließt Overlay
4. ✅ Backdrop Click schließt Overlay

### 3. Test PWA Prompt (länger)

1. ✅ Analyze-Action durchführen
2. ✅ 3 Minuten warten (oder Zeit im Code verkürzen)
3. ✅ PWA Prompt erscheint Bottom Right
4. ✅ "Install" öffnet Browser-Dialog
5. ✅ "Not Now" schließt Prompt

### 4. Test Access Explainer

1. ✅ Access Page öffnen
2. ✅ Explainer Modal erscheint automatisch
3. ✅ Beide Options sichtbar (OG + Holder)
4. ✅ "Calculate" / "Check Balance" Buttons funktionieren

---

## 🐛 Common Issues & Fixes

### Issue 1: Welcome Overlay erscheint nicht

**Check:**
```javascript
// Browser Console
const state = JSON.parse(localStorage.getItem('sparkfined_onboarding_state'))
console.log(state.tourShown) // Should be false
```

**Fix:**
```javascript
localStorage.removeItem('sparkfined_onboarding_state')
location.reload()
```

---

### Issue 2: PWA Prompt erscheint nicht

**Reasons:**
- Browser unterstützt kein PWA (Safari Desktop)
- Already installed
- < 3 Minuten seit firstAnalyze

**Fix zum Testen:**
```tsx
// In PWAInstallPrompt.tsx temporär ändern:
if (elapsed > 10 * 1000) { // 10 Sekunden statt 3 Minuten
  setVisible(true)
}
```

---

### Issue 3: Animations funktionieren nicht

**Check:**
```css
/* In App.css - sind die Keyframes definiert? */
@keyframes slide-up { ... }
@keyframes bounce-slow { ... }
```

**Fix:**
Copy-paste aus diesem Guide oben.

---

### Issue 4: TypeScript Errors

**Common:**
```
Cannot find module '@/lib/onboarding'
```

**Fix:**
Check `tsconfig.json` hat path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📊 Verify Implementation

### Checklist

- [ ] **Welcome Overlay**
  - [ ] Erscheint beim ersten Besuch
  - [ ] "Try Demo" funktioniert
  - [ ] "Skip" funktioniert
  - [ ] Mobile responsive
  - [ ] Desktop centered

- [ ] **PWA Install Prompt**
  - [ ] Erscheint nach 3 Min
  - [ ] Bottom Right (Mobile)
  - [ ] "Install" öffnet Dialog
  - [ ] "Dismiss" funktioniert
  - [ ] Re-prompt nach 24h

- [ ] **Access Explainer**
  - [ ] Erscheint beim ersten Access-Besuch
  - [ ] OG + Holder Cards sichtbar
  - [ ] Buttons funktionieren
  - [ ] Modal ist scrollbar

- [ ] **Analytics**
  - [ ] firstAnalyzeTimestamp wird gesetzt
  - [ ] Events werden getrackt (Console)
  - [ ] State wird persistiert (LocalStorage)

---

## 🎨 Optional Enhancements (Nice-to-Have)

### 1. Toast Messages (15 Min)

Erstelle `/workspace/src/components/onboarding/Toast.tsx`:

```tsx
// Siehe ONBOARDING_COMPONENT_LIBRARY.md für vollen Code
```

Usage:
```tsx
import { useToast } from '@/components/onboarding/Toast'

const { showToast } = useToast()

showToast({
  message: '💡 Tip: Save analysis to Journal',
  actions: [
    { label: 'Show me', onClick: () => navigate('/journal'), variant: 'primary' },
    { label: 'Dismiss', onClick: () => {}, variant: 'ghost' },
  ],
})
```

---

### 2. Bottom Nav Badges (10 Min)

In `/workspace/src/components/BottomNav.tsx`:

```tsx
import { BottomNavBadge } from './onboarding/BottomNavBadge'
import { markFeatureDiscovered } from '@/lib/onboarding'

// Wrap NavLink content:
<NavLink to="/journal" onClick={() => markFeatureDiscovered('journal')}>
  <BottomNavBadge page="journal">
    <span className="text-2xl">📝</span>
    <span className="text-xs">Journal</span>
  </BottomNavBadge>
</NavLink>
```

---

### 3. Contextual Tooltips (20 Min)

Nach erstem Analyze, zeige Tooltips:

```tsx
// In AnalyzePage nach Results render:
const [showTooltip, setShowTooltip] = useState(false)

useEffect(() => {
  if (data && !getOnboardingState().tooltipsSeen.includes('kpi-cards')) {
    setTimeout(() => setShowTooltip(true), 2000)
  }
}, [data])

{showTooltip && (
  <ContextualTooltip
    target=".kpi-card:first-child"
    title="Key Metrics"
    content="These are the most important trading metrics at a glance."
    onDismiss={() => {
      setShowTooltip(false)
      updateOnboardingState({
        tooltipsSeen: [...getOnboardingState().tooltipsSeen, 'kpi-cards']
      })
    }}
  />
)}
```

---

## 🚀 Launch Checklist

### Pre-Launch

- [ ] Alle Components implementiert
- [ ] Auf 3 Geräten getestet (iPhone, Android, Desktop)
- [ ] Analytics Events funktionieren
- [ ] LocalStorage funktioniert (auch Incognito)
- [ ] Animations sind smooth (60fps)
- [ ] Accessibility Check (Keyboard, Screen Reader)

### Launch Day

- [ ] Monitor Analytics Dashboard
- [ ] Onboarding Completion Rate > 70%
- [ ] PWA Install Rate > 40%
- [ ] Time to First Action < 60s
- [ ] No Console Errors

### Post-Launch (Week 1)

- [ ] Collect User Feedback
- [ ] Analyze Drop-off Points
- [ ] A/B Test Variants
- [ ] Iterate based on Data

---

## 📈 Success Metrics

### Day 1 Targets

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| **Onboarding Completion** | 70% | 80% | 90% |
| **First Analyze** | 60% | 70% | 80% |
| **PWA Install** | 30% | 40% | 50% |
| **D1 Retention** | 35% | 45% | 55% |

### Week 1 Targets

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| **Total Users** | 500 | 750 | 1000 |
| **Active Users** | 200 | 300 | 500 |
| **OG Passes** | 10 | 25 | 50 |
| **D7 Retention** | 20% | 30% | 40% |

---

## 🎓 Resources

### Documentation
- [Onboarding Flows Detailed](./ONBOARDING_FLOWS_DETAILED.md)
- [Design Specs](./ONBOARDING_DESIGN_SPECS.md)
- [Component Library](./ONBOARDING_COMPONENT_LIBRARY.md)
- [Flowcharts](./ONBOARDING_FLOWCHARTS.md)

### Code
- `/src/lib/onboarding.ts` - State Management
- `/src/components/onboarding/` - All Components
- `/docs/` - All Documentation

### Tools
- **Analytics:** Plausible, Umami, PostHog
- **Testing:** Chrome DevTools, React DevTools
- **Debugging:** LocalStorage Inspector, Network Tab

---

## 💡 Pro Tips

### 1. Start Simple
Don't implement everything at once. Start with Welcome Overlay + PWA Prompt.

### 2. Test Early
Test on real devices, not just Dev Tools responsive mode.

### 3. Monitor Closely
Watch analytics daily in the first week. React to data.

### 4. Iterate Fast
If completion rate < 60%, simplify the tour immediately.

### 5. Ask Users
In-app feedback widget or Discord/Twitter polls.

---

## 🆘 Need Help?

### Debug Onboarding State

```javascript
// Browser Console
const state = JSON.parse(localStorage.getItem('sparkfined_onboarding_state'))
console.table(state)
```

### Force Show Components

```javascript
// Reset specific flags
const state = JSON.parse(localStorage.getItem('sparkfined_onboarding_state'))
state.tourShown = false
state.pwaInstallPrompted = false
state.accessExplainerSeen = false
localStorage.setItem('sparkfined_onboarding_state', JSON.stringify(state))
location.reload()
```

### Check Component Mount

```tsx
// Add to component
useEffect(() => {
  console.log('[WelcomeTour] Mounted')
  return () => console.log('[WelcomeTour] Unmounted')
}, [])
```

---

**Du schaffst das! 🚀**

**Geschätzte Zeit:**
- Minimal (Critical only): **15 Minuten**
- Standard (All 3 Main): **30 Minuten**
- Complete (+ Nice-to-have): **60 Minuten**

**Los geht's!** 💪
