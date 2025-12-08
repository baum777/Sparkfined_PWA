import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from '@/components/Header';
import GlobalInstruments from '@/pages/_layout/GlobalInstruments';
import { PageTransition } from '@/components/ui/PageTransition';

/**
 * AppShell
 *
 * Global layout wrapper that applies the Adaptive Intelligence grid:
 * - Desktop sidebar (glass surface)
 * - Token-driven header / top bar
 * - Responsive content rail with consistent spacing + padding
 * - Mobile bottom navigation
 * - Global instruments rail pinned beneath page content
 */
export default function AppShell() {
  return (
    <div className="relative min-h-screen bg-app-gradient text-text-primary">
      <Sidebar />

      <div className="flex min-h-screen flex-col transition-[padding] duration-300 ease-out lg:pl-[var(--sidebar-width,5rem)]">
        <Header />

        <main
          id="main-content"
          tabIndex={-1}
          className="relative flex-1 px-4 pb-[5.5rem] pt-5 sm:px-6 md:px-8 lg:px-10 lg:pb-16"
        >
          <div className="mx-auto w-full max-w-7xl">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>

        <div className="border-t border-border/60 bg-surface/50 px-4 py-4 backdrop-blur-md sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <GlobalInstruments />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
