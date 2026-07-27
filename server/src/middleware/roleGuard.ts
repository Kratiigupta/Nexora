import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { ApiError } from "../utils/ApiError";

/**
 * Role-based access control middleware.
 * Restricts route access to users with specified roles.
 *
 * Usage:
 *   router.post("/events", authMiddleware, roleGuard("admin"), controller.create);
 *   router.get("/mentor", authMiddleware, roleGuard("mentor", "admin"), controller.list);
 */
export const roleGuard = (...allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    const userRole = req.user.role || "student";

    if (!allowedRoles.includes(userRole)) {
      return next(
        ApiError.forbidden(
          `This action requires one of the following roles: ${allowedRoles.join(", ")}`
        )
      );
    }

    next();
  };
};
