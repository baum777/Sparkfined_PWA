import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { primaryNavItems, secondaryNavItems } from "@/config/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Flame, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function isNavItemActive(item: typeof primaryNavItems[0], pathname: string): boolean {
  if (item.activeRoutes) {
    return item.activeRoutes.includes(pathname);
  }
  return pathname === item.path;
}

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Check if any secondary item is active to default-open the Advanced section
  const isSecondaryActive = secondaryNavItems.some(
    (item) => location.pathname === item.path
  );

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border-sf-subtle bg-elevated"
    >
      <SidebarHeader className="border-b border-border-sf-subtle p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-glow-brand">
            <Flame className="h-5 w-5 text-black" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-text-primary tracking-tight">
              Sparkfined
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-elevated">
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-text-tertiary text-[10px] uppercase tracking-wider font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNavItems.map((item) => {
                const isActive = isNavItemActive(item, location.pathname);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "rounded-lg transition-all duration-150",
                        isActive 
                          ? "bg-surface-hover text-brand border-l-2 border-brand shadow-glow" 
                          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      )}
                    >
                      <NavLink
                        to={item.path}
                        data-testid={item.testId}
                        className="flex items-center gap-2.5"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Advanced Section (Collapsible) */}
        <SidebarGroup>
          <Collapsible defaultOpen={isSecondaryActive} className="group/collapsible">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel
                className={cn(
                  "cursor-pointer rounded-lg transition-all duration-150",
                  "flex items-center justify-between w-full",
                  "text-text-tertiary text-[10px] uppercase tracking-wider font-medium",
                  "hover:bg-surface-hover hover:text-text-secondary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                )}
                data-testid="nav-advanced-trigger"
              >
                <span>Advanced</span>
                <ChevronDown className="h-3.5 w-3.5 text-text-tertiary transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className={cn(
                            "rounded-lg transition-all duration-150",
                            isActive 
                              ? "bg-surface-hover text-brand border-l-2 border-brand shadow-glow" 
                              : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                          )}
                        >
                          <NavLink
                            to={item.path}
                            data-testid={item.testId}
                            className="flex items-center gap-2.5"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail className="bg-transparent hover:bg-brand/10" />
    </Sidebar>
  );
}
