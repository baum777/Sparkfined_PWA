/**
 * Desktop Sidebar Navigation
 * 
 * Features:
 * - Visible on desktop (>= lg)
 * - Icon + Label (vertical)
 * - Active state indicator (emerald bg, rounded)
 * - Collapsible (optional, for later)
 * - Settings at bottom
 */

import { NavLink } from 'react-router-dom';
import { Home, BarChart3, FileText, Bell, TrendingUp, Settings } from '@/lib/icons';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
}

const primaryNavItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  { path: '/analysis-v2', label: 'Analyze', Icon: BarChart3 },
  { path: '/chart', label: 'Chart', Icon: TrendingUp },
  { path: '/journal-v2', label: 'Journal', Icon: FileText },
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
];

const secondaryNavItems: NavItem[] = [
  { path: '/settings', label: 'Settings', Icon: Settings },
];

export default function Sidebar() {
  // Map labels to tour step IDs
  const getTourId = (label: string) => {
    const idMap: Record<string, string> = {
      'Board': 'board-link',
      'Analyze': 'analyze-link',
      'Chart': 'chart-link',
      'Journal': 'journal-link',
      'Alerts': 'notifications-link',
      'Settings': 'settings-link',
    };
    return idMap[label] || '';
  };

  return (
    <aside
      id="main-navigation"
      className="fixed left-0 top-0 hidden h-screen w-20 flex-col border-r border-zinc-800 bg-zinc-900 py-6 lg:flex"
      role="navigation"
      aria-label="Primary navigation"
    >
      {/* Primary Nav */}
      <nav className="flex-1 space-y-2 px-3">
        {primaryNavItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            id={getTourId(label)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg py-3 px-2 transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`
            }
            style={{
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--duration-short) var(--ease-in-out)',
            }}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Secondary Nav (Bottom) */}
      <nav className="space-y-2 px-3">
        {secondaryNavItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            id={getTourId(label)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg py-3 px-2 transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`
            }
            style={{
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--duration-short) var(--ease-in-out)',
            }}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
