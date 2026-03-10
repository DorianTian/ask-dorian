import Router from "@koa/router";
import { weeklyController } from "../controllers/weekly-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const weeklyRoutes = new Router({ prefix: "/weekly" });

weeklyRoutes.use(authGuard);

weeklyRoutes.get("/", weeklyController.getDashboard);
