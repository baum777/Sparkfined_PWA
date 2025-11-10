# Rituals Components

**Privacy-first** React components for trading discipline: daily rituals, pre-trade checklists, and post-trade journaling.

## 📦 Components

### 1. `MorningMindsetCard`

Daily goal-setting ritual with mood tracking and streak counter.

**Features:**
- Set daily trading goal
- Track emotional state
- Maintain streak counter
- Mark ritual as complete

**Usage:**
```tsx
import { MorningMindsetCard } from '@/components/rituals';

<MorningMindsetCard
  onComplete={(ritual) => console.log('Ritual completed!', ritual)}
/>
```

**Props:**
- `onComplete?: (ritual: DailyRitual) => void` - Callback when ritual is marked complete

---

### 2. `PreTradeChecklistModal`

Pre-trade validation checklist to enforce discipline before entering trades.

**Features:**
- Trade thesis validation (min 10 chars)
- Risk/Reward ratio input
- Risk amount tracking
- Position size and stop loss (optional)
- Privacy-preserving storage (hashes only to telemetry)

**Usage:**
```tsx
import { PreTradeChecklistModal } from '@/components/rituals';

const [isOpen, setIsOpen] = useState(false);

<PreTradeChecklistModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={(checklist) => console.log('Checklist submitted', checklist)}
  defaultSymbol="BTC/USDT"
/>
```

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `onSubmit?: (checklist: PreTradeChecklist) => void` - Callback when checklist is submitted
- `defaultSymbol?: string` - Pre-fill symbol field

**Validation:**
- Symbol: required
- Thesis: min 10 characters
- RR: must be > 0
- Risk Amount: must be > 0

---

### 3. `PostTradeReviewDrawer`

Post-trade journal entry form with emotional tracking and reflection.

**Features:**
- Complete trade details (entry/exit times, size, risk)
- Trade plan documentation
- PnL tracking with visual indicators
- Emotional journey (before/during/after)
- Influencing factors
- Notes and reflection
- Optional replay snapshot attachment

**Usage:**
```tsx
import { PostTradeReviewDrawer } from '@/components/rituals';

const [isOpen, setIsOpen] = useState(false);

<PostTradeReviewDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSave={(entry) => console.log('Journal entry saved', entry)}
  defaultSymbol="BTC/USDT"
/>
```

**Props:**
- `isOpen: boolean` - Controls drawer visibility
- `onClose: () => void` - Callback when drawer is closed
- `onSave?: (entry: TradeJournalEntry) => void` - Callback when entry is saved
- `defaultSymbol?: string` - Pre-fill symbol field

---

## 🗄️ Data Storage

**Sprint B (Current):** Data is stored in **IndexedDB** (via Dexie) with automatic localStorage fallback.

Migration path: ✅ `localStorage → IndexedDB` → 🔜 `Encrypted Sync`

**Storage API:**
```ts
import {
  getTodaysRitual,
  saveDailyRitual,
  markRitualComplete,
  savePreTradeChecklist,
  saveJournalEntry,
  getRitualStats,
  getStorageInfo,
} from '@/lib/storage/ritualStore';

// Daily Ritual (async)
const ritual = await getTodaysRitual();
await saveDailyRitual('My goal', 'calm', false);

// Pre-Trade Checklist (async)
const checklist = await savePreTradeChecklist(
  'BTC/USDT',
  'My thesis',
  2.5,
  100
);

// Journal Entry (async)
const entry = await saveJournalEntry({
  symbol: 'BTC/USDT',
  tradePlan: 'My plan',
  entryTime: '2025-11-10T10:00',
  exitTime: '2025-11-10T12:00',
  positionSize: 0.01,
  riskAmount: 100,
  stopLossPct: 2.5,
  emotionalState: {
    before: 'calm',
    during: 'anxious',
    after: 'relieved',
  },
  influencers: ['News', 'Twitter'],
  outcome: {
    pnl: 150,
    notes: 'Followed plan perfectly',
  },
  replaySnapshotId: null,
});

// Stats (async)
const stats = await getRitualStats();
console.log('Current streak:', stats.currentStreak);

// Check storage backend
const info = getStorageInfo();
console.log('Backend:', info.backend); // 'indexeddb' or 'localstorage'
```

**Migration:**
```ts
import { autoMigrate, getMigrationSummary } from '@/lib/storage/migration';

// Automatic on app start
await autoMigrate();

// Check status
const summary = getMigrationSummary();
console.log(summary.status, summary.message);
```

---

## 📊 Telemetry & Privacy

All events are **privacy-first**: no raw text is sent to telemetry.

**Event Emitter:**
```ts
import { emitRitualEvent, RitualEvents } from '@/lib/telemetry/emitEvent';

emitRitualEvent(RitualEvents.GOAL_SET, {
  date: '2025-11-10',
  goalHash: 'sha256_hash_here',
  mood: 'calm',
  streak: 5,
});
```

**Privacy Rules:**
- ❌ Never send raw text (goals, thesis, notes)
- ✅ Send SHA-256 hashes only
- ✅ Categorize PnL into buckets (large_win, small_win, etc.)
- ✅ Send metadata and flags only

See full event catalog: `docs/event_catalog/rituals_event_catalog.json`

---

## 🧪 Testing

**Unit Tests:**
```bash
pnpm test src/components/rituals/__tests__
```

**Storybook:**
```bash
pnpm storybook
```

Stories available:
- `Rituals/MorningMindsetCard`
- `Rituals/PreTradeChecklistModal`
- `Rituals/PostTradeReviewDrawer`

---

## 🎨 Demo Page

Visit the demo page to see all components in action:

```
http://localhost:5173/rituals/demo
```

**Demo Features:**
- Live component preview
- Stats dashboard
- Recent activity feed
- Clear data button (DEV only)

---

## 🔐 Security & Privacy

### Data Flow

1. **Local First**: All data stored in `localStorage` (MVP)
2. **Hash Sensitive Text**: Goals, thesis, notes are hashed before telemetry
3. **Opt-in Sync**: Future server sync is opt-in and encrypted
4. **No PII**: Never collect personal identifiable information

### Encryption (Future)

```ts
// Planned for Sprint B
import { encryptEntry, decryptEntry } from '@/lib/crypto/aes';

const encrypted = await encryptEntry(entry, userKey);
localStorage.setItem('journal_encrypted', encrypted);
```

### Token Gating (Future)

```ts
// Planned for Sprint C
import { verifyTokenOwnership } from '@/lib/auth/token-gate';

const hasAccess = await verifyTokenOwnership(walletAddress, 'RITUAL_TOKEN');
```

---

## 🚀 Sprint Status

### Sprint B - Production Hardening ✅ (Completed)
- ✅ Migrate to IndexedDB (Dexie wrapper)
- ✅ Background sync via Service Worker (stub)
- ⏳ Encryption-at-rest (AES-GCM) - Deferred to Sprint C
- ✅ Migration script (localStorage → IndexedDB)
- ✅ Unified storage layer with fallback
- ✅ All components updated to async API

**See:** `SPRINT_B_STATUS.md` for details

### Sprint C - Backend Integration (Planned)
- [ ] API endpoints (`/api/journal/sync`, `/api/journal/fetch`)
- [ ] Wallet signature auth
- [ ] Token-gating (SBT/NFT verification)
- [ ] AI summarizer (opt-in, metadata only)
- [ ] Finish encryption-at-rest implementation

---

## 📚 Type Definitions

See `src/components/rituals/types.ts` for full TypeScript types:

```ts
export interface DailyRitual {
  date: string;           // YYYY-MM-DD
  goalHash: string;       // SHA-256
  goal: string;           // Local only
  mood: MoodState;
  completed: boolean;
  streak: number;
  createdAt: string;
  synced: boolean;
}

export interface PreTradeChecklist {
  id: string;
  symbol: string;
  thesisHash: string;     // SHA-256
  thesis: string;         // Local only
  rr: number;
  riskAmount: number;
  positionSize?: number;
  stopLossPct?: number;
  createdAt: string;
  synced: boolean;
}

export interface TradeJournalEntry {
  id: string;
  symbol: string;
  tradePlanHash: string;  // SHA-256
  tradePlan: string;      // Local only
  entryTime: string;
  exitTime: string;
  positionSize: number;
  riskAmount: number;
  stopLossPct: number;
  emotionalState: EmotionalState;
  influencers: string[];
  outcome: TradeOutcome;
  replaySnapshotId: string | null;
  createdAt: string;
  synced: boolean;
}
```

---

## 🤝 Contributing

When adding new features:

1. Update types in `types.ts`
2. Add storage functions in `localRitualStore.ts`
3. Emit events via `emitRitualEvent`
4. Update event catalog JSON
5. Write unit tests
6. Add Storybook stories
7. Update this README

---

## 📝 License

Part of Sparkfined PWA. All rights reserved.

---

## 🔗 Related

- [Event Catalog](../../../docs/event_catalog/rituals_event_catalog.json)
- [Storage Layer (Sprint B)](../../lib/storage/ritualStore.ts)
- [IndexedDB Layer](../../lib/storage/ritualDb.ts)
- [Migration](../../lib/storage/migration.ts)
- [Background Sync](../../lib/sync/backgroundSync.ts)
- [Legacy Storage (Sprint A)](../../lib/storage/localRitualStore.ts)
- [Telemetry Service](../../lib/TelemetryService.ts)
- [Demo Page](../../pages/rituals/DemoRitualsPage.tsx)
- [Sprint B Status](../../../SPRINT_B_STATUS.md)
