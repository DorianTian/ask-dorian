import Router from "@koa/router";
import { taskController } from "../controllers/task-controller.js";
import { authGuard } from "../middleware/auth-guard.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";

export const taskRoutes = new Router({ prefix: "/tasks" });

taskRoutes.use(authGuard);

taskRoutes.post("/", taskController.create);
taskRoutes.get("/", taskController.list);
taskRoutes.get("/:id", validateUuidParam, taskController.getById);
taskRoutes.patch("/:id", validateUuidParam, taskController.update);
taskRoutes.post("/:id/complete", validateUuidParam, taskController.complete);
taskRoutes.delete("/:id", validateUuidParam, taskController.delete);
