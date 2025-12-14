# Navigation Map (Current Version)

| Bereich | Label/Icon | Route | Page Component | Hinweise |
| --- | --- | --- | --- | --- |
| Rail (icon-first) | Dashboard (grid icon) | /dashboard | `DashboardPage` | Default landing; /board → /dashboard redirect. |
| Rail (icon-first) | Journal (pen icon) | /journal | `JournalPage` | Journal v2 UI is the default; /journal/v2 redirects here. |
| Rail (icon-first) | Chart (sparkline icon) | /chart | `ChartPage` | /analysis and /analysis-v2 redirect here. |
| Rail (icon-first) | Watchlist (star icon) | /watchlist | `WatchlistPage` | — |
| Topbar | Alerts (bell icon) | /alerts | `AlertsPage` | Only alerts + settings are visible in the topbar. |
| Topbar | Settings (gear icon) | /settings | `SettingsPage` | Only alerts + settings are visible in the topbar. |

**Redirects (legacy → canonical)**
- `/journal/v2` → `/journal`
- `/analysis`, `/analysis-v2`, `/analyze` → `/chart`
