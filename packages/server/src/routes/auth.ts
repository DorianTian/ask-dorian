import Router from "@koa/router";
import { authController } from "../controllers/auth-controller.js";
import { authGuard } from "../middleware/auth-guard.js";
import { authRateLimiter } from "../middleware/auth-rate-limiter.js";

export const authRoutes = new Router({ prefix: "/auth" });

// Public routes (rate-limited)
authRoutes.post("/register", authRateLimiter, authController.register);
authRoutes.post("/login", authRateLimiter, authController.login);
authRoutes.post("/google", authRateLimiter, authController.googleOAuth);
authRoutes.post("/refresh", authRateLimiter, authController.refresh);

// Protected routes
authRoutes.post("/logout", authGuard, authController.logout);
authRoutes.post("/logout-all", authGuard, authController.logoutAll);
