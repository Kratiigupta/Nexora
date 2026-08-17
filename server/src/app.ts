import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import { env } from "./config/env";
import { initializeSocket } from "./config/socket";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import { logger } from "./utils/logger";

// ──────────────────────────────────────────
// 1. Create Express app + HTTP server
// ──────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ──────────────────────────────────────────
// 2. Global Middleware
// ──────────────────────────────────────────

// Security headers — hardened production configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://*.supabase.co"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.supabase.co"],
        connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co", "http://localhost:*", "https://*"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    frameguard: { action: "deny" }, // X-Frame-Options: DENY
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }, // Referrer-Policy
    noSniff: true, // X-Content-Type-Options: nosniff
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS — allow requests from the Next.js frontend
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request logging
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing
app.use(cookieParser());

// Rate limiting
app.use(rateLimiter);

// ──────────────────────────────────────────
// 3. API Routes
// ──────────────────────────────────────────
app.use("/api/v1", routes);

// Health check endpoint (unversioned)
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: "1.0.0",
    },
  });
});

// ──────────────────────────────────────────
// 4. 404 Handler
// ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested endpoint does not exist",
    },
  });
});

// ──────────────────────────────────────────
// 5. Error Handler (must be last)
// ──────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────
// 6. Initialize Socket.IO
// ──────────────────────────────────────────
initializeSocket(httpServer);

// ──────────────────────────────────────────
// 7. Start Server
// ──────────────────────────────────────────
httpServer.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`🚀 Nexora API Server running on port ${env.PORT}`);
  logger.info(`📍 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 Client URL: ${env.CLIENT_URL}`);
  logger.info(`❤️  Health check: http://localhost:${env.PORT}/health`);
});

export default app;
