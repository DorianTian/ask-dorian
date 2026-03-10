import { randomUUID } from "node:crypto";
import path from "node:path";
import multer from "@koa/multer";
import { AppError } from "./error-handler.js";

const ALLOWED_MIME_PREFIXES = ["audio/", "image/", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, "uploads/");
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, "");
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(_req, file, cb) {
    const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) =>
      file.mimetype.startsWith(prefix),
    );

    if (!isAllowed) {
      cb(
        new AppError(
          400,
          "INVALID_FILE_TYPE",
          `File type "${file.mimetype}" is not allowed. Accepted: audio/*, image/*, application/pdf`,
        ),
      );
      return;
    }

    cb(null, true);
  },
});

export const uploadSingle = upload.single("file");
export const uploadAudio = upload.single("audio");
export const uploadImage = upload.single("image");
