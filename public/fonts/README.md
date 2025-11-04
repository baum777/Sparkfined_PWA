# Fonts — JetBrains Mono

## Current Status

**✅ Google Fonts CDN active** (immediate fallback, works now)  
**⏳ Local font file:** Not yet added (optional for production)

## Test Font Rendering

Visit: `/font-test` (add route or create test page)

Or inspect any `.font-mono` element in DevTools:
- Computed → font-family should show "JetBrains Mono"
- Network → Should see font loading (Google Fonts or local)

---

## Option 1: Keep Google Fonts CDN (Current)

**Pros:**
- ✅ Works immediately (no download needed)
- ✅ Cached by browser (shared across sites)
- ✅ Auto-updates

**Cons:**
- ⚠️ External request (slower on first load)
- ⚠️ Privacy concern (Google tracking)
- ⚠️ Requires internet connection

**No action needed** — already active in `src/styles/fonts.css`

---

## Option 2: Self-Host (Recommended for Production)

**Why self-host:**
- ✅ Faster (no external request)
- ✅ Offline-friendly (PWA)
- ✅ Privacy (no Google tracking)
- ✅ Full control

### Download Instructions

1. **Visit:** https://www.jetbrains.com/lp/mono/
2. **Click:** "Download" button
3. **Extract:** ZIP file
4. **Find:** `fonts/webfonts/` directory in extracted files
5. **Copy to this directory:**
   - `JetBrainsMono-Regular.woff2` → rename to `jetbrains-mono-latin.woff2`
   - `JetBrainsMono-Medium.woff2` → rename to `jetbrains-mono-medium-latin.woff2` (optional)

### Latin Subset (Smaller File)

For even smaller file size (~30 KB instead of ~150 KB):

1. **Visit:** https://everythingfonts.com/subsetter
2. **Upload:** JetBrains Mono TTF file
3. **Select Characters:** 
   - Basic Latin
   - Latin-1 Supplement
   - Numbers & Punctuation
4. **Export:** WOFF2 format
5. **Save as:** `jetbrains-mono-latin.woff2`

### Verify Local Font Works

1. **Place file:** `public/fonts/jetbrains-mono-latin.woff2`
2. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **DevTools → Network:** Filter "font" → Should see local file loading
4. **DevTools → Elements:** Inspect `.font-mono` → font-family should be "JetBrains Mono"

If local file loads, Google Fonts CDN won't be used anymore (local has priority).

---

## Usage in Code

```tsx
// Contract Addresses (CA)
<input className="font-mono text-sm" placeholder="7xKF...abc" />

// Journal Code Blocks
<pre className="font-mono text-sm whitespace-pre-wrap">
  Trade entry: BTC/USD @ 50,200
</pre>

// Numeric Precision (Prices)
<span className="font-mono text-base">0.00012345</span>

// Timestamps (absolute)
<time className="font-mono text-xs">2025-11-04 14:32:10</time>
```

---

## Fallback Chain

1. **Local WOFF2** (`/fonts/jetbrains-mono-latin.woff2`) — Fastest
2. **Google Fonts CDN** — If local not found
3. **Fira Code** — If Google Fonts fails
4. **System Monospace** — Final fallback

Current: Using **Google Fonts CDN** (fallback #2)

---

## Performance Impact

| Method | Size | Load Time (4G) | Offline |
|--------|------|----------------|---------|
| **Local (subset)** | ~30 KB | ~50ms | ✅ Yes |
| **Local (full)** | ~150 KB | ~200ms | ✅ Yes |
| **Google CDN** | ~150 KB | ~300ms | ❌ No |

---

## Next Steps

**For MVP/Testing:** Keep Google Fonts CDN (current setup) ✅

**For Production:** Self-host local font:
1. Download font
2. Place in `public/fonts/`
3. Test with hard refresh
4. Remove `@import` line from `fonts.css` (optional, local will override anyway)

---

**Font is working now via Google Fonts CDN** ✅  
**You can continue to Phase B**
