import { useState, useEffect } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { currentUserQueryOptions } from '@/hooks/useAuth';
import { gamesQueryOptions } from '@/hooks/useGame';
import { AdminNavbar } from '@/components/admin/admin-navbar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    let user;

    try {
      user = await context.queryClient.ensureQueryData(
        currentUserQueryOptions,
      );
    } catch {
      context.queryClient.removeQueries({
        queryKey: currentUserQueryOptions.queryKey,
      });
      throw redirect({ to: "/auth" });
    }

    if (!user) {
      throw redirect({ to: "/auth" });
    }

    if (user.role !== "admin") {
      throw redirect({ to: "/auth" });
    }

    return { user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: games = [] } = useQuery(gamesQueryOptions);



  // Prevent background scrolling when mobile sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      
      {/* Fixed Top Admin Navbar (Permanently pinned at top, never scrolls away) */}
      <AdminNavbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        adminUser={{
          name: user?.name,
          email: user?.email,
          role: user?.role,
        }}
      />

      <div className="flex w-full min-w-0 pt-16">
        {/* Left Admin Sidebar (Mobile Responsive Drawer + Desktop Fixed) */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          gamesCount={games.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 md:pl-64 w-full min-w-0 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}
