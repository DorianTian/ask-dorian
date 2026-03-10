import type { Context } from "koa";
import { z } from "zod";
import { eventService } from "../services/event-service.js";

const createEventSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  type: z.string().max(20).default("other"),
  color: z.string().max(20).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  isAllDay: z.boolean().default(false),
  location: z.string().max(500).optional(),
  conferenceUrl: z.string().url().max(1000).optional(),
  conferenceType: z.string().max(50).optional(),
  reminders: z.array(z.object({
    minutes: z.number().int().min(0),
    method: z.string(),
  })).optional(),
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
}).refine(
  (data) => !data.endTime || new Date(data.endTime) > new Date(data.startTime),
  { message: "endTime must be after startTime", path: ["endTime"] },
);

const updateEventSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  type: z.string().max(20).optional(),
  color: z.string().max(20).nullable().optional(),
  status: z.string().max(20).optional(),
  visibility: z.string().max(20).optional(),
  busyStatus: z.string().max(20).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().nullable().optional(),
  isAllDay: z.boolean().optional(),
  location: z.string().max(500).nullable().optional(),
  conferenceUrl: z.string().url().max(1000).nullable().optional(),
  conferenceType: z.string().max(50).nullable().optional(),
  reminders: z.array(z.object({
    minutes: z.number().int().min(0),
    method: z.string(),
  })).optional(),
  projectId: z.string().uuid().nullable().optional(),
  taskId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
}).refine(
  (data) => !(data.startTime && data.endTime) || new Date(data.endTime) > new Date(data.startTime),
  { message: "endTime must be after startTime", path: ["endTime"] },
);

const listEventsSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const eventController = {
  async create(ctx: Context) {
    const body = createEventSchema.parse(ctx.request.body);
    const event = await eventService.create(ctx.state.userId, body);
    ctx.status = 201;
    ctx.body = event;
  },

  async list(ctx: Context) {
    const query = listEventsSchema.parse(ctx.query);
    const events = await eventService.listByRange(
      ctx.state.userId,
      query.start,
      query.end,
    );
    ctx.body = events;
  },

  async getById(ctx: Context) {
    const event = await eventService.findById(ctx.state.userId, ctx.params.id);
    ctx.body = event;
  },

  async update(ctx: Context) {
    const body = updateEventSchema.parse(ctx.request.body);
    const event = await eventService.update(ctx.state.userId, ctx.params.id, body);
    ctx.body = event;
  },

  async delete(ctx: Context) {
    await eventService.delete(ctx.state.userId, ctx.params.id);
    ctx.status = 204;
  },

  async getToday(ctx: Context) {
    const tz = (ctx.query.timezone as string) || "UTC";
    const events = await eventService.getToday(ctx.state.userId, tz);
    ctx.body = events;
  },
};
