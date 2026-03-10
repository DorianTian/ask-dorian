import type { Context } from "koa";
import { z } from "zod";
import { projectService } from "../services/project-service.js";

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).default("#6366f1"),
  goal: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().max(20).optional(),
  status: z.string().max(20).optional(),
  goal: z.string().max(2000).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  sortOrder: z.string().max(255).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const listProjectsSchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const projectController = {
  async create(ctx: Context) {
    const body = createProjectSchema.parse(ctx.request.body);
    const project = await projectService.create(ctx.state.userId, body);
    ctx.status = 201;
    ctx.body = project;
  },

  async list(ctx: Context) {
    const query = listProjectsSchema.parse(ctx.query);
    const statusArr = query.status ? query.status.split(",") : undefined;
    const projects = await projectService.list(ctx.state.userId, {
      status: statusArr,
      limit: query.limit,
      offset: query.offset,
    });
    ctx.body = projects;
  },

  async getById(ctx: Context) {
    const project = await projectService.findById(ctx.state.userId, ctx.params.id);
    ctx.body = project;
  },

  async update(ctx: Context) {
    const body = updateProjectSchema.parse(ctx.request.body);
    const project = await projectService.update(ctx.state.userId, ctx.params.id, body);
    ctx.body = project;
  },

  async delete(ctx: Context) {
    await projectService.delete(ctx.state.userId, ctx.params.id);
    ctx.status = 204;
  },
};
