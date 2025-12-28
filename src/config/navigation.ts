import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  LineChart, 
  Bell, 
  Settings,
  Eye,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
  /** Routes that should also highlight this nav item as active */
  activeRoutes?: string[];
}

export const primaryNavItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    testId: "nav-dashboard",
  },
  {
    title: "Journal",
    path: "/journal",
    icon: BookOpen,
    testId: "nav-journal",
  },
  {
    title: "Learn",
    path: "/lessons",
    icon: GraduationCap,
    testId: "nav-learn",
  },
  {
    title: "Chart",
    path: "/chart",
    icon: LineChart,
    testId: "nav-chart",
    activeRoutes: ["/chart", "/chart/replay", "/replay"],
  },
  {
    title: "Alerts",
    path: "/alerts",
    icon: Bell,
    testId: "nav-alerts",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    testId: "nav-settings",
  },
];

const showHandbook = import.meta.env.VITE_ENABLE_DEV_NAV === 'true';

export const secondaryNavItems: NavItem[] = [
  {
    title: "Watchlist",
    path: "/watchlist",
    icon: Eye,
    testId: "nav-watchlist",
  },
  {
    title: "Oracle",
    path: "/oracle",
    icon: Sparkles,
    testId: "nav-oracle",
  },
  ...(showHandbook ? [{
    title: "Handbook",
    path: "/handbook",
    icon: HelpCircle,
    testId: "nav-handbook",
  }] : []),
];
