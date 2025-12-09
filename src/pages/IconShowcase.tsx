import React from 'react'

/**
 * IconShowcase - Displays all PWA icons from /public/icons/
 * Useful for verifying icon quality and maskable areas
 */
export default function IconShowcase() {
  const icons = [
    { size: 32, name: 'icon-32.png' },
    { size: 48, name: 'icon-48.png' },
    { size: 64, name: 'icon-64.png' },
    { size: 72, name: 'icon-72.png' },
    { size: 96, name: 'icon-96.png' },
    { size: 128, name: 'icon-128.png' },
    { size: 152, name: 'icon-152.png' },
    { size: 167, name: 'icon-167.png' },
    { size: 180, name: 'icon-180.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 256, name: 'icon-256.png' },
    { size: 384, name: 'icon-384.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 1024, name: 'icon-1024.png' },
  ]

  return (
    <div className="min-h-screen bg-bg text-text-primary p-8" data-testid="icon-showcase-page">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 text-gradient-brand">
            PWA Icon Showcase
          </h1>
          <p className="text-text-secondary text-lg">
            All icons are <span className="text-brand font-semibold">maskable</span> and optimized for Android/iOS home screens
          </p>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {icons.map((icon) => (
            <div
              key={icon.size}
              className="rounded-xl border border-border bg-surface/80 p-6 shadow-card-subtle transition hover:border-brand/60 hover:shadow-glow-accent"
            >
              {/* Icon Preview */}
              <div className="flex items-center justify-center mb-4 rounded-lg bg-surface-subtle p-6 aspect-square">
                <img
                  src={`/icons/${icon.name}`}
                  alt={`${icon.size}x${icon.size} icon`}
                  width={icon.size > 128 ? 128 : icon.size}
                  height={icon.size > 128 ? 128 : icon.size}
                  className="rounded-lg"
                  style={{
                    imageRendering: icon.size <= 96 ? 'pixelated' : 'auto',
                  }}
                />
              </div>

              {/* Icon Info */}
              <div className="text-center">
                <div className="text-xl font-bold text-brand mb-1">
                  {icon.size}x{icon.size}
                </div>
                <div className="text-sm text-text-tertiary font-mono">{icon.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Maskable Info */}
        <div className="mt-4 rounded-xl border border-border bg-surface/70 p-8 shadow-card-subtle">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-text-primary">
            <span className="text-brand">✓</span>
            Maskable Icons
          </h2>
          <div className="text-text-secondary space-y-3">
            <p>
              All icons are marked as <code className="rounded bg-surface-subtle px-2 py-1 text-brand">"purpose": "any maskable"</code> in the manifest.
            </p>
            <p>
              This means they adapt to different device shapes (rounded squares, circles, squircles) automatically.
            </p>
            <p className="text-text-tertiary text-sm">
              <strong>Safe zone:</strong> Keep important content within 80% of the icon area (center).
            </p>
          </div>
        </div>

        {/* Favicon Info */}
        <div className="rounded-xl border border-border bg-surface/80 p-6 shadow-card-subtle">
          <h3 className="text-xl font-bold mb-3 text-text-primary">Additional Assets</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="/favicon.ico" alt="Favicon" width={32} height={32} />
                <div>
                  <div className="font-semibold text-text-primary">favicon.ico</div>
                  <div className="text-sm text-text-tertiary">256x256 multi-resolution</div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="/apple-touch-icon.png" alt="Apple Touch" width={32} height={32} className="rounded-lg" />
                <div>
                  <div className="font-semibold text-text-primary">apple-touch-icon.png</div>
                  <div className="text-sm text-text-tertiary">180x180 iOS home screen</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Info */}
        <div className="rounded-xl border border-border bg-surface/70 p-6 shadow-card-subtle">
          <h3 className="text-lg font-semibold mb-3 text-text-primary">Test Installation</h3>
          <ol className="list-decimal list-inside space-y-2 text-text-secondary">
            <li>Open Chrome DevTools → <span className="text-brand">Application</span></li>
            <li>Check <span className="text-brand">Manifest</span> section</li>
            <li>Verify all icons are listed</li>
            <li>Click <span className="text-brand">Install</span> button in address bar</li>
            <li>Add to home screen on mobile devices</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
