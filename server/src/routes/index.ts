import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import teamRoutes from "./team.routes";
import projectRoutes from "./project.routes";
import chatRoutes from "./chat.routes";
import skillExchangeRoutes from "./skillExchange.routes";
import eventRoutes from "./event.routes";
import notificationRoutes from "./notification.routes";
import aiRoutes from "./ai.routes";
import uploadRoutes from "./upload.routes";
import adminRoutes from "./admin.routes";
import { authMiddleware } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { aiRateLimiter, authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

/**
 * API Route Aggregator
 * All routes are prefixed with /api/v1 in the main app.
 *
 * Public routes:    No middleware
 * Protected routes: authMiddleware
 * Admin routes:     authMiddleware + roleGuard("admin")
 * AI routes:        authMiddleware + aiRateLimiter
 */

// Auth — rate-limited, mostly public
router.use("/auth", authRateLimiter, authRoutes);

// Protected routes — require authentication
router.use("/users", authMiddleware, userRoutes);
router.use("/teams", authMiddleware, teamRoutes);
router.use("/projects", authMiddleware, projectRoutes);
router.use("/chat", authMiddleware, chatRoutes);
router.use("/skill-exchange", authMiddleware, skillExchangeRoutes);
router.use("/events", authMiddleware, eventRoutes);
router.use("/notifications", authMiddleware, notificationRoutes);
router.use("/upload", authMiddleware, uploadRoutes);

// AI — rate-limited + authenticated
router.use("/ai", authMiddleware, aiRateLimiter, aiRoutes);

// Admin — authenticated + admin role only
router.use("/admin", authMiddleware, roleGuard("admin"), adminRoutes);

export default router;
