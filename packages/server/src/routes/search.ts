import Router from "@koa/router";
import { searchController } from "../controllers/search-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const searchRoutes = new Router({ prefix: "/search" });

searchRoutes.use(authGuard);

searchRoutes.get("/", searchController.search);
