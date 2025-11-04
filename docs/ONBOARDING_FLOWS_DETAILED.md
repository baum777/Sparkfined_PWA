# 🎯 Onboarding Flows - Detailliertes Konzept

**Projekt:** Sparkfined PWA  
**Version:** 2.0 (Gemeinsam entwickelt)  
**Datum:** 2025-11-04

---

## 🔍 Analyse: Aktuelle Situation

### App-Struktur
- **Einstiegspunkt:** `/` = AnalyzePage (kein separates Landing)
- **Main Navigation:** Bottom Nav mit 3 Tabs (Analyze, Journal, Replay)
- **Weitere Pages:** Access, Settings, Notifications (über Header/Menu)
- **Komplexität:** Analyze-Page ist Feature-reich (KPIs, Heatmap, AI, Playbook)

### Problem
❌ User landet direkt auf der komplexen Analyze-Page  
❌ Keine Erklärung, was die App kann  
❌ Kein Demo-Modus (leeres Input-Feld)  
❌ Access-System (OG Pass) ist versteckt  
❌ PWA-Features (Install, Push) werden nicht promoted

---

## 🎯 Onboarding-Ziele

### Primär (First Session)
1. ✅ **Verstehen** - "Was kann diese App?"
2. ✅ **Erste Aktion** - Token analysieren (< 60s)
3. ✅ **Feature Discovery** - Weitere Features entdecken
4. ✅ **Access verstehen** - OG Pass vs Holder
5. ✅ **PWA Installation** - App installieren

### Sekundär (Return Visits)
6. ✅ **Deep Features** - Chart, Replay, AI nutzen
7. ✅ **Habit Building** - Journal, Notifications
8. ✅ **Community** - Access/Leaderboard

---

## 📊 User Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRST-TIME USER JOURNEY                   │
└─────────────────────────────────────────────────────────────┘

Phase 1: Landing (0-10 Sekunden)
├─ App öffnen → AnalyzePage
├─ Leeres Input-Feld sehen
└─ ❓ "Was soll ich hier machen?"

Phase 2: Welcome & Orientation (10-30 Sekunden)
├─ Welcome Overlay erscheint (nicht Fullscreen!)
├─ Kurze Intro: "Professional Trading Analysis"
├─ 3 Key Features zeigen (Analyze, Chart, Access)
└─ CTA: "Try Demo" oder "Skip Tour"

Phase 3: First Action (30-90 Sekunden)
├─ Demo Token vorausgefüllt (SOL)
├─ "Analyze" Button highlighted
├─ User klickt → Ergebnisse in 5-10s
├─ KPIs + Heatmap + AI-Button sichtbar
└─ ✅ First Value Moment

Phase 4: Feature Discovery (90-180 Sekunden)
├─ Contextual Tooltips erscheinen
│  ├─ "Save to Journal" (bei Hover auf AI Result)
│  ├─ "View Chart" (bei Hover auf Chart-Link)
│  └─ "Create Alert" (bei Hover auf Playbook)
├─ Bottom Nav Badges: "New" auf Journal/Replay
└─ User exploriert weitere Features

Phase 5: PWA Conversion (3-5 Minuten)
├─ User nutzt App aktiv
├─ PWA Install Prompt erscheint (Bottom Right)
├─ Benefits zeigen (Offline, Fast, Push)
└─ Install oder Dismiss

Phase 6: Access Discovery (Optional)
├─ User öffnet Menu/Settings
├─ "Access Pass" Badge/Highlight
├─ Access Page → Explainer Modal
└─ OG Pass vs Holder verstehen

┌─────────────────────────────────────────────────────────────┐
│                   RETURN USER JOURNEY                        │
└─────────────────────────────────────────────────────────────┘

Session 2-3: Habit Formation
├─ "Welcome back!" Message (optional)
├─ Letzte Analysen anzeigen (History)
├─ Journal-Entries reminder
└─ Notification Opt-in promoten

Session 4+: Power User
├─ Advanced Features: Replay, Chart Drawing
├─ Community: Leaderboard, Access
├─ Referrals: Invite Friends
└─ Pro Tips: Keyboard Shortcuts
```

---

## 🎨 Flow 1: Welcome & First Analyze (Critical Path)

### Schritt 1: Welcome Overlay (10 Sekunden)

**Design: Compact Bottom Sheet (nicht Fullscreen!)**

```
┌─────────────────────────────────────┐
│  AnalyzePage (sichtbar, aber dimmed)│
│  ┌───────────────────────────────┐  │
│  │ [Input Field]  [Analyze]     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║  👋 Welcome to Sparkfined     ║  │
│  ║                               ║  │
│  ║  Professional Trading Analysis║  │
│  ║                               ║  │
│  ║  📊 Instant KPIs & Heatmaps   ║  │
│  ║  📈 Advanced Charting          ║  │
│  ║  🤖 AI-Powered Insights        ║  │
│  ║                               ║  │
│  ║  [Try Demo] [Skip Tour]       ║  │
│  ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘
```

**Interaktionen:**
- **Try Demo** → Input-Feld wird mit SOL gefüllt + Analyze automatisch
- **Skip Tour** → Overlay verschwindet, User kann selbst erkunden
- **Backdrop Click** → Overlay verschwindet (nicht aufdringlich)

**Timing:**
- Erscheint nach 2 Sekunden (gibt User Zeit zum Orientieren)
- Nur beim ersten Besuch (localStorage Flag)

---

### Schritt 2: Demo Analysis (Guided)

**Flow:**

```
1. User klickt "Try Demo"
   ↓
2. Welcome Overlay faded out
   ↓
3. Input-Feld animated → SOL Address eingefügt
   ↓
4. "Analyze" Button highlighted + pulsiert
   ↓
5. Auto-Click nach 1s (oder User klickt selbst)
   ↓
6. Loading State (5-10s)
   ↓
7. Results erscheinen mit Animation
   ↓
8. Tooltips erscheinen nacheinander:
   ├─ Tooltip 1: "These are key metrics" (über KPI Cards)
   ├─ Tooltip 2: "Visual indicator signals" (über Heatmap)
   └─ Tooltip 3: "Get AI insights" (über AI Button)
```

**Visual: Tooltips (Nicht-blockierend)**

```
┌─────────────────────────────────────┐
│  KPI Cards                          │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Close   │ │Change  │ │ATR     │  │
│  │$123.45 │ │+5.2%   │ │2.34    │  │
│  └────────┘ └────────┘ └────────┘  │
│     ↑                               │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━┓         │
│  ┃ 💡 Key metrics at a   ┃         │
│  ┃ glance. Click for     ┃         │
│  ┃ details.              ┃         │
│  ┃ [Got it] [Next]       ┃         │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━┛         │
│                                     │
│  Heatmap                            │
│  ┌─────────────────────────────┐   │
│  │ [Indicator Matrix]          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Tooltip-Eigenschaften:**
- **Position:** Near target element (nicht Overlay)
- **Dismissible:** Click "Got it" oder Click außerhalb
- **Sequential:** 1 nach dem anderen (nicht alle gleichzeitig)
- **Skippable:** "Skip All" Button in jedem Tooltip

---

### Schritt 3: Feature Hints (Progressive Disclosure)

**Timing:** Nach 20 Sekunden auf Analyze Page

**Toast Messages (Bottom Left, non-intrusive):**

```
┌─────────────────────────────────────┐
│  AnalyzePage                        │
│                                     │
│  [KPI Cards]                        │
│  [Heatmap]                          │
│  [AI Section]                       │
│                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ 💡 Tip: Click "→ Chart" to   ┃  │
│  ┃ visualize this analysis       ┃  │
│  ┃ [Show me] [Dismiss]           ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                     │
│  Bottom Nav                         │
└─────────────────────────────────────┘
```

**Progressive Hints (One at a time):**

1. **After first Analyze (20s):**
   "💡 Tip: Save AI insights to your Journal"

2. **After Chart Link click (30s):**
   "📈 Try drawing on the chart for technical analysis"

3. **After 2 Minutes (120s):**
   "🎯 Create alerts to track price movements"

4. **After 3 Minutes (180s):**
   → PWA Install Prompt (separate component)

---

## 🎨 Flow 2: Feature Discovery (Bottom Nav)

### Problem
User sieht nur 3 Tabs (Analyze, Journal, Replay) → andere Features versteckt

### Lösung: Smart Bottom Nav mit Discovery Badges

```
┌─────────────────────────────────────┐
│  Bottom Navigation                  │
├───────────┬───────────┬─────────────┤
│  📊       │  📝  ①   │  ⏮️  NEW   │
│  Analyze  │  Journal  │  Replay     │
│           │           │             │
│  (active) │ (unseen)  │  (new)      │
└───────────┴───────────┴─────────────┘
```

**Badge Types:**
- **Red Dot** - Noch nicht besucht
- **Number Badge** - Neue Inhalte (z.B. "① " = 1 Journal Entry)
- **"NEW" Label** - Neu hinzugefügtes Feature
- **Pulse Animation** - Feature mit Action Required

**Implementation:**

```typescript
// Track visited pages in localStorage
const visitedPages = JSON.parse(
  localStorage.getItem('visited_pages') || '[]'
)

// Show badge if not visited
const showBadge = !visitedPages.includes('journal')
```

---

## 🎨 Flow 3: Access System Discovery

### Challenge
Access System (OG Pass vs Holder) ist komplex und versteckt

### Approach: Gradual Introduction

**Step 1: Soft Hint (After 2 Minutes)**

Toast Message:
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🎫 Unlock full features with  ┃
┃ Sparkfined Access Pass        ┃
┃ [Learn More] [Not Now]        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**Step 2: Header Badge (Persistent)**

```
┌─────────────────────────────────────┐
│  [Logo]  Sparkfined    [🎫] [⚙️]  │
│                         ↑           │
│                       (Badge)       │
└─────────────────────────────────────┘
```

Badge führt zu Access Page

**Step 3: Access Page → Explainer Modal (First Visit)**

Automatisch beim ersten Besuch der Access Page:

```
┌─────────────────────────────────────┐
│  Access Explainer Modal             │
│                                     │
│  🎫 Two ways to unlock access:      │
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │ 👑 OG Pass  │  │ 💎 Holder    │ │
│  │ 333 Slots   │  │ Unlimited    │ │
│  │ Lock tokens │  │ Hold ≥100k   │ │
│  │ Lifetime    │  │ Flexible     │ │
│  │             │  │              │ │
│  │ [Calculate] │  │ [Check]      │ │
│  └─────────────┘  └──────────────┘ │
│                                     │
│  [Learn More] [Get Started]         │
└─────────────────────────────────────┘
```

---

## 🎨 Flow 4: PWA Installation (Conversion)

### Timing Strategy

```
┌─────────────────────────────────────┐
│  PWA Install Trigger Conditions     │
└─────────────────────────────────────┘

Condition 1: Time-Based
├─ First Analyze completed
└─ 3+ Minutes active usage

Condition 2: Engagement-Based
├─ 2+ Features used (Analyze + Chart)
└─ AI Button clicked

Condition 3: Return Visit
├─ 2nd or 3rd session
└─ User shows interest (>2 min session)

Priority: Whichever comes first
```

### PWA Prompt Design

**Location: Bottom Right (Mobile) / Sidebar (Desktop)**

```
Mobile:
┌─────────────────────────────────────┐
│  AnalyzePage                        │
│                                     │
│  [Content]                          │
│                                     │
│                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓     │
│  ┃ 📲 Install Sparkfined     ┃     │
│  ┃                           ┃     │
│  ┃ ✓ Faster loading          ┃     │
│  ┃ ✓ Work offline            ┃     │
│  ┃ ✓ Price alerts            ┃     │
│  ┃                           ┃     │
│  ┃ [Install] [Not Now]       ┃     │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛     │
│                                     │
│  Bottom Nav                         │
└─────────────────────────────────────┘

Desktop:
┌─────────────────────────────────────┐
│  [Logo] Sparkfined      [🎫] [⚙️] │
├─────────────────────────────────────┤
│                    │                │
│  AnalyzePage       │  ┏━━━━━━━━━━┓ │
│                    │  ┃ 📲 Install┃ │
│  [Content]         │  ┃          ┃ │
│                    │  ┃ Benefits:┃ │
│                    │  ┃ • Fast   ┃ │
│                    │  ┃ • Offline┃ │
│                    │  ┃ • Alerts ┃ │
│                    │  ┃          ┃ │
│                    │  ┃ [Install]┃ │
│                    │  ┃ [Dismiss]┃ │
│                    │  ┗━━━━━━━━━━┛ │
└─────────────────────────────────────┘
```

**Features:**
- ✅ Non-blocking (doesn't cover content)
- ✅ Dismissible (X button)
- ✅ Re-prompt after 24h if dismissed
- ✅ Never show again if installed
- ✅ Track in localStorage

---

## 🎨 Flow 5: Journal Integration

### Problem
User analysiert Token, aber speichert nichts → keine Habit

### Solution: Contextual Journal Prompts

**Trigger 1: After AI Result**

```
┌─────────────────────────────────────┐
│  AI-Assist Section                  │
│  ┌─────────────────────────────────┐│
│  │ [AI Result Text]                ││
│  └─────────────────────────────────┘│
│                                     │
│  [In Journal einfügen] ← Highlighted│
│     ↑                               │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━┓        │
│  ┃ 💡 Save for later review┃        │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━┛        │
└─────────────────────────────────────┘
```

**Trigger 2: After 3rd Analyze (Pattern)**

Toast Message:
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📝 You've analyzed 3 tokens   ┃
┃ Start a trade journal to      ┃
┃ track your ideas!             ┃
┃ [Open Journal] [Later]        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎨 Flow 6: Notifications Opt-In

### Problem
Push Permissions werden oft abgelehnt, wenn zu früh gefragt

### Solution: Permission Priming (2-Step)

**Step 1: Soft Ask (On Notifications Page)**

```
┌─────────────────────────────────────┐
│  Notifications Page                 │
│                                     │
│  🔔 Smart Price Alerts              │
│                                     │
│  Get notified when:                 │
│  • Price hits your target           │
│  • Volume spikes detected           │
│  • Pattern confirmed                │
│                                     │
│  ⚡ Enable Push Notifications       │
│                                     │
│  [Enable Notifications]             │
│  [Maybe Later]                      │
└─────────────────────────────────────┘
```

User klickt "Enable Notifications" → **dann erst** Browser Permission

**Step 2: Browser Permission (Hard Ask)**

Nur nach User-Klick auf Button → Native Browser Dialog

**Step 3: Success State**

```
┌─────────────────────────────────────┐
│  🎉 Notifications Enabled!          │
│                                     │
│  You'll receive alerts for:         │
│  ✓ Price movements                  │
│  ✓ Volume spikes                    │
│  ✓ Technical signals                │
│                                     │
│  [Create First Alert]               │
└─────────────────────────────────────┘
```

---

## 📊 Flow Decision Tree

```
User opens App
    ↓
First Visit?
    ├─ YES → Welcome Overlay (2s delay)
    │        ├─ Try Demo → Guided Analysis
    │        └─ Skip Tour → Free Explore
    │
    └─ NO → Direct to AnalyzePage
             ├─ Show last analysis (if exists)
             └─ "Welcome back" toast (optional)

User completes first Analyze
    ↓
Show contextual hints
    ├─ Journal hint (20s)
    ├─ Chart hint (30s)
    └─ Alert hint (60s)

User active for 3+ minutes
    ↓
Show PWA Install Prompt
    ├─ Install → Success
    │   └─ Mark installed in state
    └─ Dismiss → Re-prompt after 24h

User opens Access Page
    ↓
First visit to Access?
    ├─ YES → Access Explainer Modal
    │        ├─ Calculate Lock → Lock Tab
    │        └─ Check Balance → Hold Tab
    │
    └─ NO → Direct to Status Tab
```

---

## 🎯 Onboarding State Machine

### States

```typescript
type OnboardingState = {
  // Welcome Flow
  welcomeShown: boolean
  welcomeCompleted: boolean
  demoCompleted: boolean
  
  // Feature Discovery
  pagesVisited: string[] // ['analyze', 'journal', ...]
  featuresUsed: string[]  // ['ai-assist', 'chart', ...]
  tooltipsSeen: string[]  // ['kpi-cards', 'heatmap', ...]
  
  // Access System
  accessPageVisited: boolean
  accessExplainerSeen: boolean
  walletConnected: boolean
  
  // PWA & Push
  pwaInstallPrompted: boolean
  pwaInstalled: boolean
  pushPermissionAsked: boolean
  pushPermissionGranted: boolean
  
  // Analytics
  firstAnalyzeTimestamp?: number
  analyzeCount: number
  sessionCount: number
  lastActiveTimestamp: number
}
```

### Transitions

```typescript
// Example: Track page visit
function onPageVisit(page: string) {
  const state = getOnboardingState()
  if (!state.pagesVisited.includes(page)) {
    updateOnboardingState({
      pagesVisited: [...state.pagesVisited, page]
    })
    
    // Remove badge from Bottom Nav
    removeBadge(page)
  }
}

// Example: Show PWA prompt
function checkPWAPrompt() {
  const state = getOnboardingState()
  
  if (state.pwaInstallPrompted || state.pwaInstalled) {
    return false // Already prompted or installed
  }
  
  const timeSinceFirstAnalyze = state.firstAnalyzeTimestamp
    ? Date.now() - state.firstAnalyzeTimestamp
    : 0
  
  const shouldShow = 
    state.analyzeCount >= 1 &&
    timeSinceFirstAnalyze > 3 * 60 * 1000 && // 3 minutes
    state.featuresUsed.length >= 2 // Used at least 2 features
  
  return shouldShow
}
```

---

## 🎨 Visual Design Principles

### 1. **Progressive Disclosure**
- Zeige nur was relevant ist (jetzt)
- Nicht alle Features auf einmal erklären
- Nach und nach einführen

### 2. **Non-Intrusive**
- Nie Fullscreen-Blockaden (außer Welcome)
- Immer Skip/Dismiss Option
- Tooltips statt Modals (wo möglich)

### 3. **Contextual**
- Hints erscheinen am richtigen Ort
- Timing ist wichtig (nicht zu früh/spät)
- Relevant zur aktuellen Aktion

### 4. **Celebratory**
- Success States feiern (Confetti, Checkmarks)
- Positive Reinforcement
- "You're making progress!"

### 5. **Consistent**
- Gleiche Farben/Styles für Onboarding-Elemente
- Wiedererkennbar (z.B. 💡 für Tips)
- Branded (Green = Primary Action)

---

## 📱 Mobile-Specific Considerations

### Touch Targets
- Minimum 44x44px für alle Buttons
- Genug Abstand zwischen Elementen (8px+)
- Thumb-friendly zones (Bottom 2/3)

### Swipe Gestures
- Welcome Tour: Swipe links/rechts für Next/Skip
- Tooltips: Swipe down zum Dismiss
- PWA Prompt: Swipe down zum Dismiss

### Orientation
- Welcome Overlay: Portrait only (Lock orientation)
- PWA Prompt: Funktioniert in beiden
- Tooltips: Adaptive positioning

---

## 🖥️ Desktop-Specific Considerations

### Hover States
- Alle Buttons haben Hover Effects
- Tooltips on Hover (zusätzlich zu Click)
- Keyboard Navigation Support

### Shortcuts
- ESC key schließt Overlays/Modals
- Tab navigation durch Onboarding
- Enter für Primary Actions

### Layout
- Welcome Modal: Centered (max-width: 600px)
- PWA Prompt: Sidebar (Right, 300px width)
- Tooltips: Near target, with arrow

---

## 📊 Success Metrics (KPIs)

### Primary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Welcome Completion** | >80% | Complete tour vs Skip |
| **Demo Completion** | >70% | "Try Demo" → Results shown |
| **Time to First Analyze** | <60s | Landing → First analyze |
| **Feature Discovery Rate** | >60% | Users visiting 2+ pages |
| **PWA Install Rate** | >40% | Installs / Prompts shown |
| **D1 Retention** | >45% | Return next day |
| **D7 Retention** | >25% | Return week later |

### Secondary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Access Page Visit** | >60% | Within first 3 sessions |
| **Wallet Connect** | >20% | Unique connections |
| **Journal Usage** | >35% | Created ≥1 entry |
| **AI Usage** | >50% | Clicked AI button |
| **Alert Creation** | >25% | Created ≥1 alert |

---

## 🧪 A/B Testing Ideas

### Test 1: Welcome Overlay Timing
- **Variant A:** Immediate (0s delay)
- **Variant B:** 2s delay (current)
- **Variant C:** 5s delay
- **Metric:** Completion rate, Bounce rate

### Test 2: Demo vs. Manual
- **Variant A:** "Try Demo" button (guided)
- **Variant B:** SOL pre-filled, no modal
- **Variant C:** Empty field, no prompts
- **Metric:** Time to first analyze, Completion rate

### Test 3: PWA Prompt Timing
- **Variant A:** After 2 minutes
- **Variant B:** After 3 minutes (current)
- **Variant C:** After first return visit
- **Metric:** Install rate, Dismiss rate

### Test 4: Tooltip vs. Toast
- **Variant A:** Sequential tooltips (current)
- **Variant B:** Toast messages only
- **Variant C:** No hints (control)
- **Metric:** Feature discovery, User confusion (support tickets)

---

## 🚀 Implementation Priority

### Phase 0: Pre-Launch (Critical - 1-2 Days)

1. ✅ **Welcome Overlay** (4 hours)
   - Bottom Sheet design
   - Try Demo / Skip logic
   - LocalStorage tracking

2. ✅ **Demo Flow** (3 hours)
   - SOL pre-fill
   - Auto-analyze
   - Success state

3. ✅ **PWA Install Prompt** (2 hours)
   - Timing logic
   - Custom UI
   - Re-prompt strategy

4. ✅ **Access Explainer** (3 hours)
   - Modal design
   - OG vs Holder comparison
   - Tab switching logic

**Total: ~12 hours**

---

### Phase 1: Launch Week (High - 2-3 Days)

5. ⏱️ **Contextual Tooltips** (4 hours)
   - KPI Cards tooltip
   - Heatmap tooltip
   - AI Button tooltip
   - Sequential logic

6. ⏱️ **Bottom Nav Badges** (3 hours)
   - Visited tracking
   - Badge rendering
   - Pulse animations

7. ⏱️ **Feature Hints (Toasts)** (3 hours)
   - Toast component
   - Timing logic
   - Dismiss handling

8. ⏱️ **Analytics Integration** (2 hours)
   - Event tracking
   - Funnel setup
   - Dashboard

**Total: ~12 hours**

---

### Phase 2: Post-Launch (Medium - 1 Week)

9. 📅 **Empty States** (4 hours)
   - Journal empty state
   - Replay empty state
   - Watchlist empty state

10. 📅 **Success Animations** (3 hours)
    - Confetti on OG Pass mint
    - Checkmarks on saves
    - Progress indicators

11. 📅 **Keyboard Shortcuts** (2 hours)
    - ESC for dismiss
    - Tab navigation
    - Shortcuts help overlay

12. 📅 **Mobile Gestures** (4 hours)
    - Swipe for tour navigation
    - Swipe to dismiss
    - Touch feedback

**Total: ~13 hours**

---

## 🎯 Zusammenfassung

### Was macht dieses Konzept besonders?

1. ✅ **User landet direkt auf der Hauptseite** (kein separates Landing)
2. ✅ **Nicht aufdringlich** (Overlays sind dismissible)
3. ✅ **Progressiv** (nach und nach mehr Features)
4. ✅ **Kontextuell** (Hints zur richtigen Zeit am richtigen Ort)
5. ✅ **Messbar** (klare KPIs und A/B Tests)
6. ✅ **Mobile-First** (Touch-optimiert, Gesten)

### Nächste Schritte

1. 📝 **Review** dieses Konzepts (Feedback willkommen!)
2. 🎨 **Design** der Welcome Overlay & Tooltips (Figma/Wireframes)
3. 💻 **Implementation** Phase 0 (Critical Path)
4. 🧪 **Testing** auf verschiedenen Geräten
5. 📊 **Analytics** Setup & Monitoring
6. 🚀 **Launch** & Iterate

---

**Feedback erwünscht! Was sollen wir ändern/verbessern?** 🤔
