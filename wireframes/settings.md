# Settings – UI Specification

## Purpose

**Goal:** Allow users to configure app preferences, manage wallet access, and control AI/notification settings.

**User Actions:**
- Connect/disconnect Solana wallet (for access gating)
- Configure AI provider preferences (OpenAI vs. Grok)
- Set notification preferences (push, email)
- Manage app settings (theme, data sync, offline mode)
- View account info and usage stats

---

## Wireframe (Base Structure)

```
[Header]
  - Page Title: "Settings"
  - "Save Changes" Button (if dirty state exists)

[Main Content]
  [Settings Sections - Vertical List with Dividers]

  [1. Account & Access]
    - Wallet Connection Card
      - Status: Connected (address: 0x1234...5678) / Not Connected
      - "Connect Wallet" or "Disconnect" Button
      - Access Status Badge (Premium / Beta / Free)
    
    - Usage Stats (if premium/beta)
      - AI Requests Used (this month)
      - Storage Used (IndexedDB)

  [2. AI Settings]
    - Provider Selection
      - Radio Buttons: [OpenAI] [Grok] [Auto (Cost-Optimized)]
      - Description: "Auto mode uses OpenAI for most tasks, Grok for crypto-specific analysis"
    
    - AI Budget Limit (future)
      - Slider: Max $ per month
      - Current month spend: $X.XX / $Y.YY

  [3. Notifications]
    - Browser Push Notifications
      - Toggle: Enable/Disable
      - Status: Granted / Denied / Not Requested
      - "Enable Notifications" Button (if denied)
    
    - Email Notifications (future)
      - Toggle: Enable/Disable
      - Email Input (if enabled)

  [4. App Preferences]
    - Theme (future)
      - Radio: [Dark] [Light] [Auto]
      - Note: "Light mode coming Q2 2025"
    
    - Data Sync
      - Toggle: Auto-sync when online
      - "Sync Now" Button
      - Last synced: timestamp
    
    - Offline Mode
      - Toggle: Aggressive caching (uses more storage)
      - Storage used: XX MB / 50 MB limit

  [5. About & Support]
    - App Version: 0.9.0
    - "View Changelog" Link
    - "Report Issue" Link (GitHub or email)
    - "Privacy Policy" Link
    - "Terms of Service" Link

  [6. Danger Zone]
    - "Clear Cache" Button (secondary)
    - "Reset All Settings" Button (destructive)
    - "Delete Account" Button (destructive, future)
```

---

## Components

### SettingsSection
- **Type:** Card with Heading
- **Description:** Grouped settings with visual separator
- **Props:**
  - `title: string` (e.g. "AI Settings")
  - `description?: string`
  - `children: React.ReactNode`
- **State:** Static
- **Events:** None (container only)

### WalletConnectionCard
- **Type:** Card with Button
- **Description:** Shows wallet status and connect/disconnect action
- **Props:**
  - `isConnected: boolean`
  - `walletAddress?: string`
  - `accessLevel: 'premium' | 'beta' | 'free'`
  - `onConnect: () => void`
  - `onDisconnect: () => void`
- **State:** Connected, Disconnected, Connecting (loading)
- **Events:** `onConnect` → Trigger Phantom/Solflare wallet, `onDisconnect` → Clear session

### ToggleSetting
- **Type:** Toggle Switch with Label
- **Description:** Single on/off setting
- **Props:**
  - `label: string`
  - `description?: string`
  - `checked: boolean`
  - `onChange: (checked: boolean) => void`
  - `disabled?: boolean`
- **State:** On, Off, Disabled
- **Events:** `onChange` → Update setting in state

### RadioGroupSetting
- **Type:** Radio Button Group
- **Description:** Multiple choice setting (e.g. AI provider)
- **Props:**
  - `label: string`
  - `options: Array<{ value, label, description? }>`
  - `selected: string`
  - `onChange: (value: string) => void`
- **State:** One option selected
- **Events:** `onChange` → Update setting

### UsageStatsCard
- **Type:** Card with Progress Bars
- **Description:** Shows usage limits and current consumption
- **Props:**
  - `stats: { aiRequests, storage, alerts }`
  - `limits: { maxAIRequests, maxStorage, maxAlerts }`
- **State:** Static (updates on data fetch)
- **Events:** None (read-only)

### DangerZoneButton
- **Type:** Button (Destructive style)
- **Description:** High-risk action (clear cache, delete account)
- **Props:**
  - `label: string`
  - `confirmMessage?: string` (if provided, shows confirmation modal)
  - `onClick: () => void`
- **State:** Default, Loading (during action), Disabled
- **Events:** `onClick` → Show confirmation → Execute action

---

## Layout Variants

### Variant 1 – Single Column List (Recommended)

**Layout:**
```
[Header]
[Main Content - Single Column, max-w-3xl mx-auto]
  - Section 1: Account & Access
  - Section 2: AI Settings
  - Section 3: Notifications
  - Section 4: App Preferences
  - Section 5: About
  - Section 6: Danger Zone
  
  Each section = Card with divider below
```

**Pros:**
- Simple, easy to scan
- Mobile-friendly (no layout shifts)
- Clear visual hierarchy
- Settings grouped logically

**Cons:**
- Requires scrolling for bottom sections
- No quick jump to section (unless anchor links added)

**Best For:** Most users; standard settings page pattern

---

### Variant 2 – Tabbed Sections

**Layout:**
```
[Header]
[Tab Bar - Horizontal]
  Tabs: [Account] [AI & Notifications] [App Preferences] [About]

[Active Tab Content]
  - Relevant settings only
  - Less scrolling per tab
```

**Pros:**
- Reduced scrolling (focused view)
- Easy to find specific setting category
- Cleaner visual (less content per screen)

**Cons:**
- More clicks to access all settings
- Tab labels may not be obvious (what's in each tab?)
- Harder to scan all settings at once

**Best For:** Users who know exactly what they're looking for; complex settings pages

---

### Variant 3 – Sidebar Navigation (Desktop) + Tabs (Mobile)

**Layout:**
```
[Desktop: Two Column]
  [Left: Sticky Sidebar (25%)]
    - Quick Jump Links
      - Account
      - AI
      - Notifications
      - App
      - About
      - Danger Zone
  
  [Right: Settings Content (75%)]
    - All sections in single scroll
    - Smooth scroll to section on sidebar click

[Mobile: Tabs (same as Variant 2)]
```

**Pros:**
- Best of both worlds (quick nav + full view)
- Professional, polished UI
- Easy to jump between sections on desktop

**Cons:**
- More complex to implement (responsive breakpoints)
- Sidebar may feel empty (only 6 links)

**Best For:** Desktop-heavy users; large settings pages (10+ sections)

---

## Data & Parameters

### Settings Data Model
```ts
interface UserSettings {
  // Account
  walletAddress?: string;
  accessLevel: 'premium' | 'beta' | 'free';
  
  // AI
  aiProvider: 'openai' | 'grok' | 'auto';
  aiBudgetLimit?: number; // USD per month
  
  // Notifications
  pushEnabled: boolean;
  emailEnabled: boolean;
  emailAddress?: string;
  
  // App
  theme: 'dark' | 'light' | 'auto';
  autoSync: boolean;
  offlineMode: 'standard' | 'aggressive';
  
  // Usage Stats
  aiRequestsThisMonth: number;
  storageUsedMB: number;
  
  // Metadata
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Persistence
- **Storage:** IndexedDB (via Dexie)
- **Sync:** Background sync when online (if autoSync enabled)
- **Default Values:** Set on first app launch

---

## Interactions & UX Details

### User Flows

#### 1. Connect Wallet
1. User clicks "Connect Wallet"
2. Modal appears: "Select Wallet" (Phantom, Solflare, etc.)
3. User selects Phantom → Browser extension prompts approval
4. User approves → Wallet address appears in settings → Access level checked (NFT verification)
5. Toast: "Wallet connected successfully"

#### 2. Enable Push Notifications
1. User toggles "Enable Push Notifications"
2. Browser prompts: "Allow sparkfined.app to send notifications?"
3. User clicks "Allow" → Toggle stays on
4. Toast: "Notifications enabled"
5. (If user clicks "Block" → Toggle reverts to off → Error message: "Enable notifications in browser settings")

#### 3. Change AI Provider
1. User selects "Grok" radio button
2. Warning appears: "Grok costs ~30x more than OpenAI. Recommended for crypto-specific analysis only."
3. User confirms → Setting saved
4. Toast: "AI provider updated to Grok"

#### 4. Clear Cache
1. User clicks "Clear Cache" (in Danger Zone)
2. Confirmation modal: "Clear all cached data? This will free up storage but require re-downloading data."
3. User clicks "Clear" → Loading spinner (2-3s)
4. Cache cleared → Toast: "Cache cleared (XX MB freed)"

### Empty States
- **No Wallet Connected:** "Connect your Solana wallet to unlock premium features" + Benefits list
- **No Email Set:** "Add email to receive alerts and updates" (if email notifications enabled)

### Loading States
- **Connecting Wallet:** Button shows spinner + "Connecting..."
- **Saving Settings:** "Save Changes" button disabled + spinner
- **Syncing Data:** Progress bar below "Sync Now" button

### Error States
- **Wallet Connection Failed:** Toast: "Failed to connect wallet. Try again or use a different wallet."
- **Push Notification Denied:** Inline warning: "Notifications blocked. Enable in browser settings: [Instructions Link]"
- **Sync Failed:** Error banner: "Sync failed. Check internet connection." + "Retry" button

---

## Mobile Considerations

- **Single Column Layout:** All sections stack vertically
- **Toggle Switches:** Large touch targets (48x48px)
- **Wallet Address:** Truncate to `0x1234...5678` with copy button
- **Sticky Header:** "Save Changes" button sticky on mobile (if changes exist)

---

## Offline Support

- **Settings Changes:** Save locally to IndexedDB immediately
- **Sync When Online:** Background sync on reconnect (if autoSync enabled)
- **Offline Indicator:** "Changes will sync when online" banner

---

## Accessibility

- **Keyboard Navigation:**
  - Tab through all interactive elements
  - Space to toggle switches
  - Enter to click buttons
- **Screen Readers:**
  - Toggle states: "Push notifications enabled" / "disabled"
  - Wallet status: "Wallet connected: 0x1234...5678" / "No wallet connected"
- **Focus Management:**
  - After saving, focus on success message
  - After error, focus on error message

---

## Security & Privacy

### Wallet Connection
- **Never store private keys** (only public address)
- **Session-based:** Wallet disconnects on app close (unless "Remember me" enabled in wallet)
- **Access verification:** Re-check NFT ownership on each session start

### Data Storage
- **Local only:** All settings stored in IndexedDB (client-side)
- **No server-side profile:** Settings never sent to backend (except wallet address for access check)
- **Clear on logout:** Option to clear all local data on disconnect

---

## Advanced Features (Future)

1. **Multi-Wallet Support:** Connect multiple wallets, switch between them
2. **Profile Sync:** Store settings in backend (encrypted) for cross-device sync
3. **Notification Preferences:** Granular control (e.g. "Only alert me for gains > 10%")
4. **Data Export:** Download all journal entries, alerts, settings as JSON/CSV
5. **Two-Factor Auth:** Optional 2FA for high-value accounts

---

## Open Questions / Todos

1. **Theme Toggle:** Implement now or wait for light mode design? → Wait for Q2 2025
2. **Email Verification:** Required for email notifications or trust user input? → Trust input (low risk)
3. **AI Budget Enforcement:** Hard limit (block requests) or soft limit (warning)? → Soft limit + warning
4. **Wallet Auto-Reconnect:** Persist connection across sessions or require re-connect? → Persist (better UX)
5. **Settings Import/Export:** Allow users to export/import settings JSON? (Low priority)

---

**Status:** ✅ Ready for implementation  
**Recommended Variant:** Variant 1 (Single Column List)  
**Last Updated:** 2025-11-14
