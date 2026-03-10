import Router from "@koa/router";
import { reviewController } from "../controllers/review-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const reviewRoutes = new Router({ prefix: "/review" });

reviewRoutes.use(authGuard);

reviewRoutes.get("/", reviewController.getWeekReview);
