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
        req.query = schemas.query.parse(req.query) as any;
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const details = (error as any).issues.map((err: any) => ({
          field: err.path.join("."),
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
