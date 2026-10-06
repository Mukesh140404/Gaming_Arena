import { Link, useNavigate } from "@tanstack/react-router";
import { 
  Gamepad2, 
  ExternalLink, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  Search,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  adminUser?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export function AdminNavbar({ onToggleSidebar, adminUser }: AdminNavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Navigate to auth
    navigate({ to: "/auth" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-black/95">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Mobile menu toggle + Breadcrumb / Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-900"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-xs dark:bg-zinc-100 dark:text-black">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-zinc-950 dark:text-zinc-50">
                  Gaming Arena
                </span>
                <Badge variant="mono" className="text-[10px] font-mono px-1.5 py-0 h-4 uppercase tracking-wider">
                  Admin
                </Badge>
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
                Control Center &bull; Games Portal
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search & Navigation quick hint */}
        <div className="hidden md:flex items-center max-w-sm w-full mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Quick search games, genres, players... (Ctrl+K)"
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700"
            />
          </div>
        </div>

        {/* Right Section: Actions & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Link to public/user portal */}
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <span>Live Arena</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          {/* Quick Notification icon */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-600 hover:text-black hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white" />
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Admin User Chip */}
          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {adminUser?.name || "Administrator"}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5 text-zinc-700 dark:text-zinc-300" />
                Super Admin
              </span>
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sign Out"
              className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

        </div>

      </div>
    </header>
  );
}
