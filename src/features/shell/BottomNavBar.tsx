import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, SETTINGS_NAV_ITEM, isNavItemActive } from "@/config/navigation";
import { cn } from "@/lib/ui/cn";
import "./bottom-nav.css";

export default function BottomNavBar() {
  const { pathname } = useLocation();
  const navItems = [...NAV_ITEMS, SETTINGS_NAV_ITEM];

  return (
    <nav
      id="main-navigation"
      className="sf-bottom-nav z-drawer border-t border-border/60 bg-surface/90 backdrop-blur-2xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-3 py-1.5">
        <div className="grid grid-cols-6 gap-1.5">
          {navItems.map((item) => {
            const { path, label, Icon, testId, tourId } = item;
            const isActive = isNavItemActive(pathname, item);

            return (
              <Link
                key={path}
                to={path}
                id={tourId}
                data-testid={testId}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border border-transparent px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary transition-all duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
                  isActive
                    ? "border-border/70 bg-brand/10 text-brand shadow-glow-brand"
                    : "text-text-secondary hover:bg-interactive-hover hover:text-text-primary",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-6 top-2 h-1 rounded-full bg-brand/70 transition-opacity duration-150 motion-reduce:transition-none",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden="true"
                />
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 2}
                  className="transition-transform duration-150 motion-reduce:transition-none"
                />
                <span className="leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
