# Developer Notes

- Commit format: fix(PX): description
- Regression test required for all P0/P1
- Run pipeline before commit
- Watchlist hydration: guard Zustand selectors (hoisted/memoized) and dedupe hydration by symbol key to avoid React 18 `getSnapshot`/depth loops on `/watchlist`.
