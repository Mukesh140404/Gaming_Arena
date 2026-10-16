import type { CookieOptions, Response } from "express";
import { env } from "../config/env";

const COOKIE_NAME = "token";

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const isProd = env.NODE_ENV === "production";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  // Cross-site cookies (Vercel frontend + Render backend) need SameSite=None and Secure
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, baseCookieOptions);
}