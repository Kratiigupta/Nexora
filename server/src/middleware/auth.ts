import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";
import { ApiError } from "../utils/ApiError";

/**
 * Extends Express Request to include authenticated user info.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  accessToken?: string;
}

/**
 * Authentication middleware.
 * Validates the Supabase JWT from the Authorization header.
 * Attaches user info to req.user for downstream handlers.
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Token not provided");
    }

    // Verify the JWT with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    // Attach user info to the request object
    req.user = {
      id: user.id,
      email: user.email || "",
      role: user.user_metadata?.role || "student",
    };
    req.accessToken = token;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth — attaches user if token exists, but doesn't block.
 * Useful for public endpoints that behave differently for logged-in users.
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        const {
          data: { user },
        } = await supabaseAdmin.auth.getUser(token);

        if (user) {
          req.user = {
            id: user.id,
            email: user.email || "",
            role: user.user_metadata?.role || "student",
          };
          req.accessToken = token;
        }
      }
    }

    next();
  } catch {
    // Silently proceed without user — this is optional auth
    next();
  }
};
