import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Request validation middleware using Zod schemas.
 * Validates req.body, req.query, and/or req.params against
 * provided schemas.
 *
 * Usage:
 *   router.post("/teams", validate({ body: createTeamSchema }), controller.create);
 */
export const validate = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        try {
          Object.defineProperty(req, "query", {
            value: parsedQuery,
            configurable: true,
            enumerable: true,
            writable: true,
          });
        } catch {
          for (const key of Object.keys(req.query)) {
            delete (req.query as any)[key];
          }
          Object.assign(req.query, parsedQuery);
        }
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        try {
          Object.defineProperty(req, "params", {
            value: parsedParams,
            configurable: true,
            enumerable: true,
            writable: true,
          });
        } catch {
          Object.assign(req.params, parsedParams);
        }
      }

      next();
    } catch (error: any) {
      if (
        error instanceof ZodError ||
        error?.name === "ZodError" ||
        Array.isArray(error?.issues)
      ) {
        const issues = error.issues || error.errors || [];
        const details = issues.map((err: any) => ({
          field: err.path ? err.path.join(".") : "",
          message: err.message,
        }));

        next(
          ApiError.badRequest(
            "Validation failed",
            details as Record<string, unknown>[]
          )
        );
      } else {
        next(error);
      }
    }
  };
};
