# SEO & Sitemap Configuration

**Last Updated**: 2025-12-08  
**Status**: ✅ Configured  
**Files**: `public/sitemap.xml`, `public/robots.txt`

---

## Overview

Sparkfined PWA includes SEO configuration to ensure proper indexing by search engines:

- **XML Sitemap** (`/sitemap.xml`) - Machine-readable list of all public pages
- **Robots.txt** (`/robots.txt`) - Crawler instructions and sitemap reference

---

## Sitemap Structure

### Current Routes (as of 2025-12-08)

The sitemap includes all production-ready routes from `src/routes/RoutesRoot.tsx`:

#### Core Features (Priority 0.8-1.0)
- `/` - Homepage (redirects to `/dashboard-v2`)
- `/landing` - Landing page
- `/dashboard-v2` - Main dashboard
- `/journal-v2` - Hero's journey trading journal
- `/chart-v2` - Multi-provider chart system
- `/analysis-v2` - Market analysis

#### Features (Priority 0.6-0.7)
- `/watchlist-v2` - Watchlist management
- `/alerts-v2` - Price alerts & triggers
- `/replay` - Chart replay mode
- `/oracle` - Daily AI insights

#### Secondary Pages (Priority 0.4-0.5)
- `/notifications` - Notification center
- `/signals` - Signals teaser
- `/lessons` - Lessons teaser
- `/settings-v2` - Settings

### Excluded Routes

The following routes are **NOT** included in the sitemap:

- **Dev-only routes**: `/styles`, `/ux`, `/icons`
- **API endpoints**: `/api/*`
- **Legacy redirects**: `/board`, `/dashboard`, `/journal`, `/analyze`, etc. (redirect to V2)
- **Dynamic routes**: `/replay/:sessionId` (only base path `/replay` included)

---

## Priority & Change Frequency

### Priority Levels
- **1.0**: Homepage, most critical entry points (Dashboard)
- **0.8-0.9**: Core features (Journal, Analysis, Chart)
- **0.6-0.7**: Important features (Alerts, Watchlist, Replay)
- **0.4-0.5**: Secondary pages, settings, teasers

### Change Frequency
- **daily**: Content changes daily (Dashboard, Journal, Alerts, Analysis, Notifications, Oracle)
- **weekly**: Updated weekly (Chart, Replay, Landing)
- **monthly**: Rarely changes (Settings, Lessons, Signals teasers)

---

## Robots.txt Configuration

The `robots.txt` file:
- Allows all user agents by default
- Disallows dev routes (`/styles`, `/ux`, `/icons`)
- Disallows API routes (`/api/*`)
- References the sitemap location
- Optional crawl delay (currently commented out)

---

## Deployment Checklist

### Before First Deployment

1. **Update Domain**
   - Replace `https://your-domain.vercel.app` in `public/sitemap.xml`
   - Replace `https://your-domain.vercel.app` in `public/robots.txt`

2. **Verify Routes**
   - Ensure all routes in `sitemap.xml` match actual production routes
   - Remove any experimental/dev routes

3. **Test Locally**
   ```bash
   pnpm dev
   # Visit http://localhost:3000/sitemap.xml
   # Visit http://localhost:3000/robots.txt
   ```

### After Deployment

1. **Verify Accessibility**
   ```bash
   curl https://your-domain.vercel.app/sitemap.xml
   curl https://your-domain.vercel.app/robots.txt
   ```

2. **Submit to Google Search Console**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add your property (domain)
   - Submit sitemap URL: `https://your-domain.vercel.app/sitemap.xml`

3. **Monitor Indexing**
   - Check Google Search Console for crawl errors
   - Monitor indexed pages count
   - Review any coverage issues

---

## Maintenance

### When to Update Sitemap

Update `public/sitemap.xml` when:

1. **New routes are added**
   - Add new route to sitemap with appropriate priority and changefreq

2. **Routes are removed or deprecated**
   - Remove from sitemap or update to redirect

3. **Page importance changes**
   - Update priority values (0.4-1.0)

4. **Content update patterns change**
   - Update changefreq (daily, weekly, monthly)

5. **Significant content updates**
   - Update `<lastmod>` date for affected pages

### Update Process

1. Edit `public/sitemap.xml`
2. Update `<lastmod>` date to current date (YYYY-MM-DD)
3. Test locally (`http://localhost:3000/sitemap.xml`)
4. Commit and deploy
5. Verify in production
6. Optionally resubmit to Google Search Console (auto-discovery usually works)

---

## Technical Details

### File Locations
- **Sitemap**: `/workspace/public/sitemap.xml`
- **Robots.txt**: `/workspace/public/robots.txt`
- **Route definitions**: `/workspace/src/routes/RoutesRoot.tsx`

### Vercel Configuration
- No special configuration needed for serving static files
- `vercel.json` rewrites handle SPA routing
- Static files in `/public` are served at root path

### PWA Considerations
- Sitemap is for search engines, not PWA functionality
- Service worker caches sitemap.xml if configured
- Offline access to sitemap is not required

---

## Troubleshooting

### Sitemap Not Accessible

**Problem**: `404` on `/sitemap.xml`

**Solution**:
1. Check file exists in `public/sitemap.xml`
2. Verify Vercel deployment includes public files
3. Check `vercel.json` rewrites don't block static files

### Routes Not Indexed

**Problem**: Google doesn't index certain pages

**Possible Causes**:
1. Route requires authentication (search engines can't access)
2. `robots.txt` blocks the route
3. Page has `<meta name="robots" content="noindex">`
4. Content is loaded dynamically and not SSR-friendly

**Solution**:
- Ensure public pages are accessible without auth
- Check `robots.txt` doesn't disallow the route
- Review HTML meta tags
- Consider SSR/SSG for critical pages (future enhancement)

### Sitemap Format Errors

**Problem**: Google reports sitemap errors

**Solution**:
1. Validate XML syntax (use online validator)
2. Ensure all URLs are absolute (include domain)
3. Check `<lastmod>` dates are in ISO format (YYYY-MM-DD)
4. Verify XML schema namespace is correct

---

## Future Enhancements

### Dynamic Sitemap Generation

Currently, the sitemap is static. Future improvements:

1. **Auto-generation from routes**
   - Script to parse `RoutesRoot.tsx` and generate sitemap
   - Run as part of build process
   - Ensures sitemap always matches actual routes

2. **Dynamic content pages**
   - Include journal entries (if public)
   - Include analysis pages
   - Include replay sessions (if shareable)

3. **Multiple sitemaps**
   - Split into multiple files for large sites
   - Use sitemap index file
   - Separate static vs. dynamic content

4. **Automatic `<lastmod>` updates**
   - Track git commits per page
   - Set lastmod based on last file change
   - Update automatically during build

### SEO Enhancements

1. **Meta tags**
   - Add `<title>` and `<meta description>` to all pages
   - Open Graph tags for social sharing
   - Twitter Card meta tags

2. **Structured data**
   - JSON-LD schema markup
   - Article schema for journal entries
   - Organization schema for brand info

3. **Canonical URLs**
   - Prevent duplicate content issues
   - Handle old/new route versions

---

## Resources

- [XML Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google Search Console](https://search.google.com/search-console)

---

**Document History**:
- 2025-12-08: Initial creation, sitemap and robots.txt configured for V2 routes
