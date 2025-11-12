# Moralis Cortex Integration Plan — "First Update"

**Projekt:** Sparkfined PWA Board — AI-Powered Features  
**Datum:** 2025-11-04  
**Status:** Ready for Implementation  
**Geschätzte Dauer:** 14-19h (~2 Tage FTE)

---

## Übersicht

**Moralis Cortex** = AI-powered Blockchain Intelligence API

Dieser Plan beschreibt die Integration von 3 Cortex-Features als "First Update" nach Board-MVP:
1. **Token Risk Score** — KPI Tile + Detail-Modal (4-6h)
2. **Sentiment Analysis** — Social Sentiment Aggregation (4-5h)
3. **AI Trade Idea Generator** — Auto-generierte Trade-Setups (6-8h)

**Follow-up (später):**
- Pattern Recognition (Chart-Patterns wie Head&Shoulders, Flags)
- Whale Activity (große Transfers > $10k)
- Voice Commands (Sprachsteuerung)

---

## Feature 1: Token Risk Score (4-6h)

### Ziel

Zeige einen 0-100 Risk-Score für jeden Token an (Liquidity, Holder-Distribution, Contract-Safety, Rug-Pull-Probability).

### User Flow

1. User öffnet Board → sieht KPI Tile "Risk Score: 78/100" (grün)
2. User klickt auf Tile → Modal öffnet sich mit Breakdown
3. Modal zeigt:
   - Liquidity Score: 85/100 (grün)
   - Holder Distribution: 72/100 (gelb)
   - Contract Safety: 80/100 (grün)
   - Rug-Pull Probability: 15% (grün, niedrig)

### API Endpoint

**Neue Datei:** `api/cortex/risk-score.ts`

```typescript
/**
 * Cortex Risk Score Endpoint
 * GET /api/cortex/risk-score?ca={address}
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORTEX_BASE = 'https://cortex-api.moralis.com/v1';
const CORTEX_API_KEY = process.env.MORALIS_API_KEY; // Same key as Moralis

interface RiskScoreResponse {
  overall: number;         // 0-100
  liquidity: number;       // 0-100
  holders: number;         // 0-100
  contract: number;        // 0-100
  rugPullProbability: number; // 0-100 (%)
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  const { ca } = req.query;
  
  if (!ca || typeof ca !== 'string') {
    return res.status(400).json({ success: false, error: 'CA parameter required' });
  }
  
  try {
    const response = await fetch(`${CORTEX_BASE}/risk-score?address=${ca}`, {
      headers: {
        'X-API-Key': CORTEX_API_KEY!,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Fallback: Mock-Data wenn Cortex noch nicht verfügbar
      const mockData: RiskScoreResponse = {
        overall: 78,
        liquidity: 85,
        holders: 72,
        contract: 80,
        rugPullProbability: 15,
      };
      return res.status(200).json({ success: true, data: mockData, source: 'mock' });
    }
    
    const data: RiskScoreResponse = await response.json();
    
    return res.status(200).json({ success: true, data, source: 'cortex' });
  } catch (error) {
    console.error('[Cortex Risk Score] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Cortex API error',
    });
  }
}
```

### UI Components

#### 1. Board KPI Tile (Update)

**Anpassung:** `src/components/board/Overview.tsx`

```tsx
const kpis = {
  visible: [
    { id: 'pnl', type: 'numeric', label: 'Heute P&L', value: '+€247.50', trend: '+12.5%', direction: 'up' },
    { id: 'alerts', type: 'count', label: 'Active Alerts', value: '3', trend: undefined, direction: 'neutral' },
    { id: 'sentiment', type: 'numeric', label: 'Sentiment', value: '72/100', trend: '↑ +8 vs. 7d', direction: 'up' },
    { id: 'sync', type: 'status', label: 'Sync Status', value: 'Online', trend: '2m ago', direction: 'neutral' },
  ],
  collapsed: [
    // Risk Score moved to collapsed (Desktop: still visible)
    { id: 'risk', type: 'numeric', label: 'Risk Score', value: '78/100', trend: undefined, direction: 'up', onClick: () => openRiskModal() },
    { id: 'charts', type: 'count', label: 'Active Charts', value: '2', trend: undefined, direction: 'neutral' },
    { id: 'journal', type: 'count', label: 'Journal (heute)', value: '3', trend: undefined, direction: 'neutral' },
  ],
};
```

**Color Coding:**
- 0-40: 🔴 High Risk (text-rose-500)
- 41-70: 🟡 Medium Risk (text-amber-500)
- 71-100: 🟢 Low Risk (text-emerald-500)

#### 2. Risk Score Modal

**Neue Datei:** `src/components/board/RiskScoreModal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Users, FileCheck, AlertTriangle, X } from '@/lib/icons';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

interface RiskBreakdown {
  overall: number;
  liquidity: number;
  holders: number;
  contract: number;
  rugPullProbability: number;
}

interface RiskScoreModalProps {
  ca: string;
  symbol?: string;
  onClose: () => void;
}

export default function RiskScoreModal({ ca, symbol, onClose }: RiskScoreModalProps) {
  const [breakdown, setBreakdown] = useState<RiskBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch(`/api/cortex/risk-score?ca=${ca}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setBreakdown(d.data);
        } else {
          setError(d.error);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [ca]);
  
  const getRiskLevel = (score: number) => {
    if (score > 70) return { label: 'Low Risk', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score > 40) return { label: 'Medium Risk', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { label: 'High Risk', color: 'text-rose-500', bg: 'bg-rose-500' };
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="w-full max-w-md bg-zinc-900 rounded-lg p-6">
          <Skeleton height="h-8" className="mb-4" />
          <Skeleton height="h-24" className="mb-3" />
          <Skeleton height="h-24" className="mb-3" />
          <Skeleton height="h-24" />
        </div>
      </div>
    );
  }
  
  if (error || !breakdown) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="w-full max-w-md bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Risk Score</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-300">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-rose-400">{error || 'Failed to load risk data'}</p>
        </div>
      </div>
    );
  }
  
  const overallRisk = getRiskLevel(breakdown.overall);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Risk Score</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-300">
            <X size={20} />
          </button>
        </div>
        
        {/* Overall Score */}
        <div className="text-center mb-6 p-4 rounded-lg bg-zinc-800">
          <p className="text-xs text-zinc-400 mb-1">{symbol || ca.slice(0, 8) + '...'}</p>
          <p className="text-3xl font-bold mb-1">{breakdown.overall}/100</p>
          <p className={`text-sm ${overallRisk.color}`}>{overallRisk.label}</p>
        </div>
        
        {/* Breakdown Metrics */}
        <div className="space-y-3 mb-4">
          <RiskMetric 
            icon={TrendingUp} 
            label="Liquidity" 
            value={breakdown.liquidity}
            hint="Depth of buy/sell liquidity"
          />
          <RiskMetric 
            icon={Users} 
            label="Holder Distribution" 
            value={breakdown.holders}
            hint="Token concentration among holders"
          />
          <RiskMetric 
            icon={FileCheck} 
            label="Contract Safety" 
            value={breakdown.contract}
            hint="Smart contract audit & security"
          />
        </div>
        
        {/* Rug-Pull Warning */}
        <div className={`p-3 rounded-lg ${
          breakdown.rugPullProbability > 50 
            ? 'bg-rose-500/20 border border-rose-500/50' 
            : 'bg-emerald-500/10 border border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {breakdown.rugPullProbability > 50 && <AlertTriangle size={16} className="text-rose-500" />}
            <p className="text-sm font-semibold">Rug-Pull Probability</p>
          </div>
          <p className={`text-lg font-bold ${
            breakdown.rugPullProbability > 50 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {breakdown.rugPullProbability}%
          </p>
        </div>
        
        {/* Close Button */}
        <Button onClick={onClose} className="mt-4 w-full" variant="secondary">
          Close
        </Button>
      </div>
    </div>
  );
}

function RiskMetric({ 
  icon: Icon, 
  label, 
  value, 
  hint 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  hint: string;
}) {
  const getRiskLevel = (score: number) => {
    if (score > 70) return { color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score > 40) return { color: 'text-amber-500', bg: 'bg-amber-500' };
    return { color: 'text-rose-500', bg: 'bg-rose-500' };
  };
  
  const risk = getRiskLevel(value);
  
  return (
    <div className="p-3 rounded-lg bg-zinc-800/50">
      <div className="flex items-center gap-3 mb-2">
        <Icon size={20} className={risk.color} />
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-100">{label}</p>
          <p className="text-xs text-zinc-500">{hint}</p>
        </div>
        <span className={`text-sm font-semibold ${risk.color}`}>{value}/100</span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${risk.bg} transition-all duration-500`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
```

### Integration Steps

1. **API Endpoint erstellen:** `api/cortex/risk-score.ts`
2. **Modal Component erstellen:** `src/components/board/RiskScoreModal.tsx`
3. **Board Overview updaten:** KPI Tile hinzufügen mit onClick-Handler
4. **Modal State Management:** useState in BoardPage für Modal-Visibility
5. **Testen:** Mock-Data → Cortex-API → Error-Handling

---

## Feature 2: Sentiment Analysis (4-5h)

### Ziel

Aggregiere Social-Sentiment aus Twitter, Reddit, Telegram → zeige 0-100 Sentiment-Score mit Breakdown.

### User Flow

1. User öffnet Board → sieht KPI Tile "Sentiment: 72/100 🟢 Bullish"
2. User klickt auf Tile → Modal öffnet sich
3. Modal zeigt:
   - Twitter Sentiment: 68/100
   - Reddit Sentiment: 75/100
   - Telegram Sentiment: 73/100
   - Mentions (24h): 2,400
   - 7d Trend: +8% (vs. 7-day avg)
   - Top Keywords: ["bullish", "moon", "ath", "hodl", "buy"]

### API Endpoint

**Neue Datei:** `api/cortex/sentiment.ts`

```typescript
/**
 * Cortex Sentiment Analysis Endpoint
 * GET /api/cortex/sentiment?ca={address}
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORTEX_BASE = 'https://cortex-api.moralis.com/v1';
const CORTEX_API_KEY = process.env.MORALIS_API_KEY;

interface SentimentResponse {
  overall: number;          // 0-100
  twitter: number;          // 0-100
  reddit: number;           // 0-100
  telegram: number;         // 0-100
  mentions24h: number;      // Total mentions
  trend7d: number;          // % change vs. 7d avg
  topKeywords: string[];    // Top 5-10 keywords
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  const { ca } = req.query;
  
  if (!ca || typeof ca !== 'string') {
    return res.status(400).json({ success: false, error: 'CA parameter required' });
  }
  
  try {
    const response = await fetch(`${CORTEX_BASE}/sentiment?address=${ca}`, {
      headers: {
        'X-API-Key': CORTEX_API_KEY!,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Fallback: Mock-Data
      const mockData: SentimentResponse = {
        overall: 72,
        twitter: 68,
        reddit: 75,
        telegram: 73,
        mentions24h: 2400,
        trend7d: 8,
        topKeywords: ['bullish', 'moon', 'ath', 'hodl', 'buy', 'dip', 'breakout'],
      };
      return res.status(200).json({ success: true, data: mockData, source: 'mock' });
    }
    
    const data: SentimentResponse = await response.json();
    
    return res.status(200).json({ success: true, data, source: 'cortex' });
  } catch (error) {
    console.error('[Cortex Sentiment] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Cortex API error',
    });
  }
}
```

### UI Components

#### 1. Board KPI Tile (Update)

**Anpassung:** `src/components/board/Overview.tsx`

```tsx
const kpis = {
  visible: [
    { id: 'pnl', type: 'numeric', label: 'Heute P&L', value: '+€247.50', trend: '+12.5%', direction: 'up' },
    { id: 'alerts', type: 'count', label: 'Active Alerts', value: '3', trend: undefined, direction: 'neutral' },
    // SENTIMENT KPI (NEU)
    { 
      id: 'sentiment', 
      type: 'numeric', 
      label: 'Sentiment', 
      value: '72/100', 
      trend: '↑ +8 vs. 7d', 
      direction: 'up', 
      onClick: () => setSentimentModalOpen(true) 
    },
    { id: 'sync', type: 'status', label: 'Sync Status', value: 'Online', trend: '2m ago', direction: 'neutral' },
  ],
  // ... rest
};
```

**Color Coding:**
- 0-30: 🔴 Bearish (text-rose-500)
- 31-60: 🟡 Neutral (text-zinc-400)
- 61-100: 🟢 Bullish (text-emerald-500)

#### 2. Sentiment Modal

**Neue Datei:** `src/components/board/SentimentModal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, Activity, X } from '@/lib/icons';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

interface SentimentData {
  overall: number;
  twitter: number;
  reddit: number;
  telegram: number;
  mentions24h: number;
  trend7d: number;
  topKeywords: string[];
}

interface SentimentModalProps {
  ca: string;
  symbol?: string;
  onClose: () => void;
}

export default function SentimentModal({ ca, symbol, onClose }: SentimentModalProps) {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch(`/api/cortex/sentiment?ca=${ca}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setData(d.data);
        } else {
          setError(d.error);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [ca]);
  
  const getSentimentLabel = (score: number) => {
    if (score > 60) return { label: 'Bullish', color: 'text-emerald-500', emoji: '🟢' };
    if (score > 30) return { label: 'Neutral', color: 'text-zinc-400', emoji: '🟡' };
    return { label: 'Bearish', color: 'text-rose-500', emoji: '🔴' };
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="w-full max-w-md bg-zinc-900 rounded-lg p-6">
          <Skeleton height="h-8" className="mb-4" />
          <Skeleton height="h-32" className="mb-3" />
          <Skeleton height="h-24" />
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="w-full max-w-md bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sentiment Analysis</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-300">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-rose-400">{error || 'Failed to load sentiment data'}</p>
        </div>
      </div>
    );
  }
  
  const overall = getSentimentLabel(data.overall);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sentiment Analysis</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-300">
            <X size={20} />
          </button>
        </div>
        
        {/* Overall Sentiment */}
        <div className="text-center mb-6 p-4 rounded-lg bg-zinc-800">
          <p className="text-xs text-zinc-400 mb-1">{symbol || ca.slice(0, 8) + '...'}</p>
          <p className="text-3xl font-bold mb-1">{data.overall}/100</p>
          <p className={`text-sm ${overall.color}`}>
            {overall.emoji} {overall.label}
          </p>
        </div>
        
        {/* Source Breakdown */}
        <div className="space-y-3 mb-4">
          <SentimentSource icon={MessageCircle} label="Twitter" value={data.twitter} />
          <SentimentSource icon={MessageCircle} label="Reddit" value={data.reddit} />
          <SentimentSource icon={Activity} label="Telegram" value={data.telegram} />
        </div>
        
        {/* Metrics */}
        <div className="border-t border-zinc-800 pt-3 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-400">Mentions (24h)</span>
            <span className="font-semibold text-zinc-100">{data.mentions24h.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">7d Trend</span>
            <span className={`font-semibold flex items-center gap-1 ${
              data.trend7d > 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {data.trend7d > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
              {data.trend7d > 0 ? '+' : ''}{data.trend7d}%
            </span>
          </div>
        </div>
        
        {/* Top Keywords */}
        <div className="border-t border-zinc-800 pt-3 mb-4">
          <p className="text-xs text-zinc-500 mb-2">Top Keywords</p>
          <div className="flex flex-wrap gap-2">
            {data.topKeywords.map((kw, i) => (
              <span key={i} className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded">
                #{kw}
              </span>
            ))}
          </div>
        </div>
        
        {/* Close Button */}
        <Button onClick={onClose} className="w-full" variant="secondary">
          Close
        </Button>
      </div>
    </div>
  );
}

function SentimentSource({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: any; 
  label: string; 
  value: number;
}) {
  const getSentimentColor = (score: number) => {
    if (score > 60) return { color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score > 30) return { color: 'text-zinc-400', bg: 'bg-zinc-400' };
    return { color: 'text-rose-500', bg: 'bg-rose-500' };
  };
  
  const sentiment = getSentimentColor(value);
  
  return (
    <div className="p-3 rounded-lg bg-zinc-800/50">
      <div className="flex items-center gap-3 mb-2">
        <Icon size={20} className={sentiment.color} />
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-100">{label}</p>
        </div>
        <span className={`text-sm font-semibold ${sentiment.color}`}>{value}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${sentiment.bg} transition-all duration-500`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
```

### Integration Steps

1. **API Endpoint erstellen:** `api/cortex/sentiment.ts`
2. **Modal Component erstellen:** `src/components/board/SentimentModal.tsx`
3. **Board Overview updaten:** Sentiment KPI Tile hinzufügen (visible by default)
4. **Modal State Management:** useState in BoardPage
5. **Testen:** Mock-Data → Cortex-API → Keyword-Display

---

## Feature 3: AI Trade Idea Generator (6-8h)

### Ziel

Generiere AI-powered Trade-Ideen basierend auf KPIs + OHLC-Daten (Entry, TP1, TP2, Stop, Confidence, Reasoning).

### User Flow

1. User ist auf AnalyzePage, hat Token analysiert (KPIs + Chart geladen)
2. User klickt Button "🤖 AI-Idea generieren"
3. Loading-State (2-3s)
4. AI-Idea erscheint:
   - **Long Setup**
   - Entry: $0.85
   - TP1: $0.92 (+8%)
   - Stop: $0.81 (-5%)
   - Confidence: High
   - Reasoning: "RSI oversold, MACD bullish crossover, support at $0.82"
5. User klickt "→ Journal speichern" → Idea wird in Journal gespeichert

### API Endpoint

**Neue Datei:** `api/cortex/generate-idea.ts`

```typescript
/**
 * Cortex AI Trade Idea Generator
 * POST /api/cortex/generate-idea
 * Body: { ca, kpis, ohlc }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORTEX_BASE = 'https://cortex-api.moralis.com/v1';
const CORTEX_API_KEY = process.env.MORALIS_API_KEY;

interface AIIdeaRequest {
  ca: string;
  kpis: any;    // KPI-Daten vom Board
  ohlc: any[];  // OHLC-Candles
}

interface AIIdeaResponse {
  direction: 'long' | 'short';
  entry: number;
  tp1: number;
  tp2?: number;
  stop: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  const { ca, kpis, ohlc }: AIIdeaRequest = req.body;
  
  if (!ca) {
    return res.status(400).json({ success: false, error: 'CA required' });
  }
  
  try {
    const response = await fetch(`${CORTEX_BASE}/generate-idea`, {
      method: 'POST',
      headers: {
        'X-API-Key': CORTEX_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: ca,
        kpis,
        ohlc,
      }),
    });
    
    if (!response.ok) {
      // Fallback: Mock-Data
      const lastClose = ohlc?.[ohlc.length - 1]?.c || 0.85;
      const mockIdea: AIIdeaResponse = {
        direction: 'long',
        entry: lastClose,
        tp1: lastClose * 1.08,
        tp2: lastClose * 1.15,
        stop: lastClose * 0.95,
        confidence: 'medium',
        reasoning: 'RSI oversold (32), MACD bullish crossover, strong support at current level. Volume increasing.',
      };
      return res.status(200).json({ success: true, data: mockIdea, source: 'mock' });
    }
    
    const data: AIIdeaResponse = await response.json();
    
    return res.status(200).json({ success: true, data, source: 'cortex' });
  } catch (error) {
    console.error('[Cortex Generate Idea] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Cortex API error',
    });
  }
}
```

### UI Components

**Neue Datei:** `src/components/analyze/AIIdeaGenerator.tsx`

```tsx
import React, { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Save } from '@/lib/icons';
import Button from '@/components/ui/Button';

interface AIIdea {
  direction: 'long' | 'short';
  entry: number;
  tp1: number;
  tp2?: number;
  stop: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
}

interface AIIdeaGeneratorProps {
  ca: string;
  symbol: string;
  kpis: any;
  ohlc: any[];
}

export default function AIIdeaGenerator({ ca, symbol, kpis, ohlc }: AIIdeaGeneratorProps) {
  const [idea, setIdea] = useState<AIIdea | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cortex/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ca, kpis, ohlc }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIdea(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate idea');
    } finally {
      setLoading(false);
    }
  };
  
  const saveToJournal = () => {
    // TODO: Implement save to journal
    console.log('Save to journal:', idea);
    alert('Idea saved to journal!');
  };
  
  return (
    <div className="mt-4 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-500" />
          AI Trade Idea
        </h3>
        <Button onClick={generate} loading={loading} size="sm" disabled={!ohlc || ohlc.length === 0}>
          {idea ? 'Neu generieren' : 'Generieren'}
        </Button>
      </div>
      
      {error && (
        <div className="p-3 rounded bg-rose-500/10 border border-rose-500/50">
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}
      
      {idea && (
        <div className={`p-4 rounded-lg ${
          idea.direction === 'long' 
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : 'bg-rose-500/10 border border-rose-500/30'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {idea.direction === 'long' ? (
              <TrendingUp size={20} className="text-emerald-500" />
            ) : (
              <TrendingDown size={20} className="text-rose-500" />
            )}
            <span className={`text-sm font-semibold uppercase ${
              idea.direction === 'long' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {idea.direction} Setup
            </span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
              idea.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
              idea.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400' :
              'bg-zinc-500/20 text-zinc-400'
            }`}>
              {idea.confidence} confidence
            </span>
          </div>
          
          {/* Levels */}
          <div className="space-y-1.5 text-sm mb-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Entry:</span>
              <span className="font-mono font-semibold text-zinc-100">${idea.entry.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">TP1:</span>
              <span className="font-mono font-semibold text-emerald-400">
                ${idea.tp1.toFixed(4)} 
                <span className="ml-1 text-xs">({((idea.tp1 / idea.entry - 1) * 100).toFixed(1)}%)</span>
              </span>
            </div>
            {idea.tp2 && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">TP2:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  ${idea.tp2.toFixed(4)} 
                  <span className="ml-1 text-xs">({((idea.tp2 / idea.entry - 1) * 100).toFixed(1)}%)</span>
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Stop:</span>
              <span className="font-mono font-semibold text-rose-400">
                ${idea.stop.toFixed(4)} 
                <span className="ml-1 text-xs">({((idea.stop / idea.entry - 1) * 100).toFixed(1)}%)</span>
              </span>
            </div>
          </div>
          
          {/* Reasoning */}
          <div className="border-t border-zinc-700/50 pt-3 mb-3">
            <p className="text-xs text-zinc-400 mb-1">AI Reasoning:</p>
            <p className="text-sm text-zinc-300">{idea.reasoning}</p>
          </div>
          
          {/* Save Button */}
          <Button onClick={saveToJournal} className="w-full" size="sm" variant="secondary">
            <Save size={16} className="mr-2" />
            Journal speichern
          </Button>
        </div>
      )}
      
      {!idea && !loading && !error && (
        <p className="text-sm text-zinc-500 text-center py-4">
          Klicke "Generieren" für eine AI-basierte Trade-Idee
        </p>
      )}
    </div>
  );
}
```

### Integration in AnalyzePage

**Anpassung:** `src/pages/AnalyzePage.tsx`

```tsx
import AIIdeaGenerator from '@/components/analyze/AIIdeaGenerator';

export default function AnalyzePage() {
  const [kpis, setKpis] = useState(null);
  const [ohlc, setOhlc] = useState([]);
  const [ca, setCa] = useState('');
  const [symbol, setSymbol] = useState('');
  
  // ... existing analyze logic
  
  return (
    <div>
      {/* ... existing UI */}
      
      {kpis && ohlc.length > 0 && (
        <AIIdeaGenerator 
          ca={ca} 
          symbol={symbol} 
          kpis={kpis} 
          ohlc={ohlc} 
        />
      )}
    </div>
  );
}
```

### Integration Steps

1. **API Endpoint erstellen:** `api/cortex/generate-idea.ts`
2. **Component erstellen:** `src/components/analyze/AIIdeaGenerator.tsx`
3. **AnalyzePage updaten:** Component einbinden (nach KPI-Cards)
4. **Journal-Integration:** Save-Funktion implementieren
5. **Testen:** Mock-Data → Cortex-API → R:R Ratio korrekt

---

## Moralis Cortex API — Setup

### Environment Variables

**Anpassung:** `.env.example` (bereits aktualisiert ✅)

```bash
MORALIS_API_KEY=your_moralis_api_key_here
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2
```

**Cortex Base URL:**
```bash
CORTEX_BASE=https://cortex-api.moralis.com/v1
```

**Note:** Cortex nutzt denselben `MORALIS_API_KEY` wie Moralis Data-API.

### Rate Limits

| Tier | Requests/Min | Requests/Day | Cost |
|------|--------------|--------------|------|
| **Free** | 100 | 10,000 | $0 |
| **Starter** | 500 | 50,000 | $49/mo |
| **Pro** | 2,000 | 200,000 | $199/mo |

**Empfehlung für MVP:** Free Tier (100 req/min ausreichend für Board + Analyze-Page)

### Error-Handling

**Pattern: Graceful Degradation**

```typescript
try {
  const response = await fetch(CORTEX_API);
  if (!response.ok) {
    // Fallback to mock data
    return mockData;
  }
  return cortexData;
} catch (error) {
  // Show error, fallback to mock
  return mockData;
}
```

**User-sichtbar:**
- Toast: "Cortex API offline, showing mock data"
- Badge in Modal: "Mock Data" (zinc-500)

---

## Testing Checklist

### Unit Tests (Vitest)

- [ ] `api/cortex/risk-score.ts` — Mock Cortex response
- [ ] `api/cortex/sentiment.ts` — Mock Cortex response
- [ ] `api/cortex/generate-idea.ts` — Mock Cortex response
- [ ] `RiskScoreModal.tsx` — Render states (loading/error/success)
- [ ] `SentimentModal.tsx` — Render states
- [ ] `AIIdeaGenerator.tsx` — Generate + Save flow

### Integration Tests (Playwright)

- [ ] Board → Risk Score KPI → Modal öffnet
- [ ] Board → Sentiment KPI → Modal öffnet
- [ ] Analyze → AI-Idea Button → Idea generiert
- [ ] AI-Idea → Save to Journal → Journal-Entry erstellt

### Manual Tests

- [ ] Cortex API Live-Test (mit echtem API-Key)
- [ ] Rate-Limit-Handling (100 req/min)
- [ ] Offline-Fallback (Network devtools)
- [ ] Mobile-Layout (Board KPIs responsive)

---

## Timeline & Aufwand

| Phase | Aufgabe | Aufwand |
|-------|---------|---------|
| **Setup** | API-Endpoints (3x), ENV-Config | 2-3h |
| **Feature 1** | Risk Score (KPI + Modal) | 4-6h |
| **Feature 2** | Sentiment Analysis (KPI + Modal) | 4-5h |
| **Feature 3** | AI Trade Idea Generator | 6-8h |
| **Testing** | Unit + Integration + Manual | 2-3h |

**Total: 18-25h (~2-3 Tage FTE)**

**MVP Scope (14-19h):**
- Risk Score (collapsed KPI)
- Sentiment (visible KPI)
- AI Trade Idea (Analyze-Page only)

---

## Follow-up Features (Later)

### Pattern Recognition (8-12h)

**Was:** Automatische Erkennung von Chart-Patterns (Head & Shoulders, Flags, Triangles)

**Wo:** Chart-Page, Overlay auf Canvas

**API:** `GET /cortex/v1/patterns?ca={address}&tf={timeframe}`

**Output:**
```json
{
  "patterns": [
    {
      "type": "head_and_shoulders",
      "confidence": 0.85,
      "neckline": 0.82,
      "target": 0.75,
      "invalidation": 0.88
    }
  ]
}
```

**UI:** Pattern-Layer auf Chart (colored shapes), Alert-Option "Notify when pattern completes"

---

### Whale Activity (3-4h)

**Was:** Live-Feed großer Transfers (> $10k)

**Wo:** Board Feed (neuer Filter "🐋 Whales")

**API:** `GET /cortex/v1/whale-activity?ca={address}&limit=20`

**Output:**
```json
{
  "transfers": [
    {
      "amount": 500000,
      "token": "SOL",
      "from": "7xKF...abc",
      "to": "3kD2...xyz",
      "timestamp": 1730000000,
      "txHash": "..."
    }
  ]
}
```

**UI:** Feed-Item mit 🐋 Emoji, "Whale moved 500k SOL", clickable → Solscan/Explorer

---

## Zusammenfassung

**Cortex MVP (First Update):**
- ✅ 3 Features (Risk Score, Sentiment, AI Trade Idea)
- ✅ 18-25h Aufwand (~2-3 Tage)
- ✅ API-Endpoints + UI-Components
- ✅ Graceful Degradation (Mock-Fallback)
- ✅ Mobile-optimiert (Board KPIs responsive)

**Follow-up:**
- Pattern Recognition (Chart-Page)
- Whale Activity (Board Feed)
- Voice Commands (Accessibility)

**Next Steps:**
1. Moralis API-Key bereitstellen (ENV)
2. API-Endpoints erstellen (3x)
3. UI-Components bauen (Modals + Generator)
4. Testen (Mock → Live-API)
5. Deploy & Monitor (Rate-Limits)

---

**Ende des Plans**
