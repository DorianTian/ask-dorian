// packages/server/src/controllers/ritual-controller.ts
import type { Context } from "koa";
import { z } from "zod";
import { ritualService } from "../services/ritual-service.js";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const listRitualsSchema = z.object({
  date: z.string().regex(dateRegex, "Expected YYYY-MM-DD").optional(),
  timezone: z.string().max(50).default("UTC"),
});

const createRitualSchema = z.object({
  title: z.string().min(1).max(200),
  isFocus: z.boolean().default(false),
  taskId: z.string().uuid().nullable().optional(),
});

const updateRitualSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isFocus: z.boolean().optional(),
  sortOrder: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  taskId: z.string().uuid().nullable().optional(),
});

const toggleCompleteSchema = z.object({
  date: z.string().regex(dateRegex, "Expected YYYY-MM-DD").optional(),
  timezone: z.string().max(50).default("UTC"),
});

const statsQuerySchema = z.object({
  from: z.string().regex(dateRegex, "Expected YYYY-MM-DD"),
  to: z.string().regex(dateRegex, "Expected YYYY-MM-DD"),
});

function todayDateStr(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
}

export const ritualController = {
  /** GET /rituals — list with completion status */
  async list(ctx: Context) {
    const query = listRitualsSchema.parse(ctx.query);
    const date = query.date ?? todayDateStr(query.timezone);
    const result = await ritualService.list(ctx.state.userId, date);
    ctx.body = result;
  },

  /** POST /rituals — create */
  async create(ctx: Context) {
    const body = createRitualSchema.parse(ctx.request.body);
    const ritual = await ritualService.create(ctx.state.userId, body);
    ctx.status = 201;
    ctx.body = ritual;
  },

  /** PATCH /rituals/:id — update */
  async update(ctx: Context) {
    const body = updateRitualSchema.parse(ctx.request.body);
    const ritual = await ritualService.update(
      ctx.state.userId,
      ctx.params.id,
      body,
    );
    ctx.body = ritual;
  },

  /** DELETE /rituals/:id — soft delete */
  async delete(ctx: Context) {
    await ritualService.delete(ctx.state.userId, ctx.params.id);
    ctx.status = 204;
  },

  /** POST /rituals/:id/toggle-complete — toggle check-in */
  async toggleComplete(ctx: Context) {
    const body = toggleCompleteSchema.parse(ctx.request.body ?? {});
    const date = body.date ?? todayDateStr(body.timezone);
    const result = await ritualService.toggleComplete(
      ctx.state.userId,
      ctx.params.id,
      date,
    );
    ctx.body = result;
  },

  /** GET /rituals/stats — stats for Review page */
  async getStats(ctx: Context) {
    const query = statsQuerySchema.parse(ctx.query);
    const stats = await ritualService.getStats(
      ctx.state.userId,
      query.from,
      query.to,
    );
    ctx.body = stats;
  },
};
