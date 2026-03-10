import type { Context } from "koa";
import { z } from "zod";
import { readFile, unlink } from "node:fs/promises";
import { fragmentService } from "../services/fragment-service.js";
import { whisperService } from "../services/whisper-service.js";
import { AppError } from "../middleware/error-handler.js";
import { logger } from "../config/logger.js";

const createFragmentSchema = z.object({
  rawContent: z.string().min(1).max(50000),
  contentType: z.enum(["text", "voice", "image", "url", "file", "email", "forward"]).default("text"),
  inputSource: z.string().max(50).default("inbox"),
  inputDevice: z.string().max(50).optional(),
  sourceApp: z.string().max(100).optional(),
  sourceRef: z.string().max(500).optional(),
  locale: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  location: z.record(z.unknown()).optional(),
  clientContext: z.record(z.unknown()).optional(),
  parentId: z.string().uuid().optional(),
});

const listFragmentsSchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const fragmentController = {
  async create(ctx: Context) {
    const body = createFragmentSchema.parse(ctx.request.body);
    const { userId, deviceId } = ctx.state;

    const fragment = await fragmentService.create(userId, {
      ...body,
      deviceId,
    });

    ctx.status = 201;
    ctx.body = fragment;
  },

  async list(ctx: Context) {
    const query = listFragmentsSchema.parse(ctx.query);
    const fragments = await fragmentService.list(ctx.state.userId, query);
    ctx.body = fragments;
  },

  async getById(ctx: Context) {
    const fragment = await fragmentService.findById(
      ctx.state.userId,
      ctx.params.id,
    );
    ctx.body = fragment;
  },

  async confirm(ctx: Context) {
    const fragment = await fragmentService.confirm(
      ctx.state.userId,
      ctx.params.id,
    );
    ctx.body = fragment;
  },

  async reject(ctx: Context) {
    const fragment = await fragmentService.reject(
      ctx.state.userId,
      ctx.params.id,
    );
    ctx.body = fragment;
  },

  async delete(ctx: Context) {
    await fragmentService.delete(ctx.state.userId, ctx.params.id);
    ctx.status = 204;
  },

  /** POST /fragments/voice — multipart/form-data with "audio" field */
  async createFromVoice(ctx: Context) {
    const file = ctx.file;
    if (!file) {
      throw new AppError(400, "NO_FILE", "Audio file is required");
    }

    try {
      // Whisper → text
      const locale = (ctx.request.body as Record<string, string>)?.locale;
      const transcription = await whisperService.transcribe(file.path, locale);

      const fragment = await fragmentService.create(ctx.state.userId, {
        rawContent: transcription,
        contentType: "voice",
        inputSource: (ctx.request.body as Record<string, string>)?.inputSource ?? "voice",
        inputDevice: (ctx.request.body as Record<string, string>)?.inputDevice,
        locale,
        timezone: (ctx.request.body as Record<string, string>)?.timezone,
        deviceId: ctx.state.deviceId,
      });

      ctx.status = 201;
      ctx.body = fragment;
    } finally {
      // Cleanup temp file
      await unlink(file.path).catch((err) => {
        logger.warn({ err, filePath: file.path }, "Failed to cleanup temp file");
      });
    }
  },

  /** POST /fragments/image — multipart/form-data with "image" field */
  async createFromImage(ctx: Context) {
    const file = ctx.file;
    if (!file) {
      throw new AppError(400, "NO_FILE", "Image file is required");
    }

    try {
      // Read image for OCR before cleanup
      const imgBuffer = await readFile(file.path);
      const base64 = imgBuffer.toString("base64");

      const fragment = await fragmentService.create(ctx.state.userId, {
        rawContent: `[image:${file.originalname}]`,
        contentType: "image",
        inputSource: (ctx.request.body as Record<string, string>)?.inputSource ?? "share_sheet",
        inputDevice: (ctx.request.body as Record<string, string>)?.inputDevice,
        locale: (ctx.request.body as Record<string, string>)?.locale,
        timezone: (ctx.request.body as Record<string, string>)?.timezone,
        clientContext: { mimeType: file.mimetype, fileSize: file.size, imageBase64: base64 },
        deviceId: ctx.state.deviceId,
      });

      ctx.status = 201;
      ctx.body = fragment;
    } finally {
      await unlink(file.path).catch((err) => {
        logger.warn({ err, filePath: file.path }, "Failed to cleanup temp file");
      });
    }
  },
};
