import Router from "@koa/router";
import { healthRoutes } from "./health.js";
import { authRoutes } from "./auth.js";
import { fragmentRoutes } from "./fragments.js";
import { taskRoutes } from "./tasks.js";
import { eventRoutes } from "./events.js";
import { projectRoutes } from "./projects.js";
import { knowledgeRoutes } from "./knowledge.js";
import { userRoutes } from "./users.js";
import { todayRoutes } from "./today.js";
import { weeklyRoutes } from "./weekly.js";
import { reviewRoutes } from "./review.js";
import { notificationRoutes } from "./notifications.js";
import { searchRoutes } from "./search.js";
import { sseRoutes } from "./sse.js";
import { ritualRoutes } from "./rituals.js";

export const router = new Router({ prefix: "/api/v1" });

// Health check (no auth)
router.use(healthRoutes.routes());

// Public
router.use(authRoutes.routes());

// Protected resources
router.use(fragmentRoutes.routes());
router.use(taskRoutes.routes());
router.use(eventRoutes.routes());
router.use(projectRoutes.routes());
router.use(knowledgeRoutes.routes());
router.use(userRoutes.routes());
router.use(todayRoutes.routes());
router.use(weeklyRoutes.routes());
router.use(reviewRoutes.routes());
router.use(notificationRoutes.routes());
router.use(searchRoutes.routes());
router.use(sseRoutes.routes());
router.use(ritualRoutes.routes());
