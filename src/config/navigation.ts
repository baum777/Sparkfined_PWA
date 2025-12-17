import {
  Activity,
  Bell,
  BookmarkPlus,
  FileText,
  GraduationCap,
  Home,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  type LucideIcon,
} from "@/lib/icons";

export interface NavigationItem {
  path: string;
  label: string;
  Icon: LucideIcon;
  testId?: string;
  tourId?: string;
  aliases?: string[];
}

export const NAV_ITEMS: NavigationItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    Icon: Home,
    testId: "nav-dashboard",
    tourId: "board-link",
    aliases: ["/dashboard-v2", "/board"],
  },
  {
    path: "/journal",
    label: "Journal",
    Icon: FileText,
    testId: "nav-journal",
    tourId: "journal-link",
    aliases: ["/journal-v2"],
  },
  {
    path: "/chart",
    label: "Chart",
    Icon: TrendingUp,
    testId: "nav-chart",
    tourId: "chart-link",
    aliases: ["/chart-v2", "/analysis", "/analysis-v2", "/analyze"],
  },
  {
    path: "/watchlist",
    label: "Watchlist",
    Icon: BookmarkPlus,
    testId: "nav-watchlist",
    aliases: ["/watchlist-v2"],
  },
  {
    path: "/alerts",
    label: "Alerts",
    Icon: Bell,
    testId: "nav-alerts",
    tourId: "notifications-link",
    aliases: ["/alerts-v2"],
  },
];

export const SETTINGS_NAV_ITEM: NavigationItem = {
  path: "/settings",
  label: "Settings",
  Icon: Settings,
  testId: "nav-settings",
  tourId: "settings-link",
  aliases: ["/settings-v2"],
};

export const SECONDARY_NAV_ITEMS: NavigationItem[] = [
  {
    path: "/signals",
    label: "Signals",
    Icon: Activity,
    testId: "nav-signals",
  },
  {
    path: "/oracle",
    label: "Oracle",
    Icon: Sparkles,
    testId: "nav-oracle",
  },
  {
    path: "/replay",
    label: "Replay",
    Icon: RefreshCw,
    testId: "nav-replay",
  },
  {
    path: "/lessons",
    label: "Learning",
    Icon: GraduationCap,
    testId: "nav-lessons",
  },
  {
    path: "/icons",
    label: "Showcase",
    Icon: Star,
    testId: "nav-showcase",
  },
];

export const isNavItemActive = (pathname: string, item: NavigationItem) => {
  const normalizedPath =
    pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const candidates = [item.path, ...(item.aliases ?? [])];

  return candidates.some(
    (candidate) =>
      normalizedPath === candidate || normalizedPath.startsWith(`${candidate}/`),
  );
};
