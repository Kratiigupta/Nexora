/**
 * Custom API Error class.
 * Extends Error with HTTP status code and error code string
 * for consistent error responses across the API.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>[];

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    details?: Record<string, unknown>[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.getDefaultCode(statusCode);
    this.details = details;
    this.name = "ApiError";

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }

  private getDefaultCode(statusCode: number): string {
    const codeMap: Record<number, string> = {
      400: "VALIDATION_ERROR",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      429: "RATE_LIMITED",
      500: "INTERNAL_ERROR",
    };
    return codeMap[statusCode] || "UNKNOWN_ERROR";
  }

  // Factory methods for common errors
  static badRequest(message: string, details?: Record<string, unknown>[]) {
    return new ApiError(400, message, "VALIDATION_ERROR", details);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "Insufficient permissions") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(resource = "Resource") {
    return new ApiError(404, `${resource} not found`, "NOT_FOUND");
  }

  static conflict(message: string) {
    return new ApiError(409, message, "CONFLICT");
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message, "INTERNAL_ERROR");
  }
}
