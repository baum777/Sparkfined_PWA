# 🧪 BLOCK 4 - QUICK TEST GUIDE

**Goal:** Test all 6 completed features in 10 minutes.

---

## 🚀 SETUP (Run Once)

```bash
# Start dev server
npm run dev

# Open in browser
http://localhost:5173
```

---

## TEST 1: Pattern Dashboard (No Data Yet)

1. Navigate to: `http://localhost:5173/replay`
2. Should see:
   - "📊 Pattern Dashboard" header
   - "No Data Yet" message
   - Button to go back to journal

✅ **PASS:** Dashboard loads without errors

---

## TEST 2: Create Test Journal Entries

Open **DevTools Console** and run:

```javascript
// Import services
const { createEntry } = await import('/src/lib/JournalService.ts');

// Create 3 winning trades
await createEntry({
  ticker: "BONK",
  address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  setup: "support",
  emotion: "confident",
  status: "closed",
  thesis: "Strong support level, high volume",
  outcome: {
    pnl: 250,
    pnlPercent: 75,
    transactions: [
      { type: "buy", timestamp: Date.now() - 86400000, price: 0.00001, amount: 1000000, mcap: 500000, txHash: "tx1" },
      { type: "sell", timestamp: Date.now(), price: 0.0000175, amount: 1000000, mcap: 875000, txHash: "tx2" }
    ],
    closedAt: Date.now()
  }
});

await createEntry({
  ticker: "PEPE",
  address: "test-pepe",
  setup: "breakout",
  emotion: "disciplined",
  status: "closed",
  thesis: "Clean breakout above resistance",
  outcome: {
    pnl: 180,
    pnlPercent: 60,
    transactions: [],
    closedAt: Date.now()
  }
});

await createEntry({
  ticker: "WIF",
  address: "test-wif",
  setup: "momentum",
  emotion: "confident",
  status: "active",
  thesis: "Strong momentum, waiting for exit signal"
});

// Create 2 losing trades
await createEntry({
  ticker: "FOMO",
  address: "test-fomo",
  setup: "FOMO",
  emotion: "fear",
  status: "closed",
  thesis: "Bought at top, panic sold",
  outcome: {
    pnl: -120,
    pnlPercent: -40,
    transactions: [],
    closedAt: Date.now()
  }
});

await createEntry({
  ticker: "DEGEN",
  address: "test-degen",
  setup: "resistance",
  emotion: "greedy",
  status: "closed",
  thesis: "Tried to short the top, got liquidated",
  outcome: {
    pnl: -80,
    pnlPercent: -30,
    transactions: [],
    closedAt: Date.now()
  }
});

console.log('✅ Created 5 test entries (3 wins, 2 losses)');
```

✅ **PASS:** Console shows "✅ Created 5 test entries"

---

## TEST 3: View Entries in Journal

1. Navigate to: `http://localhost:5173/journal`
2. Should see **5 journal cards**:
   - **BONK** (closed, green PnL +$250.00)
   - **PEPE** (closed, green PnL +$180.00)
   - **WIF** (active, cyan badge, no PnL)
   - **FOMO** (closed, red PnL -$120.00)
   - **DEGEN** (closed, red PnL -$80.00)

3. Check each card has:
   - Status badge (top-right)
   - Setup tag (green)
   - Emotion tag (purple)
   - Thesis text
   - **🎬 Create Replay** button (or **🎬 View Replay** if already created)

✅ **PASS:** All 5 entries visible with correct data

---

## TEST 4: Create Replay Session

1. On **BONK** card, click **"🎬 Create Replay"**
2. Button should show **"⏳ Creating..."** briefly
3. Should navigate to: `/replay/{sessionId}`
4. **ReplayPlayer** should load with:
   - Session name: "BONK Replay"
   - Playback controls (▶ Play, ⏸ Pause, ⏮⏭ Step)
   - Speed controls (0.5x, 1x, 2x, 4x)
   - Bookmark button
   - Timeline with progress bar
   - "Open in Chart →" button

✅ **PASS:** ReplayPlayer loads with all controls

---

## TEST 5: Test Playback Controls

1. Click **▶ Play**
   - Frame counter should increment
   - Timeline progress bar should move
   - OHLC numbers should update (mock data)

2. Click **⏸ Pause**
   - Playback should stop

3. Click **Timeline** at 50% position
   - Should scrub to middle of replay

4. Change **Speed** to **2x**
   - Playback should speed up

5. Click **"🔖 Add Bookmark"**
   - Should show bookmark input
   - Enter note: "Test bookmark"
   - Click "Save"
   - Bookmark flag should appear on timeline

6. Click **"🔖 Bookmarks"** button
   - Should show bookmarks list
   - Click "Jump" button
   - Should jump to bookmark frame

✅ **PASS:** All controls work as expected

---

## TEST 6: Pattern Dashboard

1. In ReplayPage, click **"📊 Dashboard"** button
2. Should switch to dashboard view
3. Check **Overview Tab**:
   - Total Trades: **5**
   - Win Rate: **60.0%** (3 wins / 5 trades)
   - Avg PnL: Should be positive
   - Best Patterns: Should show `support + confident` at top
   - Worst Patterns: Should show `FOMO + fear` at bottom

4. Click **🎯 By Setup** tab:
   - Should see breakdown by setup (support, breakout, momentum, FOMO, resistance)
   - Win rate bars should be accurate
   - Click "View All support Trades" → should filter (not implemented yet, but button should be there)

5. Click **😐 By Emotion** tab:
   - Should see breakdown by emotion (confident, disciplined, fear, greedy)
   - Win rate bars should show confident/disciplined high, fear/greedy low

6. Click **📚 Pattern Library** tab:
   - Should show BONK and PEPE (PnL > 10%)
   - Should NOT show FOMO or DEGEN (losses)
   - Click on BONK → should navigate to `/journal?entry={id}` (not implemented yet)

✅ **PASS:** Dashboard shows correct stats and all tabs work

---

## TEST 7: Filter by Pattern

1. In Dashboard **Overview** tab, find **Best Patterns**
2. Click on **`support + confident`** pattern
3. Should see stats recalculate (in console or visually)
4. (Full filtering UI not implemented yet, but function call should work)

✅ **PASS:** Click doesn't error, console shows filtering

---

## TEST 8: Open in Chart

1. Navigate back to ReplayPage player view: `/replay/{sessionId}`
2. Click **"Open in Chart →"** button
3. Should navigate to: `/chart?replaySession={sessionId}`
4. Chart should load (may be empty if no real data fetched yet)
5. Console should show: **"✅ Loaded replay session: BONK Replay"**

✅ **PASS:** Chart page loads without errors

---

## TEST 9: View Replay from Journal

1. Navigate to: `/journal`
2. Find **BONK** entry (now should have 🎬 icon in indicators)
3. Click **"🎬 View Replay"** button (changed from "Create Replay")
4. Should navigate to same replay session as before

✅ **PASS:** Replay session is linked to journal entry

---

## TEST 10: Create Multiple Replays

1. Go to `/journal`
2. Click **"🎬 Create Replay"** on **PEPE** entry
3. Should create new session
4. Click **"🎬 Create Replay"** on **WIF** entry (active)
5. Should create another new session
6. Go to `/replay` (dashboard)
7. (Session list not implemented yet, but sessions should be in IndexedDB)

**Verify in IndexedDB:**
- DevTools → Application → IndexedDB → `sparkfined-ta-pwa` → `replay_sessions`
- Should see 3 sessions (BONK, PEPE, WIF)

✅ **PASS:** Multiple replay sessions created

---

## 🎯 SUCCESS CRITERIA

All tests should pass with:
- ✅ No console errors
- ✅ All UI elements render
- ✅ Navigation works
- ✅ Data persists in IndexedDB
- ✅ Pattern stats calculate correctly

---

## 🐛 TROUBLESHOOTING

### **Issue: "Cannot find module JournalService"**
**Fix:** Restart dev server
```bash
# Ctrl+C to stop
npm run dev
```

### **Issue: Journal entries not showing**
**Fix:** Clear IndexedDB and recreate
```javascript
indexedDB.deleteDatabase('sparkfined-ta-pwa');
// Refresh page, then run TEST 2 again
```

### **Issue: Replay button missing**
**Fix:** Check entry status - button only shows for `active` and `closed` entries (not `temp`)

### **Issue: Pattern stats wrong**
**Fix:** Make sure entries have `outcome` object with `pnl` field for closed trades

### **Issue: Chart doesn't load replay session**
**Fix:** Check console for errors. Session may not have `ohlcCache` yet (mock data generation may fail silently)

---

## 📊 EXPECTED RESULTS SUMMARY

| Feature | Status | Notes |
|---------|--------|-------|
| ReplayPlayer | ✅ Working | All controls functional |
| PatternDashboard | ✅ Working | All tabs render, stats calculate |
| ReplayPage | ✅ Working | Player + Dashboard toggle works |
| Create Replay Button | ✅ Working | Creates session, navigates |
| View Replay Button | ✅ Working | Loads existing session |
| Pattern Library | ✅ Working | Shows entries with PnL > 10% |
| Chart Integration | ⚠️ Partial | Loads session, but no real OHLC data |
| Bookmarks | ✅ Working | Add, delete, jump to bookmarks |
| Speed Controls | ✅ Working | 0.5x - 4x playback speed |
| Timeline Scrubbing | ✅ Working | Click to seek |

---

## 🚀 WHAT'S NEXT?

After all tests pass, ready for:
1. **BLOCK 5:** Additional features (if requested)
2. **Production Testing:** Real trading data
3. **UI Polish:** Animations, transitions, responsive design
4. **Documentation:** User guide, video tutorials

---

**STATUS:** 🧪 Ready for testing!
