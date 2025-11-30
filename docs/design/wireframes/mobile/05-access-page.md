# Access Page — Mobile Wireframe (375px)

**Screen:** AccessPage (`/access`)  
**TL;DR:** OG gating system with status check, lock calculator, hold verification, and leaderboard

---

## State 1: Status Tab (No Access)

```
┌─────────────────────────────────────────┐
│  [Header]                          [⚙️]  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│ // Header banner
│  │ Sparkfiend Access Pass              ││ // text-3xl font-bold
│  │                                     ││ // gradient: green-400 to blue-500
│  │ Fair OG-Gating • 333 Slots          ││ // text-slate-400 text-sm
│  │ MCAP-Dynamic Lock • Soulbound NFT   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Tab Bar
│  │ [🎫 Status] [🔒 Lock]              ││ // Active tab: green-400 border-b-2
│  │ [💎 Hold] [🏆 Leaderboard]         ││ // Inactive: slate-400 hover:white
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Status Card (AccessStatusCard)
│  │ 🔐 Access Status                    ││ // border-slate-800 rounded-lg p-6
│  │                                     ││ // bg-slate-900/50
│  │  Current Status: None               ││ // text-lg text-slate-300
│  │                                     ││
│  │  You don't have access yet.         ││ // text-sm text-slate-400
│  │                                     ││
│  │  To become an OG:                   ││
│  │  • Lock tokens (MCAP-based)         ││
│  │  • Or hold minimum balance          ││
│  │                                     ││
│  │  [Go to Lock Tab →]                 ││ // btn-primary
│  │  [Go to Hold Tab →]                 ││ // btn-secondary
│  └─────────────────────────────────────┘│
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Gradient Header**: `bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent`
- **Tab Bar**: Flex row, border-bottom separator, active tab has colored border-b-2
- **Status Card**: Shows current access state (None / Holder / OG)

---

## State 2: Status Tab (OG with NFT)

```
┌─────────────────────────────────────────┐
│  [Header: Access Pass]             [⚙️]  │
├─────────────────────────────────────────┤
│  [Header banner...]                     │
│  [Tab Bar: Status active]               │
│                                         │
│  ┌─────────────────────────────────────┐│ // Status Card (OG)
│  │ ✅ Access Status                    ││
│  │                                     ││
│  │  Current Status: OG                 ││ // text-green-400 font-bold
│  │  🎖️ Soulbound NFT Minted            ││ // NFT badge
│  │                                     ││
│  │  Lock Details:                      ││
│  │  • Amount: 10,000 TOKENS            ││
│  │  • Locked: 01.10.2025               ││
│  │  • Duration: 180 days               ││
│  │  • Rank: #42 / 333                  ││
│  │                                     ││
│  │  [View on Explorer]                 ││ // External link to Solscan
│  │  [Go to Leaderboard]                ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **OG Status**: Green checkmark + green text
- **NFT Badge**: Emoji indicator (could be actual NFT image)
- **Lock Details**: Amount, date, duration, rank
- **Explorer Link**: Opens Solscan in new tab

---

## State 3: Lock Tab

```
┌─────────────────────────────────────────┐
│  [Header: Access Pass]             [⚙️]  │
├─────────────────────────────────────────┤
│  [Header banner...]                     │
│  [Tab Bar: Lock active]                 │
│                                         │
│  ┌─────────────────────────────────────┐│ // Lock Calculator (LockCalculator)
│  │ 🔒 Lock Calculator                  ││
│  │                                     ││
│  │ Calculate required lock amount      ││
│  │ based on current MCAP.              ││
│  │                                     ││
│  │ [Current MCAP]                      ││
│  │ ┌───────────────────────────────┐   ││ // Input: MCAP in USD
│  │ │ placeholder: "Enter MCAP ($)" │   ││ // number input
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ [Calculate]                         ││ // Button
│  │                                     ││
│  │ --- Results ---                     ││ // Shown after calculation
│  │                                     ││
│  │ Required Lock: 8,500 TOKENS         ││ // Calculated amount
│  │ Duration: 120 days                  ││ // MCAP-based tier
│  │ Tier: Gold                          ││ // Tier name
│  │                                     ││
│  │ [Connect Wallet]                    ││ // Phantom/Solflare button
│  │ [Lock Tokens]                       ││ // Primary CTA (disabled until wallet)
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  💡 Note: Lock is dynamic and adjusts  │ // Info text
│  with MCAP tiers. Early lockers get    │ // text-xs text-slate-400
│  better rates (333 slots only).        │
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **MCAP Input**: Number field for current market cap
- **Calculate Button**: Triggers tier calculation logic
- **Results**: Shows required lock amount, duration, tier name
- **Wallet Connect**: Solana wallet selector (Phantom, Solflare, etc.)
- **Lock Button**: Disabled until wallet connected

---

## State 4: Hold Tab

```
┌─────────────────────────────────────────┐
│  [Header: Access Pass]             [⚙️]  │
├─────────────────────────────────────────┤
│  [Header banner...]                     │
│  [Tab Bar: Hold active]                 │
│                                         │
│  ┌─────────────────────────────────────┐│ // Hold Check (HoldCheck)
│  │ 💎 Hold Verification                ││
│  │                                     ││
│  │ Check if you meet the minimum       ││
│  │ holding requirements for access.    ││
│  │                                     ││
│  │ [Wallet Address]                    ││
│  │ ┌───────────────────────────────┐   ││ // Input: Solana wallet address
│  │ │ placeholder: "Enter wallet..."│   ││ // or auto-fill from connected wallet
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ [Connect Wallet] [Verify]           ││ // Buttons
│  │                                     ││
│  │ --- Verification Result ---         ││
│  │                                     ││
│  │ ✅ Verified                         ││ // Status indicator
│  │                                     ││
│  │ Token Balance: 15,234 TOKENS        ││ // On-chain balance
│  │ Minimum Required: 5,000 TOKENS      ││
│  │ Hold Duration: 45 days              ││ // Inferred from TX history
│  │ Eligibility: Holder                 ││ // Holder status (not OG)
│  │                                     ││
│  │ [Upgrade to OG (Lock)]              ││ // CTA to Lock tab
│  └─────────────────────────────────────┘│
│                                         │
│  💡 Holder status grants partial access.│
│  Lock tokens to become OG (full access).│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Wallet Input**: Manual entry or auto-fill from connected wallet
- **Verify Button**: Queries on-chain balance via GET /api/access/status
- **Result**: Shows balance, minimum required, hold duration, eligibility
- **Upgrade CTA**: Links to Lock tab if user wants OG status

---

## State 5: Leaderboard Tab

```
┌─────────────────────────────────────────┐
│  [Header: Access Pass]             [⚙️]  │
├─────────────────────────────────────────┤
│  [Header banner...]                     │
│  [Tab Bar: Leaderboard active]          │
│                                         │
│  ┌─────────────────────────────────────┐│ // Leaderboard (LeaderboardList)
│  │ 🏆 Top 333 OG Lockers               ││
│  │                                     ││
│  │ ┌─────────────────────────────────┐ ││ // Table (scrollable)
│  │ │ Rank Wallet         Amount Date │ ││ // Header row
│  │ ├─────────────────────────────────┤ ││
│  │ │ #1   7xKF...abc   12.5K  Oct 1 │ ││ // Row 1 (highlighted)
│  │ │ #2   abc1...xyz   11.2K  Oct 1 │ ││ // Row 2
│  │ │ #3   def2...uvw   10.8K  Oct 2 │ ││ // Row 3
│  │ │ ...                             │ ││
│  │ │ #42  you!...456    9.1K  Oct 5 │ ││ // Current user (highlighted)
│  │ │ ...                             │ ││
│  │ │ #333 xyz9...ghi    5.0K  Nov 1 │ ││ // Last slot
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ Updates every 30s                   ││ // text-xs text-slate-500
│  └─────────────────────────────────────┘│
│                                         │
│  💡 333 slots available. Once full,     │
│  new entrants must outbid lowest OG.    │
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Table**: Rank, Wallet (truncated), Lock Amount, Lock Date
- **Highlight**: Current user row (if in top 333) has bg-green-900/20
- **Scrollable**: Vertical scroll for full 333 rows
- **Auto-Refresh**: Polls server every 30s (inferred)

---

## COMPONENT BREAKDOWN

| Component | Event | Action | Animation |
|-----------|-------|--------|-----------|
| Tab Button | onClick | setActiveTab(id) | border-b-2 color change |
| Button: Go to Lock Tab | onClick | setActiveTab('lock') | tab switch |
| Input: MCAP | onChange | setValue(value) | none |
| Button: Calculate | onClick | calculateLock() → local logic | result display |
| Button: Connect Wallet | onClick | connectWallet() → Phantom API | wallet selector |
| Button: Lock Tokens | onClick | lockTokens() → Solana TX | transaction dialog |
| Input: Wallet Address | onChange | setValue(value) | none |
| Button: Verify | onClick | verifyHold() → GET /api/access/status | loading + result |
| Leaderboard Row | none | Display only | none |

---

## DATA FLOW

### Lock Calculation
```
User Input (MCAP) → Tier Logic → { amount, duration, tier }
```

**Tier Example:**
- MCAP < $1M: 10,000 tokens, 180 days, Bronze
- MCAP $1M-$5M: 7,500 tokens, 120 days, Silver
- MCAP $5M-$10M: 5,000 tokens, 90 days, Gold
- MCAP > $10M: 2,500 tokens, 60 days, Platinum

### Hold Verification
```
Wallet Address → GET /api/access/status → { balance, holdDuration, eligibility }
```

### Leaderboard
```
GET /api/access/lock (inferred endpoint) → [ { rank, wallet, amount, date } ]
```

---

## USER FLOWS

### Flow 1: Check Status (No Access)
1. User lands on Access page (Status tab)
2. Status card shows "None"
3. User clicks "Go to Lock Tab"
4. Lock calculator shown

### Flow 2: Calculate & Lock
1. User on Lock tab
2. Enters current MCAP
3. Clicks "Calculate"
4. Results shown (amount, duration, tier)
5. Clicks "Connect Wallet"
6. Wallet selector appears (Phantom/Solflare)
7. User approves connection
8. Clicks "Lock Tokens"
9. Transaction preview shown
10. User confirms in wallet
11. TX submitted → POST /api/access/lock
12. Success → mints NFT → status updates to OG

### Flow 3: Verify Holdings
1. User on Hold tab
2. Enters wallet address (or connects wallet)
3. Clicks "Verify"
4. API call → GET /api/access/status
5. Result shown (balance, duration, eligibility)
6. If eligible, status updates to "Holder"

### Flow 4: View Leaderboard
1. User on Leaderboard tab
2. Table loads (GET leaderboard data)
3. User sees top 333 OGs
4. User's row highlighted (if in list)
5. Auto-refresh every 30s

---

## RESPONSIVE BEHAVIOR

### Mobile (<768px)
- Tabs: 2x2 grid or horizontal scroll
- Table: Horizontal scroll for leaderboard

### Desktop (>1024px)
- Tabs: Single horizontal row
- Cards: Wider, more padding
- Table: Full width, no scroll

---

## ACCESSIBILITY

- **Tab Navigation**: Keyboard accessible (Tab key, Enter/Space)
- **ARIA Labels**: Tabs have role="tab", aria-selected
- **Wallet Connect**: Opens modal with keyboard trap
- **Color Contrast**: Green/blue gradient readable on dark bg

---

## EDGE CASES

- **Wallet Not Connected**: Lock/Verify buttons disabled
- **Invalid MCAP**: Calculate button validates input (> 0)
- **Leaderboard Full**: Indicator that 333 slots are filled
- **Insufficient Balance**: Error message on lock attempt
- **Transaction Failed**: Retry button shown

---

**Storybook Variants:** Status (None), Status (OG), Lock Calculator, Hold Verification, Leaderboard
