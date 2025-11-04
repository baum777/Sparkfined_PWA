/**
 * Quick Actions Zone
 * 
 * Navigation shortcuts:
 * - Mobile: Horizontal scroll (snap-mandatory)
 * - Desktop: Vertical stack
 */

import { useNavigate } from 'react-router-dom';
import { Search, Plus } from '@/lib/icons';

interface Action {
  id: string;
  label: string;
  icon: typeof Search;
  target: string;
}

export default function QuickActions() {
  const navigate = useNavigate();
  
  const actions: Action[] = [
    { id: 'analyze', label: 'New Analysis', icon: Search, target: '/analyze' },
    { id: 'chart', label: 'Open Chart', icon: Search, target: '/chart' }, // Will use BarChart3
    { id: 'journal', label: 'Add Journal', icon: Search, target: '/journal' }, // Will use FileText
    { id: 'import', label: 'Import Data', icon: Plus, target: '#import' },
    { id: 'share', label: 'Share Session', icon: Search, target: '#share' }, // Will use Share2
  ];
  
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-zinc-100 lg:hidden">Quick Actions</h2>
      
      {/* Mobile: Horizontal scroll-row */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden snap-x snap-mandatory">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => action.target.startsWith('#') ? undefined : navigate(action.target)}
            className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center gap-2 bg-zinc-900 transition-all active:scale-95 snap-center"
            style={{
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--duration-short) var(--ease-in-out)',
            }}
          >
            <action.icon size={24} className="text-zinc-300" />
            <span className="text-xs font-medium text-zinc-300">{action.label}</span>
          </button>
        ))}
      </div>
      
      {/* Desktop: Vertical stack */}
      <div className="hidden lg:block space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => action.target.startsWith('#') ? undefined : navigate(action.target)}
            className="flex h-20 w-full items-center gap-4 border border-zinc-800 bg-zinc-900 px-4 py-4 transition-all hover:bg-zinc-850 hover:scale-[1.02] active:scale-95"
            style={{
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--duration-short) var(--ease-in-out)',
            }}
          >
            <action.icon size={24} className="text-zinc-300" />
            <span className="text-sm font-medium text-zinc-300">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
