Soll-Spezifikation (Tabs & Regeln):

Primary Tabs: Dashboard, Journal, Learn (Route bleibt /lessons), Chart, Alerts, Settings

Secondary Tabs: Watchlist, Oracle

Replay-Regel: kein eigener Tab; /replay ist Route-Alias → setzt Chart Replay State/Mode.

Dev-only Tabs: optional, nicht als Loveable-MVP requirement werten.

Auftrag:

Ist-Inventar: Finde alle Tabs im Code (Nav configs, Tab-Komponenten, Router). Erstelle Liste mit tabId, label, order, route(s), component, status (done/partial/missing).

Soll-Import: Lies ./loveable-import als Soll-Quelle und extrahiere dieselben Felder + Must-have Inhalte.

Ist↔Soll Mapping & Bewertung: Pro Soll-Tab: Match / Missing / Mismatch / Extra + Severity + kurze Begründung.

Verdrahtung-Check (fokus: neue Tabs, aber bitte pro Soll-Tab dokumentieren):

Routing/Nav: Entry vorhanden, Reihenfolge, aktive Markierung, Deep-Link/Refresh, Guards/FeatureFlags.

API: Endpoints/Queries/Mutations je Tab, Cache/Invalidation, Auth, Error/Loading/Empty states.

WalletConnect: connect/disconnect, account state, chain switching, “wrong network”, rejected signature.

Onchain: contracts/addresses per chain, ABI usage, reads (format/decimals/BigInt), writes (tx lifecycle: sign→pending→confirm/fail), event/log refresh.

Output: report.md mit (a) Tabellen Ist/Soll/Diff, (b) “Wiring Sheet” je Tab, (c) priorisierte Fixliste.

② (ausführlich, mit tab-spezifischen Must-haves als Acceptance Criteria):

Für jeden Soll-Tab prüfe UI-Inhalte + Wiring. Dokumentiere fundiert mit Datei-/Pfadreferenzen.

Dashboard (Must-haves + Wiring): Header+Meta+CTA “Log entry”, KPI Strip (5), Cards (Daily Bias/Holdings/Trade Log), Secondary Cards, Bottom Grid, FAB + Quick Actions + Overlay + Alert Create Entry Point.

Wiring: KPI/holdings/trades Quellen (API/onchain), Refresh/invalidations, CTA flows (entry create).

Journal (V2 Layout + Contract): Input Column (Emotional State required, Thesis required, Templates overwrite/merge/suggest, AI notes, Sticky Action Bar), Output Column (Archetype+Score, 2×2 Metrics, Insights Cards, History latest 5).

Contract: Validation + Autosave Semantik identisch → überprüfe Trigger, debounce, persistence, error recovery.

Learn (/lessons): Module list + progress, lesson viewer (markdown/json), optional quizzes/AI summaries.

Wiring: content source (API/static), progress persistence (API/wallet?), offline behavior falls relevant.

Chart: TopBar (timeframes/replay/export/mobile actions), Sidebar (markets/sessions), Toolbar (indicators/drawings/alerts), Bottom Panel Tabs (Grok Pulse + Journal Notes), Canvas + markers.

Replay: /replay alias → Chart replay state. Prüfe: route handling, state init, URL params, back/forward behavior.

Alerts: list+filters, create flow (ideal RightSheet), empty states CTA, URL-prefill semantics, stable testids.

Wiring: create/update/delete APIs, optional onchain triggers?, prefill parsing, deterministic selectors.

Settings: Sektionen identisch (Appearance, Chart prefs, Notifications, Connected Wallets, Monitoring, Token Usage, Risk Defaults, Export/Backup, Advanced/Diagnostics, Danger Zone typed RESET).

Wiring: prefs storage, wallet management, export endpoints, dangerous actions safeguards.

Watchlist: assets list/table, selection→detail panel (split/sheet), open chart CTA, sort/filter nur wenn vorhanden sonst missing.

Wiring: prices source (API/onchain/oracle), navigation to chart with correct params.

Oracle: reward banner (if exists), full report block (oracle-pre), theme filter + history chart + list; additive Loveable insights nur wenn policy erlaubt.

Wiring: oracle data pipeline, pagination/history, chart series source.

Bewertungssystem: Pro Tab Score-Matrix: UI Must-haves, Routing/Nav, API, Wallet, Onchain, States, A11y, Tests. Ausgabe als Tabelle + “Top Issues”.

③ (allumfassend, inkl. Artefakte/Automations-Checkliste):

Erzeuge normalisierte Artefakte:

tabs_inventory.json: alle gefundenen Tabs + routes + component refs

tabs_spec.json: Soll aus ./loveable-import + ob Primary/Secondary + Must-haves

tabs_diff.json: mapping + gaps + severity

wiring_matrix.json: pro Tab: nav, routes, api(endpoints, queryKeys, mutations), wallet(connectors, states), onchain(chains, contracts, reads, writes, events), guards(flags/roles), tests

Automatisierbare Checks (Static):

Jeder Soll-Tab existiert in Nav+Router; /lessons unverändert; /replay alias nur Chart-mode.

Jede API-Anfrage hat Loading/Error/Empty handling.

Wallet gating: UI reagiert sauber auf disconnected/wrong network/rejected signature.

Onchain: Address registry pro chain, ABI konsistent, BigInt/decimals korrekt, tx lifecycle UI vorhanden.

Alerts: URL-prefill parser + stabile data-testid nach Pattern.

Smoke-Test-Suite (manuell oder e2e): Pro Tab: open via click + deep-link + refresh; connect wallet; wrong network; onchain read; write tx (reject/revert/success) → UI & state updates.