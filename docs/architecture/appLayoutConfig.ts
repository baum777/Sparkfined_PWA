// docs/architecture/appLayoutConfig.ts

export type RouteKind = "page" | "section" | "layout" | "api";
export type LayoutKind = "root" | "app-shell" | "tabbed" | "plain";

export interface RouteNode {
  path: string;
  name: string;
  kind: RouteKind;
  layout?: LayoutKind;
  navGroup?: "main" | "journal" | "analysis" | "settings" | "help";
  tabId?: string;
  icon?: string; // optional Icon-Token, z.B. "dashboard", "journal"
  children?: RouteNode[];
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  group?: "main" | "secondary";
}

export interface TabConfig {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export interface AppLayoutConfig {
  routes: RouteNode[];
  mainNav: NavItem[];
  bottomNav: NavItem[];
  journalTabs: TabConfig[];
}

export const appLayoutConfig: AppLayoutConfig = {
  // ---------------------------------------------------------------------------
  // 1) Vollständiger Routenbaum mit Layout-Informationen
  // ---------------------------------------------------------------------------
  routes: [
    {
      path: "/",
      name: "Root",
      kind: "layout",
      layout: "root",
      children: [
        {
          path: "/landing",
          name: "Landing",
          kind: "page",
          layout: "plain",
        },
        {
          path: "/app",
          name: "AppShell",
          kind: "layout",
          layout: "app-shell",
          children: [
            {
              path: "/app/dashboard",
              name: "Dashboard",
              kind: "page",
              layout: "plain",
              navGroup: "main",
              icon: "dashboard",
            },
            {
              path: "/app/markets",
              name: "Markets",
              kind: "section",
              layout: "plain",
              navGroup: "main",
              icon: "markets",
              children: [
                {
                  path: "/app/markets/spot",
                  name: "SpotMarkets",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/markets/favorites",
                  name: "FavoriteMarkets",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/markets/search",
                  name: "MarketSearch",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/markets/token/:address",
                  name: "TokenDetail",
                  kind: "page",
                  layout: "plain",
                },
              ],
            },

            // ------------------- JOURNAL 2.0 (Tabbed Layout) -------------------
            {
              path: "/app/journal",
              name: "Journal",
              kind: "section",
              layout: "tabbed",
              navGroup: "journal",
              icon: "journal",
              children: [
                // Tab: Entries (default)
                {
                  path: "/app/journal",
                  name: "JournalEntriesTab",
                  kind: "page",
                  layout: "tabbed",
                  navGroup: "journal",
                  tabId: "entries",
                  children: [
                    {
                      path: "/app/journal/new",
                      name: "JournalNew",
                      kind: "section",
                      layout: "plain",
                      children: [
                        {
                          path: "/app/journal/new/quick",
                          name: "JournalNewQuick",
                          kind: "page",
                          layout: "plain",
                        },
                        {
                          path: "/app/journal/new/advanced",
                          name: "JournalNewAdvanced",
                          kind: "page",
                          layout: "plain",
                        },
                        {
                          path: "/app/journal/new/import",
                          name: "JournalNewImport",
                          kind: "page",
                          layout: "plain",
                        },
                      ],
                    },
                    {
                      path: "/app/journal/:entryId",
                      name: "JournalEntryDetail",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/bulk",
                      name: "JournalBulkActions",
                      kind: "page",
                      layout: "plain",
                    },
                  ],
                },

                // Tab: Insights
                {
                  path: "/app/journal/insights",
                  name: "JournalInsightsTab",
                  kind: "page",
                  layout: "tabbed",
                  navGroup: "journal",
                  tabId: "insights",
                  children: [
                    {
                      path: "/app/journal/insights/list",
                      name: "JournalInsightsList",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/insights/:insightId",
                      name: "JournalInsightDetail",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/insights/history",
                      name: "JournalInsightsHistory",
                      kind: "page",
                      layout: "plain",
                    },
                  ],
                },

                // Tab: Journey
                {
                  path: "/app/journal/journey",
                  name: "JournalJourneyTab",
                  kind: "page",
                  layout: "tabbed",
                  navGroup: "journal",
                  tabId: "journey",
                  children: [
                    {
                      path: "/app/journal/journey/timeline",
                      name: "JournalJourneyTimeline",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/journey/snapshots",
                      name: "JournalJourneySnapshots",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/journey/goals",
                      name: "JournalJourneyGoals",
                      kind: "page",
                      layout: "plain",
                    },
                  ],
                },

                // Tab: Social
                {
                  path: "/app/journal/social",
                  name: "JournalSocialTab",
                  kind: "page",
                  layout: "tabbed",
                  navGroup: "journal",
                  tabId: "social",
                  children: [
                    {
                      path: "/app/journal/social/previews",
                      name: "JournalSocialPreviews",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/social/templates",
                      name: "JournalSocialTemplates",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/social/export",
                      name: "JournalSocialExport",
                      kind: "page",
                      layout: "plain",
                    },
                  ],
                },

                // Tab: Templates
                {
                  path: "/app/journal/templates",
                  name: "JournalTemplatesTab",
                  kind: "page",
                  layout: "tabbed",
                  navGroup: "journal",
                  tabId: "templates",
                  children: [
                    {
                      path: "/app/journal/templates/list",
                      name: "JournalTemplateList",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/templates/:templateId",
                      name: "JournalTemplateDetail",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/templates/new",
                      name: "JournalTemplateNew",
                      kind: "page",
                      layout: "plain",
                    },
                  ],
                },

                // Tab: Settings
                {
                  path: "/app/journal/settings",
                  name: "JournalSettingsTab",
                  kind: "page",
                  layout: "tabbed",
                  navGroup: "journal",
                  tabId: "settings",
                  children: [
                    {
                      path: "/app/journal/settings/tags",
                      name: "JournalTagManager",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/settings/privacy",
                      name: "JournalPrivacySettings",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/settings/ai",
                      name: "JournalAISettings",
                      kind: "page",
                      layout: "plain",
                    },
                    {
                      path: "/app/journal/settings/export",
                      name: "JournalExportImport",
                      kind: "page",
                      layout: "plain",
                    },
                  ],
                },
              ],
            },

            // ------------------- Replay -------------------
            {
              path: "/app/replay",
              name: "Replay",
              kind: "section",
              layout: "plain",
              navGroup: "main",
              icon: "replay",
              children: [
                {
                  path: "/app/replay/sessions",
                  name: "ReplaySessions",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/replay/session/:id",
                  name: "ReplaySessionDetail",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/replay/journal-link",
                  name: "ReplayJournalLink",
                  kind: "page",
                  layout: "plain",
                },
              ],
            },

            // ------------------- Alerts -------------------
            {
              path: "/app/alerts",
              name: "Alerts",
              kind: "section",
              layout: "plain",
              navGroup: "main",
              icon: "alerts",
              children: [
                {
                  path: "/app/alerts/list",
                  name: "AlertsList",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/alerts/new",
                  name: "AlertNew",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/alerts/:alertId",
                  name: "AlertDetail",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/alerts/history",
                  name: "AlertsHistory",
                  kind: "page",
                  layout: "plain",
                },
              ],
            },

            // ------------------- Watchlists -------------------
            {
              path: "/app/watchlists",
              name: "Watchlists",
              kind: "section",
              layout: "plain",
              navGroup: "main",
              icon: "watchlists",
              children: [
                {
                  path: "/app/watchlists/list",
                  name: "WatchlistsList",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/watchlists/:id",
                  name: "WatchlistDetail",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/watchlists/new",
                  name: "WatchlistNew",
                  kind: "page",
                  layout: "plain",
                },
              ],
            },

            // ------------------- Analysis / Grok Pulse / Oracle -------------------
            {
              path: "/app/analysis",
              name: "Analysis",
              kind: "section",
              layout: "plain",
              navGroup: "analysis",
              icon: "analysis",
              children: [
                {
                  path: "/app/analysis/token/:address",
                  name: "TokenAnalysis",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/analysis/teaser-vision",
                  name: "TeaserVision",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/analysis/daily-oracle",
                  name: "DailyOracle",
                  kind: "page",
                  layout: "plain",
                },
              ],
            },

            // ------------------- Settings -------------------
            {
              path: "/app/settings",
              name: "Settings",
              kind: "section",
              layout: "plain",
              navGroup: "settings",
              icon: "settings",
              children: [
                {
                  path: "/app/settings/profile",
                  name: "ProfileSettings",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/settings/theme",
                  name: "ThemeSettings",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/settings/integrations",
                  name: "IntegrationSettings",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/settings/advanced",
                  name: "AdvancedSettings",
                  kind: "page",
                  layout: "plain",
                },
              ],
            },

            // ------------------- Help -------------------
            {
              path: "/app/help",
              name: "Help",
              kind: "section",
              layout: "plain",
              navGroup: "help",
              icon: "help",
              children: [
                {
                  path: "/app/help/onboarding",
                  name: "HelpOnboarding",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/help/journal",
                  name: "HelpJournal",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/help/ai-insights",
                  name: "HelpAIInsights",
                  kind: "page",
                  layout: "plain",
                },
                {
                  path: "/app/help/changelog",
                  name: "Changelog",
                  kind: "page",
                  layout: "plain",
                },
              ],
            },
          ],
        },
        // API Root (nur als Referenz, nicht im App-Shell-Layout)
        {
          path: "/api",
          name: "ApiRoot",
          kind: "api",
          children: [
            { path: "/api/ai/assist", name: "AiAssist", kind: "api" },
            { path: "/api/journal", name: "JournalApi", kind: "api" },
            {
              path: "/api/journal/insights",
              name: "JournalInsightsApi",
              kind: "api",
            },
            { path: "/api/replay", name: "ReplayApi", kind: "api" },
            { path: "/api/alerts", name: "AlertsApi", kind: "api" },
            { path: "/api/watchlists", name: "WatchlistsApi", kind: "api" },
            { path: "/api/oracle", name: "DailyOracleApi", kind: "api" },
            { path: "/api/push", name: "PushNotificationsApi", kind: "api" },
          ],
        },
      ],
    },
  ],

  // ---------------------------------------------------------------------------
  // 2) Hauptnavigation (z.B. Sidebar / TopNav)
  // ---------------------------------------------------------------------------
  mainNav: [
    { label: "Dashboard", path: "/app/dashboard", icon: "dashboard", group: "main" },
    { label: "Markets", path: "/app/markets", icon: "markets", group: "main" },
    { label: "Journal", path: "/app/journal", icon: "journal", group: "main" },
    { label: "Replay", path: "/app/replay", icon: "replay", group: "main" },
    { label: "Alerts", path: "/app/alerts", icon: "alerts", group: "main" },
    { label: "Watchlists", path: "/app/watchlists", icon: "watchlists", group: "main" },
    { label: "Analysis", path: "/app/analysis", icon: "analysis", group: "main" },
    { label: "Settings", path: "/app/settings", icon: "settings", group: "secondary" },
    { label: "Help", path: "/app/help", icon: "help", group: "secondary" }
  ],

  // ---------------------------------------------------------------------------
  // 3) BottomNav (mobile)
  // ---------------------------------------------------------------------------
  bottomNav: [
    { label: "Dashboard", path: "/app/dashboard", icon: "dashboard", group: "main" },
    { label: "Markets", path: "/app/markets", icon: "markets", group: "main" },
    { label: "Journal", path: "/app/journal", icon: "journal", group: "main" },
    { label: "Analysis", path: "/app/analysis", icon: "analysis", group: "main" }
  ],

  // ---------------------------------------------------------------------------
  // 4) Journal Tabs (für JournalPageV2)
  // ---------------------------------------------------------------------------
  journalTabs: [
    { id: "entries",   label: "Entries",   path: "/app/journal",             icon: "entries" },
    { id: "insights",  label: "Insights",  path: "/app/journal/insights",    icon: "insights" },
    { id: "journey",   label: "Journey",   path: "/app/journal/journey",     icon: "journey" },
    { id: "social",    label: "Social",    path: "/app/journal/social",      icon: "social" },
    { id: "templates", label: "Templates", path: "/app/journal/templates",   icon: "templates" },
    { id: "settings",  label: "Settings",  path: "/app/journal/settings",    icon: "settings" }
  ]
};
