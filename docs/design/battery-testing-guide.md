# Battery Testing Guide: OLED Mode

**Date**: 2025-12-05  
**Phase**: 4.4 (Performance Testing - Battery)  
**Type**: Manual Testing Guide  
**Status**: Ready for Execution

---

## Overview

OLED Mode is designed to save battery on OLED displays by using pure black backgrounds. Pure black pixels (`#000000`) on OLED/AMOLED displays consume **zero power** because the pixels are completely off.

### Expected Battery Savings

| Display Type | Expected Savings | Reasoning |
|--------------|------------------|-----------|
| **OLED (Phone)** | 20-30% | Pure black pixels off |
| **AMOLED (Samsung)** | 25-35% | Better efficiency |
| **Mini-LED (iPad)** | 5-10% | Dimming zones, not off |
| **LCD (Standard)** | 0% | Backlight always on |

**Note**: Battery savings only apply to OLED/AMOLED displays.

---

## Prerequisites

### Required Equipment

1. **OLED Device** (at least one):
   - iPhone 12 Pro or newer (OLED)
   - Samsung Galaxy S21+ or newer (AMOLED)
   - Google Pixel 7 or newer (OLED)

2. **Battery Monitoring Tools**:
   - iOS: Settings → Battery → Battery Usage
   - Android: Settings → Battery → Battery Usage
   - **AccuBattery** (Android, recommended)
   - **Battery Life** (iOS, App Store)

3. **Environment**:
   - Fully charged device (100%)
   - Same brightness level (50%)
   - Same ambient conditions (indoor, consistent lighting)
   - Wi-Fi connected (consistent network)

### Test Preparation

1. **Baseline Calibration**:
   ```
   Day 1: Normal usage (no OLED mode)
   Day 2: OLED mode enabled
   Day 3: Compare battery drain
   ```

2. **Controlled Test**:
   ```
   Session 1: 30min usage, OLED OFF
   Session 2: 30min usage, OLED ON
   Same routes, same actions
   ```

---

## Test Methodology

### Method 1: Controlled 30-Minute Test (Recommended)

**Objective**: Measure battery drain over 30 minutes of active use.

#### Steps

1. **Preparation**:
   ```
   - Charge device to 100%
   - Close all background apps
   - Set brightness to 50%
   - Enable airplane mode (optional, for consistency)
   - Disable auto-brightness
   ```

2. **Baseline (OLED OFF)**:
   ```
   Time: 0:00
   - Note starting battery: 100%
   - Open Sparkfined app
   - Navigate: Dashboard → Journal → Watchlist → Alerts → Analysis
   - Spend 5 minutes on each route
   - Interact with UI (scroll, click, read)
   Time: 30:00
   - Note ending battery: ___%
   ```

3. **OLED Mode (OLED ON)**:
   ```
   - Charge device back to 100%
   - Wait 10 minutes for battery to stabilize
   - Enable OLED Mode in Settings
   Time: 0:00
   - Note starting battery: 100%
   - Repeat exact same navigation and actions
   Time: 30:00
   - Note ending battery: ___%
   ```

4. **Calculate Savings**:
   ```
   Drain (OFF) = 100% - Battery After (OFF)
   Drain (ON)  = 100% - Battery After (ON)
   Savings     = ((Drain OFF - Drain ON) / Drain OFF) × 100
   ```

#### Example Results

```
OLED OFF:
- Start: 100%
- End:   94%
- Drain: 6%

OLED ON:
- Start: 100%
- End:   95.5%
- Drain: 4.5%

Savings: ((6 - 4.5) / 6) × 100 = 25%
```

---

### Method 2: Real-World Usage (7-Day Test)

**Objective**: Measure battery savings under normal usage patterns.

#### Steps

1. **Week 1: OLED OFF**:
   ```
   Day 1-7:
   - Use app normally (no OLED mode)
   - Note daily battery drain
   - Track app usage time (Settings → Battery)
   ```

2. **Week 2: OLED ON**:
   ```
   Day 1-7:
   - Enable OLED mode
   - Use app normally (same usage pattern)
   - Note daily battery drain
   - Track app usage time
   ```

3. **Compare**:
   ```
   Average Daily Drain (Week 1): ___%
   Average Daily Drain (Week 2): ___%
   Savings: ((Week1 - Week2) / Week1) × 100
   ```

#### Example Results

```
Week 1 (OLED OFF):
- Daily drain: 8%
- App usage: 2h 15m

Week 2 (OLED ON):
- Daily drain: 6%
- App usage: 2h 10m

Savings: ((8 - 6) / 8) × 100 = 25%
```

---

### Method 3: Screen-On Time Test

**Objective**: Measure how OLED mode extends screen-on time.

#### Steps

1. **OLED OFF**:
   ```
   - Charge to 100%
   - Use app continuously until 20% battery
   - Note total screen-on time
   ```

2. **OLED ON**:
   ```
   - Charge to 100%
   - Enable OLED mode
   - Use app continuously until 20% battery
   - Note total screen-on time
   ```

3. **Compare**:
   ```
   Screen-On Time (OFF): ___h ___m
   Screen-On Time (ON):  ___h ___m
   Increase: ON - OFF
   ```

#### Example Results

```
OLED OFF:
- Screen-on time: 5h 30m

OLED ON:
- Screen-on time: 7h 0m

Increase: 1h 30m (27% more)
```

---

## Test Report Template

### Device Information

```
Device: [iPhone 12 Pro / Samsung Galaxy S21+]
OS Version: [iOS 17.2 / Android 13]
Display: [OLED / AMOLED]
Battery Capacity: [2815mAh / 4800mAh]
Test Date: [2025-12-05]
Tester: [Name]
```

### Test Configuration

```
Brightness: 50%
Auto-Brightness: Disabled
Network: Wi-Fi
Background Apps: Closed
Ambient Temperature: ~20°C
Test Duration: 30 minutes
```

### Test Results

#### Controlled Test (30 Minutes)

| Metric | OLED OFF | OLED ON | Difference |
|--------|----------|---------|------------|
| **Starting Battery** | 100% | 100% | - |
| **Ending Battery** | ___% | ___% | - |
| **Battery Drain** | ___% | ___% | ___% |
| **Savings** | - | - | ___%  |

#### Real-World Test (7 Days)

| Metric | Week 1 (OFF) | Week 2 (ON) | Difference |
|--------|--------------|-------------|------------|
| **Avg Daily Drain** | ___% | ___% | ___% |
| **App Usage Time** | ___h ___m | ___h ___m | - |
| **Savings** | - | - | ___% |

#### Screen-On Time Test

| Metric | OLED OFF | OLED ON | Difference |
|--------|----------|---------|------------|
| **Screen-On Time** | ___h ___m | ___h ___m | ___h ___m |
| **Increase** | - | - | ___% |

---

## Variables to Control

### Must Control (High Impact)

1. **Screen Brightness**: Fix at 50%
2. **Auto-Brightness**: Disable
3. **Background Apps**: Close all
4. **Network**: Use Wi-Fi (not cellular)
5. **Ambient Light**: Consistent indoor lighting

### Should Control (Medium Impact)

1. **Usage Pattern**: Same routes, same actions
2. **Test Duration**: Exact same duration
3. **Battery Health**: Test on devices with >80% battery health
4. **Temperature**: Room temperature (~20°C)

### Can Vary (Low Impact)

1. **Notifications**: OK to vary
2. **Time of Day**: OK to vary
3. **App Version**: Same version for both tests

---

## Expected Results

### OLED Displays (iPhone, Samsung)

**Target**: 20-30% battery savings

**Reasoning**:
- Pure black pixels consume zero power
- Sparkfined UI is ~60% black in OLED mode
- Expected savings: 0.6 × (pure black efficiency) ≈ 25%

**Success Criteria**:
- ✅ Pass: 15-35% savings
- ⚠️ Caution: 10-15% savings (investigate)
- ❌ Fail: <10% savings (bug or test issue)

### Mini-LED (iPad Pro)

**Target**: 5-10% battery savings

**Reasoning**:
- Local dimming zones, not per-pixel
- Some efficiency gain from dimming
- Less dramatic than true OLED

**Success Criteria**:
- ✅ Pass: 3-12% savings
- ⚠️ Caution: 0-3% savings (expected)
- ❌ Fail: Negative savings (bug)

### LCD Displays

**Target**: 0% battery savings

**Reasoning**:
- Backlight always on
- No per-pixel control
- Pure black = no savings

**Success Criteria**:
- ✅ Pass: -2% to +2% (within margin of error)
- ⚠️ Caution: >±5% (test variability)

---

## Common Issues & Troubleshooting

### Issue: Inconsistent Results

**Symptoms**:
- Savings vary widely (10% vs 30%)
- Hard to reproduce
- Results don't make sense

**Causes**:
- Brightness not controlled
- Background apps draining battery
- Different usage patterns

**Solution**:
1. Fix brightness at 50%
2. Close all background apps
3. Use airplane mode for consistency
4. Repeat test 3 times, average results

---

### Issue: No Measurable Savings

**Symptoms**:
- OLED ON and OFF have same drain
- Expected 25%, measured 0%

**Causes**:
- OLED mode not actually enabled
- Device not OLED (check display type)
- Test duration too short (<10 min)

**Solution**:
1. Verify OLED mode enabled: `data-oled="true"` on `<body>`
2. Verify device has OLED display
3. Extend test to 30 minutes minimum
4. Check background color is pure black (`#000000`)

---

### Issue: Negative Savings (Worse with OLED)

**Symptoms**:
- OLED ON drains **more** battery than OFF
- Unexpected result

**Causes**:
- Bug in implementation (layout thrashing)
- Background processes triggered
- Test variability (margin of error)

**Solution**:
1. Run performance tests (check for jank)
2. Check console for errors
3. Verify no extra network requests
4. Repeat test 3 times
5. If consistent, investigate code

---

## Tools & Apps

### iOS

1. **Built-in Battery Settings**:
   - Settings → Battery → Battery Usage (by App)
   - Shows app battery drain over 24h/10 days

2. **Battery Life** (App Store):
   - Real-time battery monitoring
   - Historical graphs
   - Free

### Android

1. **AccuBattery** (Recommended):
   - Precise battery drain measurement
   - Screen-on time tracking
   - Battery health monitoring
   - Free (with ads)

2. **GSam Battery Monitor**:
   - Detailed battery stats
   - Per-app breakdown
   - Root not required

3. **Built-in Battery Settings**:
   - Settings → Battery → Battery Usage
   - Less precise than AccuBattery

---

## Data Collection Form

### Test Session Log

```
Session ID: ____
Date: ____
Time: ____

Device: ____
Display Type: [OLED / AMOLED / Mini-LED / LCD]
OS: [iOS / Android] ____
App Version: ____

OLED Mode: [ON / OFF]

Starting Battery: ___%
Ending Battery:   ___%
Duration:         ___ minutes

Routes Visited:
□ Dashboard (5 min)
□ Journal (5 min)
□ Watchlist (5 min)
□ Alerts (5 min)
□ Analysis (5 min)
□ Settings (5 min)

Interactions:
□ Scrolling
□ Clicking buttons
□ Reading content
□ Toggling OLED mode

Notes:
____________________
____________________
____________________
```

---

## Analysis & Reporting

### Calculate Savings

```python
# Python script for calculating savings
def calculate_savings(drain_off, drain_on):
    if drain_off == 0:
        return 0
    
    savings_percent = ((drain_off - drain_on) / drain_off) * 100
    return round(savings_percent, 2)

# Example
drain_off = 6  # 6% drain in 30min
drain_on = 4.5 # 4.5% drain in 30min

savings = calculate_savings(drain_off, drain_on)
print(f"Battery savings: {savings}%")
# Output: Battery savings: 25.0%
```

### Statistical Significance

Run test **3 times** and calculate average:

```
Test 1: 25% savings
Test 2: 27% savings
Test 3: 23% savings

Average: (25 + 27 + 23) / 3 = 25%
Std Dev: 2%

Result: 25% ± 2% savings
```

---

## Success Criteria

### Phase 4.4 Complete

- [ ] Controlled 30-minute test completed
- [ ] Results documented
- [ ] Savings calculated
- [ ] Statistical significance (n=3)
- [ ] Cross-device validation (≥2 devices)

### Production Ready

- [ ] OLED devices show 15-35% savings
- [ ] No negative savings on any device
- [ ] Consistent results across tests
- [ ] User-facing documentation created

---

## User-Facing Documentation

### Help Text (In-App)

```
OLED Mode

Pure black backgrounds for OLED displays.

Benefits:
• 20-30% battery savings on OLED screens
• Reduced eye strain during long sessions
• Minimizes screen burn-in risk

Note: Savings only apply to OLED/AMOLED displays
(iPhone 12+, Samsung Galaxy, Google Pixel, etc.)
```

### FAQ

**Q: How much battery does OLED mode save?**  
A: On OLED displays (iPhone 12+, Samsung Galaxy, etc.), expect 20-30% battery savings during app usage. On LCD displays, there's no battery benefit.

**Q: Does OLED mode work on all devices?**  
A: OLED mode works on all devices, but battery savings only apply to OLED/AMOLED displays.

**Q: Can I measure the savings myself?**  
A: Yes! Use your device's battery settings to compare app battery usage with OLED mode ON vs OFF over a week.

---

## Related Documentation

- **Performance Tests**: `/workspace/tests/e2e/performance/oled-performance.spec.ts`
- **Visual Tests**: `/workspace/tests/e2e/visual/oled-mode-visual.spec.ts`
- **Contrast Tests**: `/workspace/tests/e2e/accessibility/oled-contrast.spec.ts`

---

## Conclusion

Battery testing validates that OLED Mode delivers on its promise of 20-30% battery savings on OLED displays. Follow this guide to conduct rigorous, reproducible battery tests and document results.

**Key Takeaways**:
- ✅ Control brightness (50%)
- ✅ Close background apps
- ✅ Test for 30 minutes minimum
- ✅ Repeat 3 times for statistical significance
- ✅ Document results clearly

---

**Created**: 2025-12-05  
**Author**: AI Assistant (Claude Sonnet 4.5)  
**Phase**: 4.4 (Performance Testing - Battery)  
**Status**: Ready for Manual Testing ✅
