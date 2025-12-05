# 🎯 Komplette Beispiele

Vollständige Komponenten-Beispiele mit allen Design-System-Features.

---

## Dashboard Card mit allen Features

```tsx
<div className="card-glass hover-lift p-6 rounded-3xl space-y-4">
  {/* Header mit Gradient Text */}
  <div className="flex items-center justify-between">
    <h3 className="text-fluid-lg font-semibold">
      Trading Performance
    </h3>
    <span className="pulse-live px-3 py-1 rounded-full bg-sentiment-bull-bg text-sentiment-bull text-xs font-semibold">
      Live
    </span>
  </div>

  {/* KPI mit Gradient */}
  <div className="space-y-2">
    <span className="text-xs uppercase tracking-wide text-text-tertiary">
      Net P&L (30d)
    </span>
    <div className="text-gradient-success text-3xl font-bold">
      +$12,450
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-2">
    <button className="btn btn-primary flex-1">
      View Details
    </button>
    <button className="btn btn-ghost">
      Export
    </button>
  </div>
</div>
```

---

## Interactive List Item

```tsx
<button className="card-interactive hover-scale w-full text-left space-y-3">
  <div className="flex items-start justify-between">
    <div>
      <h4 className="font-semibold text-text-primary">
        SOL/USDT
      </h4>
      <p className="text-sm text-text-secondary">
        Solana • Mainnet
      </p>
    </div>
    <span className="text-gradient-success font-mono font-bold">
      +8.5%
    </span>
  </div>

  <div className="border-glow-success p-3 rounded-xl bg-sentiment-bull-bg/50">
    <span className="text-xs text-sentiment-bull">
      Strong uptrend detected
    </span>
  </div>
</button>
```

---

## Alert Banner with Glow

```tsx
<div className="glass-heavy border-glow-brand p-4 rounded-2xl flex items-center gap-3">
  <div className="w-2 h-2 rounded-full bg-brand pulse-live" />
  <div className="flex-1">
    <p className="font-semibold text-text-primary">
      Price Alert Triggered
    </p>
    <p className="text-sm text-text-secondary">
      BTC reached $50,000
    </p>
  </div>
  <button className="btn btn-sm btn-outline">
    Dismiss
  </button>
</div>
```

---

## Hero Section mit Grid Pattern

```tsx
<section className="bg-grid-pattern min-h-screen flex items-center justify-center p-8">
  <div className="card-glass elevation-float p-12 rounded-3xl text-center max-w-2xl space-y-6">
    <h1 className="text-gradient-brand text-5xl font-bold">
      Welcome to Sparkfined
    </h1>
    <p className="text-fluid-lg text-text-secondary">
      Your intelligent crypto trading companion with AI-powered insights
    </p>
    <div className="flex gap-4 justify-center">
      <button className="btn btn-primary btn-lg">
        Get Started
      </button>
      <button className="btn btn-outline btn-lg">
        Learn More
      </button>
    </div>
  </div>
</section>
```

---

## Scrollable Watchlist

```tsx
<div className="card-elevated p-6 rounded-3xl space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-fluid-xl font-bold">Watchlist</h3>
    <button className="btn btn-sm btn-ghost">
      Add Symbol
    </button>
  </div>

  <div className="scrollbar-custom h-96 overflow-y-auto space-y-2">
    {symbols.map((symbol) => (
      <button
        key={symbol.id}
        className="card-interactive hover-lift w-full text-left p-4 rounded-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">{symbol.name}</h4>
            <p className="text-sm text-text-secondary">{symbol.chain}</p>
          </div>
          <div className="text-right">
            <p className={`font-mono font-bold ${
              symbol.change > 0
                ? 'text-gradient-success'
                : 'text-gradient-danger'
            }`}>
              {symbol.change > 0 ? '+' : ''}{symbol.change}%
            </p>
            <p className="text-sm text-text-tertiary">
              ${symbol.price.toFixed(2)}
            </p>
          </div>
        </div>
      </button>
    ))}
  </div>
</div>
```

---

## Loading State

```tsx
<div className="card space-y-4 p-6 rounded-3xl">
  <div className="shimmer h-6 w-32 rounded-lg bg-surface-skeleton" />
  <div className="shimmer h-20 rounded-xl bg-surface-skeleton" />
  <div className="flex gap-2">
    <div className="shimmer h-10 flex-1 rounded-lg bg-surface-skeleton" />
    <div className="shimmer h-10 w-20 rounded-lg bg-surface-skeleton" />
  </div>
</div>
```

---

## Modal Dialog

```tsx
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
  <div className="card-glass elevation-float p-8 rounded-3xl max-w-md w-full space-y-6">
    <div className="space-y-2">
      <h2 className="text-fluid-2xl font-bold">Confirm Trade</h2>
      <p className="text-text-secondary">
        Are you sure you want to execute this trade?
      </p>
    </div>

    <div className="card-bordered p-4 rounded-xl space-y-2">
      <div className="flex justify-between">
        <span className="text-text-secondary">Pair</span>
        <span className="font-semibold">SOL/USDT</span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-secondary">Amount</span>
        <span className="font-semibold">10 SOL</span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-secondary">Type</span>
        <span className="font-semibold text-sentiment-bull">Buy</span>
      </div>
    </div>

    <div className="flex gap-3">
      <button className="btn btn-ghost flex-1">
        Cancel
      </button>
      <button className="btn btn-primary flex-1">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## Stats Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Win Rate */}
  <div className="card-glass p-6 rounded-2xl space-y-2">
    <p className="text-xs uppercase tracking-wide text-text-tertiary">
      Win Rate
    </p>
    <p className="text-3xl font-bold text-gradient-success">
      68%
    </p>
    <p className="text-sm text-text-secondary">
      +4% vs. last month
    </p>
  </div>

  {/* Total Trades */}
  <div className="card-glass p-6 rounded-2xl space-y-2">
    <p className="text-xs uppercase tracking-wide text-text-tertiary">
      Total Trades
    </p>
    <p className="text-3xl font-bold text-text-primary">
      234
    </p>
    <p className="text-sm text-text-secondary">
      Last 30 days
    </p>
  </div>

  {/* Avg. Profit */}
  <div className="card-glass p-6 rounded-2xl space-y-2">
    <p className="text-xs uppercase tracking-wide text-text-tertiary">
      Avg. Profit
    </p>
    <p className="text-3xl font-bold text-gradient-success">
      $142
    </p>
    <p className="text-sm text-text-secondary">
      Per trade
    </p>
  </div>

  {/* Best Trade */}
  <div className="card-glass p-6 rounded-2xl space-y-2">
    <p className="text-xs uppercase tracking-wide text-text-tertiary">
      Best Trade
    </p>
    <p className="text-3xl font-bold text-gradient-success">
      +$2,450
    </p>
    <p className="text-sm text-text-secondary">
      SOL/USDT
    </p>
  </div>
</div>
```

---

**[← Zurück zur Übersicht](./overview.md)**
