# OLED Mode Test Plan & Report

**Date**: 2025-12-05  
**Phase**: 3.3 (OLED Display Testing)  
**Status**: Test Plan Ready ✅

---

## Test Overview

### Objectives

1. **Verify Visual Quality** - Pure black backgrounds, no color banding
2. **Validate Accessibility** - Text remains readable (WCAG AA)
3. **Confirm Persistence** - Settings persist across sessions
4. **Test Functionality** - Toggle works across all routes
5. **Measure Performance** - No performance regressions

---

## Test Devices

### Required OLED Displays

| Device | Display Type | Resolution | OS | Browser | Priority |
|--------|--------------|------------|-----|---------|----------|
| **iPhone 12 Pro** | OLED | 2532×1170 | iOS 17+ | Safari | High |
| **iPhone 14 Pro** | OLED | 2556×1179 | iOS 17+ | Safari | High |
| **Samsung Galaxy S21+** | AMOLED | 2400×1080 | Android 13+ | Chrome | High |
| **Samsung Galaxy S23** | AMOLED | 2340×1080 | Android 13+ | Chrome | Medium |
| **iPad Pro 12.9" (2021+)** | mini-LED | 2732×2048 | iPadOS 17+ | Safari | Medium |
| **Google Pixel 7** | OLED | 2400×1080 | Android 13+ | Chrome | Low |

**Minimum Testing**: 2 devices (iPhone + Samsung)

---

## Test Environment Setup

### Prerequisites

1. **Device Preparation**:
   ```bash
   # Clear browser cache
   # Set display brightness to 50%
   # Enable Dark Mode (system-wide)
   # Close all background apps
   ```

2. **App Setup**:
   ```bash
   # Visit: https://sparkfined.app/settings-v2
   # Or local: http://localhost:5173/settings-v2
   # Ensure logged in
   # Reset OLED mode to OFF (baseline)
   ```

3. **Capture Tools**:
   - Screenshots (before/after)
   - Video recording (toggle animation)
   - Battery monitor (optional)

---

## Test Cases

### Test Case 1: Visual Quality

**Objective**: Verify pure black backgrounds and no color banding

**Steps**:

1. **Baseline (OLED OFF)**:
   - [ ] Navigate to Settings
   - [ ] OLED Mode toggle is OFF (gray)
   - [ ] Capture screenshot
   - [ ] Note background color (should be near-black, not pure black)

2. **Enable OLED Mode**:
   - [ ] Click OLED Mode toggle
   - [ ] Toggle animates to ON position (green)
   - [ ] Page background turns pure black immediately
   - [ ] Capture screenshot

3. **Visual Inspection**:
   - [ ] Background is **pure black** (`#000000` / `rgb(0, 0, 0)`)
   - [ ] Surface colors are **near-black** (`#080808` / `rgb(8, 8, 8)`)
   - [ ] **No color banding** visible (smooth gradients)
   - [ ] **No halos** around text (sharp edges)
   - [ ] **No color bleeding** from bright elements

4. **Navigate to Different Pages**:
   - [ ] Dashboard (`/dashboard-v2`)
   - [ ] Journal (`/journal-v2`)
   - [ ] Watchlist (`/watchlist-v2`)
   - [ ] Alerts (`/alerts-v2`)
   - [ ] Analysis (`/analysis-v2`)
   - [ ] Chart (`/chart-v2`)
   
   **For each page**:
   - [ ] Background is pure black
   - [ ] Cards are near-black
   - [ ] No visual issues
   - [ ] Capture 1 screenshot per page

**Expected Results**:
- ✅ Pure black root background
- ✅ Near-black surfaces (slight lift from background)
- ✅ No banding, halos, or bleeding
- ✅ Consistent across all pages

**Pass Criteria**: All checkboxes checked

---

### Test Case 2: Text Readability (Accessibility)

**Objective**: Ensure text meets WCAG AA contrast ratios

**Steps**:

1. **Measure Contrast Ratios**:
   - Use browser DevTools color picker
   - Measure: Text color vs Background color
   
   | Text Type | Color | Background | Expected Ratio | Measured | Pass? |
   |-----------|-------|------------|----------------|----------|-------|
   | Primary text | `#f4f4f5` | `#000000` | 7:1 (AAA) | ? | ☐ |
   | Secondary text | `#a1a1aa` | `#000000` | 4.5:1 (AA) | ? | ☐ |
   | Tertiary text | `#71717a` | `#000000` | 4.5:1 (AA) | ? | ☐ |
   | Button text (brand) | `#0fb34c` | `#000000` | 3:1 (large) | ? | ☐ |
   | Card text | `#f4f4f5` | `#080808` | 7:1 (AAA) | ? | ☐ |

2. **Readability Test**:
   - [ ] Read body text on Dashboard (comfortable?)
   - [ ] Read headings on Journal page (clear?)
   - [ ] Read helper text on Settings (legible?)
   - [ ] Read alert badges (distinguishable?)

3. **Interactive Elements**:
   - [ ] Buttons clearly visible
   - [ ] Links easily identifiable
   - [ ] Focus rings show on keyboard navigation
   - [ ] Hover states work properly

**Expected Results**:
- ✅ All text meets WCAG AA (4.5:1) or AAA (7:1)
- ✅ No text is hard to read
- ✅ Interactive elements clearly visible

**Pass Criteria**: All contrast ratios meet standards

---

### Test Case 3: Persistence

**Objective**: Verify OLED mode persists across sessions

**Steps**:

1. **Enable OLED Mode**:
   - [ ] Go to Settings
   - [ ] Toggle OLED Mode ON
   - [ ] Verify background is pure black

2. **Refresh Page**:
   - [ ] Press F5 / Cmd+R
   - [ ] Page reloads
   - [ ] OLED mode still ON (toggle shows ON)
   - [ ] Background still pure black

3. **Navigate Away and Back**:
   - [ ] Go to Dashboard
   - [ ] Go to Journal
   - [ ] Return to Settings
   - [ ] OLED mode still ON

4. **Close Tab and Reopen**:
   - [ ] Close browser tab
   - [ ] Reopen browser
   - [ ] Navigate to Settings
   - [ ] OLED mode still ON (persisted from localStorage)

5. **Disable and Re-enable**:
   - [ ] Toggle OLED Mode OFF
   - [ ] Background returns to near-black (`#0a0a0a`)
   - [ ] Toggle OLED Mode ON
   - [ ] Background returns to pure black (`#000000`)

**Expected Results**:
- ✅ OLED mode persists after page reload
- ✅ Persists after navigation
- ✅ Persists after browser close/reopen
- ✅ Toggle accurately reflects state

**Pass Criteria**: All persistence scenarios work

---

### Test Case 4: Functionality Across Routes

**Objective**: Ensure OLED mode works on all pages

**Test Matrix**:

| Route | Path | Background | Cards | Text | Pass? |
|-------|------|------------|-------|------|-------|
| **Landing** | `/landing` | Pure black? | Near-black? | Readable? | ☐ |
| **Dashboard** | `/dashboard-v2` | Pure black? | Near-black? | Readable? | ☐ |
| **Journal** | `/journal-v2` | Pure black? | Near-black? | Readable? | ☐ |
| **Watchlist** | `/watchlist-v2` | Pure black? | Near-black? | Readable? | ☐ |
| **Alerts** | `/alerts-v2` | Pure black? | Near-black? | Readable? | ☐ |
| **Analysis** | `/analysis-v2` | Pure black? | Near-black? | Readable? | ☐ |
| **Chart** | `/chart-v2` | Pure black? | Near-black? | Readable? | ☐ |
| **Settings** | `/settings-v2` | Pure black? | Near-black? | Readable? | ☐ |

**Steps for Each Route**:
1. Navigate to route
2. Verify background is `#000000` (use DevTools)
3. Verify cards are `#080808` (near-black)
4. Verify text is readable
5. Capture screenshot

**Expected Results**:
- ✅ All routes show pure black background
- ✅ All cards show near-black surfaces
- ✅ All text readable

**Pass Criteria**: All 8 routes pass

---

### Test Case 5: Toggle UI & Accessibility

**Objective**: Verify toggle component is accessible

**Steps**:

1. **Visual Design**:
   - [ ] Toggle has clear ON/OFF states
   - [ ] ON state: Green background (`bg-brand`)
   - [ ] OFF state: Gray background (`bg-surface-hover`)
   - [ ] Switch knob animates smoothly (200ms)
   - [ ] Label "OLED Mode" is clear
   - [ ] Description explains benefits

2. **Keyboard Accessibility**:
   - [ ] Tab to toggle (receives focus)
   - [ ] Focus ring visible (2px brand color)
   - [ ] Press Space to toggle ON
   - [ ] Press Space to toggle OFF
   - [ ] Press Enter to toggle (also works)
   - [ ] Escape does nothing (expected)

3. **Screen Reader**:
   - [ ] `role="switch"` present
   - [ ] `aria-checked` reflects state
   - [ ] `aria-label` describes state
   - [ ] Label announces "OLED Mode enabled/disabled"

4. **Touch Targets (Mobile)**:
   - [ ] Toggle tap area ≥ 44×44px
   - [ ] Easy to tap on mobile
   - [ ] No accidental toggles

**Expected Results**:
- ✅ Toggle is accessible via keyboard
- ✅ Screen reader announces state
- ✅ Touch targets meet size guidelines

**Pass Criteria**: All accessibility checks pass

---

### Test Case 6: Performance

**Objective**: Ensure no performance regressions

**Steps**:

1. **Lighthouse Test (OLED OFF)**:
   ```bash
   # Run Lighthouse on /dashboard-v2
   # Capture: Performance, Accessibility, Best Practices
   ```
   - [ ] Performance Score: ____
   - [ ] Accessibility Score: ____
   - [ ] FCP: ____ ms
   - [ ] TTI: ____ ms

2. **Lighthouse Test (OLED ON)**:
   ```bash
   # Toggle OLED Mode ON
   # Run Lighthouse again on /dashboard-v2
   ```
   - [ ] Performance Score: ____ (should be ±5%)
   - [ ] Accessibility Score: ____ (should be same or better)
   - [ ] FCP: ____ ms (should be ±10%)
   - [ ] TTI: ____ ms (should be ±10%)

3. **Render Performance**:
   - [ ] No jank when toggling OLED mode
   - [ ] Smooth transition (no flicker)
   - [ ] No console errors

4. **Battery Test (Optional)**:
   - [ ] Run app for 30min with OLED OFF
   - [ ] Note battery drain: ____%
   - [ ] Run app for 30min with OLED ON
   - [ ] Note battery drain: ____%
   - [ ] Expected: 20-30% less drain with OLED ON

**Expected Results**:
- ✅ Performance Score unchanged (±5%)
- ✅ No visual glitches
- ✅ No console errors
- ✅ Battery savings (if measured)

**Pass Criteria**: No significant performance degradation

---

### Test Case 7: Edge Cases

**Objective**: Test unusual scenarios

**Steps**:

1. **Rapid Toggling**:
   - [ ] Toggle ON/OFF 10 times rapidly
   - [ ] No visual glitches
   - [ ] No console errors
   - [ ] Final state matches toggle UI

2. **Theme Changes**:
   - [ ] OLED ON + Theme: System
   - [ ] OLED ON + Theme: Dark
   - [ ] OLED ON + Theme: Light (should OLED override Light?)
   - [ ] Verify expected behavior

3. **Browser Zoom**:
   - [ ] Zoom to 50%
   - [ ] OLED mode still works
   - [ ] Zoom to 200%
   - [ ] OLED mode still works

4. **DevTools Color Inspect**:
   - [ ] Use DevTools color picker
   - [ ] Click on background: Shows `#000000`
   - [ ] Click on card: Shows `#080808`

5. **localStorage Corruption**:
   - [ ] Enable OLED mode
   - [ ] Open DevTools Console
   - [ ] Run: `localStorage.setItem('oled-mode', 'invalid')`
   - [ ] Refresh page
   - [ ] OLED mode defaults to OFF gracefully

**Expected Results**:
- ✅ Rapid toggling works smoothly
- ✅ Theme changes handled correctly
- ✅ Zoom levels work
- ✅ Colors match tokens
- ✅ Graceful error handling

**Pass Criteria**: No crashes or visual bugs

---

## Test Report Template

### Device Information

```
Device: [iPhone 12 Pro / Samsung Galaxy S21+]
OS Version: [iOS 17.2 / Android 13]
Browser: [Safari 17 / Chrome 120]
Screen Size: [2532×1170 / 2400×1080]
Display Type: [OLED / AMOLED]
App Version: [v1.0.0]
Test Date: [2025-12-05]
Tester: [Name]
```

### Test Results Summary

| Test Case | Status | Issues Found | Notes |
|-----------|--------|--------------|-------|
| 1. Visual Quality | ☐ Pass / ☐ Fail | | |
| 2. Text Readability | ☐ Pass / ☐ Fail | | |
| 3. Persistence | ☐ Pass / ☐ Fail | | |
| 4. Functionality | ☐ Pass / ☐ Fail | | |
| 5. Toggle UI | ☐ Pass / ☐ Fail | | |
| 6. Performance | ☐ Pass / ☐ Fail | | |
| 7. Edge Cases | ☐ Pass / ☐ Fail | | |

**Overall Result**: ☐ PASS / ☐ FAIL

---

### Screenshots Captured

- [ ] Settings - OLED OFF
- [ ] Settings - OLED ON
- [ ] Dashboard - OLED ON
- [ ] Journal - OLED ON
- [ ] Watchlist - OLED ON
- [ ] Chart - OLED ON
- [ ] Toggle Animation (video)

---

### Issues Found

#### Issue 1: [Title]
- **Severity**: Critical / High / Medium / Low
- **Description**: 
- **Steps to Reproduce**: 
- **Expected**: 
- **Actual**: 
- **Screenshot**: 

#### Issue 2: [Title]
...

---

### Recommendations

Based on test results:

1. **Visual Adjustments**:
   - [ ] Adjust card surface color if too dark/light
   - [ ] Tweak text colors if readability issues
   - [ ] Fix any banding/halo issues

2. **Functionality Fixes**:
   - [ ] Fix persistence if failing
   - [ ] Fix toggle animation if janky
   - [ ] Fix accessibility if issues found

3. **Performance Optimizations**:
   - [ ] Optimize if performance degradation > 10%
   - [ ] Fix console errors
   - [ ] Improve battery efficiency

---

## Manual Testing Checklist

### Quick Test (5 minutes)

For rapid verification after code changes:

- [ ] Settings page loads
- [ ] Toggle is visible and clickable
- [ ] Toggle ON → Background turns black
- [ ] Toggle OFF → Background returns to dark gray
- [ ] Refresh → State persists
- [ ] No console errors

### Full Test (30 minutes)

For comprehensive validation:

- [ ] All Test Cases 1-7 completed
- [ ] Screenshots captured
- [ ] Issues documented
- [ ] Test report filled
- [ ] Recommendations noted

---

## Expected Token Values (Reference)

### OLED Mode OFF (Dark Theme)

```css
--color-bg: 10 10 10;              /* #0a0a0a - near-black */
--color-surface: 24 24 27;         /* #18181b - zinc-900 */
--color-surface-elevated: 28 28 30; /* #1c1c1e - zinc-850 */
```

### OLED Mode ON

```css
--color-bg: 0 0 0;                 /* #000000 - pure black */
--color-surface: 8 8 8;            /* #080808 - near-black */
--color-surface-elevated: 12 12 12; /* #0c0c0c - elevated */
--color-surface-hover: 18 18 18;   /* #121212 - hover */
--color-border: 30 30 30;          /* #1e1e1e - subtle borders */
```

**Verification**:
```javascript
// DevTools Console
getComputedStyle(document.body).backgroundColor
// Expected: "rgb(0, 0, 0)" when OLED ON
```

---

## Automated Tests (Future)

### Playwright E2E Test

```typescript
// tests/e2e/settings/oled-mode.spec.ts
import { test, expect } from '@playwright/test';

test.describe('OLED Mode', () => {
  test('should toggle OLED mode and persist', async ({ page }) => {
    await page.goto('/settings-v2');
    
    // Find toggle
    const toggle = page.getByRole('switch', { name: /OLED Mode/i });
    await expect(toggle).toBeVisible();
    
    // Check initial state (OFF)
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    
    // Toggle ON
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    
    // Verify background color
    const bgColor = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundColor
    );
    expect(bgColor).toBe('rgb(0, 0, 0)');
    
    // Refresh and verify persistence
    await page.reload();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    
    const bgColorAfter = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundColor
    );
    expect(bgColorAfter).toBe('rgb(0, 0, 0)');
  });
  
  test('should work across all routes', async ({ page }) => {
    await page.goto('/settings-v2');
    
    // Enable OLED mode
    const toggle = page.getByRole('switch', { name: /OLED Mode/i });
    await toggle.click();
    
    // Test each route
    const routes = ['/dashboard-v2', '/journal-v2', '/watchlist-v2', '/alerts-v2'];
    
    for (const route of routes) {
      await page.goto(route);
      const bgColor = await page.evaluate(() => 
        window.getComputedStyle(document.body).backgroundColor
      );
      expect(bgColor, `${route} should have black background`).toBe('rgb(0, 0, 0)');
    }
  });
});
```

---

## Success Criteria

### Must Pass (Blockers)

- ✅ Pure black background (`#000000`) when OLED ON
- ✅ All text readable (WCAG AA compliance)
- ✅ Persistence works (localStorage)
- ✅ No console errors
- ✅ Toggle is accessible (keyboard + screen reader)

### Should Pass (High Priority)

- ✅ Works on all routes
- ✅ No visual glitches (banding, halos)
- ✅ Performance unchanged (±5%)
- ✅ Battery savings measurable (20-30%)

### Nice to Have (Low Priority)

- ✅ Smooth toggle animation
- ✅ Auto-detect OLED display
- ✅ Theme integration seamless

---

## Sign-Off

### Tester Sign-Off

```
I have completed the OLED Mode testing and confirm:
- All test cases executed
- Issues documented
- Screenshots captured
- Recommendations provided

Tester: __________________
Date: ____________________
Result: PASS / FAIL
```

### Reviewer Sign-Off

```
I have reviewed the test results and:
- Test coverage is adequate
- Issues are documented clearly
- Recommendations are actionable

Reviewer: __________________
Date: ____________________
Approval: APPROVED / CHANGES REQUESTED
```

---

**Created**: 2025-12-05  
**Status**: Test Plan Ready ✅  
**Phase**: 3.3 (OLED Testing)  
**Next**: Execute tests on real devices
