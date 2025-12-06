# Navigation Redesign – Visual Wireframes & Mockups

**Status**: Design Reference
**Last Updated**: 2025-12-06

---

## 📐 WIREFRAME 1: Desktop Layout (New)

### **Full Desktop Screen (lg+)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│  ┌──────────┐  ┌──────────────────────────────────────────────────────────┐ │
│  │          │  │                                                            │ │
│  │  SPARK   │  │            DASHBOARD / ANALYSIS / JOURNAL / ETC            │ │
│  │  FINED   │  │                    [Page Content Here]                     │ │
│  │          │  │                                                            │ │
│  ├──────────┤  │                                                            │ │
│  │  TRADING │  │                                                            │ │
│  │ WORKFLOW │  │                                                            │ │
│  │          │  │                                                            │ │
│  │ 📊 Board │  │                                                            │ │
│  │ 📈 Anal. │  │                                                            │ │
│  │ 📉 Chart │  │                                                            │ │
│  │ 📔 Jour. │  │                                                            │ │
│  │ ⚠️  Alrt.  │  │                                                            │ │
│  │          │  │                                                            │ │
│  ├──────────┤  │                                                            │ │
│  │ KNOWLEDGE│  │                                                            │ │
│  │   BASE   │  │                                                            │ │
│  │          │  │                                                            │ │
│  │ 📋 Watch │  │                                                            │ │
│  │ 🔮 Orac. │  │                                                            │ │
│  │ 🎓 Less. │  │                                                            │ │
│  │ 📡 Sig.  │  │                                                            │ │
│  │          │  │                                                            │ │
│  ├──────────┤  │                                                            │ │
│  │ SYSTEM   │  │                                                            │ │
│  │          │  │                                                            │ │
│  │ ⚙️ Settings│  │                                                            │ │
│  │          │  │                                                            │ │
│  ├──────────┤  │                                                            │ │
│  │ 🎮 XP    │  │                                                            │ │
│  │ 2,450    │  │                                                            │ │
│  │ Master ✨ │  │                                                            │ │
│  └──────────┘  └──────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

← 5rem/16rem → ← Remaining Width (100% - sidebar) →
(collapsed/expanded)
```

### **Sidebar States**

#### **Collapsed State** (5rem width)
```
┌────────┐
│ SPARK  │
├────────┤
│ 📊 B   │  ← Tooltip on hover: "Board"
│ 📈 A   │
│ 📉 C   │
│ 📔 J   │
│ ⚠️  Al  │
├────────┤
│ 📋 W   │
│ 🔮 Or  │
│ 🎓 Le  │
│ 📡 Si  │
├────────┤
│ ⚙️ S    │
├────────┤
│ 🎮 XP  │
│ 2,450  │
│ Master │
└────────┘

Button: ≡ (collapse/expand toggle)
```

#### **Expanded State** (16rem width)
```
┌────────────────────┐
│ SPARKFINED LOGO    │
├────────────────────┤
│ TRADING WORKFLOW   │
│                    │
│ 📊 Board           │
│ 📈 Analyze         │
│ 📉 Chart           │
│ 📔 Journal         │
│ ⚠️  Alerts          │
│                    │
│ KNOWLEDGE BASE     │
│                    │
│ 📋 Watchlist       │
│ 🔮 Oracle          │
│ 🎓 Lessons         │
│ 📡 Signals         │
│                    │
│ SYSTEM             │
│                    │
│ ⚙️  Settings        │
├────────────────────┤
│ 🎮 XP: 2,450       │
│ Phase: Master ✨   │
└────────────────────┘
```

### **Active State Example** (Analyze page)
```
┌────────────────────┐
│ SPARKFINED LOGO    │
├────────────────────┤
│ TRADING WORKFLOW   │
│                    │
│ 📊 Board           │
│ 📈 Analyze       ← ACTIVE (emerald glow)
│ 📉 Chart           │
│ 📔 Journal         │
│ ⚠️  Alerts          │
│ ...                │

Styling:
- Background: rgba(5, 150, 105, 0.1)  [emerald-500/10]
- Border: 2px solid emerald-500
- Text: text-emerald-500
- Glow: shadow-glow-emerald
```

---

## 📱 WIREFRAME 2: Mobile Layout (New)

### **Bottom Navigation (Default View)**

```
┌──────────────────────────────────┐
│ < Board                     ⋮ ⋮  │  ← Page Header (varies by page)
├──────────────────────────────────┤
│                                  │
│        [Page Content Area]       │
│                                  │
│        (Full width on mobile)    │
│                                  │
├──────────────────────────────────┤
│ 📊│📈│📉│📔│⚙️│ ☰   │           │  ← BottomNav (5 primary + menu)
│ B│ A│ C│ J│ S│ Menu│           │
└──────────────────────────────────┘

Tab dimensions:
- Height: 64px (touch-friendly)
- Icon: 24px
- Label: 11px text
- Spacing: Equal (1fr grid, 5 tabs = ~20% each)
- Width per tab: ~64px (large touch targets)
```

### **Mobile Navigation Drawer (Open State)**

```
┌──────────────────────────────────┐
│ < Board                     ⋮ ⋮  │
├──────────────────────────────────┤
│                                  │
│        [Page Content]      ▓▓▓▓  │  ← Drawer appears
│                            ▓▓▓▓  │     from right
│                            ▓▓▓▓  │
├──────────────────────────────────┤
│ 📊│📈│📉│📔│⚙️│ ✕   │           │
│ B│ A│ C│ J│ S│Close│           │
└──────────────────────────────────┘

                        ┌─────────────────┐
                        │ Secondary Items:│
                        │                 │
                        │ ⚠️  Alerts      │
                        │ 📋 Watchlist   │
                        │ 🔮 Oracle      │
                        │ 🎓 Lessons     │
                        │ 📡 Signals     │
                        │                 │
                        │ Deep Links:     │
                        │ ────────────    │
                        │ ▶️  Replay*     │
                        │ 🔔 Notify*     │
                        │                 │
                        └─────────────────┘
```

### **Mobile Drawer Details**

```
Drawer Properties:
- Position: Fixed, right side
- Width: ~75% of viewport
- Overlay: Backdrop with opacity
- Animation: Slide from right (200ms)
- Close: Click item / Click backdrop / Swipe left
- Accessibility: aria-dialog, focus trap

Item Styling:
- Padding: 16px 20px
- Font: 16px, text-primary
- Icon: 20px (left-aligned)
- Active state: Background color + emerald text
- Divider: After primary items
```

---

## 🎨 WIREFRAME 3: Responsive Breakpoints

### **Breakpoint Strategy**

```
Mobile Screen       Tablet             Desktop
(0 - 768px)        (768px - 1024px)   (1024px+)

┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐
│ [Content]    │   │ │ [Content]  │   │ │ [Content]          │
│              │   │ │            │   │ │                    │
│ ┌─┬─┬─┬─┬─┐  │   │ │ (sidebar  │   │ │ (full sidebar      │
│ │ │ │ │ │ │  │   │ │  visible) │   │ │  expanded)         │
└─┴─┴─┴─┴─┘  │   │ │            │   │ │                    │
              │   │ └──────────────┘   │ └──────────────────────┘
BottomNav     │   ├──────────────┤    ├──────────────────────┤
Only          │   │ │ Bottom (?) │    │  Sidebar only        │
              │   │ └──────────────┘   │  (no bottom nav)     │

Media Query:
- sm: 640px (Tailwind default)
- md: 768px
- lg: 1024px ← KEY BREAKPOINT
- xl: 1280px
```

### **Layout Transitions**

```
sm (< md):
  - BottomNav active
  - Sidebar hidden
  - No sidebar in page

md (md - lg):
  - BottomNav still active (or hidden?)
  - Sidebar exists but maybe collapsed
  - Tablet handling needed

lg+ (>= lg):
  - Sidebar active (expanded)
  - BottomNav hidden
  - Full desktop experience
```

---

## 🎯 WIREFRAME 4: Feature Discovery Paths

### **User Journey: New User (First Time)**

```
Landing Page
    ↓
    └─→ Onboarding Wizard
           ├─→ Step 1: Journal
           │   └─→ Create first entry
           │       └─→ [Guided to /journal-v2]
           │
           ├─→ Step 2: Watchlist
           │   └─→ Add symbols
           │       └─→ [Guided to /watchlist-v2]
           │
           ├─→ Step 3: Alerts
           │   └─→ Create first alert
           │       └─→ [Guided to /alerts-v2]
           │
           └─→ Complete → Dashboard
               ↓
               All nav items now visible
               └─→ User can explore: Analysis, Chart, Oracle, Lessons, Signals
```

### **User Journey: Experienced User (Daily Workflow)**

```
Dashboard (Land here)
    ↓
    ├─→ Sidebar/BottomNav: Quick jump to any feature
    │   ├─→ 📊 Board (KPI check)
    │   ├─→ 📈 Analysis (Pattern review)
    │   ├─→ 📉 Chart (Trade execution)
    │   ├─→ 📔 Journal (Trade log)
    │   ├─→ ⚠️  Alerts (Monitor triggers)
    │   └─→ [Secondary tier]: Watchlist, Oracle, Lessons, Signals
    │
    └─→ Context-specific jumps:
        ├─→ Chart → Replay (playback session)
        ├─→ Watchlist → Replay (review session)
        └─→ Dashboard → Journal (add new entry)
```

---

## 🎨 WIREFRAME 5: Component Hierarchy

### **Desktop Sidebar Component Tree**

```
<Sidebar collapsed={isCollapsed} onToggle={toggleCollapse}>
  ├─ <SidebarHeader>
  │   └─ [SPARKFINED LOGO]
  │
  ├─ <SidebarNavSection title="Trading Workflow">
  │   ├─ <NavItem href="/dashboard-v2" icon="Board" label="Board" />
  │   ├─ <NavItem href="/analysis-v2" icon="Analyze" label="Analyze" />
  │   ├─ <NavItem href="/chart-v2" icon="Chart" label="Chart" />
  │   ├─ <NavItem href="/journal-v2" icon="Journal" label="Journal" />
  │   └─ <NavItem href="/alerts-v2" icon="Alerts" label="Alerts" />
  │
  ├─ <SidebarNavSection title="Knowledge Base">
  │   ├─ <NavItem href="/watchlist-v2" icon="Watchlist" label="Watchlist" />
  │   ├─ <NavItem href="/oracle" icon="Oracle" label="Oracle" />
  │   ├─ <NavItem href="/lessons" icon="Lessons" label="Lessons" />
  │   └─ <NavItem href="/signals" icon="Signals" label="Signals" />
  │
  ├─ <SidebarNavSection title="System">
  │   └─ <NavItem href="/settings-v2" icon="Settings" label="Settings" />
  │
  └─ <SidebarFooter>
      └─ <GamificationBadge xp={2450} phase="Master" />
```

### **Mobile BottomNav Component Tree**

```
<BottomNav>
  ├─ <NavTabBar>
  │   ├─ <NavTab href="/dashboard-v2" icon="Board" label="Board" />
  │   ├─ <NavTab href="/analysis-v2" icon="Analyze" label="Analyze" />
  │   ├─ <NavTab href="/chart-v2" icon="Chart" label="Chart" />
  │   ├─ <NavTab href="/journal-v2" icon="Journal" label="Journal" />
  │   ├─ <NavTab href="/settings-v2" icon="Settings" label="Settings" />
  │   └─ <NavDrawerTrigger icon="Menu" label="More" onClick={openDrawer} />
  │
  └─ <NavigationDrawer isOpen={isOpen} onClose={closeDrawer}>
      ├─ <DrawerItem href="/alerts-v2" icon="Alerts" label="Alerts" />
      ├─ <DrawerItem href="/watchlist-v2" icon="Watchlist" label="Watchlist" />
      ├─ <DrawerItem href="/oracle" icon="Oracle" label="Oracle" />
      ├─ <DrawerItem href="/lessons" icon="Lessons" label="Lessons" />
      ├─ <DrawerItem href="/signals" icon="Signals" label="Signals" />
      ├─ <DrawerDivider />
      ├─ <DrawerItem href="/replay" icon="Replay" label="Replay" disabled />
      └─ <DrawerItem href="/notifications" icon="Notify" label="Notifications" disabled />
```

---

## 🎯 WIREFRAME 6: State Diagrams

### **Navigation State (Desktop)**

```
┌──────────────────────────────────────┐
│  Sidebar State Machine               │
├──────────────────────────────────────┤
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ COLLAPSED (5rem)                │ │
│  │  • Icons only                   │ │
│  │  • Tooltips on hover            │ │
│  │  • CSS: width 5rem              │ │
│  │  • localStorage: collapsed=true │ │
│  └──────────┬──────────────────────┘ │
│             │ [Click toggle]         │
│             ↓                        │
│  ┌─────────────────────────────────┐ │
│  │ EXPANDED (16rem)                │ │
│  │  • Icons + labels               │ │
│  │  • Section headers visible      │ │
│  │  • Footer visible               │ │
│  │  • CSS: width 16rem             │ │
│  │  • localStorage: collapsed=false│ │
│  └──────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘

Active State (Both):
  - When user on page X
  - NavItem for X: active=true
  - Applied styles: bg-brand/10, text-brand, border-glow
```

### **Navigation State (Mobile)**

```
┌──────────────────────────────────────┐
│  BottomNav + Drawer State Machine   │
├──────────────────────────────────────┤
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ DRAWER CLOSED (Default)         │ │
│  │  • 6 primary tabs visible       │ │
│  │  • "☰ More" button visible      │ │
│  │  • Drawer: display none         │ │
│  └──────────┬──────────────────────┘ │
│             │ [Tap ☰ More]           │
│             ↓                        │
│  ┌─────────────────────────────────┐ │
│  │ DRAWER OPEN                     │ │
│  │  • 6 primary tabs still visible │ │
│  │  • Drawer slides from right     │ │
│  │  • Backdrop: semi-transparent   │ │
│  │  • Close buttons/backdrop click │ │
│  └──────────┬──────────────────────┘ │
│             │ [Click item/backdrop]  │
│             ↓                        │
│  ┌─────────────────────────────────┐ │
│  │ DRAWER CLOSED (Animation)       │ │
│  │  • Navigation complete          │ │
│  │  • Page content updates         │ │
│  └─────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

---

## 🎨 WIREFRAME 7: Visual States

### **NavItem States** (Sidebar/BottomNav)

```
DEFAULT STATE:
┌──────────────┐
│ 📊 Dashboard │  text: text-text-secondary
│              │  bg: transparent
└──────────────┘

HOVER STATE:
┌──────────────┐
│ 📊 Dashboard │  text: text-text-primary
│              │  bg: bg-interactive-hover
└──────────────┘

ACTIVE STATE:
┌──────────────┐
│ 📊 Dashboard │  text: text-emerald-500
│              │  bg: bg-brand/10
│              │  border: 2px emerald-500
│              │  glow: shadow-glow-emerald
└──────────────┘

FOCUS STATE (Keyboard):
┌──────────────┐
│ 📊 Dashboard │  [All of ACTIVE] +
│              │  ring: ring-2 ring-emerald-400
└──────────────┘
```

---

## 📊 COMPARISON TABLE: Before vs After

### **Desktop Sidebar Comparison**

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| Items | 7 (6 primary + 1 settings) | 10 (6 primary + 3 secondary + 1 system) |
| Sections | None | 3 (Trading Workflow, Knowledge Base, System) |
| Grouping | Flat list | Hierarchical |
| Secondary nav | None | Watchlist, Oracle, Lessons, Signals |
| Gamification | None | XP badge + Phase indicator |
| Discoverability | 7/10 (Watchlist hidden) | 10/10 (All features visible) |

### **Mobile BottomNav Comparison**

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| Visible items | 4 (Board, Analyze, Journal, Settings) | 5 primary + drawer |
| Chart | ✗ Desktop only | ✓ Mobile accessible (primary) |
| Alerts | ✗ Desktop only | ✓ Mobile accessible (drawer) |
| Oracle | ✗ Desktop only | ✓ Mobile accessible (drawer) |
| Watchlist | ✗ Hidden | ✓ Mobile accessible (drawer) |
| Lessons | ✗ Orphaned | ✓ Mobile accessible (drawer) |
| Signals | ✗ Orphaned | ✓ Mobile accessible (drawer) |
| Touch targets | ~60px (4 tabs) | ~64px (5 tabs) - better UX |
| Discoverability | 4/10 (Mobile limited) | 10/10 (All discoverable) |

---

## ✅ Design System Alignment

### **Color Palette Usage**
```
Active/Hover:     emerald-500 (#059669)
Active BG:        emerald-500/10 (rgba with 10% opacity)
Text Secondary:   text-text-secondary (slate-400)
Text Primary:     text-text-primary (slate-100)
Divider:          border-brand/20
Glow:             shadow-glow-emerald (custom from design system)
Backdrop:         rgba(0, 0, 0, 0.5) (semi-transparent)
```

### **Typography**
```
Desktop:
  - Sidebar heading: 12px, uppercase, letter-spacing
  - Nav item: 14px, medium weight
  - Footer: 12px, muted

Mobile:
  - Nav label: 11px, small caps
  - Drawer item: 16px, medium weight
```

### **Spacing**
```
Desktop Sidebar:
  - Padding: 16px
  - Gap between items: 8px
  - Gap between sections: 16px
  - Section header gap: 12px

Mobile BottomNav:
  - Tab height: 64px
  - Padding: 8px 12px
  - Gap: 0 (flex: 1 each)

Drawer:
  - Item padding: 16px 20px
  - Width: 75% of viewport (max 300px)
```

---

## 🎬 Animations & Transitions

### **Sidebar Collapse/Expand**
```css
.sidebar {
  transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
  /* easing: material-motion standard */
}

.sidebar-label {
  opacity: 0 | 1;
  transition: opacity 100ms ease-out | 200ms ease-in;
}
```

### **Drawer Slide Animation**
```css
.navigation-drawer {
  animation: slideInRight 200ms cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}
```

### **Active State Animation**
```css
.nav-item[aria-current="page"] {
  animation: highlightActive 150ms cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes highlightActive {
    from {
      background: transparent;
    }
    to {
      background: emerald-500/10;
    }
  }
}
```

---

## 🎯 Accessibility Considerations

### **Semantic HTML**
```html
<!-- Desktop Sidebar -->
<nav role="navigation" aria-label="Primary navigation">
  <ul>
    <li>
      <NavLink
        to="/dashboard-v2"
        aria-current={isActive ? "page" : "false"}
      >
        Board
      </NavLink>
    </li>
  </ul>
</nav>

<!-- Mobile Drawer -->
<div
  role="dialog"
  aria-modal="true"
  aria-label="Secondary navigation"
>
  <button aria-label="Close navigation" onClick={close} />
  <!-- drawer items -->
</div>
```

### **Keyboard Navigation**
```
Tab:        Focus next nav item
Shift+Tab:  Focus previous nav item
Enter:      Activate link
Escape:     Close drawer (mobile)
Arrow Keys: Optional (not required)
```

### **Screen Reader Support**
```
Sidebar:
  "navigation, Primary navigation"
  "Link, Board, current page"
  "Link, Analyze"

Drawer:
  "dialog, Secondary navigation"
  "Link, Watchlist"
  "Button, Close"
```

---

**End of Wireframes**
