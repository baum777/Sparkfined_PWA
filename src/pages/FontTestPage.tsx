/**
 * Font Test Page
 * 
 * Test JetBrains Mono rendering
 * Route: /font-test (add to RoutesRoot.tsx if needed)
 */

export default function FontTestPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Font Test Page</h1>
        
        {/* System Font (Sans) */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-2 text-xs text-zinc-500">System Font (Sans-Serif)</p>
          <p className="text-sm text-zinc-100">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-base text-zinc-100">
            0123456789 !@#$%^&*()
          </p>
          <p className="text-lg text-zinc-100">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </p>
        </div>
        
        {/* Monospace Font (JetBrains Mono) */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="mb-2 text-xs text-zinc-500">JetBrains Mono (Monospace)</p>
          <p className="font-mono text-sm text-zinc-100">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="font-mono text-base text-zinc-100">
            0123456789 !@#$%^&*()
          </p>
          <p className="font-mono text-lg text-zinc-100">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </p>
        </div>
        
        {/* Contract Address Example */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-2 text-xs text-zinc-500">Contract Address (CA) — Mono</p>
          <p className="font-mono text-sm text-zinc-100">
            7xKFc8Tp9jMgQGM1dQHqsJVYUdFj3kZpRbCxqzNabc123
          </p>
          <p className="font-mono text-xs text-zinc-500">
            So11111111111111111111111111111111111111112
          </p>
        </div>
        
        {/* Numeric Precision */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-2 text-xs text-zinc-500">Numeric Precision — Mono</p>
          <p className="font-mono text-base text-zinc-100">
            Price: 0.00012345 BTC
          </p>
          <p className="font-mono text-base text-emerald-400">
            +€247.50 (+12.5%)
          </p>
          <p className="font-mono text-base text-rose-400">
            -€89.20 (-4.8%)
          </p>
        </div>
        
        {/* Character Distinction Test */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-2 text-xs text-zinc-500">Character Distinction (Important for CA)</p>
          <div className="space-y-1">
            <p className="font-mono text-sm text-zinc-100">
              <span className="text-zinc-500">0 vs O:</span> 0O0O0O (zero vs capital O)
            </p>
            <p className="font-mono text-sm text-zinc-100">
              <span className="text-zinc-500">1 vs l vs I:</span> 1l1I1l (one vs lowercase L vs capital i)
            </p>
            <p className="font-mono text-sm text-zinc-100">
              <span className="text-zinc-500">5 vs S:</span> 5S5S5S (five vs capital S)
            </p>
          </div>
        </div>
        
        {/* Font Detection */}
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
          <p className="mb-2 text-sm font-semibold text-zinc-100">Font Detection</p>
          <p className="text-xs text-zinc-400 mb-2">
            Open DevTools → Elements → Inspect the text below → Check "Computed" tab → font-family
          </p>
          <p className="font-mono text-base text-emerald-400">
            This should be "JetBrains Mono"
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            If you see "Fira Code" or "monospace" → JetBrains Mono not loaded yet (using fallback)
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Check Network tab for font file or Google Fonts request
          </p>
        </div>
        
        {/* Instructions */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-400">Installation Status</p>
          <div className="space-y-2 text-sm text-zinc-300">
            <p>✅ Google Fonts CDN aktiv (Fallback)</p>
            <p>⏳ Lokale Font-Datei fehlt noch</p>
            <p className="mt-3 text-xs text-zinc-500">
              Für Production: Font lokal hosten (siehe <code className="rounded bg-zinc-800 px-1 py-0.5">/public/fonts/README.md</code>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
