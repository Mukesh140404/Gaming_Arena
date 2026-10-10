import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import Navbar from '../../components/navbar'
import { PROJECT_NAME } from '../../constants'
import { currentUserQueryOptions } from '@/hooks/useAuth';

export const Route = createFileRoute('/(protected)')({
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

    return { user };
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const { user } = Route.useRouteContext();

  return (
    <div className="relative min-h-screen bg-[#FDF0EE] text-[#1F2438] flex flex-col selection:bg-[#FF6562]/20 selection:text-[#E85D56]">

      {/* Background Decorative Gradient Blobs (Matching Auth Theme) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#FFD7D0]/50 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-[#FFE5DF]/70 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-[#FFD7D0]/40 blur-3xl" />
      </div>

      <Navbar
        projectName={PROJECT_NAME}
        username={user?.name || "Player"}
        userRole={user?.role === "admin" ? "Admin" : "Player"}
        email={user?.email}
      />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

    </div>
  )
}