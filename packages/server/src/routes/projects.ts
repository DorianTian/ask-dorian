import Router from "@koa/router";
import { projectController } from "../controllers/project-controller.js";
import { authGuard } from "../middleware/auth-guard.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";

export const projectRoutes = new Router({ prefix: "/projects" });

projectRoutes.use(authGuard);

projectRoutes.post("/", projectController.create);
projectRoutes.get("/", projectController.list);
projectRoutes.get("/:id", validateUuidParam, projectController.getById);
projectRoutes.patch("/:id", validateUuidParam, projectController.update);
projectRoutes.delete("/:id", validateUuidParam, projectController.delete);
