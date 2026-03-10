import Router from "@koa/router";
import { userController } from "../controllers/user-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const userRoutes = new Router({ prefix: "/users" });

userRoutes.use(authGuard);

userRoutes.get("/me", userController.getProfile);
userRoutes.patch("/me", userController.updateProfile);
userRoutes.get("/me/settings", userController.getSettings);
userRoutes.patch("/me/settings", userController.updateSettings);
