import Router from "@koa/router";
import { eventController } from "../controllers/event-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const eventRoutes = new Router({ prefix: "/events" });

eventRoutes.use(authGuard);

eventRoutes.post("/", eventController.create);
eventRoutes.get("/", eventController.list);
eventRoutes.get("/today", eventController.getToday);
eventRoutes.get("/:id", eventController.getById);
eventRoutes.patch("/:id", eventController.update);
eventRoutes.delete("/:id", eventController.delete);
