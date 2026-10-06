import { useState } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { currentUserQueryOptions } from '@/api/auth.queries';
import { gamesQueryOptions } from '@/api/game.queries';
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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      
      {/* Top Admin Navbar (White / Gray / Black) */}
      <AdminNavbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        adminUser={{
          name: user?.name,
          email: user?.email,
          role: user?.role,
        }}
      />

      <div className="flex">
        {/* Left Admin Sidebar (With Games Item) */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          gamesCount={games.length}
        />

        {/* Main Content Area hosting the Outlet */}
        <main className="flex-1 md:pl-64 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}
