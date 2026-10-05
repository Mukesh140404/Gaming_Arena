import { api } from "./axios";
import type { SelectUser, UserLoginInput, UserLoginOutput, UserRegisterInput, UserRegisterOutput } from "../types/auth.type";

export async function loginUser(data: UserLoginInput): Promise<UserLoginOutput> {
  const res = await api.post("/auth/sign-in", data);
  return res.data.data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/sign-out");
}

export async function getCurrentUser(): Promise<SelectUser> {
  const res = await api.get("/auth/get-me");
  return res.data.data;
}

export async function signupUser(data: UserRegisterInput): Promise<UserRegisterOutput> {
  const res = await api.post("/auth/sign-up", data);
  return res.data.data;
}
    
