/**
 * Quick Actions Zone
 * 
 * Navigation shortcuts:
 * - Mobile: Horizontal scroll (snap-mandatory)
 * - Desktop: Vertical stack
 */

import { useNavigate } from 'react-router-dom';
import { Search, BarChart3, FileText, Upload, Share2 } from '@/lib/icons';
import QuickActionCard from './QuickActionCard';

export default function QuickActions() {
  const navigate = useNavigate();
  
  const actions = [
    { id: 'analyze', label: 'New Analysis', icon: Search, target: '/analysis-v2' },
    { id: 'chart', label: 'Open Chart', icon: BarChart3, target: '/chart-v2' },
    { id: 'journal', label: 'Add Journal', icon: FileText, target: '/journal-v2' },
    { id: 'import', label: 'Import Data', icon: Upload, target: '#import' },
    { id: 'share', label: 'Share Session', icon: Share2, target: '#share' },
  ];
  
  const handleAction = (target: string) => {
    if (target.startsWith('#')) {
      // NOTE(P2-backlog): Open modal/sheet for import/share when flows are ready
      console.log('Action:', target);
    } else {
      navigate(target);
    }
  };
  
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-zinc-100 lg:hidden">Quick Actions</h2>
      
      {/* Mobile: Horizontal scroll-row */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden snap-x snap-mandatory">
        {actions.map((action) => (
          <QuickActionCard
            key={action.id}
            label={action.label}
            icon={action.icon}
            onClick={() => handleAction(action.target)}
            mobile
          />
        ))}
      </div>
      
      {/* Desktop: Vertical stack */}
      <div className="hidden lg:block space-y-2">
        {actions.map((action) => (
          <QuickActionCard
            key={action.id}
            label={action.label}
            icon={action.icon}
            onClick={() => handleAction(action.target)}
          />
        ))}
      </div>
    </div>
  );
}
