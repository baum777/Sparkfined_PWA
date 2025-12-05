/**
 * Desktop Sidebar Navigation
 *
 * Features:
 * - Visible on desktop (>= lg)
 * - Icon + Label (vertical)
 * - Active state indicator (emerald bg, rounded)
 * - Collapsible with smooth transitions (stores width in CSS var)
 * - Settings at bottom
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BarChart3,
  FileText,
  Bell,
  TrendingUp,
  Settings,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from '@/lib/icons';
import { getItem, setItem } from '@/lib/safeStorage';

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
}

const primaryNavItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  { path: '/analysis-v2', label: 'Analyze', Icon: BarChart3 },
  { path: '/chart-v2', label: 'Chart', Icon: TrendingUp },
  { path: '/journal-v2', label: 'Journal', Icon: FileText },
  { path: '/oracle', label: 'Oracle', Icon: Sparkles },
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
];

const secondaryNavItems: NavItem[] = [
  { path: '/settings-v2', label: 'Settings', Icon: Settings },
];

const STORAGE_KEY = 'sparkfined.sidebar.collapsed';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    const stored = getItem(STORAGE_KEY);
    if (stored === 'false') return false;
    if (stored === 'true') return true;
    return true;
  });

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const width = isCollapsed ? '5rem' : '16rem';
    root.style.setProperty('--sidebar-width', width);
    root.dataset.sidebar = isCollapsed ? 'collapsed' : 'expanded';
  }, [isCollapsed]);

  React.useEffect(() => {
    setItem(STORAGE_KEY, isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    return () => {
      root.style.setProperty('--sidebar-width', '5rem');
      delete root.dataset.sidebar;
    };
  }, []);

  const getNavClasses = (isActive: boolean) =>
    [
      'group flex w-full rounded-2xl px-3 py-2 font-medium transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
      isCollapsed ? 'flex-col items-center justify-center gap-1 text-[11px]' : 'flex-row items-center gap-3 text-sm',
      isActive
        ? 'bg-brand/10 text-brand border-glow-brand hover-glow' // Design System: border-glow, hover-glow
        : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover hover-lift', // Design System: hover-lift
    ].join(' ');

  // Map labels to tour step IDs
  const getTourId = (label: string) => {
    const idMap: Record<string, string> = {
      'Board': 'board-link',
      'Analyze': 'analyze-link',
      'Chart': 'chart-link',
      'Journal': 'journal-link',
      'Oracle': 'oracle-link',
      'Alerts': 'notifications-link',
      'Settings': 'settings-link',
    };
    return idMap[label] || '';
  };

  return (
    <aside
      id="main-navigation"
      className={`fixed left-0 top-0 hidden h-screen flex-col border-r border-border glass-subtle py-6 transition-[width,transform] duration-300 ease-out motion-reduce:transition-none lg:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      role="navigation"
      aria-label="Primary navigation"
      data-collapsed={isCollapsed}
    >
      {/* Primary Nav */}
      <nav className="flex-1 space-y-2 px-2">
        {primaryNavItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            id={getTourId(label)}
            className={({ isActive }) => getNavClasses(isActive)}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={isCollapsed ? 22 : 20}
                  strokeWidth={isActive ? 2.4 : 2}
                  className="transition-transform duration-200 motion-reduce:transition-none"
                />
                <span
                  className={`text-current transition-[opacity,transform] duration-200 motion-reduce:transition-none ${
                    isCollapsed ? 'text-[11px]' : 'text-sm'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Secondary Nav (Bottom) */}
      <nav className="space-y-2 px-2">
        {secondaryNavItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            id={getTourId(label)}
            className={({ isActive }) => getNavClasses(isActive)}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={isCollapsed ? 22 : 20}
                  strokeWidth={isActive ? 2.4 : 2}
                  className="transition-transform duration-200 motion-reduce:transition-none"
                />
                <span
                  className={`text-current transition-[opacity,transform] duration-200 motion-reduce:transition-none ${
                    isCollapsed ? 'text-[11px]' : 'text-sm'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="mx-3 mt-4 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-subtle px-3 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-brand hover:text-text-primary hover-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus motion-reduce:transition-none"
        aria-pressed={!isCollapsed}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        />
        <span
          className={`overflow-hidden transition-[max-width,opacity] duration-200 motion-reduce:transition-none ${
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[6rem] opacity-100'
          }`}
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </span>
      </button>
    </aside>
  );
}
