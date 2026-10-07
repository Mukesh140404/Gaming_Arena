import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Gamepad2,
  ChevronRight,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  gamesCount?: number;
}

interface SidebarItem {
  label: string;
  to: string;
  icon: LucideIcon;
  isActive?: (pathname: string) => boolean;
  count?: number;
}

export function AdminSidebar({
  isOpen,
  onClose,
  gamesCount = 0,
}: AdminSidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const sidebarItems: SidebarItem[] = [
    {
      label: "Dashboard",
      to: "/admin",
      icon: LayoutDashboard,
      isActive: (pathname) => pathname === "/admin" || pathname === "/admin/",
    },
    {
      label: "Games",
      to: "/admin/games",
      icon: Gamepad2,
      count: gamesCount,
      isActive: (pathname) => pathname.startsWith("/admin/games"),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 md:top-16 bottom-0 left-0 z-50 md:z-30 w-72 md:w-64 border-r border-zinc-200 bg-white",
          "transition-transform duration-300 ease-in-out md:translate-x-0",
          "dark:border-zinc-800 dark:bg-black",
          "flex flex-col justify-between shadow-2xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5 md:px-3 md:py-4">

          {/* Mobile Header with Title and Close Button */}
          <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3.5 dark:border-zinc-800 md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                Admin Menu
              </span>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1.5">
            <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Navigation
            </div>

            {sidebarItems.map((item) => {
              const Icon = item.icon;

              const isActive = item.isActive
                ? item.isActive(currentPath)
                : currentPath === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 md:py-2.5 min-h-[44px]",
                    "text-sm font-medium transition-all duration-150 select-none",
                    isActive
                      ? "bg-zinc-950 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950 font-semibold"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-white dark:text-black"
                          : "text-zinc-500 group-hover:text-black dark:text-zinc-400 dark:group-hover:text-white"
                      )}
                    />

                    <span>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors",
                          isActive
                            ? "bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        )}
                      >
                        {item.count}
                      </span>
                    )}

                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Sidebar Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 md:hidden bg-zinc-50/50 dark:bg-zinc-950/50">
          <p className="text-[11px] text-zinc-400 text-center">
            Gaming Arena Admin &bull; Control Panel
          </p>
        </div>
      </aside>
    </>
  );
}