import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { primaryNavItems, secondaryNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MoreHorizontal } from "lucide-react";
import { useState } from "react";

function isNavItemActive(item: typeof primaryNavItems[0], pathname: string): boolean {
  if (item.activeRoutes) {
    return item.activeRoutes.includes(pathname);
  }
  return pathname === item.path;
}

export function MobileBottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Show first 4 items in bottom bar, rest in drawer
  const bottomNavItems = primaryNavItems.slice(0, 4);
  const drawerPrimaryItems = primaryNavItems.slice(4);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-sf-subtle bg-surface/95 backdrop-blur-sm md:hidden"
      data-testid="mobile-bottom-nav"
      role="navigation"
      aria-label="Primary navigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const isActive = isNavItemActive(item, location.pathname);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={`${item.testId}-mobile`}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
                isActive
                  ? "text-brand"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center",
                isActive && "after:absolute after:-bottom-1 after:h-0.5 after:w-4 after:rounded-full after:bg-brand after:shadow-glow-accent"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-150",
                  isActive ? "text-brand drop-shadow-[0_0_6px_rgba(15,179,76,0.5)]" : ""
                )} />
              </div>
              <span className={cn(
                "truncate font-medium",
                isActive ? "text-brand" : ""
              )}>
                {item.title}
              </span>
            </NavLink>
          );
        })}

        {/* More / Menu Trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs text-text-tertiary hover:text-text-primary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
              data-testid="mobile-menu-trigger"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="truncate font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-[20px] p-0" data-testid="mobile-menu-drawer">
            <SheetHeader className="p-4 border-b border-border-sf-subtle">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="p-4 grid gap-2 overflow-y-auto max-h-[calc(80vh-60px)]">
              {/* Remaining Primary Items */}
              {drawerPrimaryItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover active:bg-surface-active"
                >
                  <item.icon className="h-5 w-5 text-text-secondary" />
                  <span className="text-text-primary font-medium">{item.title}</span>
                </NavLink>
              ))}

              <div className="h-px bg-border-sf-subtle my-2" />
              
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-3 mb-1">
                Advanced
              </div>

              {/* Secondary Items */}
              {secondaryNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover active:bg-surface-active"
                >
                  <item.icon className="h-5 w-5 text-text-secondary" />
                  <span className="text-text-primary font-medium">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
