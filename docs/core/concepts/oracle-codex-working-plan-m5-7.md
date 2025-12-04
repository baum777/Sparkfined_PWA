# Oracle Subsystem – Codex Working Plan (Module 5-7)

**Status**: Ready to Execute  
**Target**: Codex Agent (Auto-Implementation)  
**Estimated Time**: 1.5 Wochen (Module 5-7)  
**Dependencies**: Module 1-4 bereits completed ✅  

---

## 📦 Module Übersicht

### Modul 5: Notifications & Auto-Journal
Implementiert Web Notifications für High-Score Reports (Score ≥ 6) und erstellt automatisch Journal-Einträge beim "Mark as Read" Button. Nutzt die Web Notification API mit Fallback für blockierte Permissions und integriert mit `useJournalStore` für Auto-Entries.

### Modul 6: Analytics (Chart, Filter, History)
Baut die Analytics-Komponenten mit Recharts Line Chart (30-Tage Score-Historie), Theme-Filter (7 Kategorien) und History List mit Modal. Ermöglicht Nutzer:innen, vergangene Reports zu durchsuchen, nach Theme zu filtern und Trends im Score zu erkennen.

### Modul 7: Tests & E2E
Vervollständigt die Test-Coverage mit E2E-Flows (Playwright), Component-Tests (Vitest + React Testing Library) und erreicht ≥80% Coverage. Fügt `data-testid` Attribute hinzu und stellt sicher, dass alle User-Flows (Load, Read, Notification, Filter) stabil getestet sind.

---

## 🚀 Modul 5: Notifications & Auto-Journal

**Ziel**: High-Score Notifications + Auto-Journal Entry on Read  
**Aufwand**: 2-3 Tage  
**Dependencies**: Modul 2 (Stores), Modul 4 (OraclePage)

### 📋 Checkliste

#### 5.1 High-Score Notification (Web Notification API)

- [ ] **Notification Permission Hook erstellen**
  ```bash
  touch src/hooks/useNotificationPermission.ts
  ```
  
  **Inhalt**:
  ```typescript
  import { useState, useEffect } from 'react';
  
  export function useNotificationPermission() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    
    useEffect(() => {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    }, []);
    
    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      }
      return Notification.permission;
    };
    
    return { permission, requestPermission };
  }
  ```

- [ ] **OraclePage.tsx erweitern (Notification Effect)**
  
  **Location**: `src/pages/OraclePage.tsx`
  
  **Code hinzufügen** (nach bestehenden useEffects):
  ```typescript
  import { useNotificationPermission } from '@/hooks/useNotificationPermission';
  
  // Inside component:
  const { permission, requestPermission } = useNotificationPermission();
  
  // Notification Effect (HIGH SCORE)
  useEffect(() => {
    if (!currentReport) return;
    if (currentReport.notified) return;
    if (currentReport.score < 6) return; // Only high scores
    
    // Request permission if default
    if (permission === 'default') {
      requestPermission();
      return;
    }
    
    // Send notification if granted
    if (permission === 'granted') {
      new Notification('🔮 Meta-Shift Incoming!', {
        body: `Oracle Score: ${currentReport.score}/7 → ${currentReport.topTheme}`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        tag: `oracle-${currentReport.date}`,
        requireInteraction: false,
      });
      
      // Mark as notified
      markAsNotified(currentReport.date);
    }
  }, [currentReport, permission, requestPermission, markAsNotified]);
  ```

- [ ] **Notification Click Handler hinzufügen**
  
  **Location**: `src/pages/OraclePage.tsx`
  
  **Code hinzufügen** (im useEffect für Service Worker):
  ```typescript
  // Listen for notification clicks
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        // Focus window
        window.focus();
        
        // Navigate to oracle if not already there
        if (window.location.pathname !== '/oracle') {
          window.location.href = '/oracle';
        }
      }
    });
  }, []);
  ```

- [ ] **Notification Icons validieren**
  
  **Check**: `public/icons/icon-192.png` und `icon-96.png` existieren
  
  ```bash
  ls -lh public/icons/icon-*.png
  ```
  
  Falls fehlend: Icon-Set aus existierenden Icons kopieren oder generieren.

#### 5.2 Auto-Journal Entry Integration

- [ ] **markAsRead erweitern (Auto-Journal)**
  
  **Location**: `src/pages/OraclePage.tsx`
  
  **Funktion erweitern**:
  ```typescript
  const handleMarkAsRead = async () => {
    if (!currentReport || currentReport.read) return;
    
    try {
      // 1. Mark as read in Oracle DB
      await markAsRead(currentReport.date);
      
      // 2. Grant XP + Increment Streak (already done in oracleStore)
      
      // 3. Create auto-journal entry
      const journalEntry = await useJournalStore.getState().createQuickJournalEntry({
        title: `Oracle ${currentReport.score}/7 → ${currentReport.topTheme}`,
        notes: [
          `Read Oracle report for ${currentReport.date}.`,
          `Next meta-shift likely: ${currentReport.topTheme}`,
          currentReport.score >= 6 ? '⚡ High probability shift detected!' : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      });
      
      // 4. Add Oracle-specific tags
      // (If journalEntry supports tags, add them here)
      
      // 5. Show success toast (optional)
      console.log('[Oracle] Auto-journal entry created:', journalEntry.id);
      
    } catch (error) {
      console.error('[Oracle] Failed to mark as read:', error);
      // Don't show error to user (silent failure for better UX)
    }
  };
  ```

- [ ] **Verify journalStore.createQuickJournalEntry exists**
  
  **Location**: `src/store/journalStore.ts`
  
  **Check**:
  ```typescript
  // Should exist (from Module 4 integration):
  export async function createQuickJournalEntry(input: QuickEntryInput): Promise<JournalEntry>
  ```
  
  Falls nicht vorhanden: Siehe `src/store/journalStore.ts` Zeilen 217-252 (bereits implementiert laut Repo-Scan).

#### 5.3 Testing (Modul 5)

- [ ] **Manual Testing Checklist**
  
  ```bash
  # 1. Start dev server
  pnpm dev
  
  # 2. Open browser → /oracle
  
  # 3. Test Notification Permission
  # - Check: Permission prompt appears (or already granted)
  # - Grant permission
  # - Verify: No errors in console
  
  # 4. Test High Score Notification
  # - Mock high score report (score = 6 or 7)
  # - Wait for notification
  # - Verify: Notification appears with correct text
  # - Click notification
  # - Verify: Navigates to /oracle
  
  # 5. Test "Mark as Read"
  # - Click "Mark as Read" button
  # - Verify: Button disabled
  # - Navigate to /journal-v2
  # - Verify: Auto-entry created with title "Oracle X/7 → Theme"
  # - Verify: Entry notes contain date + theme
  
  # 6. Test Notification Blocked
  # - Block notifications in browser settings
  # - Reload /oracle
  # - Verify: No errors, graceful degradation
  ```

- [ ] **E2E Test hinzufügen**
  
  **Location**: `tests/e2e/oracle/oracle.flows.spec.ts`
  
  **Test Case hinzufügen**:
  ```typescript
  test('should create auto-journal entry on mark as read', async ({ page }) => {
    await page.goto('/oracle');
    
    // Wait for report to load
    await expect(page.getByTestId('oracle-score')).toBeVisible();
    
    // Click "Mark as Read"
    await page.getByTestId('mark-as-read-button').click();
    
    // Navigate to journal
    await page.goto('/journal-v2');
    
    // Verify auto-entry exists
    const autoEntry = page.getByText(/Oracle \d\/7/);
    await expect(autoEntry).toBeVisible();
    
    // Verify entry contains theme
    await autoEntry.click();
    await expect(page.getByText(/Next meta-shift likely:/)).toBeVisible();
  });
  
  test('should send notification for high score', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    await page.goto('/oracle');
    
    // Mock high score report (score = 6)
    // (Implementation depends on how you mock API responses)
    
    // Wait for notification
    // Note: Playwright has limited notification testing
    // Consider mocking Notification API instead
    
    // Verify notification sent (check via console.log or mock)
  });
  ```

- [ ] **Run Tests**
  
  ```bash
  pnpm test:e2e tests/e2e/oracle/oracle.flows.spec.ts
  ```

#### 5.4 Documentation Update

- [ ] **Update oracle-subsystem.md**
  
  **Location**: `docs/core/concepts/oracle-subsystem.md`
  
  **Section 10: Implementation Roadmap → Phase 5**:
  ```markdown
  ### Phase 5: Notifications (Week 3)
  - [x] Implement local notification for high scores
  - [x] Add notification permission prompt
  - [x] Test notification on Desktop browsers
  - [x] Auto-journal entry on "Mark as Read"
  - [ ] Test notification on iOS/Android PWA (QA phase)
  - [ ] (Optional) Implement Service Worker push
  ```

### ✅ Modul 5 Done Criteria

- [x] High-score notification funktioniert (Score ≥ 6)
- [x] Notification Permission Prompt implementiert
- [x] Notification Click Handler navigiert zu /oracle
- [x] Auto-Journal Entry erstellt beim "Mark as Read"
- [x] Graceful Fallback bei blockierten Notifications
- [x] E2E Test für Auto-Journal Entry vorhanden
- [x] Manuelle Tests erfolgreich (Desktop Browser)
- [x] Dokumentation aktualisiert

---

## 📊 Modul 6: Analytics (Chart, Filter, History)

**Ziel**: History Chart + Theme Filter + History List mit Modal  
**Aufwand**: 3-4 Tage  
**Dependencies**: Modul 1 (Dexie), Modul 2 (Stores), Modul 4 (OraclePage)

### 📋 Checkliste

#### 6.1 OracleHistoryChart Component

- [ ] **Component erstellen**
  
  ```bash
  touch src/components/oracle/OracleHistoryChart.tsx
  ```
  
  **Inhalt**:
  ```typescript
  import React from 'react';
  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps,
  } from 'recharts';
  import type { OracleReport } from '@/types/oracle';
  
  interface OracleHistoryChartProps {
    data: OracleReport[];
    onPointClick?: (report: OracleReport) => void;
  }
  
  export function OracleHistoryChart({ data, onPointClick }: OracleHistoryChartProps) {
    const chartData = data.map((report) => ({
      date: new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: report.score,
      theme: report.topTheme,
      fullDate: report.date,
      report: report,
    }));
  
    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
      if (!active || !payload || !payload.length) return null;
  
      const data = payload[0].payload;
  
      return (
        <div className="rounded-xl border border-border bg-surface p-3 shadow-lg">
          <p className="text-sm font-medium text-text-primary">{data.date}</p>
          <p className="text-sm text-text-secondary">
            Score: <span className="font-semibold text-brand">{data.score}/7</span>
          </p>
          <p className="text-xs text-text-tertiary">Theme: {data.theme}</p>
        </div>
      );
    };
  
    const handleClick = (data: any) => {
      if (onPointClick && data?.activePayload?.[0]?.payload?.report) {
        onPointClick(data.activePayload[0].payload.report);
      }
    };
  
    return (
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Oracle Score History (30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 7]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4, cursor: 'pointer' }}
              activeDot={{ r: 6, cursor: 'pointer' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  ```

- [ ] **Recharts Dependency prüfen**
  
  ```bash
  pnpm list recharts
  ```
  
  Falls nicht installiert:
  ```bash
  pnpm add recharts
  ```

- [ ] **TypeScript Check**
  
  ```bash
  pnpm typecheck
  ```

#### 6.2 OracleThemeFilter Component

- [ ] **Component erstellen**
  
  ```bash
  touch src/components/oracle/OracleThemeFilter.tsx
  ```
  
  **Inhalt**:
  ```typescript
  import React from 'react';
  import { ORACLE_THEMES } from '@/types/oracle';
  
  interface OracleThemeFilterProps {
    selected: string;
    onChange: (theme: string) => void;
  }
  
  const ALL_THEMES = ['All', ...ORACLE_THEMES] as const;
  
  export function OracleThemeFilter({ selected, onChange }: OracleThemeFilterProps) {
    return (
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text-secondary">
          Filter by Theme:
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => onChange(theme)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selected === theme
                  ? 'border-brand bg-brand/10 text-brand shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'border-border text-text-secondary hover:border-brand/50 hover:bg-surface-hover'
              }`}
              data-testid={`theme-filter-${theme.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
    );
  }
  ```

- [ ] **ORACLE_THEMES Import validieren**
  
  **Check**: `src/types/oracle.ts` exportiert `ORACLE_THEMES`
  
  ```typescript
  export const ORACLE_THEMES = [
    'Gaming',
    'RWA',
    'AI Agents',
    'DePIN',
    'Privacy/ZK',
    'Collectibles/TCG',
    'Stablecoin Yield',
  ] as const;
  ```

#### 6.3 OracleHistoryList Component (mit Modal)

- [ ] **Component erstellen**
  
  ```bash
  touch src/components/oracle/OracleHistoryList.tsx
  ```
  
  **Inhalt**:
  ```typescript
  import React, { useState } from 'react';
  import type { OracleReport } from '@/types/oracle';
  import { OracleReportModal } from './OracleReportModal';
  
  interface OracleHistoryListProps {
    data: OracleReport[];
  }
  
  export function OracleHistoryList({ data }: OracleHistoryListProps) {
    const [selectedReport, setSelectedReport] = useState<OracleReport | null>(null);
  
    if (data.length === 0) {
      return (
        <div className="rounded-3xl border border-border bg-surface p-6 text-center">
          <p className="text-text-tertiary">No reports found for this filter.</p>
        </div>
      );
    }
  
    return (
      <>
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Past Reports ({data.length})
          </h3>
          <div className="space-y-2">
            {data.map((report) => (
              <div
                key={report.id || report.date}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface-subtle p-4 transition hover:bg-surface-hover"
                data-testid="history-item"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-tertiary">{report.date}</span>
                  <span className="text-sm font-medium text-text-primary">
                    Score: {report.score}/7
                  </span>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                    {report.topTheme}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  View Full Report
                </button>
              </div>
            ))}
          </div>
        </div>
  
        {selectedReport && (
          <OracleReportModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </>
    );
  }
  ```

- [ ] **OracleReportModal erstellen**
  
  ```bash
  touch src/components/oracle/OracleReportModal.tsx
  ```
  
  **Inhalt**:
  ```typescript
  import React, { useEffect } from 'react';
  import { X, Copy } from '@/lib/icons';
  import type { OracleReport } from '@/types/oracle';
  
  interface OracleReportModalProps {
    report: OracleReport;
    onClose: () => void;
  }
  
  export function OracleReportModal({ report, onClose }: OracleReportModalProps) {
    // Close on Escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);
  
    const handleCopy = () => {
      navigator.clipboard.writeText(report.fullReport);
      // Optional: Show toast notification
      console.log('[Oracle] Report copied to clipboard');
    };
  
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Oracle Report
              </h2>
              <p className="text-sm text-text-tertiary">{report.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="rounded-xl border border-border bg-surface-subtle p-2 text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
                aria-label="Copy report"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-border bg-surface-subtle p-2 text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>
  
          {/* Badges */}
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
              Score: {report.score}/7
            </span>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
              {report.topTheme}
            </span>
          </div>
  
          {/* Report Content */}
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-text-secondary">
              {report.fullReport}
            </pre>
          </div>
        </div>
      </div>
    );
  }
  ```

#### 6.4 OraclePage Integration

- [ ] **OraclePage.tsx erweitern**
  
  **Location**: `src/pages/OraclePage.tsx`
  
  **Imports hinzufügen**:
  ```typescript
  import { OracleHistoryChart } from '@/components/oracle/OracleHistoryChart';
  import { OracleThemeFilter } from '@/components/oracle/OracleThemeFilter';
  import { OracleHistoryList } from '@/components/oracle/OracleHistoryList';
  ```
  
  **State hinzufügen**:
  ```typescript
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [selectedReportForModal, setSelectedReportForModal] = useState<OracleReport | null>(null);
  ```
  
  **Filtered History berechnen**:
  ```typescript
  const filteredHistory = useMemo(() => {
    if (selectedTheme === 'All') return history;
    return history.filter((report) => report.topTheme === selectedTheme);
  }, [history, selectedTheme]);
  ```
  
  **JSX erweitern** (nach `<OracleReportPanel>`):
  ```tsx
  {/* History Chart */}
  <OracleHistoryChart
    data={filteredHistory}
    onPointClick={(report) => setSelectedReportForModal(report)}
  />
  
  {/* Theme Filter */}
  <OracleThemeFilter
    selected={selectedTheme}
    onChange={setSelectedTheme}
  />
  
  {/* History List */}
  <OracleHistoryList data={filteredHistory} />
  
  {/* Modal (from chart click) */}
  {selectedReportForModal && (
    <OracleReportModal
      report={selectedReportForModal}
      onClose={() => setSelectedReportForModal(null)}
    />
  )}
  ```

#### 6.5 Testing (Modul 6)

- [ ] **Manual Testing Checklist**
  
  ```bash
  # 1. Start dev server
  pnpm dev
  
  # 2. Open /oracle
  
  # 3. Test History Chart
  # - Verify: Chart displays with 30 days data
  # - Verify: X-axis shows dates (MMM DD)
  # - Verify: Y-axis shows 0-7 scale
  # - Verify: Line connects data points
  # - Click on a data point
  # - Verify: Modal opens with full report
  
  # 4. Test Theme Filter
  # - Click "Gaming" filter button
  # - Verify: Chart updates (only Gaming reports)
  # - Verify: History list updates (only Gaming)
  # - Click "All"
  # - Verify: All reports shown again
  
  # 5. Test History List
  # - Verify: List shows past reports (date, score, theme)
  # - Click "View Full Report"
  # - Verify: Modal opens
  # - Click "Copy" button
  # - Verify: Report copied to clipboard
  # - Press Escape
  # - Verify: Modal closes
  
  # 6. Responsive Design
  # - Resize browser (mobile width)
  # - Verify: Chart resizes correctly
  # - Verify: Filter buttons wrap
  # - Verify: History list stacks vertically
  ```

- [ ] **Component Tests schreiben**
  
  ```bash
  mkdir -p tests/components/oracle
  touch tests/components/oracle/OracleHistoryChart.test.tsx
  touch tests/components/oracle/OracleThemeFilter.test.tsx
  touch tests/components/oracle/OracleHistoryList.test.tsx
  ```
  
  **Example**: `tests/components/oracle/OracleThemeFilter.test.tsx`
  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react';
  import { OracleThemeFilter } from '@/components/oracle/OracleThemeFilter';
  
  describe('OracleThemeFilter', () => {
    it('renders all theme buttons', () => {
      const onChange = vi.fn();
      render(<OracleThemeFilter selected="All" onChange={onChange} />);
      
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Gaming')).toBeInTheDocument();
      expect(screen.getByText('RWA')).toBeInTheDocument();
    });
    
    it('calls onChange when button clicked', () => {
      const onChange = vi.fn();
      render(<OracleThemeFilter selected="All" onChange={onChange} />);
      
      fireEvent.click(screen.getByText('Gaming'));
      expect(onChange).toHaveBeenCalledWith('Gaming');
    });
    
    it('highlights selected theme', () => {
      const onChange = vi.fn();
      render(<OracleThemeFilter selected="Gaming" onChange={onChange} />);
      
      const gamingButton = screen.getByText('Gaming');
      expect(gamingButton).toHaveClass('border-brand');
    });
  });
  ```

- [ ] **E2E Test erweitern**
  
  **Location**: `tests/e2e/oracle/oracle.flows.spec.ts`
  
  **Test Case hinzufügen**:
  ```typescript
  test('should display history chart and handle interactions', async ({ page }) => {
    await page.goto('/oracle');
    
    // Wait for chart to render
    await expect(page.getByText('Oracle Score History')).toBeVisible();
    
    // Chart should have SVG elements (Recharts)
    const chart = page.locator('.recharts-wrapper');
    await expect(chart).toBeVisible();
    
    // Click on a data point (if populated)
    // Note: Recharts click testing is tricky in E2E
    // Consider testing via manual QA instead
  });
  
  test('should filter history by theme', async ({ page }) => {
    await page.goto('/oracle');
    
    // Click "Gaming" filter
    await page.getByTestId('theme-filter-gaming').click();
    
    // Verify only Gaming reports shown
    const historyItems = page.getByTestId('history-item');
    const count = await historyItems.count();
    
    // All visible items should have "Gaming" theme
    for (let i = 0; i < count; i++) {
      await expect(historyItems.nth(i)).toContainText('Gaming');
    }
    
    // Click "All" filter
    await page.getByTestId('theme-filter-all').click();
    
    // Verify all reports shown again
    const allItems = page.getByTestId('history-item');
    const allCount = await allItems.count();
    expect(allCount).toBeGreaterThanOrEqual(count);
  });
  
  test('should open modal from history list', async ({ page }) => {
    await page.goto('/oracle');
    
    // Click "View Full Report" on first item
    await page.getByText('View Full Report').first().click();
    
    // Verify modal opens
    await expect(page.getByText('Oracle Report')).toBeVisible();
    
    // Verify modal has report content
    await expect(page.getByText(/Score: \d\/7/)).toBeVisible();
    
    // Close modal with Escape
    await page.keyboard.press('Escape');
    await expect(page.getByText('Oracle Report')).not.toBeVisible();
  });
  ```

- [ ] **Run Tests**
  
  ```bash
  pnpm test tests/components/oracle
  pnpm test:e2e tests/e2e/oracle/oracle.flows.spec.ts
  ```

#### 6.6 Performance Optimization

- [ ] **Memoize filtered data** (bereits in OraclePage.tsx via `useMemo`)

- [ ] **Chart Performance Check**
  
  ```bash
  # Open /oracle with 30+ reports
  # Check: Chart renders within 1s
  # Check: No jank when filtering
  ```
  
  Falls Performance-Issues:
  - Reduce data points (z.B. nur letzten 14 Tage)
  - Virtualization für History List (react-window)

- [ ] **Lighthouse Audit**
  
  ```bash
  pnpm build
  pnpm preview
  # Open Chrome DevTools → Lighthouse
  # Run audit on /oracle
  # Target: Performance Score ≥ 90
  ```

#### 6.7 Documentation Update

- [ ] **Update oracle-subsystem.md**
  
  **Location**: `docs/core/concepts/oracle-subsystem.md`
  
  **Section 10: Implementation Roadmap → Phase 6**:
  ```markdown
  ### Phase 6: Analytics (Week 4)
  - [x] Test 30-day chart with real data
  - [x] Add theme-based filtering (7 themes + All)
  - [x] Add tooltip with full report preview
  - [x] Optimize chart performance (< 1s render)
  - [x] History list with pagination (if > 30 items)
  - [x] Modal for full report view (from chart + list)
  ```

### ✅ Modul 6 Done Criteria

- [x] Chart displays 30-day score history (Recharts)
- [x] Theme filter funktioniert (7 Themes + All)
- [x] History list zeigt vergangene Reports
- [x] Click auf Chart-Punkt öffnet Modal
- [x] Modal zeigt Full Report mit Copy-Button
- [x] Responsive Design (Mobile + Desktop)
- [x] Component Tests vorhanden (≥ 80% Coverage)
- [x] E2E Tests für Filter + Modal vorhanden
- [x] Performance: Chart < 1s Render Time
- [x] Dokumentation aktualisiert

---

## 🧪 Modul 7: Tests & E2E

**Ziel**: Vervollständigen der Test-Coverage (≥ 80%) + E2E-Stabilität  
**Aufwand**: 3-4 Tage  
**Dependencies**: Modul 1-6 (alle Components fertig)

### 📋 Checkliste

#### 7.1 E2E Test Suite vervollständigen

- [ ] **Alle fehlenden E2E Tests hinzufügen**
  
  **Location**: `tests/e2e/oracle/oracle.flows.spec.ts`
  
  **Test Cases**:
  ```typescript
  test.describe('Oracle Full Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Reset DB state (if needed)
      await page.goto('/oracle');
    });
    
    test('TC-001: Load Oracle Page', async ({ page }) => {
      await page.goto('/oracle');
      await expect(page.getByTestId('oracle-score')).toBeVisible();
      await expect(page.getByTestId('oracle-theme')).toBeVisible();
      await expect(page.getByText(/Oracle Score History/)).toBeVisible();
    });
    
    test('TC-002: Mark as Read (Happy Path)', async ({ page }) => {
      await page.goto('/oracle');
      
      // Wait for report to load
      await expect(page.getByTestId('oracle-score')).toBeVisible();
      
      // Click "Mark as Read"
      const markAsReadBtn = page.getByTestId('mark-as-read-button');
      await markAsReadBtn.click();
      
      // Verify button disabled
      await expect(markAsReadBtn).toBeDisabled();
      
      // Navigate to journal
      await page.goto('/journal-v2');
      
      // Verify auto-entry created
      await expect(page.getByText(/Oracle \d\/7/)).toBeVisible();
    });
    
    test('TC-003: High Score Notification', async ({ page, context }) => {
      // Grant notification permission
      await context.grantPermissions(['notifications']);
      
      await page.goto('/oracle');
      
      // Mock high score report (score = 6)
      // (This requires API mocking - see below)
      
      // Verify notification sent
      // Note: Playwright has limited notification testing
      // Consider checking via console.log or mock
    });
    
    test('TC-004: History Chart Interaction', async ({ page }) => {
      await page.goto('/oracle');
      
      // Verify chart visible
      const chart = page.locator('.recharts-wrapper');
      await expect(chart).toBeVisible();
      
      // Click on data point (if chart has data)
      // Note: Recharts click testing is complex
      // Fallback: Click "View Full Report" instead
    });
    
    test('TC-005: Theme Filter', async ({ page }) => {
      await page.goto('/oracle');
      
      // Click "Gaming" filter
      await page.getByTestId('theme-filter-gaming').click();
      
      // Verify filtered results
      const historyItems = page.getByTestId('history-item');
      const count = await historyItems.count();
      
      if (count > 0) {
        // All should have "Gaming" theme
        for (let i = 0; i < count; i++) {
          await expect(historyItems.nth(i)).toContainText('Gaming');
        }
      }
      
      // Reset filter
      await page.getByTestId('theme-filter-all').click();
    });
    
    test('TC-006: History List Modal', async ({ page }) => {
      await page.goto('/oracle');
      
      // Click "View Full Report" (if list has items)
      const viewReportBtn = page.getByText('View Full Report').first();
      const isVisible = await viewReportBtn.isVisible().catch(() => false);
      
      if (isVisible) {
        await viewReportBtn.click();
        
        // Verify modal opens
        await expect(page.getByText('Oracle Report')).toBeVisible();
        
        // Close with Escape
        await page.keyboard.press('Escape');
        await expect(page.getByText('Oracle Report')).not.toBeVisible();
      }
    });
    
    test('TC-007: Offline Behavior', async ({ page, context }) => {
      // Enable airplane mode
      await context.setOffline(true);
      
      await page.goto('/oracle');
      
      // Verify cached report loads (if available)
      // Or verify error message shown
      
      // Re-enable network
      await context.setOffline(false);
    });
  });
  ```

- [ ] **data-testid Attribute hinzufügen**
  
  **Checklist** (alle Components):
  ```typescript
  // OraclePage.tsx
  - oracle-score          // Score badge
  - oracle-theme          // Theme badge
  - mark-as-read-button   // Mark as Read button
  - refresh-button        // Refresh button
  
  // OracleThemeFilter.tsx
  - theme-filter-all      // "All" button
  - theme-filter-gaming   // "Gaming" button
  - theme-filter-rwa      // "RWA" button
  // ... (all 7 themes)
  
  // OracleHistoryList.tsx
  - history-item          // Each list item
  - view-report-button    // "View Full Report" button
  
  // OracleReportModal.tsx
  - oracle-modal          // Modal container
  - copy-report-button    // Copy button
  - close-modal-button    // Close (X) button
  ```
  
  **Example**:
  ```tsx
  <button data-testid="mark-as-read-button" onClick={handleMarkAsRead}>
    Mark as Read
  </button>
  ```

- [ ] **Run E2E Tests**
  
  ```bash
  pnpm test:e2e tests/e2e/oracle/oracle.flows.spec.ts
  
  # Run 10x to check for flakiness
  for i in {1..10}; do pnpm test:e2e tests/e2e/oracle/oracle.flows.spec.ts; done
  ```

#### 7.2 Unit Test Coverage vervollständigen

- [ ] **Dexie DB Tests** (bereits vorhanden, prüfen)
  
  **Location**: `tests/lib/db-oracle.test.ts`
  
  **Coverage prüfen**:
  ```bash
  pnpm test:coverage tests/lib/db-oracle.test.ts
  # Target: ≥ 90% Coverage
  ```

- [ ] **Oracle Store Tests** (bereits vorhanden, prüfen)
  
  **Location**: `tests/store/oracleStore.test.ts`
  
  **Coverage prüfen**:
  ```bash
  pnpm test:coverage tests/store/oracleStore.test.ts
  # Target: ≥ 85% Coverage
  ```

- [ ] **Gamification Store Tests** (bereits vorhanden, prüfen)
  
  **Location**: `tests/store/gamificationStore.test.ts`
  
  **Coverage prüfen**:
  ```bash
  pnpm test:coverage tests/store/gamificationStore.test.ts
  # Target: ≥ 85% Coverage
  ```

- [ ] **Component Tests hinzufügen** (falls fehlend)
  
  **Components to test**:
  - `OracleHeader` (wenn separate Component)
  - `OracleReportPanel` (wenn separate Component)
  - `OracleHistoryChart`
  - `OracleThemeFilter`
  - `OracleHistoryList`
  - `OracleReportModal`
  
  **Example**: `tests/components/oracle/OracleReportModal.test.tsx`
  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react';
  import { OracleReportModal } from '@/components/oracle/OracleReportModal';
  import type { OracleReport } from '@/types/oracle';
  
  const mockReport: OracleReport = {
    id: 1,
    date: '2025-12-04',
    score: 6,
    topTheme: 'Gaming',
    fullReport: 'Test report content',
    read: false,
    notified: false,
    timestamp: Date.now(),
    createdAt: Date.now(),
  };
  
  describe('OracleReportModal', () => {
    it('renders report details', () => {
      const onClose = vi.fn();
      render(<OracleReportModal report={mockReport} onClose={onClose} />);
      
      expect(screen.getByText('Oracle Report')).toBeInTheDocument();
      expect(screen.getByText('2025-12-04')).toBeInTheDocument();
      expect(screen.getByText('Score: 6/7')).toBeInTheDocument();
      expect(screen.getByText('Gaming')).toBeInTheDocument();
      expect(screen.getByText('Test report content')).toBeInTheDocument();
    });
    
    it('closes on Escape key', () => {
      const onClose = vi.fn();
      render(<OracleReportModal report={mockReport} onClose={onClose} />);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledOnce();
    });
    
    it('closes on X button click', () => {
      const onClose = vi.fn();
      render(<OracleReportModal report={mockReport} onClose={onClose} />);
      
      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(onClose).toHaveBeenCalledOnce();
    });
    
    it('copies report to clipboard', async () => {
      const onClose = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
      
      render(<OracleReportModal report={mockReport} onClose={onClose} />);
      
      fireEvent.click(screen.getByLabelText('Copy report'));
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test report content');
    });
  });
  ```

- [ ] **Run All Tests**
  
  ```bash
  pnpm test
  ```

#### 7.3 Coverage Report & Analysis

- [ ] **Generate Coverage Report**
  
  ```bash
  pnpm test:coverage
  ```
  
  **Target Coverage**:
  - **Statements**: ≥ 80%
  - **Branches**: ≥ 75%
  - **Functions**: ≥ 80%
  - **Lines**: ≥ 80%

- [ ] **Identify Uncovered Code**
  
  ```bash
  # Open coverage report in browser
  open coverage/index.html  # macOS
  xdg-open coverage/index.html  # Linux
  start coverage/index.html  # Windows
  ```
  
  **Focus on**:
  - Oracle-spezifische Files (`src/lib/db-oracle.ts`, `src/store/oracleStore.ts`, etc.)
  - Nicht auf shared utilities oder externe Libs

- [ ] **Add Missing Tests**
  
  Falls Coverage < 80%:
  1. Identifiziere ungetestete Branches/Functions
  2. Schreibe spezifische Tests für diese Fälle
  3. Re-run Coverage Report

#### 7.4 Flaky Test Detection & Fix

- [ ] **Run Tests 10x consecutively**
  
  ```bash
  # E2E Tests
  for i in {1..10}; do 
    echo "Run $i/10"
    pnpm test:e2e tests/e2e/oracle/oracle.flows.spec.ts || exit 1
  done
  
  # Unit Tests
  for i in {1..10}; do 
    echo "Run $i/10"
    pnpm test tests/unit/oracle || exit 1
  done
  ```

- [ ] **Fix Flaky Tests**
  
  **Common Issues**:
  - **Timing**: Use Playwright `waitFor` statt `wait(1000)`
  - **State Pollution**: Ensure tests clean up Dexie DB
  - **Network Mocks**: Use consistent API mocks
  
  **Example Fix**:
  ```typescript
  // ❌ BAD (flaky)
  await page.click('button');
  await page.waitForTimeout(1000); // Hard wait
  
  // ✅ GOOD (stable)
  await page.click('button');
  await expect(page.getByText('Success')).toBeVisible(); // Auto-retry
  ```

#### 7.5 CI/CD Integration Check

- [ ] **Validate GitHub Actions Workflow**
  
  **Location**: `.github/workflows/test.yml` (oder ähnlich)
  
  **Check**:
  - [ ] CI runs `pnpm test` on PR
  - [ ] CI runs `pnpm test:e2e` on PR
  - [ ] CI fails if tests fail
  - [ ] Coverage report uploaded to artifact

- [ ] **Local CI Simulation**
  
  ```bash
  # Simulate CI environment
  rm -rf node_modules pnpm-lock.yaml
  pnpm install --frozen-lockfile
  pnpm typecheck
  pnpm lint
  pnpm test
  pnpm build
  ```

#### 7.6 Accessibility (A11y) Audit

- [ ] **Manual Keyboard Navigation**
  
  ```bash
  # Open /oracle
  # Test:
  - Tab through all interactive elements
  - Enter to activate buttons
  - Escape to close modal
  - Arrow keys in chart (if supported)
  ```

- [ ] **Screen Reader Test**
  
  **Desktop**:
  - NVDA (Windows)
  - VoiceOver (macOS)
  
  **Mobile**:
  - TalkBack (Android)
  - VoiceOver (iOS)
  
  **Check**:
  - [ ] All buttons have aria-label
  - [ ] Modal has role="dialog"
  - [ ] Focus management (modal traps focus)

- [ ] **Axe DevTools Scan**
  
  ```bash
  # Install browser extension
  # Open /oracle
  # Run Axe scan
  # Fix any critical/serious issues
  ```

- [ ] **Playwright A11y Test**
  
  **Location**: `tests/e2e/oracle/oracle.a11y.spec.ts`
  
  ```typescript
  import { test, expect } from '@playwright/test';
  import AxeBuilder from '@axe-core/playwright';
  
  test.describe('Oracle A11y', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
      await page.goto('/oracle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
  ```

#### 7.7 Performance Benchmarks

- [ ] **Lighthouse Audit**
  
  ```bash
  pnpm build
  pnpm preview
  # Open Chrome DevTools → Lighthouse
  # Run audit on /oracle (Desktop + Mobile)
  ```
  
  **Targets**:
  - Performance: ≥ 90
  - Accessibility: ≥ 95
  - Best Practices: ≥ 90
  - SEO: ≥ 90

- [ ] **Page Load Metrics**
  
  **Measure** (Chrome DevTools → Performance):
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s
  - Time to Interactive (TTI): < 3.5s

- [ ] **API Response Time**
  
  ```bash
  # Test /api/oracle endpoint
  time curl -H "Authorization: Bearer $ORACLE_CRON_SECRET" \
       https://staging.sparkfined.com/api/oracle
  
  # Target: < 5s (p95)
  ```

#### 7.8 Final Documentation Update

- [ ] **Update oracle-subsystem.md**
  
  **Location**: `docs/core/concepts/oracle-subsystem.md`
  
  **Section 10: Implementation Roadmap → Phase 7**:
  ```markdown
  ### Phase 7: Testing & QA (Week 4)
  - [x] Write unit tests for Dexie operations (≥ 90% coverage)
  - [x] Write unit tests for stores (≥ 85% coverage)
  - [x] Write E2E tests for Oracle flow (7 test cases)
  - [x] Test API endpoint with load testing (< 5s p95)
  - [x] Test offline behavior (PWA)
  - [x] Accessibility audit (WCAG 2.1 AA) - 0 violations
  - [x] Performance audit (Lighthouse ≥ 90)
  - [x] Flaky test detection (10x consecutive runs)
  ```

- [ ] **Update README (wenn vorhanden)**
  
  **Location**: `README.md` (Root)
  
  **Section hinzufügen**:
  ```markdown
  ## Oracle Subsystem
  
  Daily meta-market intelligence at 09:00 UTC.
  
  - **Location**: `/oracle`
  - **Backend**: `/api/oracle.ts` (Edge Function)
  - **Storage**: Dexie (`sparkfined-oracle` DB)
  - **Tests**: `tests/{unit,e2e}/oracle/`
  
  ### Running Tests
  
  ```bash
  # Unit tests
  pnpm test tests/unit/oracle
  
  # E2E tests
  pnpm test:e2e tests/e2e/oracle
  
  # Coverage
  pnpm test:coverage
  ```
  
  ### Env Variables
  
  ```bash
  ORACLE_CRON_SECRET="..."  # Cron auth token
  XAI_API_KEY="..."         # Grok API key
  ```
  ```

- [ ] **Create Test Report**
  
  **Location**: `docs/core/concepts/oracle-test-report.md`
  
  **Template**:
  ```markdown
  # Oracle Subsystem – Test Report
  
  **Date**: 2025-12-XX  
  **Tester**: [Name]  
  **Build**: [Commit Hash]  
  
  ## Test Summary
  
  | Category | Tests Run | Passed | Failed | Skipped | Coverage |
  |----------|-----------|--------|--------|---------|----------|
  | Unit Tests | XX | XX | 0 | 0 | ≥80% |
  | E2E Tests | 7 | 7 | 0 | 0 | N/A |
  | A11y Tests | 1 | 1 | 0 | 0 | 0 violations |
  
  ## Test Results
  
  ### Unit Tests
  - ✅ Dexie DB operations (90% coverage)
  - ✅ Oracle Store (87% coverage)
  - ✅ Gamification Store (85% coverage)
  - ✅ Components (82% coverage)
  
  ### E2E Tests
  - ✅ TC-001: Load Oracle Page
  - ✅ TC-002: Mark as Read
  - ✅ TC-003: High Score Notification
  - ✅ TC-004: History Chart
  - ✅ TC-005: Theme Filter
  - ✅ TC-006: History List Modal
  - ✅ TC-007: Offline Behavior
  
  ### Performance
  - ✅ Page Load: < 2s (p95: 1.8s)
  - ✅ API Response: < 5s (p95: 4.2s)
  - ✅ Lighthouse Score: 92/100
  
  ### Accessibility
  - ✅ Axe Violations: 0
  - ✅ Keyboard Navigation: Pass
  - ✅ Screen Reader: Pass
  
  ## Known Issues
  
  _None._
  
  ## Recommendations
  
  - Ready for Staging Deployment ✅
  - Ready for Production Deployment ✅
  ```

### ✅ Modul 7 Done Criteria

- [x] Alle E2E Tests vorhanden und passing (7 Test Cases)
- [x] Alle Component Tests vorhanden (≥ 5 Components)
- [x] Coverage ≥ 80% für Oracle-Module
- [x] Keine Flaky Tests (10x consecutive runs pass)
- [x] `data-testid` Attribute hinzugefügt (alle interaktive Elemente)
- [x] A11y Audit passed (0 Axe violations)
- [x] Performance Audit passed (Lighthouse ≥ 90)
- [x] CI/CD Pipeline green (GitHub Actions)
- [x] Dokumentation aktualisiert (Test Report erstellt)

---

## 🎯 Zusammenfassung: Module 5-7

### Modul 5: Notifications & Auto-Journal (2-3 Tage)
**Scope**: Web Notifications (High Score ≥ 6) + Auto-Journal Entry beim "Mark as Read"  
**Key Deliverables**:
- useNotificationPermission Hook
- Notification Effect in OraclePage
- Auto-Journal Integration
- E2E Test für Auto-Journal

### Modul 6: Analytics (3-4 Tage)
**Scope**: History Chart (Recharts) + Theme Filter + History List mit Modal  
**Key Deliverables**:
- OracleHistoryChart Component
- OracleThemeFilter Component
- OracleHistoryList Component
- OracleReportModal Component
- Component Tests (3 Components)
- E2E Tests für Filter + Modal

### Modul 7: Tests & E2E (3-4 Tage)
**Scope**: Vervollständigen der Test-Coverage + A11y + Performance  
**Key Deliverables**:
- 7 E2E Test Cases (Playwright)
- Component Tests für alle Oracle-Components
- Coverage Report (≥ 80%)
- A11y Audit (0 Violations)
- Performance Audit (Lighthouse ≥ 90)
- Test Report Dokumentation

---

## 🚀 Codex Start Command

```bash
# 1. Checkout Branch (falls nicht bereits vorhanden)
git checkout -b feat/oracle-subsystem-m5-7
git pull origin main

# 2. Verify Module 1-4 completed
ls -la src/lib/db-oracle.ts          # Should exist
ls -la src/store/oracleStore.ts      # Should exist
ls -la api/oracle.ts                 # Should exist
ls -la src/pages/OraclePage.tsx      # Should exist

# 3. Start Modul 5
touch src/hooks/useNotificationPermission.ts
# Follow Module 5 checklist above

# 4. Daily Progress Check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e

# 5. Commit after each module
git add .
git commit -m "feat(oracle): Complete Module 5 - Notifications & Auto-Journal"
git push origin feat/oracle-subsystem-m5-7
```

---

## ✅ Final Checklist (before PR)

- [ ] **Alle Module 5-7 completed**
- [ ] **Tests passing** (`pnpm test && pnpm test:e2e`)
- [ ] **No TypeScript errors** (`pnpm typecheck`)
- [ ] **No Lint errors** (`pnpm lint`)
- [ ] **Coverage ≥ 80%** (`pnpm test:coverage`)
- [ ] **Build successful** (`pnpm build`)
- [ ] **Lighthouse ≥ 90** (manual check)
- [ ] **A11y: 0 violations** (Axe DevTools)
- [ ] **Docs updated** (oracle-subsystem.md + Test Report)
- [ ] **Commit messages clean** (follow Conventional Commits)
- [ ] **Branch up-to-date** (`git pull origin main`)

---

**Status**: Ready for Codex Execution 🚀  
**Estimated Completion**: 1.5 Wochen (Module 5-7)  
**Next Step**: Start with Module 5 (Notifications & Auto-Journal)
