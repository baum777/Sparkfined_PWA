# ONBOARDING DIALOGS
## Lore-Integrated User Introduction

**Purpose:** Welcome users with narrative context, not just feature lists
**Flow:** 4-stage progressive onboarding matching Hero's Journey
**Tone:** Mythic but actionable, degen-friendly but profound
**Duration:** 2-5 minutes (skippable for power users)

---

## ONBOARDING PHILOSOPHY

**Traditional onboarding:**
"Here's button X. Click it to do Y."
→ Functional, boring, forgettable

**Sparkfined onboarding:**
"You're at Stage X of your journey. This tool helps you with Y."
→ Narrative, engaging, memorable

**Key Principles:**
1. **Story First:** Every screen tells where they are in the journey
2. **Choice-Driven:** Users select their path (persona-based)
3. **Show, Don't Tell:** Interactive demos > walls of text
4. **Unlock Feeling:** "You just unlocked Stage 2 NFT!" creates progress
5. **Skip-Friendly:** Power users can skip, but shouldn't want to

---

## ONBOARDING FLOW

```
Landing Page (Call to Adventure)
        ↓
    [Begin Journey] Button Clicked
        ↓
┌───────────────────────────────────┐
│ STAGE 1: PERSONA SELECTION        │ (30s)
│ "Who are you?"                    │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│ STAGE 2: WELCOME TO COMMAND CENTER│ (60s)
│ "This is your system."            │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│ STAGE 3: INTERACTIVE TOUR          │ (90-120s)
│ "Try it yourself."                │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│ STAGE 4: FIRST ACTION + NFT MINT  │ (30s)
│ "You've crossed the threshold."  │
└───────────────────────────────────┘
        ↓
    App Main View (BoardPage)
```

---

## STAGE 1: PERSONA SELECTION

**Screen:** Full-screen modal, dark background with grid pattern

**Title (Top):**
```
🌟 WELCOME TO THE JOURNEY
```

**Subtitle:**
```
Every trader begins in The Scattered Realm.
But not every trader walks the same path.

Who are you?
```

**Persona Cards (4 options, grid layout):**

### **CARD 1: THE NEWCOMER**
```
┌──────────────────────────────┐
│  🌱 THE NEWCOMER             │
│                              │
│  "I'm new to crypto trading" │
│                              │
│  You'll get:                 │
│  • Full guided tour (5 min)  │
│  • Basic concepts explained  │
│  • Safe playground mode      │
│  • Slow-paced intro          │
│                              │
│  [Choose This Path →]        │
└──────────────────────────────┘
```

**Data Collected:**
- `userPersona: "newcomer"`
- `tourSpeed: "slow"`
- `showTooltips: true`
- `safeMode: true` (limits features initially)

---

### **CARD 2: THE ACTIVE TRADER**
```
┌──────────────────────────────┐
│  ⚡ THE ACTIVE TRADER        │
│                              │
│  "I trade regularly"         │
│                              │
│  You'll get:                 │
│  • Quick tour (2 min)        │
│  • Feature highlights        │
│  • All features unlocked     │
│  • Jump right in             │
│                              │
│  [Choose This Path →]        │
└──────────────────────────────┘
```

**Data Collected:**
- `userPersona: "active"`
- `tourSpeed: "medium"`
- `showTooltips: false`
- `safeMode: false`

---

### **CARD 3: THE POWER USER**
```
┌──────────────────────────────┐
│  🔥 THE POWER USER           │
│                              │
│  "I know what I'm doing"     │
│                              │
│  You'll get:                 │
│  • Skip tour (optional)      │
│  • Keyboard shortcuts shown  │
│  • Advanced features first   │
│  • API docs access           │
│                              │
│  [Choose This Path →]        │
└──────────────────────────────┘
```

**Data Collected:**
- `userPersona: "power"`
- `tourSpeed: "fast"` or `"skip"`
- `showTooltips: false`
- `safeMode: false`
- `showKeyboardShortcuts: true`

---

### **CARD 4: THE MOBILE-FIRST**
```
┌──────────────────────────────┐
│  📱 THE MOBILE-FIRST         │
│                              │
│  "I mostly trade on mobile"  │
│                              │
│  You'll get:                 │
│  • Mobile-optimized tour     │
│  • Gesture guide             │
│  • Touch-first UI tips       │
│  • PWA install prompt        │
│                              │
│  [Choose This Path →]        │
└──────────────────────────────┘
```

**Data Collected:**
- `userPersona: "mobile"`
- `tourSpeed: "medium"`
- `showGestureGuide: true`
- `promptPWAInstall: true`

---

**Bottom of Screen:**
```
Not sure? Start with "Active Trader" - you can change this later in Settings.

[Skip Onboarding →] (small, subtle)
```

**After Selection:**
```
✅ Persona Selected: [Name]

Unlocked: Stage 1 NFT "The Scattered Realm" 💀

[Mint Now] [Continue Journey →]
```

---

## STAGE 2: WELCOME TO COMMAND CENTER

**Screen:** Animated transition from persona selection

**Animation:**
- Fog/chaos visual fades
- Command Center UI materializes from code
- Three Pillars glow into view (💎📜🔑)

**Dialog (Center of screen, glassmorphism card):**

### **FOR NEWCOMER:**
```markdown
🗡️ WELCOME TO YOUR COMMAND CENTER

You've just left The Scattered Realm.

**This is Sparkfined.**
Not a signal group. Not a guru. Your SYSTEM.

**The Three Pillars:**

💎 CLARITY OVER CHAOS
  → Structured data, not scattered tabs

📜 MEMORY OVER INSTINCT
  → Your journal never forgets

🔑 SOVEREIGNTY OVER DEPENDENCY
  → Your data, your rules, your device

**What this means:**
We won't tell you WHEN to trade.
We'll show you HOW to decide.

The market is chaos. Your system isn't.

[I Understand →] [Read Full Lore]
```

### **FOR ACTIVE TRADER:**
```markdown
⚡ WELCOME TO THE COMMAND CENTER

You've traded before. You know the pain:
• Missed alerts
• Forgotten trade reasons
• Scattered tools
• Vendor lock-in

**Sparkfined fixes that:**

💎 Clarity → Heuristic analysis <50ms (free)
📜 Memory → AI-powered journal + LessonsPage
🔑 Sovereignty → Local-first, offline PWA

**Your edge isn't the chart.**
**It's what you DO with it.**

Ready to see how?

[Show Me →] [Skip Tour]
```

### **FOR POWER USER:**
```markdown
🔥 WELCOME, POWER USER

**Tech Stack:**
• React 18 + TypeScript + Vite
• IndexedDB (Dexie) - local-first
• Canvas rendering (60fps charts)
• Offline PWA (2.3 MB precached)
• Solana Web3.js (soulbound NFTs)

**Pillars:**
• Clarity: Heuristic (0€) → AI (optional)
• Memory: Journal + AI pattern detection
• Sovereignty: Export all, self-host (Q2 2025)

**Keyboard Shortcuts:**
• ? → Show all shortcuts
• / → Quick search
• Ctrl+J → New journal entry
• Ctrl+K → Command palette

[Enter Command Center →] [Read API Docs]
```

---

## STAGE 3: INTERACTIVE TOUR

**Format:** Step-by-step highlighting of UI elements with narrative context

**Tour Structure (Adaptive based on persona):**

### **STEP 1: BOARD PAGE OVERVIEW**

**Highlight:** Entire BoardPage
**Narrative:**
```
📊 THIS IS THE BOARD

Your command center. Everything at a glance:
• Market overview (11 KPIs)
• Activity feed (recent actions)
• Quick actions (navigate anywhere)

Think of it as your cockpit.

[Next: Analyze a Token →]
```

**Interactive Element:**
```
Try it: Click on the BTC/USD tile
[Clickable highlight on KPI tile]
```

**After Click:**
```
✅ Good! You just navigated to AnalyzePage.
This is where clarity begins.

[Continue →]
```

---

### **STEP 2: ANALYZE PAGE (THE FIRST CLARITY)**

**Highlight:** Upload Screenshot area
**Narrative:**
```
📸 UPLOAD A CHART SCREENSHOT

This is the magic:
1. Upload any chart (TradingView, Binance, etc.)
2. OCR extracts token + price + indicators
3. Heuristic engine calculates:
   • Range (Low/Mid/High)
   • Bias (Bullish/Bearish/Neutral)
   • Entry zones (Fibonacci-based)
   • SL/TP suggestions

All in <50ms. Completely free.

[Try It Now - Upload Demo Chart →]
```

**Interactive Element:**
```
[Demo Chart Button]
Click to analyze a sample BTC chart
```

**After Demo Analysis:**
```
⚡ ANALYSIS COMPLETE (42ms)

Range: $48,200 (L) | $49,247 (M) | $50,800 (H)
Bias: Bullish
Entry: Wait for $49,000-$49,300 consolidation
SL: $48,150 | TP: $51,200 (1.5R)

This is CLARITY.
Not a signal. A STRUCTURE.

You decide what to do with it.

[Next: Journal This →]
```

---

### **STEP 3: JOURNAL PAGE (THE CHRONICLE)**

**Highlight:** Journal entry form
**Narrative:**
```
📜 THE JOURNAL: YOUR MEMORY

Most traders lose because they forget:
• Why they entered
• How they felt
• What worked last time

Your journal fixes that.

**For every trade, write:**
• Entry reason (real, not BS)
• Emotion (#FOMO #Disciplined #Revenge)
• Plan (Entry/SL/TP)

**After 30+ entries:**
LessonsPage unlocks → AI shows your patterns

[Create Demo Entry →]
```

**Interactive Element (Pre-filled demo):**
```
┌──────────────────────────────────┐
│ Journal Entry #1                 │
│                                  │
│ Token: BTC/USDT                  │
│ Entry: $49,150                   │
│ Why: Consolidation + RSI <30     │
│ Emotion: #Disciplined            │
│ Plan: SL $48,800 | TP $50,900    │
│                                  │
│ [Save Entry]                     │
└──────────────────────────────────┘
```

**After Save:**
```
✅ JOURNAL ENTRY SAVED

This is now part of your Codex.

29 more entries → LessonsPage unlocks
  (AI finds patterns: best setups, worst emotions)

[Next: Set an Alert →]
```

---

### **STEP 4: ALERTS (THE SENTINEL)**

**Highlight:** Alert creation modal
**Narrative:**
```
🔔 ALERTS: THE SENTINEL

The market never sleeps. But you must.

**Set rules like:**
• "If BTC crosses $50,000, notify me"
• "If RSI <30, alert me"
• "If volume spikes 200%, ping me"

**Server-side** = Always running (even if app closed)
**Backtestable** = See historical performance

Initiates: 10 alerts/day (free)
OGs: Unlimited

[Create Demo Alert →]
```

**Interactive Element:**
```
Rule Builder (Visual):
┌──────────────────────────────────┐
│ IF [BTC/USDT]                    │
│ [Price] [crosses above] [$50,000]│
│ THEN [Push Notification]         │
│                                  │
│ [Create Alert]                   │
└──────────────────────────────────┘
```

**After Creation:**
```
✅ ALERT SET

You'll be notified when BTC crosses $50k.
Even if you're sleeping. Even if app is closed.

This is the Sentinel. It watches.

[Next: See Your Journey →]
```

---

## STAGE 4: JOURNEY MAP + NFT MINT

**Screen:** Full Journey visualization

**Title:**
```
🗺️ YOUR JOURNEY AWAITS
```

**Visual:** 12-stage roadmap (like Landing Page section)

**Narrative:**
```
You are now at STAGE 5: THE FIRST CLARITY

You've crossed the threshold from chaos to system.

**Completed:**
✅ Stage 1: The Scattered Realm (entered the app)
✅ Stage 2: Call to Adventure (saw the lore)
✅ Stage 3: Refusal of Call (chose to begin anyway)
✅ Stage 4: Meeting Mentor (met the Command Center)
✅ Stage 5: Crossing Threshold (ran first analysis)

**What's Next:**
⏭️ Stage 6: Tests & Allies (journal 10 trades)
⏭️ Stage 7: Mirror of Emotions (journal 30 trades)
... → Stage 12: The Cycle (mentor 3 users)

Each stage unlocks an NFT (proof of your journey).

[Mint Stage 5 NFT →] [Continue to App]
```

**NFT Mint Modal:**
```
┌─────────────────────────────────────┐
│  🌅 THE FIRST CLARITY               │
│                                     │
│  [NFT Visual Preview]               │
│  Trader stepping through portal     │
│  Chaos → Clarity                    │
│                                     │
│  Stage 5 of 12                      │
│  Unlocked: [Today's Date]           │
│                                     │
│  This NFT is soulbound              │
│  (non-transferable, yours forever)  │
│                                     │
│  [Connect Wallet & Mint]            │
│  [Skip for Now]                     │
└─────────────────────────────────────┘
```

**After Mint (or Skip):**
```
✨ ONBOARDING COMPLETE

You are no longer blind.
You have a system.

The journey continues.

**Quick Tips:**
• Press ? for keyboard shortcuts
• Check BoardPage daily for overview
• Journal BEFORE you trade (not after)
• Set alerts BEFORE you sleep

**Remember The Creed:**
"I trade not blind, but with clarity.
 I rely not on hope, but on data.
 I am sovereign."

[Enter the Command Center →]
```

**Redirect:** BoardPage (with welcome banner)

---

## PROGRESSIVE HINTS (POST-ONBOARDING)

**Format:** Subtle banner at top of pages (dismissible)

### **Hint 1: After First Real Trade**
```
💡 TIP: Journal this trade NOW (while it's fresh)

Your future self will thank you.

[Open Journal] [Dismiss]
```

### **Hint 2: After 5 Trades, No Journal**
```
⚠️ You've made 5 trades but journaled 0.

Without memory, you repeat mistakes.

[Start Journaling] [Remind Me Later]
```

### **Hint 3: After First Loss**
```
📖 Losses are data, not failures.

Journal this trade. Tag the emotion.
Learn the pattern.

[Journal This Loss] [Dismiss]
```

### **Hint 4: After 30 Journal Entries**
```
🎉 30 ENTRIES! LessonsPage Unlocked!

AI has analyzed your patterns.
See your edge (and your demons).

[View LessonsPage →] [Later]
```

### **Hint 5: After Viewing LessonsPage**
```
📊 Your data showed:
FOMO trades = [X]% WR
Disciplined trades = [Y]% WR

Will you honor the data?

[I Will] [Dismiss]
```

---

## ONBOARDING COMPLETION METRICS

**Success Criteria:**

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Onboarding completion | 75%+ | Indicates good UX |
| Time to first analysis | <90s | Quick value demonstration |
| First journal entry | 40%+ | Engagement with core feature |
| NFT mint rate | 30%+ | Community buy-in |
| Return within 24h | 60%+ | Sticky onboarding |

---

## PERSONA-SPECIFIC VARIATIONS

### **Newcomer Path Adjustments:**
- Slower pace (more pauses between steps)
- More explanatory text
- Glossary tooltips (hover over "RSI" → see definition)
- Safe mode: Limits to demo trades first

### **Active Trader Path:**
- Skip basic explanations
- Jump to advanced features (LessonsPage, Alerts)
- Show comparison to TradingView/Binance
- Emphasize speed (<50ms heuristic)

### **Power User Path:**
- Option to skip entirely
- If not skipped: Tech stack shown first
- Keyboard shortcuts emphasized
- API documentation linked
- GitHub (Q2 2025) mentioned

### **Mobile-First Path:**
- Gesture tutorial (swipe, pinch-to-zoom)
- PWA installation prompt
- Offline mode highlighted
- Touch-optimized demos

---

## ACCESSIBILITY CONSIDERATIONS

**Screen Reader Support:**
```html
<!-- Example ARIA -->
<div role="dialog" aria-labelledby="onboarding-title">
  <h1 id="onboarding-title">Welcome to Your Command Center</h1>
  <p>You've just left The Scattered Realm...</p>
  <button aria-label="Continue to interactive tour">
    I Understand →
  </button>
</div>
```

**Keyboard Navigation:**
- Tab through all options
- Enter/Space to select
- Esc to dismiss modals
- Arrow keys for persona selection

**Reduced Motion:**
- Disable fog/chaos animations
- Use simple fade transitions
- No auto-advancing steps (user-controlled)

---

## A/B TEST VARIATIONS (Future)

**Test 1: Narrative vs Functional**
- A: Full lore-based onboarding (described above)
- B: Simple feature list ("Here's charts, here's journal, here's alerts")
- Metric: Retention at Day 7

**Test 2: NFT Incentive**
- A: Mint NFT immediately after onboarding
- B: Delay NFT mint until first journal entry
- Metric: Journal adoption rate

**Test 3: Tour Length**
- A: Full 5-minute tour (newcomer default)
- B: 2-minute quick tour
- Metric: Completion rate + feature discovery

---

## DEVELOPER IMPLEMENTATION NOTES

**State Management:**
```typescript
interface OnboardingState {
  persona: 'newcomer' | 'active' | 'power' | 'mobile';
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  skipped: boolean;
  nftsMinted: string[]; // Stage IDs
  tourSpeed: 'slow' | 'medium' | 'fast';
  showTooltips: boolean;
}
```

**LocalStorage Persistence:**
```javascript
localStorage.setItem('sparkfined_onboarding', JSON.stringify({
  completed: true,
  persona: 'active',
  completedDate: '2025-03-15',
  skippedSteps: []
}));
```

**Progressive Hints (After Onboarding):**
```typescript
// Show hint if condition met + not dismissed
const hints = [
  {
    id: 'journal_first_trade',
    condition: () => user.tradesCount === 1 && user.journalEntries === 0,
    message: '💡 TIP: Journal this trade NOW',
    dismissable: true
  }
];
```

---

## CONCLUSION

**Onboarding is not a tutorial.**
**It's the first chapter of their story.**

**Every dialog should:**
- Place them in the narrative (Stage X of 12)
- Give them agency (choose your path)
- Show immediate value (first analysis in 90s)
- Build anticipation (unlockable NFTs)

**By the end, they should feel:**
- "I understand the system" (Clarity)
- "I want to journal my trades" (Memory)
- "I own this, not a vendor" (Sovereignty)

**And most importantly:**
**"I am on a journey. And I'm not alone."**

**⚡ Welcome to the Order.**

---

**Document Status:** ✅ Complete - Onboarding Dialogs with Lore Integration
**Next Use:** Frontend implementation (React components), UX design, copywriting
**Integration:** References hero-journey-full.md (12 stages), three-pillars.md, NFT collection
