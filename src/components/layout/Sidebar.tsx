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
import { NavLink, useLocation } from 'react-router-dom';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { getItem, setItem } from '@/lib/safeStorage';
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, SETTINGS_NAV_ITEM, isNavItemActive } from '@/config/navigation';

const STORAGE_KEY = 'sparkfined.sidebar.collapsed';

export default function Sidebar() {
  const { pathname } = useLocation();
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
      'group flex w-full rounded-2xl border border-transparent px-3 py-2 font-medium transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
      isCollapsed ? 'flex-col items-center justify-center gap-1 text-[11px]' : 'flex-row items-center gap-3 text-sm',
      isActive
        ? 'border-border bg-brand/10 text-brand shadow-glow-brand'
        : 'text-text-secondary hover:border-border/70 hover:bg-interactive-hover hover:text-text-primary',
    ].join(' ');

  // Get tour ID and data-testid for nav item
  const navSections = React.useMemo(
    () => [
      {
        title: 'Trading Workflow',
        items: NAV_ITEMS,
      },
      {
        title: 'Knowledge Base',
        items: SECONDARY_NAV_ITEMS,
      },
      {
        title: 'System',
        items: [SETTINGS_NAV_ITEM],
      },
    ],
    [],
  );

  const renderNavItem = (item: typeof NAV_ITEMS[number]) => {
    const { path, label, Icon, tourId, testId } = item;
    return (
      <NavLink
        key={path}
        to={path}
        id={tourId || undefined}
        data-testid={testId}
        className={({ isActive }) => {
          const active = isActive || isNavItemActive(pathname, item);
          return getNavClasses(active);
        }}
        aria-label={label}
        aria-current={isNavItemActive(pathname, item) ? 'page' : undefined}
      >
        {({ isActive }) => {
          const active = isActive || isNavItemActive(pathname, item);
          return (
            <>
              <Icon
                size={isCollapsed ? 22 : 20}
                strokeWidth={active ? 2.4 : 2}
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
          );
        }}
      </NavLink>
    );
  };

  const renderSectionHeader = (title: string) => (
    <div
      className={`px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-text-tertiary transition-[opacity,margin] duration-200 motion-reduce:transition-none ${
        isCollapsed ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {title}
    </div>
  );

  return (
    <aside
      id="main-navigation"
      className={`fixed left-0 top-0 hidden h-screen flex-col border-r border-border/70 bg-surface/70 px-2 py-6 backdrop-blur-2xl transition-[width,transform] duration-300 ease-out motion-reduce:transition-none lg:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      role="navigation"
      aria-label="Primary navigation"
      data-collapsed={isCollapsed}
    >
      <div className="flex-1 overflow-y-auto">
        {navSections.map(({ title, items }) => (
          <div key={title}>
            {!isCollapsed && renderSectionHeader(title)}
            <nav className="space-y-2 px-1.5">{items.map(renderNavItem)}</nav>
          </div>
        ))}
      </div>

      {/* Gamification Footer */}
      <div className="mt-4 space-y-2 border-t border-border/60 px-3 pt-4">
        <div className="rounded-2xl border border-border/70 bg-surface/80 px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">
          <div className="text-[11px] text-brand">🎮 XP • 2,450</div>
          <div
            className={`text-[9px] font-normal text-text-secondary transition-opacity duration-200 motion-reduce:transition-none ${
              isCollapsed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Phase: Master ✨
          </div>
        </div>
      </div>

      {/* Collapse Button */}
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
