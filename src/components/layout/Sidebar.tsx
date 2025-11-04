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
import { Home, BarChart3, FileText, Bell, Clock, Settings } from '@/lib/icons';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
}

const primaryNavItems: NavItem[] = [
  { path: '/', label: 'Board', Icon: Home },
  { path: '/analyze', label: 'Analyze', Icon: BarChart3 },
  { path: '/journal', label: 'Journal', Icon: FileText },
  { path: '/notifications', label: 'Alerts', Icon: Bell },
  { path: '/history', label: 'History', Icon: Clock },
];

const secondaryNavItems: NavItem[] = [
  { path: '/settings', label: 'Settings', Icon: Settings },
];

export default function Sidebar() {
  return (
    <aside
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
