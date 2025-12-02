import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Bell, 
  FileText, 
  Zap, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Lock,
  Wifi,
  Clock,
  PlayCircle,
  Target,
  Award,
  TrendingDown
} from '@/lib/icons';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [visibleStats, setVisibleStats] = useState<{ [key: string]: boolean }>({});
  const statsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleStats(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(statsRef.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <Zap className="text-emerald-500" size={28} />
            <span className="text-xl font-bold">Sparkfined</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden text-sm text-zinc-400 hover:text-zinc-100 md:block">
              Features
            </a>
            <a href="#pricing" className="hidden text-sm text-zinc-400 hover:text-zinc-100 md:block">
              Pricing
            </a>
            <button
              onClick={() => navigate('/dashboard-v2')}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 md:px-6 md:pt-40 md:pb-32">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="relative mx-auto max-w-5xl text-center">
          {/* Floating Stats */}
          <div className="absolute -top-8 left-0 right-0 flex flex-wrap justify-center gap-4 text-xs text-zinc-500 md:text-sm">
            <span className="animate-fade-in flex items-center gap-1">
              <Zap size={14} className="text-emerald-500" />
              1,247 alerts today
            </span>
            <span className="animate-fade-in motion-delay-200 flex items-center gap-1">
              <Wifi size={14} className="text-emerald-500" />
              98.5% uptime
            </span>
            <span className="animate-fade-in motion-delay-400 flex items-center gap-1">
              <Clock size={14} className="text-emerald-500" />
              42ms response
            </span>
          </div>

          <h1 className="animate-slide-in-left mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            <span className="block">⚡ Stop Trading Blind.</span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Start Trading Smart.
            </span>
          </h1>
          
          <p className="animate-fade-in motion-delay-200 mb-4 text-lg text-zinc-400 md:text-xl">
            Your edge isn't the chart. It's what you <strong className="text-zinc-200">DO</strong> with it.
          </p>
          <p className="animate-fade-in motion-delay-300 mb-8 text-base text-zinc-500 md:text-lg">
            The command center that actual traders use. No BS, just alpha.
          </p>

          <div className="animate-fade-in motion-delay-400 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate('/dashboard-v2')}
              className="group flex items-center gap-2 rounded-lg bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-600 hover:scale-105 hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] active:scale-95"
            >
              Try It Now - No Signup
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-8 py-4 text-lg font-medium text-zinc-100 transition-all hover:border-zinc-600 hover:bg-zinc-800"
            >
              <PlayCircle size={20} />
              Watch 30s Demo
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              No signup
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Works offline
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Privacy-first
            </span>
          </div>
        </div>

        {/* Animated Chart Preview */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="animate-fade-in motion-delay-600 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 shadow-2xl">
            <div className="aspect-video rounded-lg bg-zinc-950 flex items-center justify-center">
              <BarChart3 size={48} className="text-zinc-700" />
              <span className="ml-3 text-zinc-600">Chart Preview - Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Ticker */}
      <section className="border-y border-zinc-800 bg-zinc-900/50 py-4 overflow-hidden">
        <div className="flex items-center gap-8 animate-ticker whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-sm text-zinc-400">"Finally, a chart tool that doesn't suck" – @degenwizard</span>
              <span className="text-zinc-700">•</span>
              <span className="text-sm text-zinc-400">"This is what TradingView should've been" – @0xAlpha</span>
              <span className="text-zinc-700">•</span>
              <span className="text-sm text-zinc-400">"Ape'd in after 5 minutes" – @chartautist</span>
              <span className="text-zinc-700">•</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* The Problem */}
      <section className="px-4 py-20 md:px-6 md:py-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-3xl font-bold md:text-5xl">
            YOU'RE LOSING MONEY BECAUSE:
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {problemPoints.map((problem, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-rose-500/50 hover:bg-zinc-900/50"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-rose-500/10 p-3">
                    <problem.icon className="text-rose-500" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">{problem.title}</h3>
                </div>
                <p className="text-zinc-400 italic">"{problem.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution - 3 Feature Grid */}
      <section id="features" className="px-4 py-20 md:px-6 md:py-32 bg-zinc-900/30">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-5xl">
            HERE'S HOW SPARKFINED FIXES THAT
          </h2>
          <p className="mb-16 text-center text-lg text-zinc-500">
            Three pillars. One mission: Make you a better trader.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:-translate-y-2"
              >
                <div className="mb-6 flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800">
                  <feature.icon className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors" size={64} />
                </div>
                
                <h3 className="mb-4 text-2xl font-bold group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                
                <ul className="mb-6 space-y-2">
                  {feature.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-zinc-400">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      {bullet}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate('/dashboard-v2')}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium transition-all hover:border-emerald-500 hover:bg-emerald-500 hover:text-black group-hover:border-emerald-500/50"
                >
                  Try Demo →
                </button>
              </div>
            ))}
          </div>

          {/* Journey System Teaser */}
          <div className="mt-20 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">🎮 Your Trading Journey</h3>
              <p className="text-zinc-400">
                Track your evolution from Degen to Master. Earn XP for discipline, not just profits.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-5">
              {journeyPhases.map((phase, i) => (
                <div key={i} className="text-center">
                  <div className="mb-2 text-4xl">{phase.icon}</div>
                  <div className="text-sm font-semibold text-zinc-300">{phase.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">{phase.xp}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => navigate('/dashboard-v2')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-medium text-black transition-all hover:bg-emerald-400"
              >
                <Award size={20} />
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="px-4 py-20 md:px-6 md:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">⚡ BY THE NUMBERS</h2>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                id={`stat-${i}`}
                ref={(el) => (statsRef.current[`stat-${i}`] = el)}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center transition-all hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <div className={`mb-2 text-4xl font-bold text-emerald-500 transition-all ${
                  visibleStats[`stat-${i}`] ? 'animate-fade-in' : 'opacity-0'
                }`}>
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Additional Context */}
          <div className="mt-12 text-center">
            <p className="text-zinc-500">
              Built for traders. By traders. <strong className="text-emerald-500">No bullshit.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Access System Teaser */}
      <section id="pricing" className="px-4 py-20 md:px-6 md:py-32 bg-zinc-900/30">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-5xl">🔐 THE OG SYSTEM</h2>
          <p className="mb-16 text-center text-lg text-zinc-400">
            Not all features are for everyone.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Free Tier */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
              <h3 className="mb-6 text-2xl font-bold">FREE TIER</h3>
              <ul className="mb-8 space-y-3">
                {freeTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/dashboard-v2')}
                className="w-full rounded-lg bg-zinc-800 px-6 py-3 font-semibold transition-all hover:bg-zinc-700"
              >
                Start Free
              </button>
            </div>

            {/* OG Tier */}
            <div className="relative rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-950/50 to-zinc-900 p-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-sm font-bold text-black">
                RECOMMENDED
              </div>
              
              <h3 className="mb-6 text-2xl font-bold">OG TIER</h3>
              <ul className="mb-8 space-y-3">
                {ogTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-100">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-bold text-black transition-all hover:bg-emerald-400 hover:scale-105">
                Become OG (0.5 SOL lock)
              </button>
              <p className="mt-4 text-center text-xs text-zinc-500">
                *No subscription BS. Lock tokens, unlock features.*
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 md:px-6 md:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">WHAT DEGENS SAY</h2>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all ${
                  i === activeTestimonial ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : ''
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-zinc-800"></div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-zinc-500">{testimonial.followers} followers</div>
                  </div>
                </div>
                <p className="mb-4 text-zinc-300">{testimonial.quote}</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="fill-emerald-500 text-emerald-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden px-4 py-32 md:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 to-zinc-950"></div>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3),transparent_50%)]"></div>
        </div>
        
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-6xl">
            ⚡ READY TO TRADE SMARTER?
          </h2>
          <p className="mb-4 text-xl text-zinc-300">
            Open the app. No signup. No credit card.
          </p>
          <p className="mb-8 text-lg text-zinc-400">
            Start charting in <strong className="text-emerald-400">3 seconds</strong>.
          </p>

          <button
            onClick={() => navigate('/dashboard-v2')}
            className="group mb-8 inline-flex items-center gap-3 rounded-lg bg-emerald-500 px-12 py-5 text-xl font-bold text-black shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_70px_rgba(16,185,129,0.6)] active:scale-95"
          >
            Launch Sparkfined
            <ArrowRight size={24} className="transition-transform group-hover:translate-x-2" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Works offline
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              ~400KB bundle
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Privacy-first
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              100% free core
            </span>
          </div>

          <p className="mt-12 text-base text-zinc-600">
            Or continue being exit liquidity. Your call. 🤷
          </p>

          {/* The Degen's Creed */}
          <div className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-2xl font-bold text-emerald-400">The Degen's Creed</h3>
            <div className="space-y-3 text-left text-zinc-400 md:text-center">
              <p>I trade not blind, but with <strong className="text-zinc-200">clarity</strong>.</p>
              <p>I rely not on hope, but on <strong className="text-zinc-200">data</strong>.</p>
              <p>When FOMO calls, I check my <strong className="text-zinc-200">journal</strong>.</p>
              <p className="pt-2 text-emerald-400">I am not a gambler. I am <strong>sovereign</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-12 md:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Zap className="text-emerald-500" size={24} />
            <span className="text-xl font-bold">Sparkfined</span>
          </div>

          <div className="mb-6 flex justify-center gap-6 text-sm text-zinc-400">
            <a
              href="https://twitter.com/sparkfined"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-100 transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://github.com/sparkfined"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-100 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://discord.gg/sparkfined"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-100 transition-colors"
            >
              Discord
            </a>
            <a href="/docs" className="hover:text-zinc-100 transition-colors">
              Docs
            </a>
          </div>

          <p className="text-sm text-zinc-600">
            Built by degens, for degens.
            <br />
            © 2025 Sparkfined. No bullshit guarantee.
          </p>
        </div>
      </footer>

      {/* Video Demo Modal */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div 
            className="relative mx-4 w-full max-w-4xl rounded-2xl bg-zinc-900 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute -top-12 right-0 text-zinc-400 hover:text-zinc-100"
              aria-label="Close"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="aspect-video rounded-lg bg-zinc-950 flex items-center justify-center">
              <div className="text-center">
                <PlayCircle size={64} className="mx-auto mb-4 text-zinc-700" />
                <p className="text-zinc-500">Demo video coming soon...</p>
                <p className="mt-2 text-sm text-zinc-600">
                  For now, <button onClick={() => { setIsVideoModalOpen(false); navigate('/dashboard-v2'); }} className="text-emerald-500 hover:underline">launch the app</button> to explore!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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

const stats = [
  { value: '1,247', label: 'Alerts Today ⚡' },
  { value: '98.5%', label: 'Uptime 🟢' },
  { value: '42ms', label: 'Response Time ⚡' },
  { value: '100%', label: 'Free 💎' },
  { value: '80KB', label: 'Bundle Size' },
  { value: 'PWA', label: 'Offline Ready' },
  { value: 'Soon™', label: 'Open Source' },
  { value: 'AA', label: 'WCAG A11y' },
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

const journeyPhases = [
  { icon: '💀', name: 'DEGEN', xp: '0-100' },
  { icon: '🔍', name: 'SEEKER', xp: '100-500' },
  { icon: '⚔️', name: 'WARRIOR', xp: '500-2K' },
  { icon: '👑', name: 'MASTER', xp: '2K-5K' },
  { icon: '🧙', name: 'SAGE', xp: '5K+' },
];

const testimonials = [
  {
    name: '@0xWizard',
    followers: '24.5K',
    quote: 'Been using for 3 months. My win rate went from 45% to 68%. No cap.',
  },
  {
    name: '@ChartAutist',
    followers: '12.3K',
    quote: 'Finally ditched TradingView. This shit just WORKS. No lag, no BS.',
  },
  {
    name: '@ApeGod',
    followers: '8.9K',
    quote: 'The replay mode is fucking genius. I backtested 200 entries. Saved me $5k.',
  },
];
