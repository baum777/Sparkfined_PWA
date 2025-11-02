# Sparkfined PWA – Performance Audit (E-18)

## Ziele

- Bundle < 300 KB (gzip)  
- p95 Route-Load < 350 ms  
- PWA Score ≥ 90  

## Checkliste

- [ ] `pnpm analyze` → Chart/React Split erfolgreich  
- [ ] Lazy Load Routes: Analyze, Journal, Settings  
- [ ] Lighthouse Report (Performance/PWA/Best-Practices/Accessibility)  
- [ ] SW Cache Hit Rate > 90 %  
- [ ] p95 Navigation < 400 ms  

## Commands

```bash
# Build the project
pnpm build

# Preview the built project locally
pnpm preview

# Run bundle analyzer (generates dist/stats.html)
pnpm analyze

# Run Lighthouse audit (requires preview server running on port 4173)
pnpm lighthouse
```

## Metrics to Track

### Bundle Size
- Target: < 300 KB gzipped
- Use `pnpm analyze` to generate visual bundle analysis
- Check for:
  - Large dependencies that could be replaced
  - Duplicated code across chunks
  - Unnecessary polyfills

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### PWA Score
- Target: ≥ 90
- Check manifest configuration
- Verify service worker caching strategy
- Test offline functionality

### Route Performance
- Measure time to interactive for each route
- Target p95 < 350ms for route transitions
- Lazy-loaded routes should load within 200ms

## Optimization Strategies

### Code Splitting
- ✅ Routes are lazy-loaded (Analyze, Chart, Journal, Replay, Settings, Notifications, Access)
- ✅ Vendor chunks separated (react, chart, analyze)
- Consider further splitting large sections

### Caching Strategy
- Service Worker caches static assets
- API responses use StaleWhileRevalidate for Dexscreener
- NetworkFirst for other APIs with 5s timeout

### Image Optimization
- Use WebP format where supported
- Lazy load images below the fold
- Consider image CDN for remote assets

### Tree Shaking
- Ensure side-effect-free imports
- Use named imports instead of default where possible
- Check for unused exports

## Ausgabe

- Bundle analysis report → `/dist/stats.html`
- Lighthouse HTML report → generated in working directory  
- Results should be attached to GitHub Action CI runs

## Continuous Monitoring

Consider adding:
- Bundle size checks in CI/CD pipeline
- Lighthouse CI for automated audits
- Real User Monitoring (RUM) for production metrics
- Performance budgets enforcement

## Notes

- PWA features include offline support via Service Worker
- IndexedDB used for local data persistence
- Critical CSS inlined for faster initial render
- Font preloading for performance boost
