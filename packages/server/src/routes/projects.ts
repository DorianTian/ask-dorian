import Router from "@koa/router";
import { projectController } from "../controllers/project-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const projectRoutes = new Router({ prefix: "/projects" });

projectRoutes.use(authGuard);

projectRoutes.post("/", projectController.create);
projectRoutes.get("/", projectController.list);
projectRoutes.get("/:id", projectController.getById);
projectRoutes.patch("/:id", projectController.update);
projectRoutes.delete("/:id", projectController.delete);
