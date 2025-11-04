# Fonts — JetBrains Mono

## Download Instructions

1. Visit: https://www.jetbrains.com/lp/mono/
2. Click "Download" button
3. Extract ZIP file
4. Copy these files to this directory:
   - `jetbrains-mono-latin.woff2` (Regular weight, Latin subset)
   - `jetbrains-mono-medium-latin.woff2` (Medium weight, optional)

## Latin Subset (Recommended)

For smaller file size (~30 KB instead of ~150 KB):
- Use online font subsetter: https://everythingfonts.com/subsetter
- Upload JetBrains Mono TTF
- Select: Latin (Basic Latin + Latin-1 Supplement)
- Export as WOFF2

## Alternative: Google Fonts

If JetBrains Mono is unavailable, the app will fallback to:
- `'Fira Code'` (monospace alternative)
- `monospace` (system default)

## Usage in Code

```tsx
// Contract Addresses
<input className="font-mono text-sm" />

// Journal Code Blocks
<pre className="font-mono text-sm" />

// Numeric Precision (Prices)
<span className="font-mono text-base">0.00012345</span>
```
