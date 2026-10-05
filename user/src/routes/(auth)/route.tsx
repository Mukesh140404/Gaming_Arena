import { currentUserQueryOptions } from "@/api/auth.queries";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)")({
  beforeLoad: async ({ context }) => {
    let user;
    try {
      user = await context.queryClient.ensureQueryData(
        currentUserQueryOptions,
      );
    }
    catch {
      user = null;
    }
    if (user) {
      if (user.role === "admin") {
        throw redirect({
          to: "/admin",
        });
      }
      throw redirect({
        to: "/dashboard",
      });
    }
    return { user };
  },
  component: () => <Outlet />,
});
