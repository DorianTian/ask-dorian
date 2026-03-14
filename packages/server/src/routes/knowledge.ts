import Router from "@koa/router";
import { knowledgeController } from "../controllers/knowledge-controller.js";
import { authGuard } from "../middleware/auth-guard.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";

export const knowledgeRoutes = new Router({ prefix: "/knowledge" });

knowledgeRoutes.use(authGuard);

knowledgeRoutes.post("/", knowledgeController.create);
knowledgeRoutes.get("/", knowledgeController.list);
knowledgeRoutes.get("/:id", validateUuidParam, knowledgeController.getById);
knowledgeRoutes.patch("/:id", validateUuidParam, knowledgeController.update);
knowledgeRoutes.delete("/:id", validateUuidParam, knowledgeController.delete);
