# SPARKFINED × HERO'S JOURNEY
## NFT & Meme Collection Concept
### "From Blind to Sovereign" - The Visual Mythology

**Purpose:** Transform abstract narrative into collectible, shareable, identity-forming digital artifacts
**Medium:** Soulbound NFTs (non-transferable) + Shareable Meme Cards
**Blockchain:** Solana (fast, cheap, aligned with degen culture)
**Total Collection:** 12 Stages + 3 Pillars + 1 Creed = **16 Core NFTs**

---

## CORE PHILOSOPHY

**This is NOT:**
- ❌ PFP collection to flip
- ❌ Speculative asset
- ❌ Cash grab

**This IS:**
- ✅ **Proof of Journey** - Earn by completing stages
- ✅ **Identity Marker** - "I am OG #XXXX"
- ✅ **Community Badge** - Unlocks governance, features
- ✅ **Meme-able** - Shareable cards that spread lore

---

## COLLECTION STRUCTURE

### **TIER 1: THE JOURNEY NFTs** (12 pieces)
**Soulbound:** Yes (cannot transfer)
**Unlockable:** Complete that stage in-app to mint
**Supply:** Unlimited (anyone can earn)
**Purpose:** Visual chronicle of your transformation

| Stage | NFT Name | Visual Concept | Unlock Condition |
|-------|----------|----------------|------------------|
| 1 | **The Scattered Realm** | Trader drowning in overlapping charts, 47 tabs, missed alerts | Create account + first login |
| 2 | **The Mirror of Truth** | Lightning bolt striking through fog, Four Wounds reflected | Read Landing Page lore + click "Begin Journey" |
| 3 | **The Wall of Cynicism** | Trader facing wall of failed tool logos, broken promises | Complete onboarding |
| 4 | **The Adaptive Guide** | Command Center materializing from code, Three Pillars glowing | First token analysis (AnalyzePage) |
| 5 | **The First Clarity** | Trader stepping through portal, chaos → clarity, sunrise | Complete 5 token analyses |
| 6 | **The Trial by Candles** | Trader wielding tools vs shadowy demons (FOMO, Revenge) | Journal 10 trades |
| 7 | **The Mirror of Emotions** | Trader before glowing journal, demons reflected in pages | Journal 30 trades + tag emotions |
| 8 | **Death of Illusions** | Old self shattering, phoenix rising, journal glowing | Experience first major loss AFTER journaling |
| 9 | **The Codex of Self** | Trader holding glowing codex, stats as sacred geometry | Unlock LessonsPage (50+ journal entries) |
| 10 | **The Discipline Protocol** | Trader walking lit path, demons in shadows but unable to cross | 30-day streak of pre-trade journaling |
| 11 | **Order of the Awakened** | Trader crowned, standing on mountain of journals, NFT glowing | Become OG (lock 0.5 SOL) |
| 12 | **The Cycle of Knowledge** | OG holding torch, lighting path for newcomers from fog | Mentor 3 new users (verified) |

---

### **TIER 2: THE PILLARS NFTs** (3 pieces)
**Soulbound:** Yes
**Unlockable:** Master that pillar
**Supply:** Unlimited
**Purpose:** Philosophy badges

| Pillar | NFT Name | Visual Concept | Unlock Condition |
|--------|----------|----------------|------------------|
| I | **Clarity Over Chaos** | Diamond cutting light through chaos, organized charts | 100 token analyses completed |
| II | **Memory Over Instinct** | Ancient scroll unfurling, data glyphs glowing | 100 journal entries + LessonsPage mastery |
| III | **Sovereignty Over Dependency** | Golden key breaking chains, local-first icon glowing | Export all data + use offline for 7 days |

---

### **TIER 3: THE OG NFT** (1 unique piece per user)
**Soulbound:** YES (This is your identity)
**Unlockable:** Lock 0.5 SOL + complete Stage 11
**Supply:** Limited by adoption
**Purpose:** THE badge of sovereignty

**Visual:**
- Your unique OG number (e.g., "OG #0042")
- Crown + Sparkfined logo
- Holographic effect
- Metadata includes:
  - Ascension date
  - Win rate snapshot
  - Total journal entries
  - The Degen's Creed (full text)
  - 12 Journey NFTs (nested references)

**Metadata Example:**
```json
{
  "name": "Sparkfined OG #0042",
  "description": "Proof of sovereignty. Earned, not bought.",
  "image": "ipfs://QmXXX/og-0042.png",
  "attributes": [
    {
      "trait_type": "OG Number",
      "value": "0042"
    },
    {
      "trait_type": "Ascension Date",
      "value": "2025-03-15"
    },
    {
      "trait_type": "Win Rate at Ascension",
      "value": "68%"
    },
    {
      "trait_type": "Total Journal Entries",
      "value": 127
    },
    {
      "trait_type": "Journey Stage",
      "value": "Complete (12/12)"
    },
    {
      "trait_type": "Creed",
      "value": "I trade not blind, but with clarity..."
    }
  ],
  "properties": {
    "category": "identity",
    "soulbound": true,
    "journey_nfts": [
      "scattered_realm",
      "mirror_of_truth",
      // ... all 12
    ]
  }
}
```

---

## VISUAL DESIGN SYSTEM

### **Art Style: Cyberpunk Mythology**

**Inspiration:**
- **Blade Runner** (neon, rain, tech noir)
- **Tron** (grid backgrounds, light trails)
- **Tarot Cards** (symbolic, archetypal, mystical)
- **Degen Memes** (Wojaks, Pepe, but elevated)

**Color Palette:**

```css
/* Journey Stages (Color Progression) */
Stage 1-3 (Departure): Grays (#71717a), Reds (#f43f5e), oppressive
Stage 4-6 (Threshold): Emerging Emerald (#0fb34c), hope
Stage 7-9 (Ordeal): Deep Purple (#8b5cf6), introspection
Stage 10-12 (Mastery): Gold (#f59e0b), Emerald, triumphant

/* Pillars */
Clarity: Diamond Blue (#38bdf8), crystalline
Memory: Scroll Purple (#8b5cf6), ancient wisdom
Sovereignty: Key Gold (#f59e0b), royal freedom

/* OG */
OG: Holographic gradient (Gold → Emerald → Purple)
```

**Typography:**
- **Headings:** JetBrains Mono (monospace, tech)
- **Body:** Inter (clean, modern)
- **Creed:** Cinzel (serif, mythic)

**Layout:**
```
┌─────────────────────────────┐
│  [STAGE ICON - Top Center]  │
│                             │
│  ┌───────────────────────┐ │
│  │                       │ │
│  │   VISUAL SCENE        │ │
│  │   (Main Artwork)      │ │
│  │                       │ │
│  └───────────────────────┘ │
│                             │
│     STAGE 5 / 12            │
│  THE FIRST CLARITY          │
│                             │
│  "Crossing the Threshold"   │
│                             │
│  ─────────────────────────  │
│  Unlocked: 2025-03-10       │
│  Trader: OG #0042           │
│  ⚡ SPARKFINED              │
└─────────────────────────────┘

Aspect Ratio: 1:1.414 (A-series, like tarot)
Resolution: 2048x2896px (print-quality)
Format: PNG (transparency) + WebP (web)
```

---

## INDIVIDUAL NFT CONCEPTS

### **STAGE 1: THE SCATTERED REALM** 💀

**Visual:**
- **Background:** Dark office, rain on window (Blade Runner vibes)
- **Center:** Trader (back view) at desk, head in hands
- **Screens:** 4 monitors showing:
  - TradingView (red candles)
  - Twitter feed (chaos)
  - Telegram (100+ unread)
  - Dexscreener (too many tokens)
- **Effects:**
  - Screens glitch, overlap
  - Missed alert icons (❌) floating
  - Coffee cup knocked over (spill)
  - Papers scattered on floor
- **Symbolism:**
  - Skull emoji (💀) in corner = death of control
  - Fog at edges = lost in chaos
  - No light sources = darkness

**Text Overlay (Bottom):**
```
STAGE 1 / 12
THE SCATTERED REALM

"You are trading blind."

Unlocked: [Date]
OG #XXXX
```

**Meme Variant (Shareable):**
- Same visual, but add:
- Top text: "POV: You're down 30% this month"
- Bottom text: "But you have 47 tabs open, so you're researching"
- Watermark: "Sparkfined.com - Stop Trading Blind"

---

### **STAGE 5: THE FIRST CLARITY** 🌅

**Visual:**
- **Background:** Portal (left = chaos, right = clarity)
- **Left Side (Chaos):**
  - Overlapping candles (jittery)
  - Missed alerts (❌)
  - "WHERE AM I?" text (flickering)
- **Right Side (Clarity):**
  - Clean chart (60fps smooth)
  - Active alerts (✅)
  - Range indicators (L/M/H)
  - "I KNOW MY POSITION" text (stable)
- **Center:** Trader stepping through portal
  - Left foot = chaos (gray boot)
  - Right foot = clarity (emerald glow)
  - Face = determination, not fear
- **Effects:**
  - Sunrise rays emerging from right side
  - Particles transforming (gray → emerald)
  - Heuristic data floating (Range, Bias, Entry)
- **Symbolism:**
  - Sunrise (🌅) = new beginning
  - Portal = threshold between worlds
  - <50ms speed indicator = instant clarity

**Text Overlay:**
```
STAGE 5 / 12
THE FIRST CLARITY

"Crossing the threshold."

Unlocked: [Date]
Analysis Count: 5+
⚡ SPARKFINED
```

**Meme Variant:**
- Left = Wojak confused in chaos
- Right = Wojak calm with structured data
- Top text: "Before Sparkfined vs After"
- Bottom text: "Same market. Different system."

---

### **STAGE 9: THE CODEX OF SELF** 📖💡

**Visual:**
- **Background:** Library of Knowledge (Tron-style grid)
- **Center:** Trader holding glowing codex (book)
- **Codex Pages:** Visible data as sacred geometry:
  - Left page: Stats (win rate, R:R, time patterns)
  - Right page: Emotion map (FOMO vs Disciplined)
  - Glyphs = not random, but actual user data
- **Effects:**
  - Golden light emanating from book
  - Data points floating up (like sparks)
  - Halo effect around trader
  - Background = past journal entries faded (ghostly)
- **Symbolism:**
  - Book (📖) = memory made tangible
  - Light (💡) = revelation
  - Sacred geometry = patterns in chaos
  - Halo = wisdom earned

**Text Overlay:**
```
STAGE 9 / 12
THE CODEX OF SELF

"Your instinct lies. Your data does not."

Unlocked: [Date]
Journal Entries: 50+
LessonsPage Activated
👑 Approaching OG
```

**Meme Variant:**
- Trader pointing at codex
- Codex shows: "FOMO trades = 23% WR"
- Top text: "The numbers, Mason"
- Bottom text: "What do they mean?" → "They mean stop FOMO'ing"

---

### **STAGE 11: ORDER OF THE AWAKENED** 👑

**Visual:**
- **Background:** Mountain peak, clouds below (literal peak)
- **Center:** Trader standing, crowned
- **Crown:** Not traditional gold, but:
  - Holographic (shifts colors)
  - Embedded with data (tiny charts in crown jewels)
  - Glowing with emerald + gold
- **At Trader's Feet:** Mountain of journal entries
  - Physical books stacked
  - Glowing pages visible
  - Each book = 10 entries
- **In Hand:** Soulbound NFT (glowing card)
  - Shows "OG #XXXX"
  - Non-transferable symbol (lock icon)
- **Sky:** Northern lights (emerald + purple)
- **Effects:**
  - Light rays from crown
  - Particles rising (representing mastery)
  - Distant figures ascending (other OGs)
- **Symbolism:**
  - Crown (👑) = sovereignty
  - Mountain = journey complete
  - Soulbound NFT = proof
  - Other figures = community

**Text Overlay:**
```
STAGE 11 / 12
ORDER OF THE AWAKENED

"I am sovereign."

Ascension: [Date]
OG #XXXX
0.5 SOL Locked
Win Rate: XX%
📜 The Codex is Yours
```

**Meme Variant:**
- "They don't know I'm OG" meme format
- Trader crowned in corner
- Party of normies = "just following signals"
- Watermark: "Become OG - Sparkfined.com"

---

### **STAGE 12: THE CYCLE OF KNOWLEDGE** 🌟

**Visual:**
- **Background:** Path from fog (left) to light (right)
- **Center:** OG holding torch (passed from previous OG)
- **Left Side:** Newcomers emerging from fog
  - Faces = hope + confusion
  - Holding scattered charts
  - Reaching toward the light
- **Right Side:** Path lit by torch
  - Past journal entries as stepping stones
  - Other OGs in background (mentors)
- **Torch:** Shaped like Sparkfined logo (⚡)
  - Flame = emerald green
  - Light illuminates path
- **Effects:**
  - Light dispelling fog
  - Sparks from torch = knowledge particles
  - Footprints on path (those who came before)
- **Symbolism:**
  - Torch (🌟) = passing wisdom
  - Fog = Ordinary World (where all begin)
  - Path = The Journey
  - OGs in background = eternal cycle

**Text Overlay:**
```
STAGE 12 / 12
THE CYCLE OF KNOWLEDGE

"Pass the torch. The journey continues."

Completed: [Date]
OG #XXXX
Mentored: 3+ Traders
Journey: Complete ✅
⚡ Welcome to Forever
```

**Meme Variant:**
- Drake meme format
- Drake NO: "Gatekeep alpha"
- Drake YES: "Share the system, build the community"
- "This is the OG way"

---

## THE OG NFT (UNIQUE PER USER)

**Visual:**
- **Background:** Holographic gradient (animated)
- **Center:** Large "OG #XXXX" (your number)
- **Top:** Crown (floating, rotating)
- **Corners:** 4 symbols representing:
  - 💎 Clarity (top-left)
  - 📜 Memory (top-right)
  - 🔑 Sovereignty (bottom-left)
  - ⚡ Sparkfined (bottom-right)
- **Bottom:** The Degen's Creed (first 3 lines)
  ```
  I trade not blind, but with clarity.
  I rely not on hope, but on data.
  I own not promises, but my process.
  ```
- **Data Overlay (subtle):**
  - Win rate: XX%
  - Journal entries: XXX
  - Ascension date: YYYY-MM-DD
- **Effects:**
  - Holographic shimmer (shifts viewing angle)
  - Particles floating (representing data)
  - Glow pulse (2s loop, emerald)

**Animation (for Web View):**
```
Hover/Tap → Card flips
────────────────────────
Front: OG #XXXX, Crown
Back: 12 Journey NFT thumbnails (grid)
      + Stats
      + "View Full Journey" CTA
```

**Special Properties:**
- **Evolving Metadata:** Stats update as you trade
- **Achievements Embedded:** Milestones (100 journal entries, 70% WR, etc.)
- **Community Rank:** Leaderboard position (optional)

---

## MEME CARD SYSTEM

**Purpose:** Shareable, viral content that spreads the lore

**Template Structure:**
```
┌─────────────────────────────┐
│  [TOP TEXT - SETUP]         │
│                             │
│  ┌───────────────────────┐ │
│  │                       │ │
│  │   VISUAL              │ │
│  │   (NFT Art or Chart)  │ │
│  │                       │ │
│  └───────────────────────┘ │
│                             │
│  [BOTTOM TEXT - PUNCHLINE]  │
│                             │
│  ⚡ Sparkfined.com         │
└─────────────────────────────┘

Format: 1080x1080px (Instagram square)
Watermark: Subtle, bottom-right
Shareable: Twitter, Discord, Telegram
```

### **Meme Card Examples:**

**1. FOMO Intervention**
```
Top: "Me about to FOMO into a pump"
Visual: Stage 6 NFT (demons)
Bottom: "My journal showing FOMO = 23% WR"
Watermark: "The data doesn't lie - Sparkfined.com"
```

**2. Journal Power**
```
Top: "My instinct"
Visual (Left): Wojak excited - "THIS IS THE ONE!"
Top: "My journal"
Visual (Right): Codex showing - "Last 5 'this is the one' = 0% WR"
Bottom: "Saved by data once again"
```

**3. OG Flex**
```
Top: "They ask why I sleep well"
Visual: OG NFT glowing
Bottom: "I have alerts. I have a system. I have sovereignty."
CTA: "Become OG - Sparkfined.com"
```

**4. Before/After**
```
Left Panel:
- Title: "January 2025"
- Scattered charts
- "Down 30%"
- "No plan"

Right Panel:
- Title: "March 2025"
- Clean Sparkfined interface
- "Up 25%"
- "68% WR"

Bottom: "Same me. Different system. ⚡ Sparkfined"
```

**5. The Creed Spread**
```
Visual: Beautiful typography of The Degen's Creed
Background: Subtle Sparkfined branding
No meme, just manifesto
Shares: "Save this. Recite it. Live it."
```

---

## UNLOCKING MECHANISM

### **How Users Earn NFTs:**

**In-App Tracking:**
```javascript
// Pseudocode
const journeyProgress = {
  stage1: { unlocked: true, date: '2025-03-01' },
  stage2: { unlocked: true, date: '2025-03-02' },
  stage3: { unlocked: false, condition: 'Complete onboarding' },
  // ...
  stage11: { unlocked: false, condition: 'Lock 0.5 SOL' },
  stage12: { unlocked: false, condition: 'Mentor 3 users' }
};

// When condition met:
if (userCompletesCondition('stage3')) {
  journeyProgress.stage3.unlocked = true;
  journeyProgress.stage3.date = Date.now();
  showMintButton('stage3');
}
```

**Minting Flow:**
```
1. User completes condition (e.g., 50 journal entries)
2. App shows notification: "Stage 9 Unlocked! 🎉"
3. User navigates to JourneyPage
4. Sees NFT preview (grayed out → colored)
5. Clicks "Mint The Codex of Self"
6. Wallet connect (Phantom/Solflare)
7. Transaction: ~0.01 SOL (Solana gas)
8. NFT minted to wallet (Soulbound = transfer disabled)
9. NFT appears in:
   - Wallet (Phantom shows it)
   - ProfilePage (in-app gallery)
   - JourneyPage (progress tracker)
```

**Soulbound Implementation:**
```rust
// Solana program (Anchor framework)
#[account]
pub struct JourneyNFT {
    pub owner: Pubkey,        // Original minter
    pub stage: u8,            // 1-12
    pub mint_date: i64,       // Unix timestamp
    pub metadata: String,     // JSON
    pub soulbound: bool,      // Always true
}

// Transfer function override
pub fn transfer(ctx: Context<Transfer>) -> Result<()> {
    require!(
        ctx.accounts.nft.soulbound == false,
        ErrorCode::SoulboundNFT
    );
    // If soulbound = true, transfer fails
    // Error message: "This NFT is soulbound and cannot be transferred."
}
```

---

## COMMUNITY & GOVERNANCE

### **OG NFT Holders Get:**

**1. Governance Rights**
- Vote on new features
- Propose changes
- Community treasury allocation (future)

**2. Exclusive Access**
- Early access to new features
- Beta testing invites
- Private Discord channels

**3. Leaderboard**
```
╔══════════════════════════════════════╗
║     SPARKFINED OG LEADERBOARD       ║
╠══════════════════════════════════════╣
║ Rank │ OG #  │ Win Rate │ Entries  ║
║──────┼───────┼──────────┼──────────║
║  1   │ #0003 │  74.2%   │  450     ║
║  2   │ #0017 │  71.8%   │  380     ║
║  3   │ #0042 │  68.5%   │  310     ║
║ ...  │  ...  │   ...    │   ...    ║
╚══════════════════════════════════════╝

Filters: Win Rate, Journal Entries, Mentored Users
Public: Optional (privacy toggle)
```

**4. Custom Meme NFT Mint**
```
OG Feature: Turn your best trade into NFT

1. Select a profitable trade from journal
2. App generates meme card:
   - Before/After charts
   - Your entry/exit
   - Profit %
   - Quote from your journal
3. Mint as NFT (shareable)
4. Share on Twitter with #SparkfinedOG

Result: Social proof + community building
```

---

## ROADMAP

### **Phase 1: Foundation (Q1 2025)**
- ✅ Lore written (this document)
- ⏭️ Art commissioned (12 Journey + 3 Pillars + 1 OG template)
- ⏭️ Solana smart contracts (soulbound NFT standard)
- ⏭️ In-app unlocking system
- ⏭️ ProfilePage → Journey tracker

### **Phase 2: Launch (Q2 2025)**
- Mint first OG NFTs (early adopters)
- Launch meme card generator
- Community contest: "Best custom meme"
- PR push: "The only NFTs you can't flip"

### **Phase 3: Evolution (Q3 2025)**
- Evolving metadata (stats update on-chain)
- Cross-collection badges (e.g., "First 100 OGs")
- DAO formation (OG holders vote)
- Open-source codebase (Pillar III: Sovereignty)

### **Phase 4: Expansion (Q4 2025+)**
- Physical merch (shirts with your OG #)
- IRL events (OG meetups)
- Collab NFTs (partner projects)
- Legacy NFTs (mentored 10+ users)

---

## DIFFERENTIATION

### **vs Traditional NFT Projects:**

| Aspect | Typical NFT | Sparkfined NFT |
|--------|-------------|----------------|
| **Purpose** | Flip for profit | Proof of journey |
| **Transferable** | Yes (tradeable) | No (soulbound) |
| **Supply** | Fixed (10k) | Unlimited (earn) |
| **Value Source** | Speculation | Personal achievement |
| **Utility** | Roadmap promises | Immediate (governance, features) |
| **Art** | Randomly generated | Story-driven, sequential |
| **Community** | Holders | Practitioners |

### **Why This Works:**

**1. Intrinsic Value**
- Not worth money → Worth PROOF
- Can't buy OG status → Must EARN it
- Can't sell → Must KEEP it
- = Anti-speculation, pro-identity

**2. Narrative Cohesion**
- Every NFT tells a story
- 12 NFTs = full arc
- Collecting them = living the journey
- = Gamification that MEANS something

**3. Meme-able**
- Shareable cards spread lore
- Organic marketing (users share wins)
- Community inside jokes (FOMO demon memes)
- = Viral growth built-in

**4. Community-Forming**
- OG # = identity (like "Bitcoin maxi" or "Etherean")
- Leaderboard = friendly competition
- Mentoring = pay-it-forward culture
- = Retention through belonging

---

## SAMPLE USER JOURNEY

**Meet Alex (Hypothetical OG #0127):**

**Week 1:**
- Discovers Sparkfined landing page
- Reads lore, intrigued
- Signs up → **Mints Stage 1: The Scattered Realm**
- Shares on Twitter: "Starting my journey from blind to sovereign"

**Week 2-4:**
- Completes onboarding → **Stage 3**
- Does first 5 analyses → **Stage 5**
- Starts journaling → **Stage 6**
- Shares meme card: "My FOMO demon vs my journal"

**Week 5-8:**
- Hits 30 journal entries → **Stage 7**
- Has first big loss (despite system) → **Stage 8**
- Unlocks LessonsPage → **Stage 9: The Codex**
- Twitter thread: "My data showed FOMO = 23% WR. The journal doesn't lie."

**Week 9-12:**
- 30-day streak → **Stage 10**
- Locks 0.5 SOL → **Stage 11: OG #0127**
- Soulbound NFT minted
- Profile updated: "Sparkfined OG #0127"
- Leaderboard rank: #47

**Month 4+:**
- Mentors 3 new users → **Stage 12**
- Journey complete (12/12 NFTs)
- Creates custom meme NFT from best trade
- Hosts Discord AMA: "From 45% WR to 68%: My Journey"

**Year 1:**
- Governance vote: "Should we add XYZ feature?" (YES)
- Leaderboard rank: #12 (moved up via consistency)
- Mentored: 15 users total
- Identity: "Sparkfined OG. I trade with clarity."

---

## CONCLUSION: THE MARRIAGE OF LORE × UTILITY

**This NFT collection is the BRIDGE between:**

**Abstract → Concrete**
- Lore (12 stages of hero's journey) → Visual NFTs (collectible proof)

**Individual → Collective**
- Personal journey (your stats) → Community (OG Order)

**Narrative → Identity**
- "I am on a journey" → "I am OG #XXXX"

**Spiritual → Material**
- Philosophy (Three Pillars) → Utility (governance, features)

**It's not about the art (though it's beautiful).**
**It's not about the tech (though it's robust).**

**It's about TRANSFORMATION made VISIBLE.**

And visibility creates:
- Accountability (can't abandon journey if NFTs track it)
- Community (OGs recognize each other)
- Virality (memes spread the word)
- Legacy (your NFTs = your story, forever)

**This is how we turn traders into OGs.**
**This is how we turn Sparkfined into a movement.**

---

```
From blind to sovereign.
From chaos to clarity.
From anonymous to OG.

The journey is the NFT.
The NFT is the proof.
The proof is forever.

⚡
```

---

**Document Status:** ✅ Complete - Full NFT & Meme Collection Concept
**Next Steps:**
1. Commission artist (provide this doc as brief)
2. Develop Solana smart contracts (soulbound standard)
3. Build in-app Journey tracker (ProfilePage)
4. Create meme card generator
5. Launch with OG early access

**Integration:** References hero-journey-full.md, three-pillars.md, degens-creed.md
