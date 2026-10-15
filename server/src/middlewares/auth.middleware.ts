import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/ApiError";
import { verifyToken, type JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    throw new ApiError(401, "Unauthorized: Invalid or expired token");
  }
}