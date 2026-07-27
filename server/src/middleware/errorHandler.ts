import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

/**
 * Global error-handling middleware.
 * Catches all errors and returns a standardized JSON response.
 * Must be registered AFTER all routes.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  if (err instanceof ApiError) {
    logger.warn(`ApiError: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
    });
  } else {
    logger.error(`Unhandled Error: ${err.message}`, {
      stack: err.stack,
    });
  }

  // If it's our custom ApiError, use its status code and details
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // For unexpected errors, send a generic 500
  const statusCode = 500;
  const message =
    env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};
