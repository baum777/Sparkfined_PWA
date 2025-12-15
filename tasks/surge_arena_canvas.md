# Surge Arena Implementation Canvas

**Project:** Sparkfined Landing Page  
**Feature:** Surge Arena Mechanics Sections  
**Version:** 1.0  
**Date:** December 2025

---

## 🎯 Objective

Integrate 3 key sections from the Pre-High Surge Arena mechanics documentation into the existing sparkfined.xyz landing page. Create visually engaging, on-brand components that explain complex tokenomics in an accessible way.

---

## 📋 Overview

### Sections to Implement

1. **System Overview** - The 3 Pillars + Flywheel dynamics
2. **Pool & Boost** - Reserve Pool Engine + Dynamic Boost Engine (combined)
3. **Arena Cycle** - Weekly timeline from Monday to Sunday

### Integration Approach

- Create new component directory: `src/components/surgearena/`
- Create data file: `src/data/surgearena.ts`
- Components can be integrated into existing `LandingPage.tsx` or as separate `/surge-arena` route
- Match existing Design System v1.0 (alchemical colors, Space Grotesk, spacing)

---

## 🎨 Design System Reference

### Colors (from existing design-tokens.css)

```css
/* Primary Colors */
--color-void: #0A0A0A;           /* Background */
--color-spark: #00F0FF;          /* Cyan - primary brand */
--color-smoke: #2A2A2A;          /* Container backgrounds */
--color-mist: #FFFFFF;           /* Text */

/* Semantic Colors */
--color-blood: #FF006E;          /* Danger/loss */
--color-gold: #FFB800;           /* Warning/opportunities */
--color-phosphor: #39FF14;       /* Success/confirmation */
--color-violet: #9D4EDD;         /* Mystical/mastery */
```

### Typography

- **Display/Headings:** Space Grotesk (bold, distinctive)
- **Body Text:** Inter (readable, clean)
- **Data/Numbers:** JetBrains Mono (monospaced)

### Spacing Scale (8px-based)

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 48px
--space-10: 80px
--space-12: 96px
```

### Existing Component Patterns

From `HeroSection.tsx` and `JournalSolution.tsx`:
- Use `<SectionShell id="...">` wrapper for sections
- Use `<ModuleHeading title="..." subtitle="..." />` for section headers
- Use `<Card variant="elevated|outlined" padding="lg">` for content blocks
- Use `<StatCard>` for metrics/numbers
- Use `<Button variant="primary|secondary">` for CTAs

---

## 📁 File Structure

```
src/
├── components/
│   └── surgearena/
│       ├── SurgeOverview.tsx        # System Overview + 3 Pillars + Flywheel
│       ├── PoolAndBoost.tsx         # Reserve Pool + Dynamic Boost (combined)
│       └── ArenaCycle.tsx           # Weekly Timeline
├── data/
│   └── surgearena.ts                # All content data (export 3 objects)
└── pages/
    └── LandingPage.tsx              # Integration point (or new SurgeArenaPage.tsx)
```

---

## 🔧 Component Specifications

### 1. SurgeOverview.tsx

**Purpose:** Explain the three interconnected pillars and flywheel dynamics

**Layout:**
```
+------------------------------------------+
|        [Title: The Surge Arena]          |
|     [Subtitle: Self-Reinforcing...]      |
+------------------------------------------+
|                                          |
|  [Pillar 1]  [Pillar 2]  [Pillar 3]    | ← 3-column grid on desktop
|  Reserve     Dynamic     Lock           |   Stack on mobile
|  Pool        Boost       Incentives     |
|                                          |
+------------------------------------------+
|       [Flywheel Dynamics Section]        |
|                                          |
|  "How the Flywheel Works"               |
|  → Users lock SPARK...                   |
|  → Higher boost...                       |
|  → More launches...                      |
|  → Platform growth...                    |
|  → Cycle reinforces...                   |
|                                          |
+------------------------------------------+
```

**Component Structure:**

```typescript
// src/components/surgearena/SurgeOverview.tsx

import { surgeOverviewContent } from '../../data/surgearena';
import ModuleHeading from '../shared/ModuleHeading';
import Card from '../shared/Card';
import SectionShell from '../shared/SectionShell';

export default function SurgeOverview() {
  return (
    <SectionShell id="surge-overview">
      <ModuleHeading 
        title={surgeOverviewContent.title}
        subtitle={surgeOverviewContent.subtitle}
      />
      
      {/* Three Pillars Grid */}
      <div className="pillars-grid">
        {surgeOverviewContent.pillars.map((pillar) => (
          <Card key={pillar.number} variant="elevated" padding="lg">
            <div className="pillar-number">{pillar.number}</div>
            <h3>{pillar.title}</h3>
            <p className="muted">{pillar.description}</p>
          </Card>
        ))}
      </div>

      {/* Flywheel Section */}
      <Card variant="outlined" padding="lg" className="flywheel-card">
        <h3>{surgeOverviewContent.flywheel.title}</h3>
        <ul className="flywheel-steps">
          {surgeOverviewContent.flywheel.steps.map((step, i) => (
            <li key={i}>
              <span className="step-arrow">→</span>
              {step}
            </li>
          ))}
        </ul>
      </Card>
    </SectionShell>
  );
}
```

**Styling Specs:**

```css
/* Add to src/styles/surgearena.css or global.css */

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.pillar-number {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-spark);
  margin-bottom: var(--space-2);
}

.flywheel-card {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(157, 78, 221, 0.05));
  border: 1px solid var(--color-spark);
}

.flywheel-steps {
  list-style: none;
  padding: 0;
  margin: var(--space-4) 0 0 0;
}

.flywheel-steps li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-smoke);
}

.flywheel-steps li:last-child {
  border-bottom: none;
}

.step-arrow {
  color: var(--color-spark);
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}
```

---

### 2. PoolAndBoost.tsx

**Purpose:** Explain Reserve Pool + Dynamic Boost engines (combined in one component)

**Layout:**
```
+------------------------------------------+
|    [Reserve Pool Engine Section]         |
|                                          |
|  [Description text]                      |
|                                          |
|  [Revenue Stream 1]  [Revenue Stream 2] | ← 2-column grid
|  Daily Lock          Launch Fee         |
|  0.02%-0.10%         3%-5%              |
|                                          |
|  Key Mechanics:                          |
|  • Block-based calculation               |
|  • No token transfer                     |
|  • etc...                                |
|                                          |
|  [Parameters Table]                      |
|                                          |
+------------------------------------------+
|    [Dynamic Boost Engine Section]        |
|                                          |
|  [Description text]                      |
|                                          |
|  [Formula Visualization]                 |
|  Base: 10% + Dynamic: +2% + Journal: +2%|
|  Max Total: 14%                          |
|                                          |
|  [Scaling Examples Table]                |
|  Locked SPARK | Dynamic | Total Boost   |
|  1M           | +0.04%  | 10.04%        |
|  5M           | +0.20%  | 10.20%        |
|  etc...                                  |
|                                          |
|  [Snapshot Timing Details]               |
|                                          |
+------------------------------------------+
```

**Component Structure:**

```typescript
// src/components/surgearena/PoolAndBoost.tsx

import { poolBoostContent } from '../../data/surgearena';
import ModuleHeading from '../shared/ModuleHeading';
import Card from '../shared/Card';
import SectionShell from '../shared/SectionShell';
import StatCard from '../shared/StatCard';

export default function PoolAndBoost() {
  const { pool, boost } = poolBoostContent;

  return (
    <SectionShell id="pool-and-boost">
      {/* Reserve Pool Section */}
      <ModuleHeading 
        title={pool.title}
        subtitle={pool.subtitle}
      />
      <p className="body-large" style={{ marginBottom: 'var(--space-6)' }}>
        {pool.description}
      </p>

      {/* Revenue Streams Grid */}
      <div className="revenue-streams-grid">
        {pool.revenueStreams.map((stream) => (
          <Card 
            key={stream.title} 
            variant="elevated" 
            padding="lg"
            className={`stream-card stream-${stream.color}`}
          >
            <h4>{stream.title}</h4>
            <div className="stream-range">{stream.range}</div>
            <p className="muted">{stream.detail}</p>
          </Card>
        ))}
      </div>

      {/* Key Mechanics */}
      <Card variant="outlined" padding="lg">
        <h4>Key Mechanics</h4>
        <ul className="bullet-list">
          {pool.keyMechanics.map((mechanic) => (
            <li key={mechanic}>{mechanic}</li>
          ))}
        </ul>
      </Card>

      {/* Parameters Table */}
      <Card variant="elevated" padding="lg">
        <h4>Parameters</h4>
        <div className="params-grid">
          {pool.parameters.map((param) => (
            <div key={param.label} className="param-row">
              <span className="param-label">{param.label}</span>
              <span className="param-value">{param.value}</span>
              <span className="param-note muted">{param.note}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Divider */}
      <div className="section-divider" />

      {/* Dynamic Boost Section */}
      <ModuleHeading 
        title={boost.title}
        subtitle={boost.subtitle}
      />
      <p className="body-large" style={{ marginBottom: 'var(--space-6)' }}>
        {boost.description}
      </p>

      {/* Formula Visualization */}
      <Card variant="elevated" padding="lg" className="formula-card">
        <h4>Boost Formula</h4>
        <div className="formula-breakdown">
          <div className="formula-component">
            <span className="formula-value">{boost.formula.base}</span>
            <span className="formula-label">Base Boost</span>
          </div>
          <span className="formula-operator">+</span>
          <div className="formula-component">
            <span className="formula-value">{boost.formula.maxDynamic}</span>
            <span className="formula-label">Max Dynamic</span>
          </div>
          <span className="formula-operator">+</span>
          <div className="formula-component">
            <span className="formula-value">{boost.formula.journalBonus}</span>
            <span className="formula-label">Journal Bonus</span>
          </div>
          <span className="formula-operator">=</span>
          <div className="formula-component formula-total">
            <span className="formula-value">{boost.formula.maxTotal}</span>
            <span className="formula-label">Max Total</span>
          </div>
        </div>
        <pre className="formula-calculation">{boost.formula.calculation}</pre>
      </Card>

      {/* Scaling Examples */}
      <Card variant="outlined" padding="lg">
        <h4>Scaling Examples</h4>
        <div className="scaling-table">
          <div className="table-header">
            <span>Total Locked SPARK</span>
            <span>Dynamic</span>
            <span>Total Boost</span>
          </div>
          {boost.scalingExamples.map((example) => (
            <div key={example.locked} className="table-row">
              <span className="mono">{example.locked}</span>
              <span className="mono">{example.dynamic}</span>
              <span className="mono highlight">{example.total}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Snapshot Timing */}
      <Card variant="elevated" padding="lg">
        <h4>Snapshot Timing</h4>
        <ul className="bullet-list">
          {boost.snapshot.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </SectionShell>
  );
}
```

**Styling Specs:**

```css
/* Add to src/styles/surgearena.css */

.revenue-streams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.stream-card {
  border-left: 4px solid;
}

.stream-card.stream-spark {
  border-left-color: var(--color-spark);
}

.stream-card.stream-gold {
  border-left-color: var(--color-gold);
}

.stream-range {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-spark);
  margin: var(--space-2) 0;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-spark), transparent);
  margin: var(--space-10) 0;
}

.formula-card {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(157, 78, 221, 0.08));
}

.formula-breakdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}

.formula-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.formula-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-spark);
}

.formula-total .formula-value {
  color: var(--color-phosphor);
  font-size: 3rem;
}

.formula-label {
  font-size: 0.875rem;
  color: var(--color-mist);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.formula-operator {
  font-size: 2rem;
  color: var(--color-mist);
  opacity: 0.5;
}

.formula-calculation {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  background: var(--color-void);
  padding: var(--space-4);
  border-radius: 8px;
  border: 1px solid var(--color-smoke);
  overflow-x: auto;
  white-space: pre-wrap;
}

.params-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.param-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-4);
  padding: var(--space-3);
  background: var(--color-void);
  border-radius: 4px;
}

.param-label {
  font-weight: 600;
}

.param-value {
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-spark);
}

.scaling-table {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-4);
  padding: var(--space-3);
}

.table-header {
  font-weight: 700;
  color: var(--color-spark);
  border-bottom: 2px solid var(--color-spark);
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
}

.table-row {
  background: var(--color-void);
  border-radius: 4px;
  transition: background 0.2s;
}

.table-row:hover {
  background: var(--color-smoke);
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}

.highlight {
  color: var(--color-phosphor);
  font-weight: 700;
}
```

---

### 3. ArenaCycle.tsx

**Purpose:** Visualize the weekly timeline from Monday to Sunday

**Layout:**
```
+------------------------------------------+
|        [Title: Weekly Arena Cycle]       |
|        [Subtitle: Monday to Sunday]      |
+------------------------------------------+
|                                          |
|  [Description paragraph]                 |
|                                          |
|  [Timeline Visualization]                |
|                                          |
|  Phase 1: Submissions                    |
|  Mon 00:00 – Sun 23:59                   |
|  ─────────────────────────────           |
|                                          |
|  Phase 2: Voting                         |
|  Mon 00:00 – Sun 23:59                   |
|  ─────────────────────────────           |
|                                          |
|  Phase 3: Tally                          |
|  Sunday 23:59 UTC                        |
|  ───                                     |
|                                          |
|  Phase 4: Boost Active                   |
|  14 days from tally                      |
|  ──────────────────────────────────────  |
|                                          |
|  Phase 5: Boost Expiry                   |
|  Day 15                                  |
|  ×                                       |
|                                          |
+------------------------------------------+
|       [Placement Rewards Cards]          |
|                                          |
|  [1st Place]  [2nd Place]  [3rd Place]  | ← 3-column grid
|  10-14%       5%           3%           |
|  Champion     Runner-up    Bronze       |
|                                          |
+------------------------------------------+
|       [Submission Requirements]          |
|                                          |
|  What to submit:                         |
|  • Token name and ticker                 |
|  • Short pitch (1-2 sentences)           |
|  • Optional: Journal link (+2% bonus)    |
|                                          |
+------------------------------------------+
```

**Component Structure:**

```typescript
// src/components/surgearena/ArenaCycle.tsx

import { arenaCycleContent } from '../../data/surgearena';
import ModuleHeading from '../shared/ModuleHeading';
import Card from '../shared/Card';
import SectionShell from '../shared/SectionShell';

export default function ArenaCycle() {
  return (
    <SectionShell id="arena-cycle">
      <ModuleHeading 
        title={arenaCycleContent.title}
        subtitle={arenaCycleContent.subtitle}
      />
      <p className="body-large" style={{ marginBottom: 'var(--space-8)' }}>
        {arenaCycleContent.description}
      </p>

      {/* Timeline Visualization */}
      <Card variant="elevated" padding="lg" className="timeline-card">
        <h4>Weekly Timeline</h4>
        <div className="timeline">
          {arenaCycleContent.timeline.map((phase, index) => (
            <div key={phase.phase} className={`timeline-phase phase-${phase.color}`}>
              <div className="phase-header">
                <span className="phase-number">{index + 1}</span>
                <div>
                  <h5 className="phase-name">{phase.phase}</h5>
                  <span className="phase-timing">{phase.timing}</span>
                </div>
              </div>
              <p className="phase-description muted">{phase.description}</p>
              <div className={`phase-bar phase-bar-${phase.color}`} />
            </div>
          ))}
        </div>
      </Card>

      {/* Placement Rewards */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Placement Rewards</h3>
        <div className="rewards-grid">
          {arenaCycleContent.rewards.map((reward) => (
            <Card 
              key={reward.placement} 
              variant="elevated" 
              padding="lg"
              className={`reward-card reward-${reward.placement}`}
            >
              <div className="reward-badge">{reward.badge}</div>
              <h4>{reward.placement}</h4>
              <div className="reward-boost">{reward.boost}</div>
              <p className="muted">{reward.note}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Submission Requirements */}
      <Card variant="outlined" padding="lg" style={{ marginTop: 'var(--space-8)' }}>
        <h4>Submission Contents</h4>
        <ul className="bullet-list">
          {arenaCycleContent.submissionContents.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </SectionShell>
  );
}
```

**Styling Specs:**

```css
/* Add to src/styles/surgearena.css */

.timeline-card {
  background: linear-gradient(180deg, rgba(0, 240, 255, 0.03), rgba(157, 78, 221, 0.03));
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.timeline-phase {
  position: relative;
  padding: var(--space-4);
  background: var(--color-void);
  border-radius: 8px;
  border-left: 4px solid;
}

.phase-spark { border-left-color: var(--color-spark); }
.phase-violet { border-left-color: var(--color-violet); }
.phase-gold { border-left-color: var(--color-gold); }
.phase-phosphor { border-left-color: var(--color-phosphor); }
.phase-blood { border-left-color: var(--color-blood); }

.phase-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.phase-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-spark);
  color: var(--color-void);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.phase-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.phase-timing {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: var(--color-spark);
}

.phase-description {
  margin: var(--space-2) 0 var(--space-4) 0;
  padding-left: calc(40px + var(--space-3));
}

.phase-bar {
  height: 8px;
  border-radius: 4px;
  margin-left: calc(40px + var(--space-3));
  position: relative;
  overflow: hidden;
}

.phase-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    currentColor 50%, 
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

.phase-bar-spark { background: var(--color-spark); color: var(--color-spark); }
.phase-bar-violet { background: var(--color-violet); color: var(--color-violet); }
.phase-bar-gold { background: var(--color-gold); color: var(--color-gold); }
.phase-bar-phosphor { background: var(--color-phosphor); color: var(--color-phosphor); }
.phase-bar-blood { background: var(--color-blood); color: var(--color-blood); }

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-6);
}

.reward-card {
  text-align: center;
  position: relative;
  border: 2px solid transparent;
  transition: border-color 0.3s, transform 0.3s;
}

.reward-card:hover {
  transform: translateY(-4px);
}

.reward-card.reward-1st {
  border-color: var(--color-phosphor);
}

.reward-card.reward-2nd {
  border-color: var(--color-gold);
}

.reward-card.reward-3rd {
  border-color: var(--color-spark);
}

.reward-badge {
  font-size: 3rem;
  margin-bottom: var(--space-2);
}

.reward-boost {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-phosphor);
  margin: var(--space-2) 0;
}

.reward-card.reward-2nd .reward-boost {
  color: var(--color-gold);
}

.reward-card.reward-3rd .reward-boost {
  color: var(--color-spark);
}
```

---

## 📝 Data File Structure

```typescript
// src/data/surgearena.ts

/**
 * Surge Arena Content Data
 * Content for Surge Arena mechanics sections
 */

export const surgeOverviewContent = {
  title: "The Surge Arena",
  subtitle: "A Self-Reinforcing Flywheel",
  pillars: [
    {
      number: "1",
      title: "Reserve Pool",
      description: "Finances weekly boosts through lock contributions and launch fees",
    },
    {
      number: "2",
      title: "Dynamic Boost",
      description: "Scales boost percentage based on total locked SPARK",
    },
    {
      number: "3",
      title: "Lock Incentives",
      description: "Rewards early supporters with NFTs and permanent access",
    }
  ],
  flywheel: {
    title: "How the Flywheel Works",
    steps: [
      "Users lock SPARK → Pool contributions + higher Dynamic Boost",
      "Higher boost → More attractive arena → More project submissions",
      "More launches → More fee revenue → Larger Reserve Pool",
      "Platform growth → Increased NFT value → More Fixed Lock demand",
      "Cycle reinforces itself with each iteration"
    ]
  }
};

export const poolBoostContent = {
  pool: {
    title: "Reserve Pool Engine",
    subtitle: "Sustainable Boost Financing",
    description: "The Reserve Pool finances all weekly Surge Boosts. It fills continuously through two revenue streams: daily lock contributions and launch fee allocations.",
    revenueStreams: [
      {
        title: "Daily Lock Contributions",
        range: "0.02% – 0.10%",
        detail: "per day of all locked SPARK (virtual weight)",
        color: "spark"
      },
      {
        title: "Launch Fee Allocation",
        range: "3% – 5%",
        detail: "of each project launch fee flows to pool",
        color: "gold"
      }
    ],
    keyMechanics: [
      "Calculation is block-based, not timestamp-based",
      "No actual token transfer from user - only virtual economic weight",
      "Contribution stops immediately upon unlock",
      "Pool funds weekly champion boosts and runner-up rewards"
    ],
    parameters: [
      { label: "Daily Rate", value: "0.02% – 0.10%", note: "Governance adjustable" },
      { label: "Launch Fee %", value: "3% – 5%", note: "Per launch" },
      { label: "Calculation", value: "Block-based", note: "Not timestamps" },
      { label: "User Deduction", value: "None", note: "Virtual weight only" }
    ]
  },
  boost: {
    title: "Dynamic Boost Engine",
    subtitle: "Community-Scaled Rewards",
    description: "The weekly boost percentage adapts to community activity. More locked SPARK means higher boosts, creating direct correlation between engagement and arena value.",
    formula: {
      base: "10%",
      maxDynamic: "+2%",
      journalBonus: "+2%",
      maxTotal: "14%",
      calculation: "Boost% = BaseBoost + DynamicBoost\nDynamicBoost = (TotalLockedSPARK / 5,000,000) × 0.2% [capped at 2%]"
    },
    scalingExamples: [
      { locked: "1,000,000", dynamic: "+0.04%", total: "10.04%" },
      { locked: "5,000,000", dynamic: "+0.20%", total: "10.20%" },
      { locked: "25,000,000", dynamic: "+1.00%", total: "11.00%" },
      { locked: "50,000,000+", dynamic: "+2.00%", total: "12.00% (cap)" }
    ],
    snapshot: [
      "Snapshot occurs every Sunday at 23:59 UTC",
      "Locked amount at snapshot determines next week's boost",
      "Boost value becomes immutable after snapshot",
      "Journal bonus verified at winner announcement"
    ]
  }
};

export const arenaCycleContent = {
  title: "Weekly Arena Cycle",
  subtitle: "Monday to Sunday UTC",
  description: "The arena operates on a weekly cycle from Monday 00:00 UTC to Sunday 23:59 UTC. Submissions and voting run parallel throughout the week.",
  timeline: [
    {
      phase: "Submissions",
      timing: "Mon 00:00 – Sun 23:59",
      description: "Projects submit continuously",
      color: "spark"
    },
    {
      phase: "Voting",
      timing: "Mon 00:00 – Sun 23:59",
      description: "Eligible wallets cast votes",
      color: "violet"
    },
    {
      phase: "Tally",
      timing: "Sunday 23:59 UTC",
      description: "Winners determined",
      color: "gold"
    },
    {
      phase: "Boost Active",
      timing: "14 days from tally",
      description: "Winners must launch",
      color: "phosphor"
    },
    {
      phase: "Boost Expiry",
      timing: "Day 15",
      description: "Unused boost forfeited",
      color: "blood"
    }
  ],
  rewards: [
    {
      placement: "1st Place",
      badge: "🏆",
      boost: "10% – 14%",
      note: "Full Dynamic Boost"
    },
    {
      placement: "2nd Place",
      badge: "🥈",
      boost: "5%",
      note: "Fixed boost"
    },
    {
      placement: "3rd Place",
      badge: "🥉",
      boost: "3%",
      note: "Fixed boost"
    }
  ],
  submissionContents: [
    "Token name and ticker symbol",
    "Short pitch text (1-2 sentences)",
    "Optional: Sparkfined Journal link (+2% bonus if verified)"
  ]
};
```

---

## 🔗 Integration Steps

### Option A: Add to Existing Landing Page

In `src/pages/LandingPage.tsx`:

```typescript
import SurgeOverview from '../components/surgearena/SurgeOverview';
import PoolAndBoost from '../components/surgearena/PoolAndBoost';
import ArenaCycle from '../components/surgearena/ArenaCycle';

export default function LandingPage() {
  return (
    <>
      {/* Existing sections... */}
      <HeroSection />
      <WoundsSection />
      <JourneySection />
      
      {/* New Surge Arena sections */}
      <SurgeOverview />
      <PoolAndBoost />
      <ArenaCycle />
      
      {/* Existing sections continue... */}
      <TransformationSection />
      <VoicesSection />
      <FinalCTA />
    </>
  );
}
```

### Option B: Create Separate Surge Arena Page

Create `src/pages/SurgeArenaPage.tsx`:

```typescript
import SurgeOverview from '../components/surgearena/SurgeOverview';
import PoolAndBoost from '../components/surgearena/PoolAndBoost';
import ArenaCycle from '../components/surgearena/ArenaCycle';

export default function SurgeArenaPage() {
  return (
    <main className="surge-arena-page">
      <SurgeOverview />
      <PoolAndBoost />
      <ArenaCycle />
    </main>
  );
}
```

Then add route in your router setup.

---

## ✅ Checklist

### Files to Create

- [ ] `src/components/surgearena/SurgeOverview.tsx`
- [ ] `src/components/surgearena/PoolAndBoost.tsx`
- [ ] `src/components/surgearena/ArenaCycle.tsx`
- [ ] `src/data/surgearena.ts`
- [ ] `src/styles/surgearena.css` (or add to existing `global.css`)

### Integration

- [ ] Import components into `LandingPage.tsx` or create `SurgeArenaPage.tsx`
- [ ] Import new CSS file in main stylesheet
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Verify color scheme matches Design System v1.0
- [ ] Test animations and hover states
- [ ] Run `npm run lint` and `npm run build`

### Content Verification

- [ ] All numbers match source document (PDF)
- [ ] Formulas are correctly displayed
- [ ] Timeline phases are accurate
- [ ] Reward percentages are correct

---

## 🎨 Visual Guidelines

### Card Styling
- Use elevated cards for primary content blocks
- Use outlined cards for secondary/list content
- Add colored left borders to highlight category
- Include hover states for interactivity

### Typography Hierarchy
- Section titles: Space Grotesk, 2.5-3rem, bold
- Subsections: Space Grotesk, 1.5-2rem, semi-bold
- Body text: Inter, 1rem, regular
- Data/numbers: JetBrains Mono, colored (Spark/Gold/Phosphor)

### Spacing
- Section padding: `var(--space-12)` top/bottom
- Card gaps: `var(--space-6)` or `var(--space-8)`
- Internal card padding: `var(--space-4)` or `var(--space-6)`

### Color Usage
- Primary accent: Spark (cyan) for interactive elements
- Secondary: Gold for warnings/opportunities
- Success: Phosphor (green) for positive outcomes
- Mystical: Violet for advanced features
- Danger: Blood for expiry/limitations

---

## 📱 Responsive Behavior

### Desktop (>1024px)
- 3-column grids for pillars and rewards
- 2-column for revenue streams
- Full timeline with visual bars

### Tablet (768-1024px)
- 2-column grids
- Stacked timeline with reduced spacing

### Mobile (<768px)
- Single column throughout
- Reduced font sizes (maintain hierarchy)
- Simplified formula visualization (stack instead of inline)
- Touch-friendly spacing (minimum 48px tap targets)

---

## 🚀 Performance Considerations

- Keep component bundle size minimal (no heavy dependencies)
- Use CSS animations (not JS) where possible
- Lazy load if not above the fold
- Optimize any imported icons/graphics

---

## 🧪 Testing Checklist

- [ ] Visual regression test against Design System
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing (iOS Safari, Chrome Mobile)
- [ ] Accessibility audit (keyboard navigation, screen readers)
- [ ] Performance test (Lighthouse score maintenance)

---

## 📚 Reference Documents

- Source: `Pre-High_Surge_Arena_Mechanics.pdf`
- Design System: `src/styles/design-tokens.css`
- Existing patterns: `src/components/landing/HeroSection.tsx`
- Existing patterns: `src/components/landing/JournalSolution.tsx`

---

## 💡 Implementation Notes

1. **Component Reusability**: All components use existing shared components (`Card`, `ModuleHeading`, `SectionShell`, etc.)

2. **Data Separation**: All content is in `surgearena.ts` for easy updates without touching component code

3. **Styling Isolation**: New styles in `surgearena.css` won't conflict with existing styles

4. **Maintainability**: Clear structure makes it easy to add more sections later (Lock System, NFTs, Voting, etc.)

5. **Brand Consistency**: Uses exact Design System v1.0 colors and typography

---

## 🎯 Success Criteria

✅ Components render correctly on all screen sizes  
✅ Matches existing landing page visual style  
✅ All data from PDF is accurately represented  
✅ Animations enhance without distracting  
✅ No regression in Lighthouse score  
✅ Code passes linting and type checks  
✅ Components are easily maintainable and extendable  

---

**Ready to implement?** Follow the file structure, copy the component code, add the styles, and integrate into your landing page. All components are designed to work independently and can be developed/tested in isolation.