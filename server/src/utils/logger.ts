import { env } from "../config/env";

/**
 * Simple structured logger.
 * In production, replace this with Winston or Pino for
 * JSON-formatted, level-filtered, rotated logs.
 */
const isDev = env.NODE_ENV === "development";

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const formatMessage = (level: string, message: string, meta?: unknown): string => {
  const timestamp = formatTimestamp();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(formatMessage("info", message, meta));
  },

  warn: (message: string, meta?: unknown) => {
    console.warn(formatMessage("warn", message, meta));
  },

  error: (message: string, meta?: unknown) => {
    console.error(formatMessage("error", message, meta));
  },

  debug: (message: string, meta?: unknown) => {
    if (isDev) {
      console.debug(formatMessage("debug", message, meta));
    }
  },

  /**
   * Log an HTTP request summary (used by middleware).
   */
  http: (method: string, url: string, statusCode: number, durationMs: number) => {
    const level = statusCode >= 400 ? "warn" : "info";
    const msg = `${method} ${url} ${statusCode} ${durationMs}ms`;
    console.log(formatMessage(level, msg));
  },
};
