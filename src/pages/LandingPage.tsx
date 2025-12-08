import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Star,
  TrendingUp,
  Wifi,
  Zap,
} from '@/lib/icons';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-primary">
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-moderate bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Zap size={20} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm uppercase tracking-[0.3em] text-tertiary">Sparkfined</span>
              <span className="text-lg font-semibold text-primary">Command Center</span>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-secondary md:flex">
            <a href="#features" className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
              Features
            </a>
            <a href="#pricing" className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
              Pricing
            </a>
            <button
              type="button"
              onClick={() => navigate('/dashboard-v2')}
              className="btn btn-primary btn-sm shadow-token-md"
            >
              Launch App
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard-v2')}
            className="btn btn-primary md:hidden"
          >
            Open
          </button>
        </div>
      </nav>

      <main className="pt-28">
        <section className="relative overflow-hidden px-4 py-20 md:px-10 lg:py-28">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" aria-hidden />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] text-tertiary">
              <span className="inline-flex items-center gap-2 rounded-full border border-subtle px-4 py-1 text-[11px] font-semibold text-secondary">
                <Wifi size={12} className="text-brand" />
                98.5% uptime
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-subtle px-4 py-1 text-[11px] font-semibold text-secondary">
                <Clock size={12} className="text-brand" />
                42ms latency
              </span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-primary md:text-6xl">
              Stop Trading Blind.
              <span className="block text-gradient-brand">Operate Like a Desk.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-secondary md:text-xl">
              Sparkfined is the glass dashboard for serious crypto traders. Journal, alerts, AI insights and execution in one glass surface.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/dashboard-v2')}
              >
                Enter Command Center
                <ArrowRight size={18} />
              </button>
              <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/dashboard-v2')}>
                Watch 30s Demo
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-secondary">
              <InlineFact icon={<CheckCircle2 size={16} className="text-brand" />} label="No signup" />
              <InlineFact icon={<CheckCircle2 size={16} className="text-brand" />} label="Works offline" />
              <InlineFact icon={<CheckCircle2 size={16} className="text-brand" />} label="Instant PWA" />
            </div>
            <div className="mt-12 w-full rounded-3xl border border-moderate bg-surface/60 p-4 shadow-token-lg backdrop-blur-lg">
              <div className="flex aspect-video items-center justify-center rounded-2xl bg-surface-subtle">
                <BarChart3 size={56} className="text-secondary" />
                <p className="ml-3 text-sm text-tertiary">Glass chart stack preview · coming soon</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-moderate bg-surface/50 py-5 text-sm text-secondary">
          <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
            {tickerQuotes.map((quote) => (
              <span key={quote} className="text-secondary">
                {quote}
              </span>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <SectionHeader eyebrow="Impact Audit" title="You're leaking capital because..." description="Every losing streak shares the same blind spots. We turned them into a battle plan." />
            <div className="grid gap-6 md:grid-cols-2">
              {problemPoints.map((problem) => (
                <article key={problem.title} className="card-glass hover-lift rounded-3xl border border-subtle p-6 text-left">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                      <problem.icon size={22} />
                    </span>
                    <h3 className="text-xl font-semibold text-primary">{problem.title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-secondary italic">"{problem.quote}"</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-app-gradient px-4 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeader eyebrow="System Modules" title="Here's how Sparkfined fixes that" description="Glass tiles snap into a 12-column grid with shared tokens for depth, glow and sentiment." />
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="group rounded-3xl border border-moderate bg-surface p-6 shadow-token-md transition hover:border-brand/50 hover:shadow-glow-accent">
                  <div className="mb-6 flex h-44 items-center justify-center rounded-2xl bg-surface-subtle">
                    <feature.icon size={56} className="text-secondary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary">{feature.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-secondary">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-brand" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="mt-6 w-full rounded-2xl border border-subtle px-4 py-2 text-sm font-semibold text-secondary transition hover:border-brand hover:text-primary">
                    Explore Module →
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeader eyebrow="Signal Metrics" title="By the numbers" description="Genuine telemetry collected during public alpha. Everything is observable." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <article key={stat.label} className="rounded-3xl border border-subtle bg-surface/70 p-6 text-center shadow-token-sm">
                  <p className="text-4xl font-semibold text-gradient-success">{stat.value}</p>
                  <p className="mt-2 text-sm text-secondary">{stat.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-surface-subtle/70 px-4 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <SectionHeader eyebrow="Access System" title="Pick your clearance" description="Lock in what you need. No subscriptions, no gatekeeping, just utility." />
            <div className="grid gap-6 md:grid-cols-2">
              <PricingCard title="Free Tier" badge="Included" description="All glass primitives + offline sync" items={freeTierFeatures} cta="Start Free" onClick={() => navigate('/dashboard-v2')} />
              <PricingCard
                featured
                title="OG Tier"
                badge="Recommended"
                description="Unlock AI copilots, replay lab and rule wizard."
                items={ogTierFeatures}
                cta="Become OG (0.5 SOL lock)"
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeader eyebrow="Credibility" title="What degens say" description="Real feedback from alpha users trading on Solana, ETH and BTC." />
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article
                  key={testimonial.name}
                  className={`rounded-3xl border border-subtle bg-surface/70 p-6 transition ${
                    index === activeTestimonial ? 'border-brand shadow-glow-accent' : ''
                  }`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-surface-subtle" />
                    <div>
                      <p className="font-semibold text-primary">{testimonial.name}</p>
                      <p className="text-xs uppercase tracking-widest text-tertiary">{testimonial.followers} followers</p>
                    </div>
                  </div>
                  <p className="text-sm text-secondary">{testimonial.quote}</p>
                  <div className="mt-4 flex gap-1 text-brand">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={`${testimonial.name}-${starIndex}`} size={16} className="fill-brand text-brand" />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-24 md:px-10">
          <div className="absolute inset-0 bg-brand/5 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-3xl rounded-3xl border border-subtle bg-surface/80 p-10 text-center shadow-token-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary">Final Call</p>
            <h2 className="mt-4 text-4xl font-semibold text-primary md:text-5xl">Ready to trade smarter?</h2>
            <p className="mt-4 text-lg text-secondary">Launch the glass console. No signup, no credit card. Just focus.</p>
            <button type="button" className="btn btn-primary btn-lg mt-8" onClick={() => navigate('/dashboard-v2')}>
              Launch Sparkfined →
            </button>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-widest text-tertiary">
              <span>80KB PWA</span>
              <span>Private by default</span>
              <span>Offline sync</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-moderate bg-surface px-4 py-10 text-center text-sm text-secondary md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Zap size={20} className="text-brand" />
            <span className="font-semibold">Sparkfined</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-tertiary">Built by degens, for degens. © {new Date().getFullYear()} Sparkfined.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-12 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-tertiary">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold text-primary md:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-base text-secondary">{description}</p>
    </header>
  );
}

function InlineFact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-tertiary">
      {icon}
      {label}
    </span>
  );
}

function PricingCard({
  title,
  badge,
  description,
  items,
  cta,
  featured,
  onClick,
}: {
  title: string;
  badge: string;
  description: string;
  items: string[];
  cta: string;
  featured?: boolean;
  onClick?: () => void;
}) {
  return (
    <article
      className={`rounded-3xl border p-8 shadow-token-md ${
        featured ? 'border-brand bg-surface-elevated/80' : 'border-subtle bg-surface/80'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-primary">{title}</h3>
        <span className="rounded-full border border-subtle px-3 py-1 text-xs uppercase tracking-widest text-tertiary">
          {badge}
        </span>
      </div>
      <p className="mt-3 text-sm text-secondary">{description}</p>
      <ul className="mt-6 space-y-3 text-sm text-secondary">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-brand" />
            {item}
          </li>
        ))}
      </ul>
      <button type="button" className={`btn btn-lg ${featured ? 'btn-primary mt-8 w-full' : 'btn-outline mt-8 w-full'}`} onClick={onClick}>
        {cta}
      </button>
    </article>
  );
}

// Data
const problemPoints = [
  {
    icon: TrendingUp,
    title: 'You missed the breakout (again)',
    quote: 'Set it at $50k, woke up to $52k. FML.',
  },
  {
    icon: FileText,
    title: "You can't remember why you entered",
    quote: 'Was it a scalp or swing? Fuck if I know.',
  },
  {
    icon: Bell,
    title: 'Your tools only work at your desk',
    quote: "Stuck on mobile, can't draw shit.",
  },
  {
    icon: Lock,
    title: 'You pay $50/mo for basic alerts',
    quote: 'TradingView Premium just to get push notifs?',
  },
];

const features = [
  {
    icon: BarChart3,
    title: 'CHARTS THAT DON\'T SUCK',
    bullets: [
      'Canvas 60fps rendering',
      '10+ technical indicators',
      'Professional drawing tools',
      'Works offline',
    ],
  },
  {
    icon: Bell,
    title: 'ALERTS THAT ACTUALLY WORK',
    bullets: [
      'Server-side evaluation',
      'Multi-condition rules',
      'Push notifications',
      'Backtest before activate',
    ],
  },
  {
    icon: FileText,
    title: "JOURNAL YOU'LL ACTUALLY USE",
    bullets: [
      'AI-powered summaries',
      'Screenshot OCR',
      'One-click entries',
      'Export to Markdown',
    ],
  },
];

const tickerQuotes = [
  '"Finally, a chart tool that doesn’t suck." – @degenwizard',
  '"This is what TradingView should have been." – @0xAlpha',
  '"Replay lab saved me $5k in mistakes." – @ChartAutist',
];

const stats = [
  { value: '1,247', label: 'Alerts armed' },
  { value: '98.5%', label: 'Realtime uptime' },
  { value: '42ms', label: 'Response time' },
  { value: '100%', label: 'Offline ready' },
  { value: '80KB', label: 'Bundle footprint' },
  { value: '0 BS', label: 'Contracts or trackers' },
];

const freeTierFeatures = [
  'All core features',
  'Unlimited charts',
  'Basic alerts',
  'Journal (100 entries)',
  'Offline mode',
];

const ogTierFeatures = [
  'Everything in Free',
  'Priority alerts',
  'AI analysis (unlimited)',
  'Advanced backtest',
  'Soulbound NFT',
  'Leaderboard access',
];

const testimonials = [
  {
    name: '@0xWizard',
    followers: '24.5K',
    quote: 'Glass journal + AI summaries got my win rate from 45% to 68%.',
  },
  {
    name: '@ChartAutist',
    followers: '12.3K',
    quote: 'Finally ditched TradingView. Execution + alerts actually work.',
  },
  {
    name: '@ApeGod',
    followers: '8.9K',
    quote: 'Replay mode is cracked. 200 entries reviewed, saved 5k. No fluff.',
  },
];

const footerLinks = [
  { href: 'https://twitter.com/sparkfined', label: 'Twitter' },
  { href: 'https://github.com/sparkfined', label: 'GitHub' },
  { href: 'https://discord.gg/sparkfined', label: 'Discord' },
  { href: '/docs', label: 'Docs' },
];
