import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function StyleShowcasePage() {
  return (
    <DashboardShell title="Style Showcase" description="Neue Design-System Komponenten & Utilities">
      <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10" data-testid="style-showcase-page">
        
        {/* Glassmorphism Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Glassmorphism</h2>
            <p className="text-text-secondary">Moderne Frosted-Glass-Effekte mit Backdrop-Blur</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl space-y-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <p className="text-sm text-text-secondary">
                Standard Glassmorphism mit mittlerem Blur
              </p>
            </div>
            
            <div className="glass-subtle p-6 rounded-2xl space-y-3">
              <h3 className="text-lg font-semibold">Glass Subtle</h3>
              <p className="text-sm text-text-secondary">
                Subtiler Glass-Effekt mit leichterem Blur
              </p>
            </div>
            
            <div className="glass-heavy p-6 rounded-2xl space-y-3">
              <h3 className="text-lg font-semibold">Glass Heavy</h3>
              <p className="text-sm text-text-secondary">
                Heavy Glass mit starkem Blur und Schatten
              </p>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Card-Varianten</h2>
            <p className="text-text-secondary">Verschiedene Card-Styles für unterschiedliche Anwendungen</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-2">Standard Card</h3>
              <p className="text-sm text-text-secondary">
                Basis Card mit Surface-Color
              </p>
            </div>
            
            <div className="card-elevated p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-2">Elevated Card</h3>
              <p className="text-sm text-text-secondary">
                Erhöhte Card mit mehr Schatten
              </p>
            </div>
            
            <div className="card-glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
              <p className="text-sm text-text-secondary">
                Glassmorphism Card
              </p>
            </div>
            
            <div className="card-bordered p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-2">Bordered Card</h3>
              <p className="text-sm text-text-secondary">
                Transparente Card mit Border
              </p>
            </div>
            
            <div className="card-glow p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-2">Glow Card</h3>
              <p className="text-sm text-text-secondary">
                Card mit Brand-Glow Effekt
              </p>
            </div>
            
            <div className="card-interactive p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-2">Interactive Card</h3>
              <p className="text-sm text-text-secondary">
                Hover mich für Effekte!
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Button-System</h2>
            <p className="text-text-secondary">Modernes Button-System mit Hover-Animationen</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-ghost">Ghost Button</button>
              <button className="btn btn-outline">Outline Button</button>
              <button className="btn btn-danger">Danger Button</button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary">Default</button>
              <button className="btn btn-primary btn-lg">Large</button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary btn-disabled">Disabled</button>
              <button className="btn btn-secondary shimmer">Loading...</button>
            </div>
          </div>
        </section>

        {/* Microinteractions Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Microinteractions</h2>
            <p className="text-text-secondary">Subtile Hover-Effekte für bessere UX</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="hover-lift p-6 bg-surface rounded-xl border border-border cursor-pointer">
              <h3 className="font-semibold mb-2">Hover Lift</h3>
              <p className="text-sm text-text-secondary">
                Hebt sich beim Hover
              </p>
            </div>
            
            <div className="hover-glow p-6 bg-surface rounded-xl border border-border cursor-pointer">
              <h3 className="font-semibold mb-2">Hover Glow</h3>
              <p className="text-sm text-text-secondary">
                Leuchtet beim Hover
              </p>
            </div>
            
            <div className="hover-scale p-6 bg-surface rounded-xl border border-border cursor-pointer">
              <h3 className="font-semibold mb-2">Hover Scale</h3>
              <p className="text-sm text-text-secondary">
                Vergrößert sich beim Hover
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <span className="pulse-live inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sentiment-bull-bg text-sentiment-bull font-semibold">
              <span className="w-2 h-2 rounded-full bg-sentiment-bull" />
              Live Indicator
            </span>
            
            <div className="shimmer h-10 w-32 rounded-lg bg-surface-skeleton" />
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Typography & Gradients</h2>
            <p className="text-text-secondary">Responsive Typography und Gradient-Text</p>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-fluid-3xl font-bold text-gradient-brand">
              Große Gradient-Überschrift
            </h1>
            
            <div className="flex flex-wrap gap-6 items-center">
              <span className="text-gradient-success text-3xl font-bold">
                +24.5%
              </span>
              <span className="text-gradient-danger text-3xl font-bold">
                -12.3%
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-fluid-xl">Extra Large Fluid Text</p>
              <p className="text-fluid-lg">Large Fluid Text</p>
              <p className="text-fluid-base">Base Fluid Text</p>
              <p className="text-fluid-sm">Small Fluid Text</p>
            </div>
          </div>
        </section>

        {/* Border Glows Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Border Glows</h2>
            <p className="text-text-secondary">Leuchtende Borders für Highlights</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-glow-brand p-6 rounded-xl bg-surface">
              <h3 className="font-semibold mb-2">Brand Glow</h3>
              <p className="text-sm text-text-secondary">
                Emerald glow effect
              </p>
            </div>
            
            <div className="border-glow-success p-6 rounded-xl bg-surface">
              <h3 className="font-semibold mb-2">Success Glow</h3>
              <p className="text-sm text-text-secondary">
                Green success glow
              </p>
            </div>
            
            <div className="border-glow-danger p-6 rounded-xl bg-surface">
              <h3 className="font-semibold mb-2">Danger Glow</h3>
              <p className="text-sm text-text-secondary">
                Red danger glow
              </p>
            </div>
          </div>
        </section>

        {/* Elevation Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Elevation & Depth</h2>
            <p className="text-text-secondary">Verschiedene Schatten-Ebenen für visuielle Hierarchie</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="elevation-low p-6 rounded-xl bg-surface">
              <h3 className="font-semibold text-sm mb-2">Low</h3>
              <p className="text-xs text-text-secondary">
                Subtiler Schatten
              </p>
            </div>
            
            <div className="elevation-medium p-6 rounded-xl bg-surface">
              <h3 className="font-semibold text-sm mb-2">Medium</h3>
              <p className="text-xs text-text-secondary">
                Mittlerer Schatten
              </p>
            </div>
            
            <div className="elevation-high p-6 rounded-xl bg-surface">
              <h3 className="font-semibold text-sm mb-2">High</h3>
              <p className="text-xs text-text-secondary">
                Starker Schatten
              </p>
            </div>
            
            <div className="elevation-float p-6 rounded-xl bg-surface">
              <h3 className="font-semibold text-sm mb-2">Float</h3>
              <p className="text-xs text-text-secondary">
                Schwebt über Seite
              </p>
            </div>
          </div>
        </section>

        {/* Complex Example */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Komplettes Beispiel</h2>
            <p className="text-text-secondary">Dashboard Card mit allen Features kombiniert</p>
          </div>
          
          <div className="card-glass hover-lift elevation-medium p-6 rounded-3xl space-y-4 max-w-md">
            <div className="flex items-center justify-between">
              <h3 className="text-fluid-lg font-semibold">
                Trading Performance
              </h3>
              <span className="pulse-live px-3 py-1 rounded-full bg-sentiment-bull-bg text-sentiment-bull text-xs font-semibold">
                Live
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-text-tertiary">
                Net P&L (30d)
              </span>
              <div className="text-gradient-success text-3xl font-bold">
                +$12,450
              </div>
              <p className="text-sm text-text-secondary">
                ↑ 24.5% from last month
              </p>
            </div>

            <div className="border-glow-success p-3 rounded-xl bg-sentiment-bull-bg/50">
              <span className="text-xs text-sentiment-bull font-medium">
                ✓ Strong uptrend detected
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="btn btn-primary flex-1">
                View Details
              </button>
              <button className="btn btn-ghost">
                Export
              </button>
            </div>
          </div>
        </section>

        {/* Scrollbar Demo */}
        <section className="space-y-6">
          <div>
            <h2 className="text-fluid-2xl font-bold text-text-primary mb-2">Custom Scrollbars</h2>
            <p className="text-text-secondary">Moderne Scrollbar-Styles</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-sm">Custom Scrollbar</h3>
              <div className="scrollbar-custom h-48 overflow-y-auto p-4 bg-surface rounded-xl border border-border">
                {Array.from({ length: 20 }).map((_, i) => (
                  <p key={i} className="text-sm text-text-secondary mb-2">
                    Zeile {i + 1}: Scrollbare Content mit styled scrollbar
                  </p>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-sm">Hidden Scrollbar</h3>
              <div className="scrollbar-hide h-48 overflow-y-auto p-4 bg-surface rounded-xl border border-border">
                {Array.from({ length: 20 }).map((_, i) => (
                  <p key={i} className="text-sm text-text-secondary mb-2">
                    Zeile {i + 1}: Scrollbare Content ohne scrollbar
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </DashboardShell>
  );
}
