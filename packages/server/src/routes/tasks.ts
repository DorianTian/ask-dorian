import Router from "@koa/router";
import { taskController } from "../controllers/task-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const taskRoutes = new Router({ prefix: "/tasks" });

taskRoutes.use(authGuard);

taskRoutes.post("/", taskController.create);
taskRoutes.get("/", taskController.list);
taskRoutes.get("/:id", taskController.getById);
taskRoutes.patch("/:id", taskController.update);
taskRoutes.post("/:id/complete", taskController.complete);
taskRoutes.delete("/:id", taskController.delete);
