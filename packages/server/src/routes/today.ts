import Router from "@koa/router";
import { todayController } from "../controllers/today-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const todayRoutes = new Router({ prefix: "/today" });

todayRoutes.use(authGuard);

todayRoutes.get("/", todayController.getDashboard);
