import type { Context } from "koa";
import { z } from "zod";
import { notificationService } from "../services/notification-service.js";

const listQuerySchema = z.object({
  unreadOnly: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const notificationController = {
  async list(ctx: Context) {
    const query = listQuerySchema.parse(ctx.query);
    const notifications = await notificationService.list(
      ctx.state.userId,
      query,
    );
    ctx.body = notifications;
  },

  async getUnreadCount(ctx: Context) {
    const count = await notificationService.getUnreadCount(ctx.state.userId);
    ctx.body = { count };
  },

  async markRead(ctx: Context) {
    await notificationService.markRead(ctx.state.userId, ctx.params.id);
    ctx.status = 204;
  },

  async markAllRead(ctx: Context) {
    const count = await notificationService.markAllRead(ctx.state.userId);
    ctx.body = { updated: count };
  },
};
