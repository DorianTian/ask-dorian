import Router from "@koa/router";
import { notificationController } from "../controllers/notification-controller.js";
import { authGuard } from "../middleware/auth-guard.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";

export const notificationRoutes = new Router({ prefix: "/notifications" });

notificationRoutes.use(authGuard);

notificationRoutes.get("/", notificationController.list);
notificationRoutes.get("/unread-count", notificationController.getUnreadCount);
notificationRoutes.post("/:id/read", validateUuidParam, notificationController.markRead);
notificationRoutes.post("/read-all", notificationController.markAllRead);
