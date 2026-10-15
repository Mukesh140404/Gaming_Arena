import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/ApiError";
import type { UserRole } from "../types/user.type";

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized: No user found on request");
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new ApiError(403, "Forbidden: You do not have permission to access this resource");
    }

    next();
  };
}