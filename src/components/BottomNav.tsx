/**
 * Bottom Navigation (Mobile)
 * 
 * Features:
 * - 4 primary routes (Board, Analyze, Journal, Settings)
 * - Icon + Label (Lucide)
 * - Active state indicator (emerald border-top)
 * - Respects rounded/sharp layout
 * - Hidden on desktop (>= lg)
 */

import { NavLink } from 'react-router-dom';
import { Home, BarChart3, FileText, Settings } from '@/lib/icons';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  { path: '/analysis-v2', label: 'Analyze', Icon: BarChart3 },
  { path: '/journal-v2', label: 'Journal', Icon: FileText },
  { path: '/settings-v2', label: 'Settings', Icon: Settings },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm lg:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-2">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 px-2 transition-colors relative ${
                  isActive
                    ? 'text-emerald-500'
                    : 'text-zinc-500 hover:text-zinc-300 active:text-zinc-400'
                }`
              }
              style={({ isActive }) => ({
                borderTop: isActive ? '2px solid var(--color-emerald)' : undefined,
                transition: 'all var(--duration-short) var(--ease-in-out)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
