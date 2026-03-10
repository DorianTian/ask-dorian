import Router from "@koa/router";
import { knowledgeController } from "../controllers/knowledge-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const knowledgeRoutes = new Router({ prefix: "/knowledge" });

knowledgeRoutes.use(authGuard);

knowledgeRoutes.post("/", knowledgeController.create);
knowledgeRoutes.get("/", knowledgeController.list);
knowledgeRoutes.get("/:id", knowledgeController.getById);
knowledgeRoutes.patch("/:id", knowledgeController.update);
knowledgeRoutes.delete("/:id", knowledgeController.delete);
