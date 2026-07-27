import { Request } from "express";

/**
 * Authenticated user attached to request by auth middleware
 */
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

/**
 * Extended Express Request with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  accessToken?: string;
}

/**
 * Standard API response shape
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>[];
  };
  meta?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Query params for paginated endpoints
 */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
