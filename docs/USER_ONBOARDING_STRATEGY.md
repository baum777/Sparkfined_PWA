# User-Onboarding-Strategie für Sparkfined PWA Veröffentlichung

**Version:** 1.0  
**Datum:** 2025-11-04  
**Zielgruppe:** Crypto Trader, Technical Analysis Enthusiasts  
**Plattform:** Progressive Web App (Mobile-First)

---

## 🎯 Onboarding-Ziele

### Primärziele
1. **90% Completion Rate** beim First-Time Onboarding
2. **60% PWA Installation Rate** nach erstem Besuch
3. **40% D7 Retention** (Tag-7-Rückkehr)
4. **Klares Verständnis** des Access-Systems (OG vs Holder)
5. **Schneller First Value Moment** (< 2 Minuten)

### Key Success Metrics
- Zeit bis zur ersten Aktion: < 60 Sekunden
- Onboarding-Abbruchrate: < 15%
- Feature Discovery Rate: > 70% für Core Features
- Access Page Besuchsrate: > 80%

---

## 🚀 Onboarding-Flow (Empfohlen)

### Phase 1: Welcome & Value Proposition (15 Sekunden)

**Screen 1 - Hero Welcome**
```
┌─────────────────────────────────────┐
│  🎯 Sparkfined                      │
│                                     │
│  Professional Trading Analysis      │
│  • AI-Powered Insights              │
│  • Advanced Charting                │
│  • Trade Journal & Replay           │
│  • Push Alerts                      │
│                                     │
│  [Get Started →]                    │
│  [Skip for now]                     │
└─────────────────────────────────────┘
```

**Implementierung:**
- Modal/Fullscreen beim ersten Besuch
- Animierte Feature-Icons
- Skip-Option für wiederkehrende User
- LocalStorage Flag: `onboarding_completed`

---

### Phase 2: Quick Tour (3 Screens à 10 Sekunden)

**Tour Screen 1 - Analyze**
```
┌─────────────────────────────────────┐
│  📊 Instant Token Analysis          │
│  ┌─────────────────────────────────┐│
│  │ [Demo Chart]                    ││
│  └─────────────────────────────────┘│
│                                     │
│  Paste any token address and get   │
│  instant KPIs, heatmaps, and AI     │
│  insights.                          │
│                                     │
│  [Next →]          [Skip Tour]  1/3│
└─────────────────────────────────────┘
```

**Tour Screen 2 - Chart & Replay**
```
┌─────────────────────────────────────┐
│  📈 Advanced Charting                │
│  ┌─────────────────────────────────┐│
│  │ [Demo Drawing Tools]            ││
│  └─────────────────────────────────┘│
│                                     │
│  Draw, analyze, and replay your     │
│  sessions. Perfect for reviewing    │
│  your trading decisions.            │
│                                     │
│  [Next →]          [Skip Tour]  2/3│
└─────────────────────────────────────┘
```

**Tour Screen 3 - Access System**
```
┌─────────────────────────────────────┐
│  🎫 Fair Access System               │
│                                     │
│  Two ways to unlock full features:  │
│                                     │
│  👑 OG Pass (333 Slots)             │
│     Lock tokens → Lifetime access   │
│                                     │
│  💎 Holder Access                   │
│     Hold ≥100k tokens               │
│                                     │
│  [Learn More →]    [Skip Tour]  3/3│
└─────────────────────────────────────┘
```

**Implementierung:**
- React Carousel/Swiper
- Touch-Gestures (Swipe)
- Progress Dots (1/3, 2/3, 3/3)
- "Skip Tour" immer sichtbar
- "Learn More" führt zu Access Page

---

### Phase 3: Interactive Demo (30 Sekunden)

**Demo Token vorschlagen**
```
┌─────────────────────────────────────┐
│  Try it yourself!                   │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ SOL Address (Demo)              ││
│  │ So11111...                      ││
│  └─────────────────────────────────┘│
│                                     │
│  [Analyze Now]                      │
│  [Use my own token]                 │
└─────────────────────────────────────┘
```

**Flow:**
1. User klickt "Analyze Now" → Automatisch zu Analyze Page mit Demo-Token
2. Zeige Tooltips über wichtige UI-Elemente:
   - KPI Cards: "Key metrics at a glance"
   - Heatmap: "Visual price patterns"
   - AI Button: "Get AI-powered insights"
3. Nach 10 Sekunden: "🎉 Great! Now try these features..." (Bottom Sheet)

**Implementierung:**
- Guided Tooltips (react-joyride oder custom)
- Highlight aktive Bereiche
- Dismiss on interaction
- localStorage: `demo_completed`

---

### Phase 4: Feature Discovery Hints (Ambient)

**Bottom Navigation Badges**
```
┌─────────────────────────────────────┐
│  [Analyze] [Chart²] [Journal¹] [•••]│
└─────────────────────────────────────┘
     ↑          ↑          ↑
   Current    New!      Unseen
```

**Feature Badges:**
- **Red Dot**: Noch nicht besucht
- **Badge mit Zahl**: Neue Inhalte/Benachrichtigungen
- **"New" Label**: Neu hinzugefügte Features

**Toast Messages (Timing):**
- Nach 30 Sekunden auf Analyze: "💡 Tip: Save trade ideas to your Journal"
- Nach Chart-Nutzung: "🎯 Try Replay Mode to review your analysis"
- Bei Rückkehr: "👋 Welcome back! 3 new price alerts triggered"

---

## 🎫 Access System Onboarding (Kritisch!)

### Problem: Komplexes Gating-System
- 2 verschiedene Zugangswege (OG vs Holder)
- Solana Wallet-Verbindung erforderlich
- MCAP-basierte Lock-Berechnung nicht intuitiv

### Lösung: Dedicated Access Explainer

**Ansatz 1: Inline Explainer (Empfohlen)**
```
Beim ersten Besuch der Access Page:

┌─────────────────────────────────────┐
│  🎫 Understanding Access             │
│                                     │
│  You have 2 options:                │
│                                     │
│  1️⃣ OG Pass (Limited to 333)        │
│     → Lock tokens based on MCAP     │
│     → Get soulbound NFT             │
│     → Lifetime access               │
│     → Rank matters!                 │
│                                     │
│  2️⃣ Holder Access (Unlimited)       │
│     → Simply hold ≥100k tokens      │
│     → Access as long as you hold    │
│     → No locking needed             │
│                                     │
│  [Calculate My Lock Amount]         │
│  [Check My Balance]                 │
│  [Maybe Later]                      │
└─────────────────────────────────────┘
```

**Ansatz 2: Interactive Calculator Onboarding**
```
Auf Lock Calculator Tab:

Step 1: "Enter current MCAP" (mit Live-Fetch Button)
Step 2: "Choose desired rank (1-333)" (Slider)
Step 3: "See required lock amount" (Auto-Update)
Step 4: "Lock & Mint NFT" (One-Click)

Tooltips bei jedem Schritt:
→ "Lower rank = Higher prestige, but more tokens needed"
→ "Your rank determines your OG Pass number"
→ "Soulbound = Can't be transferred or sold"
```

**Fallback für Unentschlossene:**
- "Not sure yet? Continue using the app and check back later"
- "You can still use basic features without access"
- Persistent Notification Dot auf Access-Icon im Bottom Nav

---

## 📱 PWA Installation Prompt (Retention-Boost)

### Timing Strategy
❌ **Nicht sofort zeigen** (nervt User)  
✅ **Nach First Value Moment** (User sieht Wert)

**Trigger:**
- Nach 3 Minuten aktiver Nutzung
- Nach erstem erfolgreichen Analyze
- Nach erstem Chart Drawing
- Nach erster Journal-Entry

**Prompt Design:**
```
┌─────────────────────────────────────┐
│  📲 Install Sparkfined               │
│                                     │
│  Get the full experience:           │
│  ✓ Faster loading                   │
│  ✓ Work offline                     │
│  ✓ Push notifications               │
│  ✓ App icon on home screen          │
│                                     │
│  [Install Now]                      │
│  [Not Now]                          │
└─────────────────────────────────────┘
```

**Implementierung:**
- beforeinstallprompt Event abfangen
- Custom UI (nicht Browser-Standard-Prompt)
- "Not Now" → Erneut nach 24h zeigen
- "Install Now" → Native Installationsdialog

---

## 🔔 Push Notification Onboarding

### Problem: 
Push Permissions sind sensibel und werden oft abgelehnt.

### Lösung: Permission Priming

**Schritt 1: Wert zeigen (Soft Ask)**
```
Auf Notifications Page:

┌─────────────────────────────────────┐
│  🔔 Smart Price Alerts               │
│                                     │
│  Get notified when:                 │
│  • Price hits your target           │
│  • Volume spikes detected           │
│  • Pattern confirmed                │
│                                     │
│  ⚡ Enable Push Notifications        │
│                                     │
│  [Enable Notifications]             │
│  [Maybe Later]                      │
└─────────────────────────────────────┘
```

**Schritt 2: Browser Permission (Hard Ask)**
Nur nach User-Klick auf "Enable Notifications" → Browser Permission Dialog

**Best Practices:**
- Nie ungefragt Browser Permission abfragen
- Zeige Wert/Nutzen vor Permission Request
- Fallback: Email Alerts (ohne Push)
- Option zum Deaktivieren jederzeit sichtbar

---

## 🎨 Visual Onboarding Elemente

### 1. Empty States (Informativ statt leer)

**Beispiel Journal (leer):**
```
┌─────────────────────────────────────┐
│  📝 Your Trade Journal               │
│                                     │
│  [Empty Journal Illustration]       │
│                                     │
│  No entries yet                     │
│                                     │
│  Start documenting your trades      │
│  to improve your strategy.          │
│                                     │
│  [Create First Entry]               │
└─────────────────────────────────────┘
```

### 2. Tooltips & Hints

**Hover/Long-Press Tooltips:**
- KPI Cards: "Click for detailed explanation"
- Heatmap: "Touch and hold to see exact values"
- AI Button: "Generate analysis summary"
- Chart Tools: "Tap to draw, double-tap to lock"

### 3. Skeleton Screens

**Beim Laden:**
- Keine weißen Bildschirme
- Animated Skeletons für KPI Cards, Tables, Charts
- "Loading..." mit Progress Bar

### 4. Success Animations

**Micro-Interactions:**
- ✅ Checkmark Animation bei erfolgreichem Save
- 🎉 Confetti bei OG Pass Mint
- ⚡ Pulse Effect bei neuer Alert
- 📊 Count-Up Animation für Zahlen

---

## 🧪 A/B Testing Empfehlungen

### Test 1: Onboarding-Länge
- **Variante A:** Full Tour (3 Screens)
- **Variante B:** Minimal (1 Screen + Interactive Demo)
- **Variante C:** Skip Tour + Tooltips on Demand
- **Metrik:** Completion Rate, Time to First Action

### Test 2: Access System Erklärung
- **Variante A:** Inline Explainer (Modal)
- **Variante B:** Video Tutorial (30s)
- **Variante C:** Interactive Calculator first
- **Metrik:** Access Page Conversions, Wallet Connects

### Test 3: PWA Install Timing
- **Variante A:** Nach 3 Min
- **Variante B:** Nach erster Aktion
- **Variante C:** Nach 24h (wiederkehrend)
- **Metrik:** Install Rate, Retention

---

## 📊 Analytics & Tracking

### Onboarding Funnel
```
1. Landing → 100%
2. Tour Started → ?%
3. Tour Completed → ?%
4. First Analyze → ?%
5. First Chart → ?%
6. Access Page Visit → ?%
7. Wallet Connect → ?%
8. PWA Install → ?%
9. D1 Return → ?%
10. D7 Return → ?%
```

### Events to Track
```typescript
// Onboarding Events
trackEvent('onboarding_started')
trackEvent('onboarding_screen_viewed', { screen: 'analyze' })
trackEvent('onboarding_skipped', { at_screen: 2 })
trackEvent('onboarding_completed')

// Feature Discovery
trackEvent('first_analyze')
trackEvent('first_chart_draw')
trackEvent('first_journal_entry')
trackEvent('first_alert_created')

// Access System
trackEvent('access_explainer_viewed')
trackEvent('wallet_connect_clicked')
trackEvent('wallet_connected', { type: 'phantom' })
trackEvent('lock_calculator_used')
trackEvent('og_pass_minted', { rank: 42 })

// PWA
trackEvent('install_prompt_shown')
trackEvent('install_prompt_accepted')
trackEvent('install_prompt_dismissed')

// Push
trackEvent('push_permission_prompted')
trackEvent('push_permission_granted')
trackEvent('push_permission_denied')
```

### Tools
- **Recommended:** Plausible Analytics (privacy-first)
- **Alternative:** Umami, PostHog
- **Avoid:** Google Analytics (privacy concerns, DSGVO)

---

## 🎯 Quick Wins für Launch

### Pre-Launch (1-2 Tage)
- [ ] Welcome Modal mit 3-Screen Tour implementieren
- [ ] Demo-Token (SOL) vorausfüllen auf Analyze Page
- [ ] Access Page Explainer Modal hinzufügen
- [ ] Empty States für alle Pages designen
- [ ] PWA Install Prompt mit Custom UI
- [ ] Push Permission Priming implementieren

### Launch Week (Tag 1-7)
- [ ] Onboarding Analytics Events implementieren
- [ ] A/B Test für Tour-Länge starten
- [ ] User Feedback sammeln (In-App Survey)
- [ ] Top 5 Abbruchpunkte identifizieren
- [ ] Hotfix für Blocker-Bugs

### Post-Launch (Woche 2-4)
- [ ] Feature Discovery verbessern (Badges, Tooltips)
- [ ] Onboarding-Flow basierend auf Daten optimieren
- [ ] Video Tutorials erstellen (30s, TikTok/Reels-Format)
- [ ] Social Proof hinzufügen ("333 OG Slots, 100 filled")
- [ ] Referral System für virales Wachstum

---

## 🚨 Critical User Flows (Priorität)

### Flow 1: From Landing → First Analysis (P0)
**Target:** < 60 Sekunden
1. Landing → Welcome Modal (5s)
2. Skip Tour → Analyze Page (2s)
3. Demo Token vorausgefüllt → Analyze (10s)
4. Results anzeigen → Success (20s)
5. Tooltip: "Save to Journal" → Hint (3s)

### Flow 2: From Discovery → Access Understanding (P0)
**Target:** < 2 Minuten
1. Bottom Nav → Access Tab (2s)
2. Access Explainer Modal → Read (30s)
3. Choose Path (OG or Holder) → Tabs (5s)
4. Calculator/Hold Check → Interact (30s)
5. Wallet Connect (optional) → Decision Point

### Flow 3: From Usage → PWA Install (P1)
**Target:** 3-5 Minuten aktive Nutzung
1. Use App → Value Moment (3 Min)
2. Install Prompt → See Benefits (10s)
3. Click "Install" → Browser Dialog (5s)
4. Confirm → PWA Installed (2s)
5. Success Message → Celebrate (3s)

---

## 💡 Zusätzliche Empfehlungen

### 1. Social Proof
- "333 OG Pass Slots — 42 already claimed!" (Live Counter)
- "Join 1,234 traders using Sparkfined" (User Count)
- Leaderboard Preview auf Homepage (Top 10 OG)

### 2. Urgency (FOMO)
- "Only 291 OG Slots left!" (Scarcity)
- "Lock amount increases with MCAP" (Now is better)
- "Early adopter badge for first 100 users"

### 3. Education
- **Blog/Docs:** "How to calculate optimal lock amount"
- **FAQ:** Access System, Soulbound NFTs, Streamflow
- **Video:** "Your first 5 minutes with Sparkfined" (YouTube)

### 4. Community
- Discord/Telegram Link prominent platzieren
- "Get help from the community" bei Problemen
- Onboarding-Channel in Discord für Fragen

### 5. Gamification
- **Achievements:** "First Analysis", "First Draw", "OG Pass Holder"
- **Streaks:** "7-day active streak"
- **Levels:** Beginner → Trader → Pro → OG

---

## 🎬 Launch Checklist

### Pre-Launch
- [ ] Welcome Tour implementiert und getestet
- [ ] Access Explainer Modal erstellt
- [ ] PWA Install Prompt funktioniert
- [ ] Push Permission Priming aktiv
- [ ] Analytics Events implementiert
- [ ] Empty States für alle Pages
- [ ] Demo-Token vorausgefüllt
- [ ] Tooltips für Key Features

### Launch Day
- [ ] Health Check: `/api/health` OK
- [ ] All ENV Variables gesetzt
- [ ] PWA installierbar auf iOS & Android
- [ ] Push Notifications funktionieren
- [ ] Wallet Connect (Phantom, Solflare) OK
- [ ] Lock Calculator aktuell (Live MCAP)
- [ ] Leaderboard live

### Post-Launch Monitoring
- [ ] Onboarding Completion Rate > 80%
- [ ] Time to First Action < 60s
- [ ] PWA Install Rate > 50%
- [ ] Access Page Visit Rate > 70%
- [ ] D1 Retention > 50%
- [ ] No critical bugs

---

## 📈 Success Metrics (Woche 1)

| Metrik | Target | Kritisch |
|--------|--------|----------|
| **Landing Page Views** | 1,000 | - |
| **Onboarding Started** | 800 (80%) | < 60% |
| **Onboarding Completed** | 720 (90% of started) | < 70% |
| **First Analyze** | 650 (81%) | < 60% |
| **Access Page Visit** | 560 (70%) | < 50% |
| **Wallet Connect** | 200 (25%) | < 15% |
| **PWA Install** | 400 (50%) | < 30% |
| **D1 Retention** | 400 (50%) | < 30% |
| **D7 Retention** | 240 (30%) | < 20% |

**Red Flags:**
- Onboarding Completion < 70% → Tour zu lang
- Time to First Action > 90s → Zu viele Steps
- PWA Install < 30% → Prompt zu früh/spät
- D7 Retention < 20% → Mangelnder Wert/Engagement

---

## 🛠️ Technische Implementierung

### Onboarding State Management

```typescript
// src/lib/onboarding.ts
export interface OnboardingState {
  completed: boolean
  tourShown: boolean
  currentStep: number
  demoCompleted: boolean
  accessExplainerSeen: boolean
  pwaInstallPrompted: boolean
  pushPermissionAsked: boolean
  firstAnalyzeTimestamp?: number
  featuresDiscovered: string[]
}

export const getOnboardingState = (): OnboardingState => {
  const stored = localStorage.getItem('onboarding_state')
  return stored ? JSON.parse(stored) : defaultState
}

export const updateOnboardingState = (updates: Partial<OnboardingState>) => {
  const current = getOnboardingState()
  const updated = { ...current, ...updates }
  localStorage.setItem('onboarding_state', JSON.stringify(updated))
}
```

### Welcome Tour Component

```typescript
// src/components/onboarding/WelcomeTour.tsx
import { useState, useEffect } from 'react'
import { getOnboardingState, updateOnboardingState } from '@/lib/onboarding'

const TOUR_SCREENS = [
  { id: 'analyze', icon: '📊', title: 'Instant Analysis', desc: '...' },
  { id: 'chart', icon: '📈', title: 'Advanced Charting', desc: '...' },
  { id: 'access', icon: '🎫', title: 'Fair Access', desc: '...' },
]

export default function WelcomeTour() {
  const [visible, setVisible] = useState(false)
  const [currentScreen, setCurrentScreen] = useState(0)

  useEffect(() => {
    const state = getOnboardingState()
    if (!state.tourShown) {
      setVisible(true)
    }
  }, [])

  const handleNext = () => {
    if (currentScreen < TOUR_SCREENS.length - 1) {
      setCurrentScreen(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    updateOnboardingState({ tourShown: true, completed: false })
    setVisible(false)
  }

  const handleComplete = () => {
    updateOnboardingState({ tourShown: true, completed: true })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
        {/* Tour Screen Content */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{TOUR_SCREENS[currentScreen].icon}</div>
          <h2 className="text-2xl font-bold mb-2">{TOUR_SCREENS[currentScreen].title}</h2>
          <p className="text-slate-400">{TOUR_SCREENS[currentScreen].desc}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TOUR_SCREENS.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx === currentScreen ? 'bg-green-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleSkip} className="btn-ghost flex-1">
            Skip Tour
          </button>
          <button onClick={handleNext} className="btn-primary flex-1">
            {currentScreen === TOUR_SCREENS.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### PWA Install Prompt

```typescript
// src/components/onboarding/PWAInstallPrompt.tsx
import { useState, useEffect } from 'react'
import { getOnboardingState, updateOnboardingState } from '@/lib/onboarding'

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Listen for beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Show prompt after 3 minutes of active usage
      const state = getOnboardingState()
      if (state.firstAnalyzeTimestamp) {
        const elapsed = Date.now() - state.firstAnalyzeTimestamp
        if (elapsed > 3 * 60 * 1000 && !state.pwaInstallPrompted) {
          setVisible(true)
          updateOnboardingState({ pwaInstallPrompted: true })
        }
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installed')
    }

    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    // Show again after 24 hours
    setTimeout(() => setVisible(true), 24 * 60 * 60 * 1000)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-slide-up">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📲</div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install Sparkfined</h3>
            <p className="text-sm text-slate-400">
              Get faster loading, offline access, and push notifications.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleDismiss} className="btn-ghost flex-1">
            Not Now
          </button>
          <button onClick={handleInstall} className="btn-primary flex-1">
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Integration in App.tsx

```typescript
// src/App.tsx
import WelcomeTour from './components/onboarding/WelcomeTour'
import PWAInstallPrompt from './components/onboarding/PWAInstallPrompt'

function App() {
  return (
    <TelemetryProvider>
      <SettingsProvider>
        <AIProviderState>
          {/* Existing App */}
          <RoutesRoot />
          <GlobalInstruments />
          
          {/* Onboarding Components */}
          <WelcomeTour />
          <PWAInstallPrompt />
        </AIProviderState>
      </SettingsProvider>
    </TelemetryProvider>
  )
}
```

---

## 🎉 Zusammenfassung

### Must-Have für Launch
1. ✅ **Welcome Tour** (3 Screens, skippable)
2. ✅ **Access Explainer** (Modal beim ersten Besuch von Access Page)
3. ✅ **Demo Token** (SOL vorausgefüllt auf Analyze)
4. ✅ **PWA Install Prompt** (nach 3 Min. aktiver Nutzung)
5. ✅ **Empty States** (alle Pages)
6. ✅ **Analytics Events** (Funnel-Tracking)

### Nice-to-Have
- Tooltips für Features (react-joyride)
- Video Tutorials (30s)
- Social Proof Counter (Live)
- Achievement System
- Referral Program

### Success = Happy Users
Ein gutes Onboarding ist **unsichtbar** — der User merkt nicht, dass er "onboarded" wird, sondern fühlt sich einfach sofort zuhause. **Wert zuerst zeigen, dann erklären.**

---

**Bereit für Launch? 🚀**
