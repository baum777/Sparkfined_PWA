/**
 * Board Page — Command Center
 * 
 * Central hub with:
 * - Overview (KPI Tiles)
 * - Focus ("Now Stream" - Recent Activities)
 * - Quick Actions (Navigation shortcuts)
 * - Feed (Activity events)
 * 
 * Responsive Grid:
 * - Mobile (< 768px): 1 column (stacked)
 * - Tablet (768-1024px): 2 columns (Focus/Actions)
 * - Desktop (> 1024px): 3 columns (Focus/Actions/Feed)
 */

import Overview from '@/components/board/Overview';
import Focus from '@/components/board/Focus';
import QuickActions from '@/components/board/QuickActions';
import Feed from '@/components/board/Feed';

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-3 py-4 md:px-6 lg:px-8">
      {/* Container with max-width */}
      <div className="mx-auto max-w-7xl">
        
        {/* Overview Zone (Full-width, all breakpoints) */}
        <section aria-label="Overview KPIs">
          <Overview />
        </section>
        
        {/* Main Grid (Mobile: 1col, Tablet: 2col, Desktop: 3col) */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-[5fr_3fr_4fr] lg:gap-8">
          
          {/* Focus Zone (Left, "Now Stream") */}
          <section aria-label="Now Stream" className="lg:col-span-1">
            <Focus />
          </section>
          
          {/* Quick Actions (Mobile: Horizontal scroll, Desktop: Sidebar) */}
          <section aria-label="Quick Actions" className="lg:col-span-1">
            <QuickActions />
          </section>
          
          {/* Feed Zone (Right/Bottom) */}
          <section aria-label="Activity Feed" className="lg:col-span-1">
            <Feed />
          </section>
          
        </div>
      </div>
    </div>
  );
}
