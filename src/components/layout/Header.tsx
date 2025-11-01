export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg-elevated/90 backdrop-blur-md border-b border-border shadow-card-subtle">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Brand Icon: Neon S with subtle glow */}
          <div className="relative w-9 h-9 rounded-md bg-brand-gradient flex items-center justify-center shadow-glow-brand transition-all duration-180 hover:shadow-glow-accent hover:scale-105">
            <span className="text-xl font-display font-bold text-white">S</span>
            <div className="absolute inset-0 rounded-md bg-accent/10 opacity-0 hover:opacity-100 transition-opacity duration-180" />
          </div>
          
          {/* Brand Wordmark */}
          <h1 className="text-xl font-display font-bold text-text-primary tracking-tight">
            Spark<span className="text-brand">fined</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Future: settings, profile, theme toggle */}
        </div>
      </div>
    </header>
  )
}
