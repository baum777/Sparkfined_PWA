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
    <div className="min-h-screen bg-void-lighter text-mist p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-spark to-spark bg-clip-text text-transparent">
            PWA Icon Showcase
          </h1>
          <p className="text-fog text-lg">
            All icons are <span className="text-spark font-semibold">maskable</span> and optimized for Android/iOS home screens
          </p>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {icons.map((icon) => (
            <div
              key={icon.size}
              className="bg-smoke border border-smoke-light rounded-xl p-6 hover:border-spark/50 transition-all duration-300 hover:shadow-glow-spark"
            >
              {/* Icon Preview */}
              <div className="flex items-center justify-center mb-4 bg-void-lighter rounded-lg p-6 aspect-square">
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
                <div className="text-xl font-bold text-spark mb-1">
                  {icon.size}x{icon.size}
                </div>
                <div className="text-sm text-ash font-mono">{icon.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Maskable Info */}
        <div className="mt-16 bg-gradient-to-r from-spark/50 to-spark/50 border border-spark/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-spark">✓</span>
            Maskable Icons
          </h2>
          <div className="text-fog space-y-3">
            <p>
              All icons are marked as <code className="bg-smoke-light px-2 py-1 rounded text-spark">"purpose": "any maskable"</code> in the manifest.
            </p>
            <p>
              This means they adapt to different device shapes (rounded squares, circles, squircles) automatically.
            </p>
            <p className="text-fog text-sm">
              <strong>Safe zone:</strong> Keep important content within 80% of the icon area (center).
            </p>
          </div>
        </div>

        {/* Favicon Info */}
        <div className="mt-8 bg-smoke border border-smoke-light rounded-xl p-6">
          <h3 className="text-xl font-bold mb-3 text-spark">Additional Assets</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="/favicon.ico" alt="Favicon" width={32} height={32} />
                <div>
                  <div className="font-semibold text-mist">favicon.ico</div>
                  <div className="text-sm text-ash">256x256 multi-resolution</div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="/apple-touch-icon.png" alt="Apple Touch" width={32} height={32} className="rounded-lg" />
                <div>
                  <div className="font-semibold text-mist">apple-touch-icon.png</div>
                  <div className="text-sm text-ash">180x180 iOS home screen</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Info */}
        <div className="mt-8 border border-smoke-light rounded-xl p-6 bg-smoke/50">
          <h3 className="text-lg font-semibold mb-3 text-mist">Test Installation</h3>
          <ol className="list-decimal list-inside space-y-2 text-fog">
            <li>Open Chrome DevTools → <span className="text-spark">Application</span></li>
            <li>Check <span className="text-spark">Manifest</span> section</li>
            <li>Verify all icons are listed</li>
            <li>Click <span className="text-spark">Install</span> button in address bar</li>
            <li>Add to home screen on mobile devices</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
