# Sparkfined — Detailed Pages & Features Guide

> **Complete Feature Documentation**
> Every page, every feature, every capability explained

---

## 📑 Table of Contents

1. [Dashboard](#1-dashboard)
2. [Journal](#2-journal)
3. [Analysis](#3-analysis)
4. [Chart](#4-chart)
5. [Watchlist](#5-watchlist)
6. [Alerts](#6-alerts)
7. [Replay Lab](#7-replay-lab)
8. [Settings](#8-settings)
9. [Notifications](#9-notifications)
10. [Signals](#10-signals)
11. [Lessons](#11-lessons)

---

## 1. Dashboard

**Route:** `/dashboard-v2`

**Purpose:** Your command center — see everything at a glance.

### 🎯 Core Features

#### KPI Strip (Top Metrics)
- **Net P&L**: Total profit/loss across all journal entries
- **Win Rate**: Win percentage over last 30 days
- **Alerts Armed**: Number of active price alerts
- **Journal Streak**: Days of consecutive journaling

#### Main Grid (3 Sections)

**1. Insight Teaser**
- Current market bias (Long/Short/Neutral)
- AI-generated summary
- Confidence level indicator
- Quick link to full analysis

**2. Journal Snapshot**
- Last 3 recent journal entries
- Quick preview: title, direction, timestamp
- One-click navigation to full entry
- Empty state if no entries exist

**3. Alerts Snapshot**
- Active alerts overview
- Triggered alerts notification
- Quick actions: Create new alert
- Status indicators (Armed/Triggered/Paused)

#### Quick Actions Bar
- **+ New Journal Entry**: Create trade log instantly
- **Generate Insights**: Run AI analysis on recent trades
- **Create Alert**: Set price notification
- **Open Chart**: Jump to chart workspace

### 🎨 UI/UX Highlights
- **Responsive Grid**: Adapts to mobile, tablet, desktop
- **Loading Skeletons**: Smooth loading experience
- **Error Handling**: Retry buttons, clear error messages
- **Dark-Mode-First**: Eye-friendly color palette

### 📊 Data Sources
- Journal entries from IndexedDB (Dexie)
- Alerts from local state (Zustand)
- KPIs calculated client-side in real-time

---

## 2. Journal

**Route:** `/journal-v2`

**Purpose:** Your trading diary — document every trade, emotion, and outcome.

### 🎯 Core Features

#### Journey Banner
- **Phase Display**: Current journey phase (Degen → Sage)
- **XP Progress Bar**: Visual progress to next level
- **Level**: Current trader level (1-100)
- **Streak Counter**: Days of consecutive journaling

#### Insights Panel
- **AI Summary**: Condensed overview of patterns
- **Generate Insights Button**: Analyze 20-50 trades
- **Pattern Categories**:
  - Behavior Loops
  - Timing Patterns
  - Risk Management
  - Setup Discipline
  - Emotional Patterns

#### Entry List (Left Sidebar)
- **Direction Filters**: All / Long / Short
- **Entry Count**: Shows count per filter
- **Sort Options**: Latest first (default)
- **Entry Cards**:
  - Title
  - Direction badge (🟢 Long / 🔴 Short)
  - Timestamp
  - Excerpt of notes
  - Active state highlighting

#### Detail Panel (Right Side)
- **Full Entry View**:
  - Title
  - Direction
  - Symbol/Asset
  - Entry Price
  - Exit Price
  - P&L (calculated)
  - Timestamp
  - Full notes (rich text)
  - Tags (Setup, Emotion, Outcome)
  - Screenshots (if attached)

#### New Entry Dialog
- **Quick Entry Mode**:
  - Title (required)
  - Notes (optional)
  - Auto-timestamp
  - Saves to IndexedDB instantly

### 🧠 AI Features
- **AI-Condense**: Summarize long journal entries
- **Pattern Detection**: Identify recurring mistakes
- **Insight Generation**: Analyze 20-50 trades for patterns
- **Behavioral Analysis**: Spot FOMO, revenge trades, emotional triggers

### 🎨 UI/UX Highlights
- **Split-Pane Layout**: List + Detail view
- **Keyboard Navigation**: Arrow keys to navigate entries
- **Offline-First**: Write entries offline, sync later
- **URL State Sync**: Active entry ID in URL for sharing

### 📊 Data Persistence
- **IndexedDB (Dexie)**: Local-first storage
- **Zustand**: In-memory state management
- **Sync Strategy**: Background sync when online

---

## 3. Analysis

**Route:** `/analysis-v2`

**Purpose:** AI-powered market insights, bias detection, and pattern recognition.

### 🎯 Core Features

#### Tab Navigation
1. **Overview**: Current market snapshot
2. **Flow**: Volume and order flow analysis (Coming Soon)
3. **Playbook**: Your trading rules and checklists (Coming Soon)

#### Overview Tab

**AI Insight Summary**
- **Current Bias**: Bullish / Bearish / Neutral
- **Reason**: AI-generated explanation
- **Timeframe Focus**: 4H / 1D / etc.
- **Confidence Level**: High / Medium / Low

**Analysis Stats Grid**
- **Bias**: Current market direction + reason
- **Range Window**: High/Low range + timeframe
- **24h Volume**: Total volume + change %
- **Price**: Current price + 24h change
- **Change**: Percentage change with trend icon

**Social Trend Card**
- **Tweet Snippet**: Latest relevant social signal
- **Sentiment Label**: Bullish / Bearish / Neutral
- **Hype Level**: Low / Medium / High
- **Trending Score**: 0-100 relevance score
- **Call to Action**: Buy / Sell / Hold / Watch
- **Link to Tweet**: Direct link to source

**Advanced Insight Card**
- **Market Structure**: Bias, range, key levels
- **Flow & Volume**: 24h volume, delta, source
- **Sentiment & Social**: Social trends, sentiment
- **Technical Patterns**: Chart patterns, indicators
- **Recommendations**: Actionable insights

#### Header Actions
- **Refresh Analysis**: Reload market data
- **Export Insights**: Download as JSON/CSV
- **Share**: Copy link to current analysis

### 🧠 AI Features
- **Multi-Tool AI System**: Uses OpenAI + xAI Grok
- **Heuristic Fallbacks**: Works even when APIs are down
- **Mock Data Mode**: Demo mode for testing
- **Auto-Refresh**: Updates when new data arrives

### 🎨 UI/UX Highlights
- **Badge System**: Visual indicators (MOCK, LIVE, DEMO)
- **Loading States**: Skeleton screens for all sections
- **Error Recovery**: Retry buttons, fallback modes
- **Responsive Grid**: Adapts to screen size

### 📊 Data Sources
- **Market Data API**: Price, volume, range
- **Social API**: Twitter/X trends (via xAI Grok)
- **AI Insights**: OpenAI GPT-4o-mini + xAI Grok
- **Heuristic Engine**: Client-side pattern detection

---

## 4. Chart

**Route:** `/chart-v2`

**Purpose:** Trade-ready chart workspace with indicators, replay, and annotations.

### 🎯 Core Features

#### Chart Display
- **Candlestick Chart**: OHLC data visualization
- **Lightweight-Charts**: Fast, responsive charting library
- **Multi-Timeframe**: 15m, 1h, 4h, 1d
- **Real-Time Updates**: Auto-refresh when online
- **Offline Mode**: Shows last cached data

#### Indicators & Overlays
- **SMA 20**: Simple Moving Average (20 periods)
- **EMA 50**: Exponential Moving Average (50 periods)
- **Bollinger Bands**: BB 20/2 (volatility bands)
- **Custom Presets**:
  - **Scalper**: Fast EMAs + tight BB
  - **Swing**: Medium SMAs + standard BB
  - **Position**: Slow SMAs + wide BB

#### Annotations System
- **📝 Journal Markers**: Trade entries on chart
- **⚠️ Price Alerts**: Alert levels on chart
- **✨ Signals**: AI-generated signals from Grok/Pulse
- **Click to Jump**: Navigate to annotation source

#### Chart Controls
- **Timeframe Selector**: Switch between 15m, 1h, 4h, 1d
- **Refresh Button**: Force data reload
- **Open Replay**: Jump to Replay Lab with current asset
- **Go Live**: Return to latest candle (from replay)
- **Create Journal**: Add journal entry from chart
- **Create Alert**: Set alert at current price

#### Chart Legend
- **Indicator Colors**: Color-coded legend
- **Annotation Types**: Journal / Alert / Signal
- **Source Badge**: Shows data source (Live / Cached / Demo)
- **Last Updated**: Timestamp of last refresh

### 🎨 UI/UX Highlights
- **Intro Banner**: First-time tips (dismissible)
- **Offline Indicator**: Shows when offline
- **Default Asset Warning**: Prompts to select asset
- **Loading States**: Smooth skeleton animations
- **Error Recovery**: Clear error messages + retry

### 📊 Data Sources
- **OHLC Data**: Fetched from market API
- **Cached Data**: IndexedDB backup for offline
- **Annotations**: Journal + Alerts from local stores
- **Signals**: AI-generated events (Grok Pulse)

---

## 5. Watchlist

**Route:** `/watchlist-v2`

**Purpose:** Track multiple assets in one view — scan risk, momentum, and context quickly.

### 🎯 Core Features

#### Asset Table
- **Symbol**: Token ticker (e.g., SOL, BTC)
- **Price**: Current price (real-time)
- **24h Change**: Price change % with color coding
- **Trend**: AI-detected trend (Bullish/Bearish/Neutral)
- **Session**: Trading session (London/NY/Asia)
- **Network**: Blockchain (Solana, Ethereum, etc.)

#### Filters & Sorting
- **Session Filter**: All / London / NY / Asia
- **Sort Modes**:
  - **Default**: Original order
  - **Top Movers**: Largest 24h change
  - **Alphabetical**: A-Z by symbol

#### Detail Panel (Right Side)
- **Asset Overview**:
  - Symbol + Full Name
  - Current Price
  - 24h High / Low
  - 24h Volume
  - Market Cap
- **Trend Analysis**:
  - AI-detected trend
  - Sentiment score
  - Social signals (if available)
- **Quick Actions**:
  - **Open Chart**: Jump to chart view
  - **Open Replay**: Start replay session
  - **Create Alert**: Set price alert
  - **Add to Journal**: Log trade

#### Live Status Badge
- **Live**: Real-time data streaming
- **Cached**: Showing last known prices
- **Offline**: No connection

### 🎨 UI/UX Highlights
- **Two-Column Layout**: Table + Detail panel
- **Responsive Design**: Adapts to mobile/tablet
- **Color-Coded Changes**: Green (up) / Red (down)
- **Hover States**: Row highlighting
- **Empty States**: Prompts to add assets

### 📊 Data Sources
- **Price API**: Real-time quotes
- **Trend API**: AI-powered trend detection
- **Cached Quotes**: IndexedDB backup for offline

---

## 6. Alerts

**Route:** `/alerts-v2`

**Purpose:** Set price notifications and stay ahead of key levels, momentum shifts, and volatility.

### 🎯 Core Features

#### Alert List
- **Status Filters**: All / Armed / Triggered / Paused
- **Type Filters**: All / Price Above / Price Below
- **Alert Cards**:
  - Symbol
  - Target Price
  - Current Price
  - Status Badge
  - Timestamp created
  - Notification settings

#### Detail Panel
- **Full Alert View**:
  - Symbol + Network
  - Alert Type (Price Above / Below)
  - Target Price
  - Current Price
  - Distance to Target (%)
  - Status (Armed / Triggered / Paused)
  - Notes (optional)
  - Created/Updated timestamps

#### Alert Actions
- **Create New**: Quick alert creation
- **Edit**: Modify target price or settings
- **Pause/Resume**: Toggle alert state
- **Delete**: Remove alert
- **Test**: Trigger test notification

#### Notification System
- **Browser Push**: Desktop notifications
- **Service Worker**: Background notifications
- **Auto-Trigger**: Checks every 60 seconds
- **Status Update**: Armed → Triggered automatically

### 🎨 UI/UX Highlights
- **Split Layout**: List + Detail
- **Status Colors**: Armed (green) / Triggered (red) / Paused (gray)
- **Filter Chips**: Quick filter selection
- **Empty States**: Prompts to create first alert

### 📊 Data Persistence
- **Zustand Store**: In-memory state
- **IndexedDB Backup**: Persistent storage
- **Sync Strategy**: Background check every 60s

---

## 7. Replay Lab

**Route:** `/replay` or `/replay/:sessionId`

**Purpose:** Study past price action frame-by-frame, analyze patterns, and improve timing.

### 🎯 Core Features

#### Replay Player
- **Playback Controls**:
  - Play / Pause
  - Seek bar (scrub through frames)
  - Speed control (0.5x, 1x, 2x, 4x)
  - Frame counter (current / total)
- **Session Info**:
  - Session name
  - Asset symbol
  - Timeframe
  - Date range

#### Chart View (Replay Mode)
- **Frame-by-Frame Playback**: Step through candles
- **Annotations Visible**: Journal + Alerts + Signals
- **Click to Jump**: Jump to annotation timestamp
- **Go Live Button**: Return to latest candle
- **Create Actions**: Add journal/alert from replay

#### Bookmark System
- **Add Bookmark**: Mark key moments
- **Bookmark List**: Navigate saved moments
- **Delete Bookmark**: Remove saved points
- **Jump to Bookmark**: Instant seek

#### Pattern Dashboard (Alternative View)
- **Pattern Stats**:
  - Win rate by setup
  - Average P&L by emotion
  - Best/worst timeframes
  - Setup frequency
- **Entry List**: Filter by pattern
- **View Entry**: Jump to journal entry

### 🎨 UI/UX Highlights
- **Dual View Modes**: Player vs Dashboard (toggle)
- **Loading States**: Smooth transitions
- **Empty States**: Prompts to create session
- **Keyboard Shortcuts**: Space (play/pause), arrows (seek)

### 📊 Data Sources
- **OHLC Data**: Historical candles
- **Replay Sessions**: Saved sessions in IndexedDB
- **Journal Entries**: Pattern analysis from journal
- **Bookmarks**: User-saved timestamps

---

## 8. Settings

**Route:** `/settings-v2`

**Purpose:** Manage preferences, data backups, AI usage, and app controls.

### 🎯 Core Features

#### General Settings
- **Theme**: Dark / Light (default: Dark)
- **Language**: EN / DE (more coming)
- **Timezone**: Auto-detect or manual

#### AI Settings
- **AI Provider**: OpenAI / xAI Grok / Both
- **Model Selection**: GPT-4o-mini (default) / GPT-4
- **Rate Limiting**: Max requests per hour
- **Cost Tracking**: Usage stats & estimates

#### Data Management
- **Export All Data**: Download JSON backup
- **Import Data**: Restore from backup
- **Clear Cache**: Reset IndexedDB
- **Reset App**: Factory reset (dangerous)

#### Notifications
- **Push Notifications**: Enable/Disable
- **Alert Sounds**: On/Off
- **Notification Types**:
  - Price alerts
  - Journal reminders
  - AI insights ready

#### Privacy & Security
- **Data Storage**: Local-first explanation
- **Analytics**: Opt-in/out telemetry
- **API Keys**: Manage OpenAI/xAI keys
- **Access Control**: NFT gating (coming soon)

### 🎨 UI/UX Highlights
- **Section Headers**: Clear organization
- **Toggle Switches**: Easy on/off controls
- **Confirmation Dialogs**: For destructive actions
- **Help Text**: Explanations for each setting

---

## 9. Notifications

**Route:** `/notifications`

**Purpose:** View all app notifications in one place.

### 🎯 Core Features

#### Notification List
- **Alert Triggered**: Price alert fired
- **Journal Reminder**: Daily journaling reminder
- **AI Insights Ready**: Analysis completed
- **System Updates**: App version updates

#### Notification Actions
- **Mark as Read**: Clear notification
- **Clear All**: Dismiss all notifications
- **Navigate**: Jump to related page (alert, journal, etc.)

---

## 10. Signals

**Route:** `/signals`

**Purpose:** AI-generated trading signals from Grok Pulse and social trends.

### 🎯 Core Features

#### Signal Feed
- **Signal Cards**:
  - Asset symbol
  - Signal type (Buy / Sell / Watch)
  - Confidence score
  - Reason (AI explanation)
  - Timestamp
  - Source (Grok / Twitter / etc.)

#### Signal Actions
- **Create Alert**: Set alert from signal
- **Add to Journal**: Log signal as trade idea
- **Dismiss**: Hide signal

---

## 11. Lessons

**Route:** `/lessons`

**Purpose:** Learn from your mistakes — curated insights and lessons.

### 🎯 Core Features

#### Lesson Library
- **Lesson Cards**:
  - Title (e.g., "Stop Revenge Trading")
  - Category (Emotion / Risk / Timing)
  - Key Takeaway
  - Related Entries (journal links)

#### Lesson Actions
- **Mark as Read**: Track completed lessons
- **Add Note**: Personal reflections
- **Apply to Journal**: Link to future entries

---

## 🎯 Cross-Page Features

### Global Features (Available Everywhere)

#### Sidebar Navigation (Desktop)
- **Dashboard**: 🏠
- **Journal**: 📓
- **Analysis**: 🧠
- **Chart**: 📈
- **Watchlist**: 👀
- **Alerts**: ⚠️
- **Replay**: 🎬
- **Settings**: ⚙️

#### Bottom Navigation (Mobile)
- Same as sidebar, optimized for thumbs
- Active state highlighting
- Badge indicators (unread notifications)

#### Onboarding Wizard
- **First-Run Experience**:
  - Welcome screen
  - Feature tour
  - Quick setup (API keys optional)
  - Create first journal entry

#### Offline Indicator
- **Status Banner**: Shows when offline
- **Last Synced**: Timestamp of last sync
- **Retry Button**: Manual sync attempt

#### Update Banner
- **New Version Available**: Prompts to reload
- **Release Notes**: Link to changelog
- **Auto-Update**: Service Worker handles updates

#### Error Boundary
- **Global Error Handling**: Catches React errors
- **Fallback UI**: User-friendly error screen
- **Report Button**: Send error log (optional)

---

## 🎨 Design System

### Color Palette
- **Background**: `#0a0a0f` (near black)
- **Surface**: `#18181b` (zinc-900)
- **Border**: `#27272a` (zinc-800)
- **Text Primary**: `#fafafa` (zinc-50)
- **Text Secondary**: `#a1a1aa` (zinc-400)
- **Brand**: `#10b981` (emerald-500)
- **Accent**: `#06b6d4` (cyan-500)
- **Danger**: `#ef4444` (red-500)
- **Warning**: `#f59e0b` (amber-500)

### Typography
- **Headings**: Inter, bold, 24-32px
- **Body**: Inter, regular, 14-16px
- **Captions**: Inter, semibold, 11-12px
- **Monospace**: JetBrains Mono (for prices, code)

### Spacing
- **Compact**: 4px, 8px (mobile)
- **Default**: 12px, 16px (desktop)
- **Loose**: 24px, 32px (sections)

### Components
- **Buttons**: Rounded-full, px-4, py-2
- **Cards**: Rounded-2xl, border-border, bg-surface
- **Inputs**: Rounded-lg, border-border, focus-ring-brand
- **Badges**: Rounded-full, px-2, py-1, text-xs

---

## 🚀 Performance Optimizations

### Code Splitting
- **Route-Level Splitting**: Each page lazy-loaded
- **Component Chunking**: Large components split
- **Vendor Chunking**: React, TailwindCSS separated

### Caching Strategies
- **Precache**: Static assets (HTML, CSS, JS)
- **Cache-First**: Images, fonts
- **Network-First**: API calls
- **Stale-While-Revalidate**: Dynamic data

### Bundle Size
- **Target**: <400KB (current: 428KB)
- **Optimization**: Tree-shaking, minification
- **Monitoring**: Rollup visualizer, Lighthouse CI

---

## 📊 Analytics & Telemetry

### Event Tracking
- **Page Views**: Route changes
- **User Actions**: Button clicks, form submits
- **Feature Usage**: Journal entries, alerts created
- **AI Usage**: Insights generated, API calls
- **Performance**: Load times, errors

### Privacy
- **Opt-In**: User consent required
- **Anonymous**: No PII collected
- **Local-First**: Data stored locally

---

## 🔒 Security & Privacy

### Data Storage
- **IndexedDB**: All data stored locally
- **Encrypted**: API keys encrypted in localStorage
- **No Server**: No backend database (yet)

### API Keys
- **User-Provided**: Bring your own OpenAI/xAI key
- **Secure Storage**: localStorage with encryption
- **Optional**: Works with demo mode without keys

### Future: On-Chain Access
- **Solana NFT Gating**: Hold NFT to access premium features
- **Wallet Integration**: Phantom, Solflare, etc.
- **Smart Contract**: Access control via Solana program

---

## 📱 PWA Features

### Installability
- **Add to Home Screen**: iOS, Android, Desktop
- **Standalone Mode**: Full-screen app experience
- **App Icon**: Custom icon, splash screen

### Offline Support
- **Service Worker**: Cache-first strategy
- **Background Sync**: Sync when online
- **Offline Indicator**: Visual feedback

### Performance
- **Fast Load**: <2s initial load
- **Smooth Scrolling**: 60fps animations
- **Low Memory**: <50MB RAM usage

---

## 🎯 Roadmap: Coming Soon

### Q1 2025
- **On-Chain Access Gating**: Solana NFT verification
- **Real-Time Push Notifications**: Browser push API
- **Background Sync**: Offline-to-online sync
- **Chart Library Evaluation**: TradingView vs Recharts

### Q2 2025
- **Supabase Migration**: Backend DB for cross-device sync
- **Mobile App Wrapper**: Capacitor (iOS/Android)
- **Advanced TA Indicators**: Ichimoku, Keltner, MACD

### Q3 2025
- **Community Heatmaps**: Anonymized behavioral patterns
- **Setup Templates**: Save & track win rates
- **Social Sharing**: Share insights on Twitter/X
- **Mentorship Pairing**: Connect with traders

---

## 📚 Technical Architecture

### Frontend (Client)
```
src/
├── pages/          # Full-page components (Dashboard, Journal, etc.)
├── components/     # Reusable UI components
├── features/       # Feature-specific modules (Analysis, Chart)
├── hooks/          # Custom React hooks
├── lib/            # Pure utilities & helpers
├── store/          # Zustand state stores
├── types/          # TypeScript type definitions
└── styles/         # Global CSS & Tailwind
```

### Backend (Serverless)
```
api/
├── ai/             # AI integration endpoints
├── market/         # Market data endpoints
├── notifications/  # Push notification handlers
└── access/         # NFT verification endpoints
```

### Data Flow
```
User Action → Component → Zustand Store → IndexedDB (Dexie)
                                        ↓
                                   Service Worker (Background Sync)
                                        ↓
                                   Vercel Edge Functions (AI/Market)
```

---

## 🎓 Learning Resources

### For Users
- **Onboarding Wizard**: First-run tour
- **Feature Tooltips**: Hover hints
- **Help Docs**: In-app documentation
- **Video Tutorials**: YouTube channel (coming soon)

### For Developers
- **Architecture Docs**: `.rulesync/` folder
- **API Docs**: `docs/API_LANDSCAPE.md`
- **Testing Docs**: `docs/core/architecture/pwa-audit/`
- **Contributing Guide**: `README.md`

---

**Version:** `0.1.0-beta`
**Last Updated:** December 1, 2025

*Built by traders, for traders. Every feature exists because we needed it ourselves.*
