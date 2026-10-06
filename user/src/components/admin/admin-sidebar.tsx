import { Link, useRouterState } from "@tanstack/react-router";
import { 
  Gamepad2, 
  Sparkles, 
  Layers, 
  Users, 
  Settings, 
  ChevronRight, 
  ExternalLink,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  gamesCount?: number;
}

export function AdminSidebar({ isOpen, onClose, gamesCount = 0 }: AdminSidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Games is the primary active route
  const isGamesActive = currentPath === "/admin" || currentPath.startsWith("/admin/games") || currentPath === "/admin/";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-zinc-200 bg-white transition-transform duration-200 ease-in-out md:translate-x-0 dark:border-zinc-800 dark:bg-black flex flex-col justify-between",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col flex-1 px-3 py-4 overflow-y-auto">
          
          {/* Mobile close bar */}
          <div className="flex items-center justify-between pb-3 px-2 md:hidden border-b border-zinc-100 dark:border-zinc-900 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Admin Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section: Main Management */}
          <div className="space-y-1">
            <div className="px-3 pb-2 pt-1 text-[11px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Management
            </div>

            {/* Primary Requested Item: Games */}
            <Link
              to="/admin"
              onClick={onClose}
              className={cn(
                "group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isGamesActive
                  ? "bg-zinc-950 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Gamepad2
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isGamesActive
                      ? "text-white dark:text-black"
                      : "text-zinc-500 group-hover:text-black dark:text-zinc-400 dark:group-hover:text-white"
                  )}
                />
                <span className="font-semibold">Games</span>
              </div>

              <div className="flex items-center gap-1.5">
                {gamesCount > 0 && (
                  <span
                    className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors",
                      isGamesActive
                        ? "bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    {gamesCount}
                  </span>
                )}
                {isGamesActive && (
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                )}
              </div>
            </Link>
          </div>

          {/* Planned Features (Clean placeholders to show scalability) */}
          <div className="mt-6 space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Upcoming Modules
            </div>

            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 rounded-lg cursor-not-allowed select-none">
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
                <span>Gaming Rooms</span>
              </div>
              <Badge variant="mono" className="text-[9px] px-1 py-0 h-4 font-mono">
                SOON
              </Badge>
            </div>

            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 rounded-lg cursor-not-allowed select-none">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
                <span>Users & Players</span>
              </div>
              <Badge variant="mono" className="text-[9px] px-1 py-0 h-4 font-mono">
                SOON
              </Badge>
            </div>

            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 rounded-lg cursor-not-allowed select-none">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
                <span>Arena Settings</span>
              </div>
              <Badge variant="mono" className="text-[9px] px-1 py-0 h-4 font-mono">
                SOON
              </Badge>
            </div>
          </div>

        </div>

        {/* Sidebar Footer Card */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                  Arena Hub v1.0
                </span>
                <span className="text-[10px] text-zinc-500">
                  Admin Dashboard Active
                </span>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Go to Player Arena</span>
            </Link>
          </div>
        </div>

      </aside>
    </>
  );
}
