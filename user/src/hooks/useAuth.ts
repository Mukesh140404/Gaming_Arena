import { loginUser, logoutUser, signupUser } from "@/api/auth";
import { currentUserQueryOptions } from "@/api/auth.queries";
import type { UserLoginInput, UserRegisterInput } from "@/types/auth.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserLoginInput) => loginUser(data),
    onSuccess: (user) => {
      queryClient.clear();
      queryClient.setQueryData(['user'], user);
      toast.success("Login successful");
      if (user.role === "admin") {
        navigate({ to: "/admin" })
      } else {
        navigate({ to: "/dashboard" })
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your email and password."
      );
    }

  })
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      navigate({
        to: "/auth",
        replace: true,
      });
    },
  });
}

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions);
}

export function useSignup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserRegisterInput) => signupUser(data),
    onSuccess: (user) => {
      queryClient.clear();
      queryClient.setQueryData(['user'], user);
      if (user.role === "admin") {
        navigate({ to: "/admin" })
      } else {
        navigate({ to: "/dashboard" })
      }
    }

  })
}
