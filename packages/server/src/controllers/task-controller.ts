import type { Context } from "koa";
import { z } from "zod";
import { taskService } from "../services/task-service.js";

const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  projectId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).default("none"),
  energyLevel: z.enum(["high", "medium", "low"]).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled", "archived"]).optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
  energyLevel: z.enum(["high", "medium", "low"]).nullable().optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  scheduledDate: z.string().nullable().optional(),
  scheduledStart: z.string().datetime().nullable().optional(),
  scheduledEnd: z.string().datetime().nullable().optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).nullable().optional(),
  actualMinutes: z.number().int().min(0).nullable().optional(),
  sortOrder: z.string().max(255).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const listTasksSchema = z.object({
  status: z.string().optional(),
  projectId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const taskController = {
  async create(ctx: Context) {
    const body = createTaskSchema.parse(ctx.request.body);
    const task = await taskService.create(ctx.state.userId, body);
    ctx.status = 201;
    ctx.body = task;
  },

  async list(ctx: Context) {
    const query = listTasksSchema.parse(ctx.query);
    const statusArr = query.status
      ? (query.status.split(",") as ("todo" | "in_progress" | "done" | "cancelled" | "archived")[])
      : undefined;
    const tasks = await taskService.list(ctx.state.userId, {
      status: statusArr,
      projectId: query.projectId,
      limit: query.limit,
      offset: query.offset,
    });
    ctx.body = tasks;
  },

  async getById(ctx: Context) {
    const task = await taskService.findById(ctx.state.userId, ctx.params.id);
    ctx.body = task;
  },

  async update(ctx: Context) {
    const body = updateTaskSchema.parse(ctx.request.body);
    const task = await taskService.update(ctx.state.userId, ctx.params.id, body);
    ctx.body = task;
  },

  async complete(ctx: Context) {
    const task = await taskService.complete(ctx.state.userId, ctx.params.id);
    ctx.body = task;
  },

  async delete(ctx: Context) {
    await taskService.delete(ctx.state.userId, ctx.params.id);
    ctx.status = 204;
  },
};
