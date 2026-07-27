import { Response } from "express";

/**
 * Standard success response helper.
 * All API responses follow this format for consistency.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  }
) => {
  const response: Record<string, unknown> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Generate a pagination meta object from query params.
 */
export const getPagination = (
  page?: string | number,
  limit?: string | number
) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, offset };
};

/**
 * Build pagination meta from total count.
 */
export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
