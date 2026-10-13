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
 * In-memory token verification cache.
 * Avoids calling supabaseAdmin.auth.getUser() on every request,
 * which adds ~500ms-1s network latency per API call.
 *
 * Cache entries expire after 5 minutes (Supabase JWTs last ~60 min).
 */
const tokenCache = new Map<
  string,
  { user: { id: string; email: string; role?: string }; expiresAt: number }
>();

const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Periodically clean expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tokenCache) {
    if (now >= entry.expiresAt) {
      tokenCache.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

/**
 * Authentication middleware.
 * Validates the Supabase JWT from the Authorization header.
 * Uses an in-memory cache to avoid repeated network calls to Supabase.
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

    // Check cache first
    const cached = tokenCache.get(token);
    if (cached && Date.now() < cached.expiresAt) {
      req.user = cached.user;
      req.accessToken = token;
      return next();
    }

    // Cache miss — verify with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      // Remove invalid token from cache if present
      tokenCache.delete(token);
      throw ApiError.unauthorized("Invalid or expired token");
    }

    // Attach user info to the request object
    const userInfo = {
      id: user.id,
      email: user.email || "",
      role: user.user_metadata?.role || "student",
    };

    req.user = userInfo;
    req.accessToken = token;

    // Cache the verified token
    tokenCache.set(token, {
      user: userInfo,
      expiresAt: Date.now() + TOKEN_CACHE_TTL,
    });

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
        // Check cache first
        const cached = tokenCache.get(token);
        if (cached && Date.now() < cached.expiresAt) {
          req.user = cached.user;
          req.accessToken = token;
          return next();
        }

        const {
          data: { user },
        } = await supabaseAdmin.auth.getUser(token);

        if (user) {
          const userInfo = {
            id: user.id,
            email: user.email || "",
            role: user.user_metadata?.role || "student",
          };

          req.user = userInfo;
          req.accessToken = token;

          tokenCache.set(token, {
            user: userInfo,
            expiresAt: Date.now() + TOKEN_CACHE_TTL,
          });
        }
      }
    }

    next();
  } catch {
    // Silently proceed without user — this is optional auth
    next();
  }
};
