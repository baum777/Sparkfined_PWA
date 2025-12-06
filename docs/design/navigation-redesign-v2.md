# Sparkfined PWA – Navigation Redesign (Optimiert)

**Version**: 2.0
**Status**: Proposed
**Last Updated**: 2025-12-06

---

## 📋 Executive Summary

Current navigation has **3 critical gaps**:
1. **Watchlist** exists but isn't discoverable (missing from Sidebar/BottomNav)
2. **Signals & Lessons** pages exist but are orphaned (no nav entry)
3. **Desktop-only features** (Chart, Oracle, Alerts) not accessible on mobile

This redesign **aligns navigation with the Hero's Journey metaphor** while maintaining clean information architecture.

---

## 🎯 Navigation Philosophy

### **Hero's Journey Mapping**
Each navigation item maps to a user phase:

| Phase | Feature | Purpose |
|-------|---------|---------|
| **Degen** | 📊 Dashboard | Entry point, KPI overview |
| **Seeker** | 📈 Analysis | Understand patterns, trends |
| **Warrior** | 📉 Chart | Execute trades, manage positions |
| **Master** | 📚 Journal | Document wins/losses, AI insights |
| **Sage** | 🎓 Lessons | Share knowledge, mentor others |

### **Design Principles**
- ✅ **Every feature is navigable** (no orphaned pages)
- ✅ **Mobile-first** with graceful desktop expansion
- ✅ **Clear hierarchy**: Primary → Secondary → Tertiary
- ✅ **Visual grouping**: Trading Tools vs. Knowledge Base
- ✅ **Consistency**: Same nav across all pages

---

## 🗂️ Proposed Information Architecture

### **PRIMARY TIER** (Always Visible)
Core trading workflow features:

```
1. 📊 Board        → /dashboard-v2     [Desktop + Mobile]
2. 📈 Analyze      → /analysis-v2      [Desktop + Mobile]
3. 📉 Chart        → /chart-v2         [Desktop + Mobile] ← MOVE TO MOBILE
4. 📔 Journal      → /journal-v2       [Desktop + Mobile]
5. ⚠️  Alerts       → /alerts-v2        [Desktop + Mobile] ← MOVE TO MOBILE
6. ⚙️  Settings     → /settings-v2      [Desktop + Mobile]
```

**Change**: Move Chart & Alerts to mobile (currently desktop-only)

### **SECONDARY TIER** (Desktop Sidebar / Menu)
Advanced features and knowledge:

```
7. 📋 Watchlist    → /watchlist-v2     [Desktop] ← ADD TO SIDEBAR
8. 🔮 Oracle       → /oracle           [Desktop + Mobile] ← ADD TO MOBILE
9. 🎓 Lessons      → /lessons          [Desktop + Mobile] ← WIRE UP NAV
10. 📡 Signals     → /signals          [Desktop] ← WIRE UP NAV
```

**Change**: Make these features discoverable via navigation

### **TERTIARY TIER** (Deep Links / Context)
Feature-dependent pages:

```
11. ▶️  Replay      → /replay           [Via Chart → Replay action]
12. 🔔 Notifications → /notifications   [Dashboard action / Context]
```

**Status**: Keep context-dependent (good UX pattern)

### **HIDDEN TIER** (Dev/Legacy)
```
- /landing         [Standalone SEO page]
- /ux, /styles     [Dev showcases - remove from prod build]
```

---

## 🎨 REDESIGNED NAVIGATION LAYOUTS

### **DESKTOP (lg+): Expanded Sidebar**

```
┌─────────────────────────────────────┐
│         SPARKFINED LOGO             │
├─────────────────────────────────────┤
│  PRIMARY TIER (Trading Workflow)    │
│ ────────────────────────────────    │
│  📊 Board                           │
│  📈 Analyze                         │
│  📉 Chart                           │
│  📔 Journal                         │
│  ⚠️  Alerts                         │
│                                     │
│  KNOWLEDGE TIER (Growth)            │
│ ────────────────────────────────    │
│  📋 Watchlist                       │
│  🔮 Oracle                          │
│  🎓 Lessons                         │
│  📡 Signals                         │
│                                     │
│  SYSTEM                             │
│ ────────────────────────────────    │
│  ⚙️  Settings        [Bottom]       │
├─────────────────────────────────────┤
│ 🎮 XP: 2,450 | Phase: Master  [Badge]
└─────────────────────────────────────┘
```

**Changes from Current**:
- ✅ Added: Watchlist, Lessons, Signals sections
- ✅ Grouped: Primary (trading) vs Secondary (learning)
- ✅ Visual divider: Section headers for clarity
- ✅ Gamification footer: Show XP + current journey phase

---

### **MOBILE (< lg): Bottom Navigation + Drawer**

#### **Bottom Tab Bar (Recommended)**

```
Mobile Screen Layout:

┌──────────────────────────────┐
│  < Back | Page Title         │  ← Page-specific header
├──────────────────────────────┤
│                              │
│   [Main Content Area]        │
│                              │
├──────────────────────────────┤
│📊│📈│📉│📔│⚙️│ ☰ MENU │        │  ← Primary (5) + Menu
│ B│ A│ C│ J│ S│         │        │
└──────────────────────────────┘

TAP ☰ MENU → Drawer opens:
┌──────────────────────┐
│ ⚠️  Alerts           │
│ 📋 Watchlist        │
│ 🔮 Oracle           │
│ 🎓 Lessons          │
│ 📡 Signals          │
│ ──────────────────  │
│ ▶️  Replay*         │
│ 🔔 Notify*          │
└──────────────────────┘
```

**Rationale**:
- 5 primary tabs + "More" menu (optimal mobile UX)
- Alerts moved to drawer (reduces primary nav clutter)
- Better touch targets (~64px per tab vs ~48px with 6)
- No crowding (5 is the industry standard for mobile nav)
- Contextual deep-links (Replay, Notifications) in drawer

---

## 📊 BEFORE vs AFTER MATRIX

| Feature | Before | After | Status |
|---------|--------|-------|--------|
| **Dashboard** | ✓ Both | ✓ Both | ✅ No change |
| **Analyze** | ✓ Both | ✓ Both | ✅ No change |
| **Chart** | ✓ Desktop only | ✓ Both | 🔄 Mobile added |
| **Journal** | ✓ Both | ✓ Both | ✅ No change |
| **Alerts** | ✓ Desktop only | ✓ Both | 🔄 Mobile added |
| **Settings** | ✓ Both | ✓ Both | ✅ No change |
| **Watchlist** | ✗ Hidden | ✓ Desktop + Mobile | 🟢 Exposed |
| **Oracle** | ✓ Desktop only | ✓ Both | 🔄 Mobile added |
| **Lessons** | ✗ Orphaned | ✓ Desktop + Mobile | 🟢 Wired up |
| **Signals** | ✗ Orphaned | ✓ Desktop + Mobile | 🟢 Wired up |
| **Replay** | ~ Programmatic | ~ Programmatic | ✅ Keep as-is |
| **Notifications** | ✗ Not impl. | 🟡 Future (TBD) | ⏳ On roadmap |

---

## 🛠️ Implementation Plan

### **Phase 1: Navigation Structure (Immediate)**

1. **Update Sidebar** (`src/components/layout/Sidebar.tsx`)
   - Add section headers: "Trading Workflow" + "Knowledge Base"
   - Add Watchlist item (with icon + label)
   - Add Lessons item (with icon + label)
   - Add Signals item (with icon + label)
   - Add gamification footer (XP + phase badge)

2. **Update BottomNav** (`src/components/layout/BottomNav.tsx`)
   - Implement "Option A" (6 primary + menu drawer)
   - 6 Tab items: Board, Analyze, Chart, Journal, Alerts, Settings
   - Add "☰ More" menu button
   - Create Mobile Navigation Drawer for secondary items
   - Add Watchlist, Oracle, Lessons, Signals to drawer

3. **Delete/Repurpose AppHeader**
   - Remove unused `src/components/layout/AppHeader.tsx`
   - Update imports (currently only in ReplayModal)

4. **Add data-testid Attributes**
   - All nav items: `data-testid="nav-{feature}"`
   - E.g., `data-testid="nav-watchlist"`, `data-testid="nav-lessons"`
   - Drawer trigger: `data-testid="nav-drawer-toggle"`

---

### **Phase 2: Mobile Experience (Follow-up)**

5. **Test Mobile Navigation**
   - E2E tests for BottomNav rendering
   - E2E tests for drawer open/close
   - E2E tests for mobile nav to all 10 features

6. **Add Navigation Drawer Component**
   - New file: `src/components/layout/NavigationDrawer.tsx`
   - Slide-out drawer from right side
   - Close on item click
   - Accessibility: `role="navigation"`, focus management

---

### **Phase 3: Validation & Docs**

7. **Update Tests**
   - Add E2E tests: Mobile bottom nav + drawer
   - Add unit tests: BottomNav rendering all items
   - Verify all routes accessible from nav

8. **Documentation**
   - Update `/docs/design/navigation.md` with new structure
   - Update `/docs/architecture/` with nav architecture
   - Add route discovery guide in `/docs/core/`

---

## 📱 Component Structure (New/Updated)

### **src/components/layout/NavigationDrawer.tsx** (NEW)
```tsx
interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
}

// Renders sliding drawer with secondary nav items
// Handles close on backdrop click + item click
// Accessibility: ARIA-dialog, focus trap
```

### **src/components/layout/Sidebar.tsx** (UPDATED)
```tsx
// New sections added:
// - Primary tier header: "Trading Workflow"
// - Secondary tier header: "Knowledge Base"
// - Watchlist, Lessons, Signals items
// - Gamification footer: XP badge + phase indicator

const navSections = [
  {
    title: "Trading Workflow",
    items: [Board, Analyze, Chart, Journal, Alerts]
  },
  {
    title: "Knowledge Base",
    items: [Watchlist, Oracle, Lessons, Signals]
  },
  {
    title: "System",
    items: [Settings]
  }
];
```

### **src/components/layout/BottomNav.tsx** (UPDATED)
```tsx
// Refactored to support:
// - Primary tabs: 6 items
// - Drawer trigger: ☰ More button
// - Drawer contents: Secondary items

const primaryItems = [
  { icon: Board, label: "Board", route: "/dashboard-v2" },
  { icon: Analyze, label: "Analyze", route: "/analysis-v2" },
  // ... 4 more
];

const secondaryItems = [
  { icon: Watchlist, label: "Watchlist", route: "/watchlist-v2" },
  // ... 3 more
];
```

---

## 🎨 Visual Design Details

### **Color & Styling**
- **Active state**: Emerald glow (`text-emerald-500`, `border-glow-emerald`)
- **Inactive**: Slate text with hover effect (`text-text-secondary hover:text-text-primary`)
- **Section headers**: Subtle muted text (`text-text-tertiary`)
- **Icons**: Consistent sizing (24px desktop, 20px mobile)

### **Icons** (Using existing Lucide icons)
```
📊 Board         → LayoutDashboard
📈 Analyze       → BarChart3
📉 Chart         → TrendingUp
📔 Journal       → FileText
⚠️  Alerts        → Bell
⚙️  Settings      → Settings
📋 Watchlist     → BookmarkSquare (or List)
🔮 Oracle        → Sparkles
🎓 Lessons       → BookOpen
📡 Signals       → Radio
▶️  Replay        → Play
🔔 Notify        → AlertCircle
```

### **Responsive Breakpoints**
- **Mobile** (`< md`): BottomNav only
- **Tablet** (`md-lg`): Sidebar collapsed + BottomNav hidden
- **Desktop** (`lg+`): Sidebar expanded, BottomNav hidden

---

## 🧪 Testing Strategy

### **Unit Tests** (Vitest)
```typescript
// BottomNav.test.tsx
✓ Renders 6 primary items
✓ Renders ☰ More button
✓ Drawer opens/closes on button click
✓ Drawer items link to correct routes

// Sidebar.test.tsx
✓ Renders all 10 nav items
✓ Renders section headers
✓ Renders gamification footer
✓ Active state highlights correctly
```

### **E2E Tests** (Playwright)
```typescript
// navigation.flows.spec.ts (NEW)
✓ Desktop: All 10 items navigable from Sidebar
✓ Mobile: All 6 primary items in BottomNav
✓ Mobile: All 4 secondary items in Drawer
✓ Mobile: Drawer open/close works
✓ All routes: URL updates correctly
✓ All routes: Active state reflects current page
✓ Deep links: Chart → Replay maintains context
✓ Deep links: Watchlist → Replay maintains context
```

---

## 📈 Metrics & Success Criteria

### **Navigation Health Metrics**
- ✅ 100% pages navigable (no orphaned routes)
- ✅ All features discoverable from primary nav or drawer
- ✅ Mobile coverage ≥ 90% (all but hidden pages)
- ✅ Accessibility: WCAG 2.1 AA compliant

### **User Experience Metrics** (Post-Launch)
- Feature discovery rate (analytics)
- Click-through from nav to features
- Mobile vs desktop usage patterns
- Bounce rate from landing page

---

## ✅ Implementation Checklist

### **Code Changes**
- [ ] Update `src/components/layout/Sidebar.tsx` (10 items + sections)
- [ ] Update `src/components/layout/BottomNav.tsx` (6 primary + drawer)
- [ ] Create `src/components/layout/NavigationDrawer.tsx` (new component)
- [ ] Remove `src/components/layout/AppHeader.tsx` (unused)
- [ ] Update all nav items with `data-testid` attributes
- [ ] Update `src/routes/RoutesRoot.tsx` (if needed for drawer context)

### **Testing**
- [ ] Run `pnpm typecheck` (no TS errors)
- [ ] Run `pnpm lint` (no ESLint errors)
- [ ] Run `pnpm test` (unit tests pass)
- [ ] Add/update E2E tests for navigation
- [ ] Run `pnpm test:e2e` (all E2E pass)

### **Documentation**
- [ ] Update `/docs/design/navigation.md`
- [ ] Update `/docs/architecture/routing.md`
- [ ] Add navigation section to `/docs/core/getting-started.md`
- [ ] Document drawer component in component library

### **QA & Review**
- [ ] Desktop navigation (all 10 items)
- [ ] Mobile navigation (6 primary + 4 in drawer)
- [ ] Responsive breakpoints (sm, md, lg, xl)
- [ ] Accessibility review (keyboard nav, screen readers)
- [ ] Visual review (colors, spacing, icons)

---

## 🔄 Rollback Plan

If issues arise:
1. **Keep old components**: Don't delete Sidebar/BottomNav, create v3 versions
2. **Feature flags**: Use `useFeatureFlag('new-navigation')` to toggle
3. **Database**: No schema changes, safe to roll back
4. **Tests**: E2E tests ensure nothing breaks

---

## 📚 Related Docs

- Current state: `/docs/design/navigation-audit-v1.md`
- Routes reference: `src/routes/RoutesRoot.tsx`
- Component patterns: `/docs/architecture/components.md`
- Accessibility: `/docs/design/accessibility.md`

---

## 🎯 Next Steps

1. **Approve concept** ← You are here
2. **Implement Phase 1** (Sidebar + BottomNav updates)
3. **Add tests** (E2E + unit)
4. **QA & review**
5. **Deploy**
6. **Monitor metrics**

---

**Prepared by**: AI Assistant
**Date**: 2025-12-06
**Status**: Ready for Implementation
