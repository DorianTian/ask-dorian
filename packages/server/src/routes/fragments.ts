import Router from "@koa/router";
import { fragmentController } from "../controllers/fragment-controller.js";
import { authGuard } from "../middleware/auth-guard.js";
import { uploadAudio, uploadImage } from "../middleware/upload.js";

export const fragmentRoutes = new Router({ prefix: "/fragments" });

fragmentRoutes.use(authGuard);

// Text/JSON
fragmentRoutes.post("/", fragmentController.create);

// Voice (multipart/form-data: audio file + optional metadata)
fragmentRoutes.post("/voice", uploadAudio, fragmentController.createFromVoice);

// Image/Screenshot (multipart/form-data: image file + optional metadata)
fragmentRoutes.post("/image", uploadImage, fragmentController.createFromImage);

fragmentRoutes.get("/", fragmentController.list);
fragmentRoutes.get("/:id", fragmentController.getById);
fragmentRoutes.post("/:id/confirm", fragmentController.confirm);
fragmentRoutes.post("/:id/reject", fragmentController.reject);
fragmentRoutes.delete("/:id", fragmentController.delete);
