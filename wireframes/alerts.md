# Alerts – UI Specification

## Purpose

**Goal:** Enable traders to set up price alerts and custom signal rules (confluence rules) to never miss trading opportunities.

**User Actions:**
- Create simple price alerts (above/below threshold)
- Create advanced signal rules (e.g. "RSI < 30 AND Volume > avg")
- View active/triggered alerts
- Enable/disable alerts without deleting
- Receive browser push notifications (when online)

---

## Wireframe (Base Structure)

```
[Header]
  - Page Title: "Alerts & Signals"
  - Tab Selector: [Price Alerts] [Signal Rules]
  - "New Alert" Button (Primary CTA)

[Main Content - Price Alerts Tab]
  [Alert List]
    - Alert Cards (grouped by status: Active / Triggered / Disabled)
      Each card:
        - Token Symbol + Icon
        - Condition (e.g. "SOL > $150")
        - Created Date
        - Status Badge (Active / Triggered / Disabled)
        - Toggle Switch (Enable/Disable)
        - Delete Button

  [Empty State]
    - "No alerts yet" + "Create your first alert" CTA

[Main Content - Signal Rules Tab]
  [Rule List]
    - Rule Cards (same grouping as alerts)
      Each card:
        - Rule Name (user-defined or auto-generated)
        - Token Symbol
        - Conditions Summary (e.g. "RSI < 30 AND Price < $100")
        - Last Triggered (timestamp or "Never")
        - Toggle + Delete

  [Empty State]
    - "No signal rules yet" + "Create advanced rule" CTA
```

---

## Create Alert Modal/Page

```
[Header]
  - Title: "Create Alert" or "Create Signal Rule"
  - Close/Cancel Button

[Form - Price Alert]
  - Token Selector (autocomplete)
  - Condition Type Dropdown:
    - "Price Above"
    - "Price Below"
    - "Price Change % (24h)"
    - "Volume Above"
  - Threshold Input (number)
  - Notification Settings:
    - Browser Push (toggle)
    - Email (toggle, future)
  - "Create Alert" Button

[Form - Signal Rule]
  - Rule Name Input (optional, auto-generated if empty)
  - Token Selector
  - Condition Builder (Visual Query Builder):
    - Add Condition (+)
    - Each Condition Row:
      - Indicator Dropdown (RSI, MACD, EMA, Price, Volume)
      - Operator Dropdown (>, <, =, crosses above, crosses below)
      - Value Input
      - Remove Button (-)
    - Logic Operator: AND / OR (between conditions)
  - Notification Settings (same as price alert)
  - "Create Rule" Button
```

---

## Components

### AlertCard
- **Type:** Card (Elevated)
- **Description:** Single alert display with status and actions
- **Props:**
  - `alert: { id, token, condition, threshold, status, createdAt }`
  - `onToggle: (id, enabled) => void`
  - `onDelete: (id) => void`
  - `onEdit: (id) => void` (future)
- **State:** Active, Triggered (visual indicator), Disabled (dimmed)
- **Events:** Toggle switch, Delete button click

### AlertForm
- **Type:** Form (Modal or Full Page)
- **Description:** Create/edit price alert
- **Props:**
  - `alert?: Alert` (for edit mode)
  - `onSave: (alert) => void`
  - `onCancel: () => void`
- **State:** Pristine, Valid, Invalid (validation errors), Saving
- **Events:** `onSave` → Validate + persist

### SignalRuleForm
- **Type:** Form with Condition Builder
- **Description:** Create advanced multi-condition rules
- **Props:**
  - `rule?: SignalRule` (for edit mode)
  - `onSave: (rule) => void`
  - `onCancel: () => void`
- **State:** Pristine, Valid (all conditions valid), Invalid, Saving
- **Events:**
  - `onAddCondition` → Add new condition row
  - `onRemoveCondition(index)` → Remove condition
  - `onSave` → Validate logic + persist

### ConditionBuilder
- **Type:** Dynamic Form Builder
- **Description:** Visual interface for building logical conditions
- **Props:**
  - `conditions: Array<Condition>`
  - `logicOperator: 'AND' | 'OR'`
  - `onChange: (conditions) => void`
- **State:** Dynamic (adds/removes rows)
- **Events:** Add/remove condition, change operator

### TokenSelector
- **Type:** Autocomplete Dropdown
- **Description:** Search and select token for alert
- **Props:**
  - `onSelect: (token) => void`
  - `placeholder?: string`
- **State:** Idle, Searching, Selected
- **Events:** `onSelect` → Set token in form

---

## Layout Variants

### Variant 1 – Tabbed List (Recommended)

**Layout:**
```
[Header with Tabs: Price Alerts | Signal Rules]
[Active List (Default Tab)]
  - Alert cards in single column
  - Grouped by status (Active → Triggered → Disabled)
  - Infinite scroll or pagination

[Floating Action Button]
  - "+" icon → Opens create modal
```

**Pros:**
- Clear separation of simple vs. advanced alerts
- Easy to scan and manage
- Familiar tab pattern (low learning curve)
- Mobile-friendly (vertical scroll)

**Cons:**
- Context switching required (tab clicks)
- Can't compare price alerts and signal rules side-by-side

**Best For:** Most users; clean, simple, focused interface

---

### Variant 2 – Unified List with Filters

**Layout:**
```
[Header with Filter Bar]
  - Type Filter: [All] [Price Alerts] [Signal Rules]
  - Status Filter: [Active] [Triggered] [Disabled]
  - Search Bar (filter by token)

[Unified Alert List]
  - Mixed cards (price alerts + signal rules)
  - Visual distinction (icon or badge for type)
  - Sortable (by date, status, token)

[New Alert Button - Top Right]
  - Opens dropdown: "Price Alert" or "Signal Rule"
```

**Pros:**
- All alerts visible in one view
- Powerful filtering and search
- Better for power users with many alerts

**Cons:**
- More cognitive load (mixed types)
- Requires more filters to narrow down
- Less clear for first-time users

**Best For:** Power users with 20+ alerts who need advanced filtering

---

### Variant 3 – Dashboard + Quick Create

**Layout:**
```
[Stats Bar - Top]
  - Total Active Alerts
  - Alerts Triggered Today
  - Most Watched Tokens

[Two Column Layout]
  [Left: Quick Create (40%)]
    - Inline form (collapsed by default)
    - Expand to create alert without modal
  
  [Right: Alert List (60%)]
    - Active alerts only (default)
    - "View All" → Full page

[Bottom: Recent Triggers]
  - Timeline of recently triggered alerts (last 24h)
```

**Pros:**
- Quick access to create (no modal)
- Stats provide context (engagement)
- Recent triggers = immediate value

**Cons:**
- Compressed alert list (less space)
- Quick create may be ignored (users expect modal)
- Stats may not be valuable for users with few alerts

**Best For:** Users who create alerts frequently and want frictionless UX

---

## Data & Parameters

### Incoming Data

#### Price Alert
- `id: string`
- `userId: string`
- `token: string` (e.g. "SOL")
- `condition: 'above' | 'below' | 'change_pct'`
- `threshold: number`
- `status: 'active' | 'triggered' | 'disabled'`
- `createdAt: Date`
- `triggeredAt?: Date`
- `notificationSettings: { push: boolean, email: boolean }`

#### Signal Rule
- `id: string`
- `userId: string`
- `name?: string`
- `token: string`
- `conditions: Array<{ indicator, operator, value }>`
- `logicOperator: 'AND' | 'OR'`
- `status: 'active' | 'triggered' | 'disabled'`
- `createdAt: Date`
- `lastTriggered?: Date`
- `notificationSettings: { push: boolean, email: boolean }`

### Filters/Parameters
- `type: 'price' | 'signal' | 'all'`
- `status: 'active' | 'triggered' | 'disabled' | 'all'`
- `token?: string` (filter by specific token)
- `searchQuery?: string`

### Important IDs
- `userId` (for scoping alerts)
- `alertId` (for CRUD operations)
- `tokenAddress` (for API calls)

---

## Interactions & UX Details

### User Flows
1. **Create Price Alert:** User clicks "New Alert" → Selects token → Sets condition ("SOL > $150") → Enables push → Saves → Alert appears in Active list
2. **Disable Alert:** User toggles alert off → Status changes to "Disabled" → No notifications sent → Can re-enable later
3. **View Triggered Alerts:** Alert triggers → Browser push notification → User opens app → Sees "Triggered" badge → Can review details or delete
4. **Create Signal Rule:** User clicks "New Rule" → Adds conditions (RSI < 30 AND Volume > 1M) → Names rule "Oversold + Volume Spike" → Saves

### Empty States
- **No Alerts:** "Stay ahead of the market with custom alerts" + "Create First Alert" button + Examples: "Get notified when SOL hits $200"
- **No Triggered Alerts:** "No alerts triggered yet" (in Triggered tab)
- **No Signal Rules:** "Create advanced rules by combining indicators" + "Create Rule" button

### Loading States
- **Alert List Loading:** 3-5 skeleton cards
- **Creating Alert:** Button shows spinner + "Creating..."
- **Checking Conditions:** "Validating rule..." (for signal rules with complex logic)

### Error States
- **Failed to Create Alert:** Toast: "Unable to create alert, try again" + Retry option
- **Invalid Condition:** Inline error below input: "Threshold must be greater than 0"
- **Token Not Found:** Error in token selector: "Token not found or unsupported"
- **Push Notifications Blocked:** Warning banner: "Enable browser notifications to receive alerts" + "Enable" button

---

## Mobile Considerations

- **Alert Cards:** Full width, reduced padding
- **Create Alert:** Full-screen modal (not popup)
- **Condition Builder:** Vertical stack (each condition = separate card)
- **Toggle Switches:** Large touch targets (48x48px minimum)
- **Tabs:** Sticky header with tabs, swipe to switch (optional enhancement)

---

## Notification Details

### Browser Push Notifications
- **Trigger:** Alert condition met (checked every 1-5 minutes)
- **Content:**
  - Title: "Alert Triggered: SOL > $150"
  - Body: "Current price: $152.34 (+1.5%)"
  - Icon: Token logo
  - Action: "View Chart" (deep link to chart page)
- **Permissions:** Request on first alert creation (with explanation)

### In-App Notifications
- **Badge:** Red dot on Alerts tab when new triggers exist
- **Toast:** "Alert triggered: SOL > $150" (when app is open)

---

## Offline Support

- **Create Alert:** Save to IndexedDB, sync when online
- **Toggle Alert:** Immediate local update, sync in background
- **Trigger Checking:** Only when online (alerts won't trigger offline)
- **Indicator:** "Alerts require internet connection" banner when offline

---

## Accessibility

- **Keyboard Navigation:**
  - Tab through alert cards
  - Enter to edit alert
  - Space to toggle enable/disable
- **Screen Readers:**
  - Announce status: "Alert active" / "Alert triggered"
  - Describe condition: "SOL above $150"
- **Color Contrast:** Status badges meet WCAG AA (green/red with sufficient contrast)

---

## Advanced Features (Future)

1. **Alert Groups:** Organize alerts into folders (e.g. "Meme Coins", "Top 10")
2. **Alert Templates:** Pre-built rules (e.g. "Golden Cross", "RSI Divergence")
3. **Alert History:** View all past triggers with charts at trigger time
4. **Multi-Token Alerts:** Single rule for multiple tokens (e.g. "Any token in watchlist > 10% gain")
5. **Webhook Integration:** Send alerts to Discord, Telegram, etc.

---

## Open Questions / Todos

1. **Alert Check Frequency:** Poll every 1min or 5min? (Balance between latency and API costs)
2. **Max Alerts per User:** Limit to 10/20/50? (Prevent abuse, manage backend load)
3. **Alert Expiration:** Auto-disable alerts after 30/60/90 days? (Clean up stale alerts)
4. **Condition Validation:** Real-time validation (check if condition is possible) or trust user input?
5. **Social Alerts:** Allow users to share/copy alert templates? (Future community feature)

---

**Status:** ✅ Ready for implementation  
**Recommended Variant:** Variant 1 (Tabbed List)  
**Last Updated:** 2025-11-14
