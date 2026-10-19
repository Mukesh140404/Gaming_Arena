import { api } from "./axios";
import type { SelectUser, UserLoginInput, UserLoginOutput, UserRegisterInput, UserRegisterOutput } from "../types/auth.type";
const WS_TOKEN_KEY = "wsToken";

// Save the WebSocket token if the backend sent one
function saveWsToken(data: { wsToken?: string } | null | undefined) {
  if (data?.wsToken) {
    sessionStorage.setItem(WS_TOKEN_KEY, data.wsToken);
  }
}

export async function loginUser(data: UserLoginInput): Promise<UserLoginOutput> {
  const res = await api.post("/auth/sign-in", data);
  saveWsToken(res.data.data);
  return res.data.data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/sign-out");
  sessionStorage.removeItem(WS_TOKEN_KEY);
}

export async function getCurrentUser(): Promise<SelectUser> {
  const res = await api.get("/auth/get-me");
  saveWsToken(res.data.data);
  return res.data.data;
}

export async function signupUser(data: UserRegisterInput): Promise<UserRegisterOutput> {
  const res = await api.post("/auth/sign-up", data);
  saveWsToken(res.data.data);
  return res.data.data;
}
    
