// packages/server/src/routes/rituals.ts
import Router from "@koa/router";
import { ritualController } from "../controllers/ritual-controller.js";
import { authGuard } from "../middleware/auth-guard.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";

export const ritualRoutes = new Router({ prefix: "/rituals" });

ritualRoutes.use(authGuard);

// IMPORTANT: /stats must come before /:id to avoid "stats" being parsed as an id
ritualRoutes.get("/stats", ritualController.getStats);
ritualRoutes.get("/", ritualController.list);
ritualRoutes.post("/", ritualController.create);
ritualRoutes.patch("/:id", validateUuidParam, ritualController.update);
ritualRoutes.delete("/:id", validateUuidParam, ritualController.delete);
ritualRoutes.post("/:id/toggle-complete", validateUuidParam, ritualController.toggleComplete);
